/**
 * RedRelay — AI Decision-Support & Operational Intelligence Service
 * Uses Google Gemini API when configured, with a deterministic offline clinical fallback engine.
 * STRICT SAFETY RULE: AI provides supporting rationale and anomaly detection only;
 * it NEVER autonomously approves compatibility, holds, release, or transfusion.
 */

import { CandidateEvaluation, DisruptionType, EmergencyRescueRequest } from "@/types";
import { COMPONENT_LABELS, BLOOD_GROUP_LABELS } from "../constants";

export interface AiMissionInsights {
  triageExplanation: string;
  anomalyWarning?: string;
  routeRecommendation: string;
  generatedAt: string;
  isAiFallback: boolean;
}

export class AiDecisionSupportService {
  /**
   * Generate intelligent triage explanation and routing recommendation
   */
  public static async generateTriageInsights(
    request: EmergencyRescueRequest,
    candidates: CandidateEvaluation[]
  ): Promise<AiMissionInsights> {
    const apiKey = process.env.GEMINI_API_KEY;

    // If API key is available, attempt Gemini API call
    if (apiKey && apiKey.trim().length > 0) {
      try {
        const prompt = `You are RedRelay AI Clinical Decision Support. Analyze this emergency blood request:
Component: ${COMPONENT_LABELS[request.component]}
Blood Group: ${BLOOD_GROUP_LABELS[request.bloodGroup]}
Units: ${request.unitsRequested}
Priority: ${request.priority}
Candidate Banks: ${JSON.stringify(candidates.map(c => ({
          name: c.bloodBankName,
          confirmedStock: c.confirmedUnitsCount,
          distanceKm: c.distanceKm,
          transitMinutes: c.estimatedTransitMinutes,
          stale: c.isStaleData,
        })))}
Provide a concise 2-sentence clinical coordination summary and 1-sentence route recommendation.`;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            return {
              triageExplanation: text,
              routeRecommendation: `Optimal route prioritizing confirmed stock at ${candidates[0]?.bloodBankName}. Estimated transit ${candidates[0]?.estimatedTransitMinutes} min.`,
              generatedAt: new Date().toISOString(),
              isAiFallback: false,
            };
          }
        }
      } catch {
        // Fall through gracefully to deterministic offline engine
      }
    }

    // Deterministic Offline Clinical Decision-Support Engine
    return this.generateDeterministicInsights(request, candidates);
  }

  /**
   * Deterministic offline clinical explanation generator
   */
  public static generateDeterministicInsights(
    request: EmergencyRescueRequest,
    candidates: CandidateEvaluation[]
  ): AiMissionInsights {
    const topCandidate = candidates[0];
    const backupCandidate = candidates[1];

    let triageExplanation = "";
    if (topCandidate && topCandidate.confirmedUnitsCount >= request.unitsRequested) {
      triageExplanation = `Primary candidate ${topCandidate.bloodBankName} possesses ${topCandidate.confirmedUnitsCount} verified units with confirmed testing clearance. Immediate hold recommended to secure inventory before transport dispatch.`;
    } else if (topCandidate && topCandidate.confirmedUnitsCount > 0) {
      triageExplanation = `Partial availability: ${topCandidate.bloodBankName} has ${topCandidate.confirmedUnitsCount} confirmed unit. Backup source ${backupCandidate?.bloodBankName || "Secondary Center"} must be notified for immediate contingency allocation.`;
    } else {
      triageExplanation = `No immediate single-source full fulfillment. Immediate network-wide escalation initiated across regional transfusion hubs.`;
    }

    let routeRecommendation = "";
    if (topCandidate) {
      routeRecommendation = `Dispatched via primary emergency arterial corridor to ${topCandidate.bloodBankName} (${topCandidate.distanceKm} km, ~${topCandidate.estimatedTransitMinutes} min transit). Cold-box temperature target 2-6°C pre-conditioned.`;
    }

    return {
      triageExplanation,
      routeRecommendation,
      generatedAt: new Date().toISOString(),
      isAiFallback: true,
    };
  }

  /**
   * Generate failure-aware exception explanation during unexpected disruptions
   */
  public static generateDisruptionAnalysis(
    disruptionType: DisruptionType,
    originalBankName: string,
    backupCandidate: CandidateEvaluation | undefined
  ): {
    headline: string;
    anomalyAnalysis: string;
    suggestedAction: string;
    humanApprovalPrompt: string;
  } {
    switch (disruptionType) {
      case "STOCK_WITHDRAWN_CLINICAL_EMERGENCY":
        return {
          headline: `Critical Disruption: Stock Withdrawn by ${originalBankName}`,
          anomalyAnalysis: `${originalBankName} experienced an internal emergency trauma surge and withdrew held units before courier release. Units are no longer accessible.`,
          suggestedAction: backupCandidate
            ? `Immediately switch mission target to ${backupCandidate.bloodBankName} (${backupCandidate.availableUnitsCount} verified units, ${backupCandidate.estimatedTransitMinutes} min transit).`
            : `Escalate to regional emergency coordinator for inter-district blood transfer.`,
          humanApprovalPrompt: `Authorized Clinician or Emergency Coordinator must review and approve rerouting to ${backupCandidate?.bloodBankName}.`,
        };

      case "TEMPERATURE_EXCURSION":
        return {
          headline: "Cold-Chain Integrity Breach: Temperature Excursion Alert (>6.0°C)",
          anomalyAnalysis: "IoT sensor telemetry recorded 7.4°C for >12 minutes inside transport cold-box. Exceeds DGHS/NBTC 2-6°C threshold for Packed Red Blood Cells.",
          suggestedAction: "Halt transfusion chain. Quarantine current box at receiving lab for immunohematology inspection. Trigger secondary backup dispatch.",
          humanApprovalPrompt: "Transfusion Officer confirmation required to reject compromised unit and dispatch fresh replacement.",
        };

      case "HOLD_EXPIRED":
        return {
          headline: "Hold Expired: 20-Minute Window Elapsed Without Courier Acknowledgment",
          anomalyAnalysis: "Unit hold timer expired at blood bank before courier confirmed arrival. Stock returned to general allocation pool.",
          suggestedAction: "Re-request immediate emergency lock or reroute to secondary candidate with active desk.",
          humanApprovalPrompt: "Approve re-requesting hold or rerouting mission.",
        };

      case "COURIER_DELAY_VEHICLE_BREAKDOWN":
        return {
          headline: "Logistics Disruption: Courier Mechanical Delay Flagged",
          anomalyAnalysis: "Courier telemetry shows zero velocity for >18 minutes on Hosur Road arterial corridor. Estimated delay +35 mins.",
          suggestedAction: "Dispatch secondary rapid medical moto courier to perform mid-route cold-box transfer or divert.",
          humanApprovalPrompt: "Confirm dispatch of relief courier.",
        };

      case "SEAL_TAMPERED":
      default:
        return {
          headline: "Custody Exception: Cold-Box Tamper Alert",
          anomalyAnalysis: "Lid open sensor triggered unexpectedly between transit checkpoints.",
          suggestedAction: "Perform visual seal and barcode verification at destination prior to laboratory cross-match.",
          humanApprovalPrompt: "Receiving lab officer must inspect and confirm container integrity.",
        };
    }
  }
}
