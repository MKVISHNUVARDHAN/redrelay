/**
 * RedRelay — Concurrency-Safe Blood Inventory Service
 * Enforces Proof of Availability, Human-gated verification, and transactional hold allocations
 */

import { AvailabilityStatus, BloodComponentType, BloodGroup, BloodUnit } from "@/types";
import { DEMO_INVENTORY_UNITS } from "../demo-data";

export interface ReservationResult {
  success: boolean;
  reservedUnitIds: string[];
  message: string;
  holdExpiresAt?: string;
  error?: string;
}

export class InventoryService {
  private static units: Map<string, BloodUnit> = new Map();
  private static locks: Map<string, boolean> = new Map(); // Concurrency locking mechanism

  static {
    this.resetToBaseline();
  }

  /**
   * Reset in-memory database to known baseline for reproducible demos & tests
   */
  public static resetToBaseline() {
    this.units.clear();
    this.locks.clear();
    for (const unit of DEMO_INVENTORY_UNITS) {
      this.units.set(unit.id, JSON.parse(JSON.stringify(unit)));
    }
  }

  public static getAllUnits(): BloodUnit[] {
    return Array.from(this.units.values());
  }

  public static getUnitById(id: string): BloodUnit | undefined {
    const unit = this.units.get(id);
    return unit ? JSON.parse(JSON.stringify(unit)) : undefined;
  }

  public static getUnitsForBank(bankId: string): BloodUnit[] {
    return Array.from(this.units.values()).filter(u => u.bloodBankId === bankId);
  }

  /**
   * Safe public view masking sensitive unit barcodes and staff IDs
   */
  public static getPublicMaskedUnit(unit: BloodUnit) {
    return {
      id: unit.id,
      component: unit.component,
      bloodGroup: unit.bloodGroup,
      status: unit.status,
      // Barcode is masked for public view (e.g. KA-***-0419)
      maskedBarcode: unit.unitBarcode.replace(/-[A-Z0-9]+-/, "-***-"),
      testingStatus: unit.testingClearance.hivElisa === "NEGATIVE" && unit.testingClearance.natTested
        ? "CERTIFIED_NEGATIVE"
        : "INCOMPLETE",
      expiryDate: unit.expiryDate,
      specialAttributes: unit.specialAttributes,
    };
  }

  /**
   * Human Gate: Authorized blood bank staff confirms actual physical stock
   */
  public static confirmUnitAvailability(
    unitId: string,
    authorizedStaffId: string,
    staffRole: string
  ): { success: boolean; unit?: BloodUnit; error?: string } {
    if (staffRole !== "BLOOD_BANK_OFFICER" && staffRole !== "COORDINATOR") {
      return { success: false, error: "SECURITY_VIOLATION: Only licensed blood bank personnel can confirm stock." };
    }

    const unit = this.units.get(unitId);
    if (!unit) return { success: false, error: "Unit not found" };

    // Check expiration safety rule
    if (new Date(unit.expiryDate).getTime() < Date.now()) {
      return { success: false, error: "CLINICAL_SAFETY_REJECTION: Expired unit cannot be confirmed or issued." };
    }

    // Check testing safety rule
    if (
      unit.testingClearance.hivElisa !== "NEGATIVE" ||
      unit.testingClearance.hbsAg !== "NEGATIVE" ||
      unit.testingClearance.hcv !== "NEGATIVE"
    ) {
      return { success: false, error: "CLINICAL_SAFETY_REJECTION: Infectious disease screening non-reactive clearance required." };
    }

    unit.status = "CONFIRMED";
    unit.testingClearance.verifiedByStaffId = authorizedStaffId;
    return { success: true, unit: JSON.parse(JSON.stringify(unit)) };
  }

