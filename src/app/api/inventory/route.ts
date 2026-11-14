import { NextRequest, NextResponse } from "next/server";
import { InventoryService } from "@/lib/services/inventory-service";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const bankId = searchParams.get("bankId");
  const isAuthorized = searchParams.get("authorized") === "true";

  let units = bankId ? InventoryService.getUnitsForBank(bankId) : InventoryService.getAllUnits();

  // If unauthorized / public view, mask sensitive barcodes and staff IDs
  if (!isAuthorized) {
    const maskedUnits = units.map(u => InventoryService.getPublicMaskedUnit(u));
    return NextResponse.json({
      success: true,
      tier: "PUBLIC_MASKED_PROOF_OF_AVAILABILITY",
      count: maskedUnits.length,
      units: maskedUnits,
    });
  }

  return NextResponse.json({
    success: true,
    tier: "AUTHORIZED_CLINICAL_VIEW",
    count: units.length,
    units,
  });
}
