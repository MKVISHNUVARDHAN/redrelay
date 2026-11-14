import { NextResponse } from "next/server";
import { ReadinessService } from "@/lib/services/readiness-service";

export async function GET() {
  const readiness = ReadinessService.getReadinessOverview();

  return NextResponse.json({
    success: true,
    readiness,
    disclaimer: "All predictive depletion metrics are statistical estimates derived from regional consumption patterns. They do not constitute guaranteed supply availability.",
    timestamp: new Date().toISOString(),
  });
}