  /**
   * Concurrency-safe transactional unit reservation (Hold creation)
   */
  public static async reserveUnitsForMission(
    bankId: string,
    component: BloodComponentType,
    bloodGroup: BloodGroup,
    quantity: number,
    holdDurationMinutes: number = 20,
    requestId: string
  ): Promise<ReservationResult> {
    const lockKey = `${bankId}-${component}-${bloodGroup}`;

    // Acquire lock to prevent race conditions
    if (this.locks.get(lockKey)) {
      return {
        success: false,
        reservedUnitIds: [],
        message: "CONCURRENCY_LOCK_ACTIVE: Another emergency allocation is evaluating these units. Please retry momentarily.",
      };
    }

    try {
      this.locks.set(lockKey, true);

      // Find eligible units that are CONFIRMED (Never reserve unconfirmed REPORTED or already HELD units!)
      const eligibleUnits = Array.from(this.units.values()).filter(u => {
        if (u.bloodBankId !== bankId) return false;
        if (u.component !== component) return false;
        if (u.bloodGroup !== bloodGroup) return false;
        if (u.status !== "CONFIRMED") return false;
        
        // Safety: Must not be expired
        if (new Date(u.expiryDate).getTime() < Date.now()) return false;
        
        // Safety: Must have negative clearance
        if (u.testingClearance.hivElisa !== "NEGATIVE") return false;

        return true;
      });

      if (eligibleUnits.length < quantity) {
        return {
          success: false,
          reservedUnitIds: [],
          message: `INSUFFICIENT_CONFIRMED_STOCK: Requested ${quantity} units, but only ${eligibleUnits.length} confirmed unit(s) available. Unconfirmed reported listings cannot be reserved.`,
          error: "INSUFFICIENT_STOCK",
        };
      }

      const holdExpiresAt = new Date(Date.now() + holdDurationMinutes * 60 * 1000).toISOString();
      const allocatedUnitIds: string[] = [];

      for (let i = 0; i < quantity; i++) {
        const u = eligibleUnits[i];
        u.status = "HELD";
        u.currentHoldId = requestId;
        allocatedUnitIds.push(u.id);
      }

      return {
        success: true,
        reservedUnitIds: allocatedUnitIds,
        message: `Successfully confirmed active hold for ${quantity} unit(s) until ${new Date(holdExpiresAt).toLocaleTimeString()}.`,
        holdExpiresAt,
      };
    } finally {
      // Release lock
      this.locks.set(lockKey, false);
    }
  }

  /**
   * Release hold (e.g. on expiration, cancellation, or rerouting)
   */
  public static releaseHold(unitIds: string[], reason: string): { releasedCount: number } {
    let releasedCount = 0;
    for (const id of unitIds) {
      const u = this.units.get(id);
      if (u && u.status === "HELD") {
        u.status = "CONFIRMED";
        u.currentHoldId = undefined;
        releasedCount++;
      }
    }
    return { releasedCount };
  }

  /**
   * Final issuance transition: HELD -> RELEASED (Courier pickup & lab release)
   */
  public static issueUnitsToCourier(
    unitIds: string[],
    authorizedOfficerRole: string
  ): { success: boolean; issuedUnitIds: string[]; error?: string } {
    // Only Blood Bank Officer can issue units
    if (authorizedOfficerRole !== "BLOOD_BANK_OFFICER") {
      return {
        success: false,
        issuedUnitIds: [],
        error: "ROLE_ENFORCEMENT_VIOLATION: Couriers or coordinators cannot issue blood units. Only licensed blood bank officers can release units.",
      };
    }

    const issuedUnitIds: string[] = [];
    for (const id of unitIds) {
      const u = this.units.get(id);
      if (!u) continue;
      
      // Verify unit is actually in HELD state
      if (u.status !== "HELD") {
        return {
          success: false,
          issuedUnitIds,
          error: `INVALID_STATE: Unit ${u.unitBarcode} is not in HELD status (Current: ${u.status}). Cannot issue.`,
        };
      }

      u.status = "RELEASED";
      issuedUnitIds.push(u.id);
    }

    return { success: true, issuedUnitIds };
  }

  /**
   * Simulate sudden withdrawal (e.g. local hospital mass casualty or contaminated batch)
   */
  public static withdrawUnit(unitId: string, reason: string): { success: boolean; unit?: BloodUnit } {
    const u = this.units.get(unitId);
    if (!u) return { success: false };
    u.status = "UNAVAILABLE";
    return { success: true, unit: JSON.parse(JSON.stringify(u)) };
  }
}
