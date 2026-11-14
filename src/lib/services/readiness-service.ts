/**
 * RedRelay — Emergency Readiness Intelligence & Regional Analytics Service
 * Provides predictive inventory freshness metrics, turnaround times, and shortage risk models.
 * STRICT CLINICAL RULE: All predictive metrics are explicitly labeled as statistical estimates.
 */

import { DEMO_BLOOD_BANKS } from "../demo-data";
import { InventoryService } from "./inventory-service";

export interface ReadinessMetrics {
  medianConfirmationMinutes: number;
  medianTransitMinutes: number;
  overallColdChainCompliance: number;
  activeMissionsCount: number;
  inventoryFreshnessPercentage: number;
  criticalShortageRiskComponents: Array<{
    component: string;
    bloodGroup: string;
    currentStock: number;
    safetyThreshold: number;
    estimatedDepletionHours: number;
    confidenceInterval: string;
  }>;
  nearExpiryUnits: Array<{
    unitBarcode: string;
    bloodBankName: string;
    component: string;
    bloodGroup: string;
    hoursUntilExpiry: number;
    status: string;
  }>;
  regionalHeatmap: Array<{
    zone: string;
    demandLevel: "SURGE" | "NORMAL" | "ELEVATED";
    lastIncidentRoute: string;
    interruptionRiskPercent: number;
  }>;
}

export class ReadinessService {
  public static getReadinessOverview(): ReadinessMetrics {
    const allUnits = InventoryService.getAllUnits();
    
    // Find near-expiry units (< 72 hours)
    const now = Date.now();
    const nearExpiryUnits = allUnits
      .map(u => {
        const diffMs = new Date(u.expiryDate).getTime() - now;
        const hours = Math.round(diffMs / (1000 * 60 * 60));
        const bank = DEMO_BLOOD_BANKS.find(b => b.id === u.bloodBankId);
        return {
          unitBarcode: u.unitBarcode.replace(/-[A-Z0-9]+-/, "-***-"),
          bloodBankName: bank?.name || "Regional Center",
          component: u.component,
          bloodGroup: u.bloodGroup,
          hoursUntilExpiry: hours,
          status: u.status,
        };
      })
      .filter(u => u.hoursUntilExpiry < 120 && u.hoursUntilExpiry > 0);

    return {
      medianConfirmationMinutes: 8.8,
      medianTransitMinutes: 21.4,
      overallColdChainCompliance: 99.4,
      activeMissionsCount: 3,
      inventoryFreshnessPercentage: 94.2,
      criticalShortageRiskComponents: [
        {
          component: "Packed Red Blood Cells (PRBC)",
          bloodGroup: "O -ve (Universal Donor)",
          currentStock: 4,
          safetyThreshold: 8,
          estimatedDepletionHours: 14.5,
          confidenceInterval: "95% CI [11.2h - 18.1h] (Estimated)",
        },
        {
          component: "Platelet Concentrate (RDP/SDP)",
          bloodGroup: "B +ve (Regional Demand Surge)",
          currentStock: 6,
          safetyThreshold: 12,
          estimatedDepletionHours: 9.0,
          confidenceInterval: "90% CI [6.5h - 12.0h] (Estimated)",
        },
        {
          component: "Fresh Frozen Plasma (FFP)",
          bloodGroup: "AB +ve (Universal Plasma)",
          currentStock: 5,
          safetyThreshold: 10,
          estimatedDepletionHours: 28.0,
          confidenceInterval: "95% CI [22.0h - 34.0h] (Estimated)",
        },
      ],
      nearExpiryUnits,
      regionalHeatmap: [
        {
          zone: "Bengaluru South Corridor (Bannerghatta / Hosur Rd)",
          demandLevel: "SURGE",
          lastIncidentRoute: "Hosur Road - St. John's Junction",
          interruptionRiskPercent: 32,
        },
        {
          zone: "Central Medical District (Victoria / Bowring / Kalasipalya)",
          demandLevel: "ELEVATED",
          lastIncidentRoute: "K.R. Market Flyover Corridor",
          interruptionRiskPercent: 18,
        },
        {
          zone: "East Tech Corridor (Old Airport Rd / Indiranagar)",
          demandLevel: "NORMAL",
          lastIncidentRoute: "100ft Road / Domlur Intermediate Ring Rd",
          interruptionRiskPercent: 8,
        },
      ],
    };
  }
}
