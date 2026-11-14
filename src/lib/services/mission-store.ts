/**
 * RedRelay — Reactive Mission State Manager
 * Synchronizes multi-perspective states across Hospital, Blood Bank, Courier, and Coordinator
 */

import {
  CandidateEvaluation,
  CourierAssignment,
  CustodyProofEvent,
  DisruptionType,
  EmergencyRescueRequest,
  RescueMission,
  Role,
} from "@/types";
import { DEMO_BLOOD_BANKS, DEMO_HOSPITALS, INITIAL_DEMO_REQUEST } from "../demo-data";
import { InventoryService } from "./inventory-service";
import { CoordinationEngine } from "./coordination-engine";
import { CustodyAuditService } from "./audit-service";
import { AiDecisionSupportService } from "./ai-service";
import { ReroutingService } from "./rerouting-service";

export type GuidedDemoStep = 
  | 1 // Urgent Request Created
  | 2 // Candidate Banks Evaluated with Confidence Tiers
  | 3 // AI Operational Priority Rationale
  | 4 // Bank Confirms Hold (Concurrency-safe lock)
  | 5 // Courier Dispatched with Cold-Box Telemetry
  | 6 // Disruption Triggered (Hold failure / stock recall / delay)
  | 7 // AI Exception Alert & Alternate Reroute Ranking
  | 8 // Human Authorization Gate (Clinician/Coordinator approval)
  | 9 // Verified Transport & Cold-Chain Delivery
  | 10 // Final Hospital Handoff & Cryptographic Evidence Trail

export class MissionStore {
  private static currentMission: RescueMission;
  private static activeRole: Role = "COORDINATOR";
  private static demoStep: GuidedDemoStep = 1;
  private static listeners: Set<() => void> = new Set();

  static {
    this.resetToBaseline();
  }

  public static subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private static notify() {
    this.listeners.forEach(fn => fn());
  }

  /**
   * Reset the entire mission and inventory state back to pristine demo baseline
   */
  public static resetToBaseline() {
    InventoryService.resetToBaseline();

    const request = JSON.parse(JSON.stringify(INITIAL_DEMO_REQUEST)) as EmergencyRescueRequest;
    const candidates = CoordinationEngine.evaluateCandidates(request);
    const topCandidate = candidates[0];

    const initialTrail: CustodyProofEvent[] = [
      CustodyAuditService.createEvent(
        "mission-blr-001",
        "HOLD_ISSUED",
        request.requestingClinician.name,
        "HOSPITAL_CLINICIAN",
        DEMO_HOSPITALS[0].name,
        [],
        `STAT Blood Request Registered: 2 Units ${request.component} ${request.bloodGroup} for ${request.patientPseudonym}`,
        "GENESIS_BLOCK_0000000000000000"
      ),
    ];

    const aiInsights = AiDecisionSupportService.generateDeterministicInsights(request, candidates);

    const initialCourier: CourierAssignment = {
      id: "courier-suresh-01",
      courierName: "Suresh Kumar",
      badgeNumber: "KA-MED-4421",
      vehicleType: "Emergency Medical Moto",
      vehiclePlate: "KA-01-EQ-9920",
      phone: "+91 97410 88219",
      currentLocation: {
        lat: 12.968,
        lng: 77.61,
        lastPing: new Date().toISOString(),
      },
      coldBoxId: "CC-BLR-09",
      telemetry: {
        currentTempCelsius: 3.8,
        minAllowedCelsius: 2.0,
        maxAllowedCelsius: 6.0,
        humidityPercent: 44,
        batteryPercent: 92,
        lidClosed: true,
        excursionDetected: false,
        lastReadingTimestamp: new Date().toISOString(),
        deviceImei: "IMEI-8631-9921-4402",
        tempHistory: [
          { timestamp: "11:00", temp: 3.7 },
          { timestamp: "11:05", temp: 3.8 },
          { timestamp: "11:10", temp: 3.8 },
          { timestamp: "11:15", temp: 3.9 },
        ],
      },
    };

    this.currentMission = {
      id: "mission-blr-001",
      missionCode: "RESCUE-BLR-041",
      requestId: request.id,
      request,
      status: "REQUEST_SUBMITTED",
      primaryBloodBankId: topCandidate.bloodBankId,
      backupBloodBankId: candidates[1]?.bloodBankId,
      assignedCourier: initialCourier,
      candidateEvaluations: candidates,
      allocatedUnitIds: [],
      aiInsights,
      custodyTrail: initialTrail,
      startedAt: new Date().toISOString(),
    };

    this.demoStep = 1;
    this.notify();
  }

