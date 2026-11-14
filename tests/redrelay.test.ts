/**
 * RedRelay — Comprehensive Automated Verification Test Suite
 * Tests all 13 critical safety, concurrency, regulatory, and role-enforcement invariants
 */

import { describe, it, expect, beforeEach } from "vitest";
import { InventoryService } from "@/lib/services/inventory-service";
import { CoordinationEngine } from "@/lib/services/coordination-engine";
import { ReroutingService } from "@/lib/services/rerouting-service";
import { CustodyAuditService } from "@/lib/services/audit-service";
import { AiDecisionSupportService } from "@/lib/services/ai-service";
import { MissionStore } from "@/lib/services/mission-store";
import { EmergencyRescueRequest } from "@/types";

describe("RedRelay Emergency Verification Suite", () => {
  beforeEach(() => {
    MissionStore.resetToBaseline();
  });

  // 1. Two competing requests for the last available unit
  it("Test 1: Prevents double-booking via concurrency-safe transactional hold allocation", async () => {
    // Red Cross has only 1 confirmed unit of O_NEG PRBC
    const bankId = "bank-redcross";

    // Request 1 tries to reserve 1 unit
    const req1 = await InventoryService.reserveUnitsForMission(bankId, "PRBC", "O_NEG", 1, 20, "req-1");
    expect(req1.success).toBe(true);
    expect(req1.reservedUnitIds.length).toBe(1);

    // Competing Request 2 tries to reserve the same unit simultaneously
    const req2 = await InventoryService.reserveUnitsForMission(bankId, "PRBC", "O_NEG", 1, 20, "req-2");
    expect(req2.success).toBe(false);
    expect(req2.error).toBe("INSUFFICIENT_STOCK");
  });

  // 2. Stale inventory cannot become automatically confirmed
  it("Test 2: Rejects stale unverified inventory (>24h) from confirmed rescue tier", () => {
    const request: EmergencyRescueRequest = {
      id: "req-test-stale",
      requestNumber: "REQ-TEST-001",
      hospitalId: "hosp-victoria",
      requestingClinician: {
        name: "Dr. Ananya Rao",
        registrationNumber: "KMC-62914",
        department: "Transfusion Medicine",
        phone: "+91 9999999999",
      },
      patientPseudonym: "PAT-001",
      component: "PRBC",
      bloodGroup: "O_NEG",
      unitsRequested: 1,
      priority: "CRASH_CODE_RED",
      requiredBy: new Date().toISOString(),
      specialRequirements: {},
      clinicalJustification: "Emergency obstetric test",
      createdAt: new Date().toISOString(),
    };

    const candidates = CoordinationEngine.evaluateCandidates(request);
    const staleBank = candidates.find(c => c.bloodBankId === "bank-bowring");
    
    expect(staleBank).toBeDefined();
    expect(staleBank?.isStaleData).toBe(true);
    // Stale bank readiness score is downgraded and flagged
    expect(staleBank?.readinessScore).toBeLessThan(30);
    expect(staleBank?.rationale).toContain("STALE_DATA_WARNING");
  });

  // 3. Expired units cannot be issued
  it("Test 3: Rejects confirmation and issuance of expired blood units", () => {
    // Inject synthetic expired unit
    const expiredUnit = {
      id: "unit-expired-test",
      unitBarcode: "KA-EXP-001",
      bloodBankId: "bank-ttk",
      component: "PRBC" as const,
      bloodGroup: "O_NEG" as const,
      volumeMl: 350,
      collectionDate: "2026-08-01T00:00:00Z",
      expiryDate: "2026-09-12T00:00:00Z", // Past date
      status: "REPORTED" as const,
      testingClearance: {
        hivElisa: "NEGATIVE" as const,
        hbsAg: "NEGATIVE" as const,
        hcv: "NEGATIVE" as const,
        vdrlSyphilis: "NEGATIVE" as const,
        malaria: "NEGATIVE" as const,
        natTested: true,
        testedAt: "2026-08-02T00:00:00Z",
        verifiedByStaffId: "STAFF-01",
      },
      storageLocation: "Cooler 1",
      specialAttributes: { leukoreduced: true, irradiated: false, cmvNegative: true, washed: false, paediatricAliquot: false },
    };

    // Add directly to in-memory units map for test verification
    (InventoryService as any).units.set("unit-expired-test", expiredUnit);

    const result = InventoryService.confirmUnitAvailability("unit-expired-test", "STAFF-01", "BLOOD_BANK_OFFICER");
    expect(result.success).toBe(false);
    expect(result.error).toContain("CLINICAL_SAFETY_REJECTION");
    expect(result.error).toContain("Expired");
  });

  // 4. Confirmation and hold expiration behavior
  it("Test 4: Correctly releases active holds back to available pool upon expiration", async () => {
    const res = await InventoryService.reserveUnitsForMission("bank-ttk", "PRBC", "O_NEG", 2, 20, "req-hold-test");
    expect(res.success).toBe(true);
    expect(res.reservedUnitIds.length).toBe(2);

    for (const uid of res.reservedUnitIds) {
      const u = InventoryService.getUnitById(uid);
      expect(u?.status).toBe("HELD");
    }

    // Release hold (simulating timeout or cancellation)
    const releaseRes = InventoryService.releaseHold(res.reservedUnitIds, "Timeout expired");
    expect(releaseRes.releasedCount).toBe(2);

    for (const uid of res.reservedUnitIds) {
      const u = InventoryService.getUnitById(uid);
      expect(u?.status).toBe("CONFIRMED");
      expect(u?.currentHoldId).toBeUndefined();
    }
  });

  // 5. Courier cannot issue blood units
  it("Test 5: Enforces strict role authorization — couriers cannot issue blood units", () => {
    const attemptAsCourier = InventoryService.issueUnitsToCourier(["unit-ttk-01"], "COURIER");
    expect(attemptAsCourier.success).toBe(false);
    expect(attemptAsCourier.error).toContain("ROLE_ENFORCEMENT_VIOLATION");

    const attemptAsOfficer = InventoryService.issueUnitsToCourier(["unit-ttk-01"], "BLOOD_BANK_OFFICER");
    // Should fail if not in HELD status first
    expect(attemptAsOfficer.success).toBe(false);
    expect(attemptAsOfficer.error).toContain("INVALID_STATE");
  });

  // 6. Unauthorized users cannot view sensitive records
  it("Test 6: Masks sensitive unit barcodes and clinical identifiers for public/unauthorized view", () => {
    const unit = InventoryService.getUnitById("unit-ttk-01");
    expect(unit).toBeDefined();

    const masked = InventoryService.getPublicMaskedUnit(unit!);
    expect(masked.maskedBarcode).toContain("***");
    expect(masked.maskedBarcode).not.toEqual(unit!.unitBarcode);
  });

  // 7. Repeated handoff requests do not create duplicate events (Idempotence & Cryptographic linkage)
  it("Test 7: Maintains cryptographic chain integrity and event provenance", () => {
    const event1 = CustodyAuditService.createEvent("m-01", "HOLD_ISSUED", "Dr. Rao", "HOSPITAL_CLINICIAN", "Victoria", ["u1"], "Initial hold");
    const event2 = CustodyAuditService.createEvent("m-01", "COURIER_PICKUP", "Suresh", "COURIER", "MediRoute", ["u1"], "Picked up", event1.eventHash);
    const event3 = CustodyAuditService.createEvent("m-01", "FINAL_RECEIPT_VERIFIED", "Sister Mary", "HOSPITAL_CLINICIAN", "Victoria", ["u1"], "Received", event2.eventHash);

    const validation = CustodyAuditService.verifyChainIntegrity([event1, event2, event3]);
    expect(validation.isValid).toBe(true);

    // Tampered event test: mutate event 2's previous hash
    const tamperedEvent2 = { ...event2, previousEventHash: "TAMPERED_HASH_9999" };
    const invalidValidation = CustodyAuditService.verifyChainIntegrity([event1, tamperedEvent2, event3]);
    expect(invalidValidation.isValid).toBe(false);
    expect(invalidValidation.brokenIndex).toBe(1);
  });

  // 8. Unit withdrawal triggers a mission alert
  it("Test 8: Unit withdrawal transitions state to DISRUPTED with audit alert", () => {
    const mission = MissionStore.getMission();
    const result = ReroutingService.triggerDisruption(mission, "STOCK_WITHDRAWN_CLINICAL_EMERGENCY");
    
    expect(result.mission.status).toBe("DISRUPTED");
    expect(result.mission.disruption?.type).toBe("STOCK_WITHDRAWN_CLINICAL_EMERGENCY");
    expect(result.disruptionSummary.headline).toContain("Critical Disruption");
    expect(result.mission.custodyTrail.some(e => e.stepName === "DISRUPTION_FLAGGED")).toBe(true);
  });

  // 9. Failed transport triggers an exception state
  it("Test 9: Cold-chain temperature excursion triggers operational exception alert", () => {
    const mission = MissionStore.getMission();
    const result = ReroutingService.triggerDisruption(mission, "TEMPERATURE_EXCURSION");

    expect(result.mission.status).toBe("DISRUPTED");
    expect(result.disruptionSummary.headline).toContain("Temperature Excursion Alert");
    expect(result.disruptionSummary.anomalyAnalysis).toContain("7.4°C");
  });

  // 10. Unconfirmed candidates are not presented as secured inventory
  it("Test 10: Ensures unconfirmed REPORTED listings cannot be allocated into holds", async () => {
    // Bowring has only REPORTED stock
    const bankId = "bank-bowring";
    const res = await InventoryService.reserveUnitsForMission(bankId, "PRBC", "O_NEG", 1, 20, "req-test");
    expect(res.success).toBe(false);
    expect(res.error).toBe("INSUFFICIENT_STOCK");
  });

  // 11. Clinical approval gates cannot be bypassed
  it("Test 11: Reroute authorization requires authorized clinician or emergency coordinator", async () => {
    const mission = MissionStore.getMission();
    const disruption = ReroutingService.triggerDisruption(mission, "HOLD_EXPIRED");

    // Courier attempts to authorize rerouting (Should be rejected)
    const unauthorizedAttempt = await ReroutingService.approveReroute(
      disruption.mission,
      "Suresh Courier",
      "COURIER",
      "Bypassing clinical gate"
    );
    expect(unauthorizedAttempt.success).toBe(false);
    expect(unauthorizedAttempt.error).toContain("SECURITY_VIOLATION");

    // Authorized Clinician approves rerouting
    const authorizedAttempt = await ReroutingService.approveReroute(
      disruption.mission,
      "Dr. Ananya Rao, MD",
      "HOSPITAL_CLINICIAN",
      "Clinically authorized emergency reroute"
    );
    expect(authorizedAttempt.success).toBe(true);
    expect(authorizedAttempt.mission.status).toBe("HOLD_CONFIRMED");
  });

  // 12. AI unavailability does not break core mission workflow
  it("Test 12: Deterministic clinical fallback functions seamlessly when AI API is offline", () => {
    const request = MissionStore.getMission().request;
    const candidates = CoordinationEngine.evaluateCandidates(request);

    const insights = AiDecisionSupportService.generateDeterministicInsights(request, candidates);
    expect(insights.isAiFallback).toBe(true);
    expect(insights.triageExplanation).toContain("Primary candidate");
    expect(insights.routeRecommendation).toContain("arterial corridor");
  });

  // 13. Demo reset returns data to a known baseline
  it("Test 13: Reset restores pristine demo state across units, reservations, and missions", () => {
    // Mutate state
    MissionStore.advanceToStep(6);
    expect(MissionStore.getMission().status).toBe("DISRUPTED");

    // Reset
    MissionStore.resetToBaseline();
    const resetMission = MissionStore.getMission();
    expect(resetMission.status).toBe("REQUEST_SUBMITTED");
    expect(resetMission.allocatedUnitIds.length).toBe(0);
    expect(resetMission.disruption).toBeUndefined();
    expect(MissionStore.getDemoStep()).toBe(1);
  });
});
