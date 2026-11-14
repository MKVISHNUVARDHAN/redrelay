/**
 * RedRelay — Failure-Aware Rescue Rerouting Service
 * Signature Hackathon Innovation: Handles disruptions without silent substitutions,
 * preserving evidence trails and enforcing human-approval gates for alternative sourcing.
 */

import { CandidateEvaluation, CustodyProofEvent, DisruptionType, RescueMission } from "@/types";
import { CustodyAuditService } from "./audit-service";
import { InventoryService } from "./inventory-service";
import { AiDecisionSupportService } from "./ai-service";
import { DEMO_BLOOD_BANKS } from "../demo-data";

export interface DisruptionSimulationResult {
  mission: RescueMission;
  disruptionSummary: {
    headline: string;
    anomalyAnalysis: string;
    suggestedAction: string;
    humanApprovalPrompt: string;
  };
  backupCandidate?: CandidateEvaluation;
}

export class ReroutingService {
  /**
   * Simulate or handle an operational disruption during an active mission
   */
  public static triggerDisruption(
    mission: RescueMission,
    disruptionType: DisruptionType,
    customDescription?: string
  ): DisruptionSimulationResult {
    const originalBank = DEMO_BLOOD_BANKS.find(b => b.id === mission.primaryBloodBankId) || DEMO_BLOOD_BANKS[0];

    // Find the best backup candidate (excluding the disrupted primary bank)
    const backupCandidate = mission.candidateEvaluations.find(
      c => c.bloodBankId !== mission.primaryBloodBankId && !c.isStaleData && c.confirmedUnitsCount > 0
    );

    const backupBankId = backupCandidate?.bloodBankId || "bank-nimhans";

    // AI/Deterministic failure analysis
    const disruptionAnalysis = AiDecisionSupportService.generateDisruptionAnalysis(
      disruptionType,
      originalBank.name,
      backupCandidate
    );

    // If units were in HELD status at the original bank, release them or mark unavailable
    if (mission.allocatedUnitIds.length > 0) {
      if (disruptionType === "STOCK_WITHDRAWN_CLINICAL_EMERGENCY") {
        for (const uid of mission.allocatedUnitIds) {
          InventoryService.withdrawUnit(uid, "Emergency internal surgical recall by blood bank");
        }
      } else {
        InventoryService.releaseHold(mission.allocatedUnitIds, `Mission disruption: ${disruptionType}`);
      }
    }

    // Preserve evidence in the append-only audit trail
    const lastEventHash = mission.custodyTrail[mission.custodyTrail.length - 1]?.eventHash || "GENESIS_BLOCK_0000000000000000";
    
    const disruptionEvent = CustodyAuditService.createEvent(
      mission.id,
      "DISRUPTION_FLAGGED",
      "RedRelay Sentinel Telemetry Engine",
      "COORDINATOR",
      "RedRelay Emergency Operations Center",
      mission.allocatedUnitIds,
      `DISRUPTION DETECTED: ${disruptionAnalysis.headline}. ${customDescription || disruptionAnalysis.anomalyAnalysis}`,
      lastEventHash,
      disruptionType === "TEMPERATURE_EXCURSION" ? 7.4 : 3.8
    );

    // Update mission state — strictly transition to DISRUPTED, never silently swap units!
    const updatedMission: RescueMission = {
      ...mission,
      status: "DISRUPTED",
      backupBloodBankId: backupBankId,
      disruption: {
        type: disruptionType,
        description: customDescription || disruptionAnalysis.anomalyAnalysis,
        occurredAt: new Date().toISOString(),
        originalBankId: originalBank.id,
        proposedBackupBankId: backupBankId,
        humanApprovalRequired: true,
      },
      custodyTrail: [...mission.custodyTrail, disruptionEvent],
    };

    return {
      mission: updatedMission,
      disruptionSummary: disruptionAnalysis,
      backupCandidate,
    };
  }

  /**
   * Human Approval Gate: Clinician or Coordinator explicitly approves the reroute plan
   */
  public static async approveReroute(
    mission: RescueMission,
    approverName: string,
    approverRole: string,
    approverNotes: string
  ): Promise<{ success: boolean; mission: RescueMission; error?: string }> {
    if (approverRole !== "HOSPITAL_CLINICIAN" && approverRole !== "COORDINATOR") {
      return {
        success: false,
        mission,
        error: "SECURITY_VIOLATION: Only the requesting clinician or emergency coordinator can authorize rerouting.",
      };
    }

    if (!mission.disruption || !mission.backupBloodBankId) {
      return {
        success: false,
        mission,
        error: "INVALID_STATE: No active disruption or proposed backup blood bank exists.",
      };
    }

    const backupBankId = mission.backupBloodBankId;
    const backupBank = DEMO_BLOOD_BANKS.find(b => b.id === backupBankId);

    // Reserve units at the new backup bank
    const reservation = await InventoryService.reserveUnitsForMission(
      backupBankId,
      mission.request.component,
      mission.request.bloodGroup,
      mission.request.unitsRequested,
      backupBank?.activeHoldTimeoutMinutes || 20,
      mission.requestId
    );

    if (!reservation.success) {
      return {
        success: false,
        mission,
        error: `REROUTE_RESERVATION_FAILED: ${reservation.message}`,
      };
    }

    // Append cryptographic audit event for the human authorization
    const lastHash = mission.custodyTrail[mission.custodyTrail.length - 1]?.eventHash || "GENESIS";
    const approvalEvent = CustodyAuditService.createEvent(
      mission.id,
      "REROUTED_AUTHORIZED",
      approverName,
      approverRole as any,
      "Transfusion Medicine Emergency Command",
      reservation.reservedUnitIds,
      `HUMAN AUTHORIZATION GRANTED: Rerouted from ${mission.disruption.originalBankId} to ${backupBank?.name || backupBankId}. Notes: ${approverNotes}`,
      lastHash,
      3.8
    );

    const updatedMission: RescueMission = {
      ...mission,
      status: "HOLD_CONFIRMED",
      primaryBloodBankId: backupBankId,
      allocatedUnitIds: reservation.reservedUnitIds,
      holdExpiresAt: reservation.holdExpiresAt,
      disruption: {
        ...mission.disruption,
        humanApprovalRequired: false,
        approvedBy: `${approverName} (${approverRole})`,
        approvalTimestamp: new Date().toISOString(),
      },
      custodyTrail: [...mission.custodyTrail, approvalEvent],
    };

    return {
      success: true,
      mission: updatedMission,
    };
  }
}