  public static getMission(): RescueMission {
    return JSON.parse(JSON.stringify(this.currentMission));
  }

  public static getActiveRole(): Role {
    return this.activeRole;
  }

  public static setActiveRole(role: Role) {
    this.activeRole = role;
    this.notify();
  }

  public static getDemoStep(): GuidedDemoStep {
    return this.demoStep;
  }

  public static setDemoStep(step: GuidedDemoStep) {
    this.demoStep = step;
    this.notify();
  }

  /**
   * Advance to specific demo step with actual state machine mutations
   */
  public static async advanceToStep(step: GuidedDemoStep) {
    this.demoStep = step;

    switch (step) {
      case 1:
        this.currentMission.status = "REQUEST_SUBMITTED";
        break;

      case 2:
      case 3:
        this.currentMission.status = "BANKS_NOTIFIED";
        break;

      case 4: {
        // Bank confirms hold
        const bankId = this.currentMission.primaryBloodBankId || "bank-ttk";
        const reservation = await InventoryService.reserveUnitsForMission(
          bankId,
          this.currentMission.request.component,
          this.currentMission.request.bloodGroup,
          this.currentMission.request.unitsRequested,
          20,
          this.currentMission.requestId
        );

        if (reservation.success) {
          this.currentMission.status = "HOLD_CONFIRMED";
          this.currentMission.allocatedUnitIds = reservation.reservedUnitIds;
          this.currentMission.holdExpiresAt = reservation.holdExpiresAt;

          const lastHash = this.currentMission.custodyTrail[this.currentMission.custodyTrail.length - 1]?.eventHash;
          const event = CustodyAuditService.createEvent(
            this.currentMission.id,
            "HOLD_ISSUED",
            "Dr. B. S. Shanthala, MD",
            "BLOOD_BANK_OFFICER",
            "Rotary Bangalore TTK Blood Centre",
            reservation.reservedUnitIds,
            `Active Hold Placed: 2 Units O-neg PRBC reserved for 20 minutes pending courier arrival.`,
            lastHash,
            3.8
          );
          this.currentMission.custodyTrail.push(event);
        }
        break;
      }

      case 5: {
        // Courier dispatched & Pickup confirmed
        this.currentMission.status = "IN_TRANSIT";
        const lastHash = this.currentMission.custodyTrail[this.currentMission.custodyTrail.length - 1]?.eventHash;
        const event = CustodyAuditService.createEvent(
          this.currentMission.id,
          "COURIER_PICKUP",
          "Suresh Kumar",
          "COURIER",
          "MediRoute Rapid Cold-Chain",
          this.currentMission.allocatedUnitIds,
          `Cold-box verified at 3.8°C. QR token validated by Blood Bank Officer. En route to Victoria Hospital.`,
          lastHash,
          3.8,
          "RR-PICKUP-7721"
        );
        this.currentMission.custodyTrail.push(event);
        break;
      }

      case 6: {
        // Disruption Triggered: Stock recalled or hold conflict
        const result = ReroutingService.triggerDisruption(
          this.currentMission,
          "STOCK_WITHDRAWN_CLINICAL_EMERGENCY",
          "Rotary TTK experienced sudden in-hospital massive trauma emergency and recalled reserved units before courier handoff."
        );
        this.currentMission = result.mission;
        break;
      }

      case 7: {
        // AI Exception Alert & Backup generation (Already handled in ReroutingService)
        this.currentMission.status = "DISRUPTED";
        break;
      }

      case 8: {
        // Human Approval Gate: Clinician authorizes backup reroute to NIMHANS Blood Centre
        const approveResult = await ReroutingService.approveReroute(
          this.currentMission,
          "Dr. Ananya Rao, MD",
          "HOSPITAL_CLINICIAN",
          "Approved emergency reroute to NIMHANS Blood Centre. 2 units O-neg PRBC confirmed available."
        );
        if (approveResult.success) {
          this.currentMission = approveResult.mission;
        }
        break;
      }

      case 9: {
        // Courier transit verified with fresh backup units
        this.currentMission.status = "IN_TRANSIT";
        const lastHash = this.currentMission.custodyTrail[this.currentMission.custodyTrail.length - 1]?.eventHash;
        const event = CustodyAuditService.createEvent(
          this.currentMission.id,
          "TRANSIT_CHECKPOINT",
          "Suresh Kumar",
          "COURIER",
          "MediRoute Rapid Cold-Chain",
          this.currentMission.allocatedUnitIds,
          `Arrived at NIMHANS Blood Centre. Picked up replacement units. Cold-box stable at 3.9°C. Proceeding to Victoria Hospital.`,
          lastHash,
          3.9,
          "RR-CHK-8832"
        );
        this.currentMission.custodyTrail.push(event);
        break;
      }

      case 10: {
        // Final Hospital Handoff Completed
        this.currentMission.status = "HANDOFF_COMPLETED";
        this.currentMission.completedAt = new Date().toISOString();

        // Release units to hospital
        for (const uid of this.currentMission.allocatedUnitIds) {
          const u = InventoryService.getUnitById(uid);
          if (u) {
            u.status = "RELEASED";
          }
        }

        const lastHash = this.currentMission.custodyTrail[this.currentMission.custodyTrail.length - 1]?.eventHash;
        const event = CustodyAuditService.createEvent(
          this.currentMission.id,
          "FINAL_RECEIPT_VERIFIED",
          "Sister Mary Verghese, RN / Lab In-Charge",
          "HOSPITAL_CLINICIAN",
          "Victoria Hospital Emergency Blood Bank",
          this.currentMission.allocatedUnitIds,
          `Physical Handoff Confirmed: Cold-box seal intact, delivery temp 4.1°C (Compliant: 2-6°C). 2 units O-neg PRBC received for emergency cross-match.`,
          lastHash,
          4.1,
          "RR-FINAL-9901"
        );
        this.currentMission.custodyTrail.push(event);
        break;
      }
    }

    this.notify();
  }

