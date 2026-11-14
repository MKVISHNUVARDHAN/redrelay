import { NextRequest, NextResponse } from "next/server";
import { MissionStore } from "@/lib/services/mission-store";
import { CoordinationEngine } from "@/lib/services/coordination-engine";
import { ReroutingService } from "@/lib/services/rerouting-service";
import { EmergencyRescueRequest } from "@/types";

export async function GET() {
  const mission = MissionStore.getMission();
  const demoStep = MissionStore.getDemoStep();
  const activeRole = MissionStore.getActiveRole();

  return NextResponse.json({
    success: true,
    mission,
    demoStep,
    activeRole,
    timestamp: new Date().toISOString(),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    // Action 1: Create new emergency request
    if (action === "CREATE_REQUEST") {
      const requestData = body.request as EmergencyRescueRequest;
      if (!requestData || !requestData.component || !requestData.bloodGroup) {
        return NextResponse.json(
          { success: false, error: "VALIDATION_FAILED: Missing component or bloodGroup" },
          { status: 400 }
        );
      }
      const newMission = MissionStore.createEmergencyRequest(requestData);
      return NextResponse.json({ success: true, mission: newMission });
    }

    // Action 2: Trigger simulated disruption
    if (action === "TRIGGER_DISRUPTION") {
      const { disruptionType } = body;
      const result = MissionStore.triggerSimulatedDisruption(disruptionType || "STOCK_WITHDRAWN_CLINICAL_EMERGENCY");
      return NextResponse.json({
        success: true,
        mission: result.mission,
        disruptionSummary: result.disruptionSummary,
      });
    }

    // Action 3: Human approval gate for rerouting
    if (action === "AUTHORIZE_REROUTE") {
      const { approverName, approverRole, approverNotes } = body;
      const result = await MissionStore.authorizeReroute(
        approverName || "Dr. Ananya Rao, MD",
        approverRole || "HOSPITAL_CLINICIAN",
        approverNotes || "Emergency reroute authorized"
      );
      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 403 });
      }
      return NextResponse.json({ success: true, mission: result.mission });
    }

    // Action 4: Advance step in guided demo
    if (action === "ADVANCE_DEMO_STEP") {
      const { step } = body;
      await MissionStore.advanceToStep(step || 1);
      return NextResponse.json({ success: true, mission: MissionStore.getMission() });
    }

    // Action 5: Reset demo
    if (action === "RESET") {
      MissionStore.resetToBaseline();
      return NextResponse.json({ success: true, message: "Baseline demo state restored" });
    }

    return NextResponse.json(
      { success: false, error: `UNKNOWN_ACTION: ${action}` },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
