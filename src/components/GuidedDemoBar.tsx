"use client";

import React, { useState, useEffect } from "react";
import { GuidedDemoStep, MissionStore } from "@/lib/services/mission-store";
import { sound } from "@/lib/audio";
import {
  AlertOctagon,
  ChevronLeft,
  ChevronRight,
  FastForward,
  Info,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
} from "lucide-react";

interface GuidedDemoBarProps {
  onSimulateDisruptionClick: () => void;
  onNavigateTab: (tab: any) => void;
}

const STEP_METADATA: Record<
  GuidedDemoStep,
  {
    title: string;
    description: string;
    recommendedTab: string;
    recommendedRole: string;
  }
> = {
  1: {
    title: "1. Urgent STAT Blood Request",
    description: "Victoria Hospital activates Crash Code Red for obstetric hemorrhage: 2 Units O-neg PRBC.",
    recommendedTab: "HOSPITAL",
    recommendedRole: "HOSPITAL_CLINICIAN",
  },
  2: {
    title: "2. Proof of Availability Filter",
    description: "System queries regional banks; Bowring Hospital rejected (>38h stale unverified listing).",
    recommendedTab: "MISSION_CONTROL",
    recommendedRole: "COORDINATOR",
  },
  3: {
    title: "3. AI Operational Triage Rationale",
    description: "Coordination engine identifies Rotary TTK as primary (99.7% cold-chain, 7.4 min turnaround).",
    recommendedTab: "MISSION_CONTROL",
    recommendedRole: "COORDINATOR",
  },
  4: {
    title: "4. Blood Bank Confirms Hold",
    description: "Rotary TTK officer inspects unit barcodes & viral clearances; locks 20-minute active hold.",
    recommendedTab: "BLOOD_BANK",
    recommendedRole: "BLOOD_BANK_OFFICER",
  },
  5: {
    title: "5. Transport Dispatched & Telemetry Active",
    description: "Courier Suresh Kumar acknowledges pickup via QR token; Peltier cold-box telemetry links at 3.8°C.",
    recommendedTab: "TRANSPORT",
    recommendedRole: "COURIER",
  },
  6: {
    title: "6. Operational Disruption Detected",
    description: "Disruption: Rotary TTK internal trauma surge causes emergency stock recall before release!",
    recommendedTab: "MISSION_CONTROL",
    recommendedRole: "COORDINATOR",
  },
  7: {
    title: "7. AI Exception Analysis & Backup Ranking",
    description: "AI Sentinel alerts coordinators: NIMHANS Blood Centre ranked as optimal contingency.",
    recommendedTab: "MISSION_CONTROL",
    recommendedRole: "COORDINATOR",
  },
  8: {
    title: "8. Human Authorization Gate",
    description: "Clinician Dr. Ananya Rao reviews exception & formally signs off on NIMHANS rerouting.",
    recommendedTab: "MISSION_CONTROL",
    recommendedRole: "HOSPITAL_CLINICIAN",
  },
  9: {
    title: "9. Rerouted Courier Transit & Telemetry",
    description: "Courier successfully diverts to NIMHANS; fresh units collected with cold-chain intact.",
    recommendedTab: "TRANSPORT",
    recommendedRole: "COURIER",
  },
  10: {
    title: "10. Verified Handoff & Cryptographic Ledger",
    description: "Victoria Hospital verifies cold-box seal & delivery temp (4.1°C); SHA-256 evidence trail finalized.",
    recommendedTab: "AUDIT",
    recommendedRole: "AUDITOR",
  },
};

export const GuidedDemoBar: React.FC<GuidedDemoBarProps> = ({
  onSimulateDisruptionClick,
  onNavigateTab,
}) => {
  const [currentStep, setCurrentStep] = useState<GuidedDemoStep>(MissionStore.getDemoStep());
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    return MissionStore.subscribe(() => {
      setCurrentStep(MissionStore.getDemoStep());
    });
  }, []);

  // 90-second auto play interval (~8-9 seconds per step)
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setTimeout(() => {
        if (currentStep < 10) {
          const next = (currentStep + 1) as GuidedDemoStep;
          handleStepChange(next);
        } else {
          setIsPlaying(false);
          sound.playSuccess();
        }
      }, 8500);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep]);

  const handleStepChange = async (step: GuidedDemoStep) => {
    await MissionStore.advanceToStep(step);
    sound.playSuccess();

    // Auto switch perspective and tab to match the step narrative
    const meta = STEP_METADATA[step];
    if (meta) {
      MissionStore.setActiveRole(meta.recommendedRole as any);
      onNavigateTab(meta.recommendedTab);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    MissionStore.resetToBaseline();
    sound.playSuccess();
    onNavigateTab("LANDING");
  };

  const stepMeta = STEP_METADATA[currentStep];

  return (
    <div className="bg-[#0C1524] border-b border-crimson-900/40 px-4 py-2 text-slate-200">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Step Badge & Controls */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-crimson-950/80 border border-crimson-700/60 text-crimson-300 text-xs font-mono font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-crimson-400" />
              90s GUIDED RESCUE DEMO
            </span>

            <span className="text-xs text-slate-400 font-mono hidden sm:inline">
              Step {currentStep}/10
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleStepChange(Math.max(1, currentStep - 1) as GuidedDemoStep)}
              disabled={currentStep === 1}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs transition-colors"
              title="Previous Step"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                isPlaying
                  ? "bg-amber-600 hover:bg-amber-500 text-white"
                  : "bg-emerald-700 hover:bg-emerald-600 text-white"
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5" /> Pause
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" /> Auto-Play 90s
                </>
              )}
            </button>

            <button
              onClick={() => handleStepChange(Math.min(10, currentStep + 1) as GuidedDemoStep)}
              disabled={currentStep === 10}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs transition-colors"
              title="Next Step"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Current Step Description Callout */}
        <div className="flex-1 max-w-2xl px-2 text-center md:text-left">
          <p className="text-xs font-semibold text-white tracking-wide">
            {stepMeta.title}:{" "}
            <span className="text-slate-300 font-normal">{stepMeta.description}</span>
          </p>
        </div>

        {/* Action Controls: Simulate Disruption & Reset */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={onSimulateDisruptionClick}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-crimson-700 hover:bg-crimson-600 text-white text-xs font-semibold shadow-glow-crimson transition-all animate-pulse"
            title="Demonstrate Innovation C: Failure-Aware Rescue Rerouting"
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            Simulate Disruption
          </button>

          <button
            onClick={handleReset}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs transition-colors"
            title="Reset entire demonstration to baseline state"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Demo</span>
          </button>
        </div>
      </div>

      {/* Progress timeline bar */}
      <div className="max-w-7xl mx-auto mt-2 pt-1 border-t border-slate-800/60 hidden sm:flex items-center justify-between gap-1">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(step => (
          <button
            key={step}
            onClick={() => handleStepChange(step as GuidedDemoStep)}
            className={`flex-1 h-1.5 rounded-full transition-all ${
              step === currentStep
                ? "bg-crimson-500 shadow-glow-crimson scale-y-125"
                : step < currentStep
                ? "bg-emerald-500"
                : "bg-slate-800 hover:bg-slate-700"
            }`}
            title={`Jump to step ${step}: ${STEP_METADATA[step as GuidedDemoStep].title}`}
          />
        ))}
      </div>
    </div>
  );
};