  /**
   * Create a new custom emergency rescue request
   */
  public static createEmergencyRequest(request: EmergencyRescueRequest): RescueMission {
    const candidates = CoordinationEngine.evaluateCandidates(request);
    const topCandidate = candidates[0];

    const initialTrail: CustodyProofEvent[] = [
      CustodyAuditService.createEvent(
        `mission-${Date.now()}`,
        "HOLD_ISSUED",
        request.requestingClinician.name,
        "HOSPITAL_CLINICIAN",
        DEMO_HOSPITALS.find(h => h.id === request.hospitalId)?.name || "Emergency Hospital",
        [],
        `STAT Request Created: ${request.unitsRequested} Unit(s) ${request.component} ${request.bloodGroup}`
      ),
    ];

    const aiInsights = AiDecisionSupportService.generateDeterministicInsights(request, candidates);

    const newMission: RescueMission = {
      id: `mission-${Date.now()}`,
      missionCode: `RESCUE-${Math.floor(100 + Math.random() * 900)}`,
      requestId: request.id,
      request,
      status: "REQUEST_SUBMITTED",
      primaryBloodBankId: topCandidate.bloodBankId,
      backupBloodBankId: candidates[1]?.bloodBankId,
      candidateEvaluations: candidates,
      allocatedUnitIds: [],
      aiInsights,
      custodyTrail: initialTrail,
      startedAt: new Date().toISOString(),
    };

    this.currentMission = newMission;
    this.demoStep = 1;
    this.notify();
    return newMission;
  }

  /**
   * Trigger disruption simulation directly
   */
  public static triggerSimulatedDisruption(type: DisruptionType) {
    const result = ReroutingService.triggerDisruption(this.currentMission, type);
    this.currentMission = result.mission;
    this.demoStep = 6;
    this.notify();
    return result;
  }

  /**
   * Authorize reroute directly
   */
  public static async authorizeReroute(approverName: string, approverRole: string, notes: string) {
    const result = await ReroutingService.approveReroute(this.currentMission, approverName, approverRole, notes);
    if (result.success) {
      this.currentMission = result.mission;
      this.demoStep = 8;
      this.notify();
    }
    return result;
  }
}
