import { NextRequest, NextResponse } from "next/server";
import { CustodyAuditService } from "@/lib/services/audit-service";
import { MissionStore } from "@/lib/services/mission-store";

export async function GET() {
  const mission = MissionStore.getMission();
  const integrity = CustodyAuditService.verifyChainIntegrity(mission.custodyTrail);

  return NextResponse.json({
    success: true,
    totalBlocks: mission.custodyTrail.length,
    isChainValid: integrity.isValid,
    brokenBlockIndex: integrity.brokenIndex,
    reason: integrity.reason,
    custodyTrail: mission.custodyTrail,
  });
}
