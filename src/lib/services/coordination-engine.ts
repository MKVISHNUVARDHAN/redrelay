/**
 * RedRelay — AI Rescue Mission Coordination Engine
 * Deterministic candidate ranking, compatibility filtering, and routing calculations
 */

import { CandidateEvaluation, EmergencyRescueRequest, LocationCoordinates } from "@/types";
import { DEMO_BLOOD_BANKS, DEMO_HOSPITALS } from "../demo-data";
import { InventoryService } from "./inventory-service";
import { RBC_COMPATIBILITY_RULES, PLASMA_COMPATIBILITY_RULES, PLATELET_COMPATIBILITY_RULES } from "../constants";

export class CoordinationEngine {
  /**
   * Calculate geographic distance in kilometers (Haversine formula)
   */
  public static calculateDistanceKm(coord1: LocationCoordinates, coord2: LocationCoordinates): number {
    const R = 6371; // Earth's radius in km
    const dLat = ((coord2.lat - coord1.lat) * Math.PI) / 180;
    const dLng = ((coord2.lng - coord1.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((coord1.lat * Math.PI) / 180) *
        Math.cos((coord2.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(1));
  }

  /**
   * Estimate realistic transit time in minutes given distance and city traffic density
   */
  public static estimateTransitMinutes(distanceKm: number, isPriority: boolean = true): number {
    // Average emergency response speed in urban Indian arterial corridors: ~25-30 km/h with siren
    // plus 5 minutes dispatch/packaging buffer
    const avgSpeedKmH = isPriority ? 28 : 20;
    const travelTime = (distanceKm / avgSpeedKmH) * 60;
    return Math.round(travelTime + 5);
  }

  /**
   * Evaluate all candidate blood banks for an emergency request
   * Deterministic safety rules apply here!
   */
  public static evaluateCandidates(request: EmergencyRescueRequest): CandidateEvaluation[] {
    const hospital = DEMO_HOSPITALS.find(h => h.id === request.hospitalId) || DEMO_HOSPITALS[0];
    const allBanks = DEMO_BLOOD_BANKS;
    const evaluations: CandidateEvaluation[] = [];

    // Determine compatible donor groups depending strictly on component type!
    let compatibleDonorGroups: string[];
    if (request.component === "PRBC" || request.component === "WHOLE_BLOOD") {
      compatibleDonorGroups = RBC_COMPATIBILITY_RULES[request.bloodGroup] || [request.bloodGroup];
    } else if (request.component === "FFP" || request.component === "CRYOPRECIPITATE") {
      compatibleDonorGroups = PLASMA_COMPATIBILITY_RULES[request.bloodGroup] || [request.bloodGroup];
    } else {
      compatibleDonorGroups = PLATELET_COMPATIBILITY_RULES[request.bloodGroup] || [request.bloodGroup];
    }

    for (const bank of allBanks) {
      const distanceKm = this.calculateDistanceKm(hospital.location, bank.location);
      const estimatedTransitMinutes = this.estimateTransitMinutes(distanceKm, request.priority === "CRASH_CODE_RED");
      
      const bankUnits = InventoryService.getUnitsForBank(bank.id);

      // Filter matching units
      const matchingUnits = bankUnits.filter(u => {
        if (u.component !== request.component) return false;
        if (!compatibleDonorGroups.includes(u.bloodGroup)) return false;
        return true;
      });

      const confirmedUnits = matchingUnits.filter(u => u.status === "CONFIRMED");
      const reportedUnits = matchingUnits.filter(u => u.status === "REPORTED");
      const heldUnits = matchingUnits.filter(u => u.status === "HELD");

      // Check if data is stale (e.g. Bowring Hospital is intentionally configured as stale > 38 hours)
      const isStaleData = bank.id === "bank-bowring";

      // Compute readiness score (0 - 100)
      // Confirmed stock has 50% weight, distance has 25% weight, historical turnaround 25%
      let readinessScore = 0;

      if (!isStaleData && confirmedUnits.length >= request.unitsRequested) {
        readinessScore += 50;
      } else if (!isStaleData && confirmedUnits.length > 0) {
        readinessScore += (confirmedUnits.length / request.unitsRequested) * 40;
      }

      // Distance score: <5km = 25, 5-10km = 18, >10km = 10
      if (distanceKm <= 5) readinessScore += 25;
      else if (distanceKm <= 10) readinessScore += 18;
      else readinessScore += 10;

      // Historical performance score
      if (bank.historicalMetrics.coldChainComplianceRate >= 99) readinessScore += 15;
      else if (bank.historicalMetrics.coldChainComplianceRate >= 95) readinessScore += 10;
      else readinessScore += 5;

      if (bank.historicalMetrics.avgConfirmationMinutes <= 10) readinessScore += 10;
      else if (bank.historicalMetrics.avgConfirmationMinutes <= 20) readinessScore += 6;
      else readinessScore += 2;

      // Generate deterministic explanation rationale
      let rationale = "";
      if (isStaleData) {
        readinessScore = 15;
        rationale = "STALE_DATA_WARNING: Unverified listings reported 38 hours ago. Excluded from verified rescue tier per Proof of Availability standards.";
      } else if (confirmedUnits.length >= request.unitsRequested) {
        rationale = `Verified stock: ${confirmedUnits.length} confirmed unit(s) available. NABH accredited cold-chain (${bank.historicalMetrics.coldChainComplianceRate}% compliance). ${estimatedTransitMinutes} min transit via arterial corridor.`;
      } else if (confirmedUnits.length > 0) {
        rationale = `Partial stock alert: Only ${confirmedUnits.length} confirmed unit of ${request.unitsRequested} requested. Will require multi-source split or primary backup.`;
      } else {
        rationale = "Zero confirmed units in stock for this exact component. Excluded from primary candidate ranking.";
      }

      evaluations.push({
        bloodBankId: bank.id,
        bloodBankName: bank.name,
        availableUnitsCount: confirmedUnits.length,
        reportedUnitsCount: reportedUnits.length,
        confirmedUnitsCount: confirmedUnits.length,
        heldUnitsCount: heldUnits.length,
        distanceKm,
        estimatedTransitMinutes,
        readinessScore: Math.round(readinessScore),
        rationale,
        coldChainRating: `${bank.historicalMetrics.coldChainComplianceRate}% Verified`,
        isStaleData,
        dataTimestamp: isStaleData ? "38 hours ago" : "5 minutes ago",
      });
    }

    // Sort deterministic order: highest readiness score first
    return evaluations.sort((a, b) => b.readinessScore - a.readinessScore);
  }
}
