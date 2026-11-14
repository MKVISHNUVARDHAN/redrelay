"use client";

import React, { useState } from "react";
import { DisruptionType, RescueMission } from "@/types";
import { MissionStore } from "@/lib/services/mission-store";
import { sound } from "@/lib/audio";
import {
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Shield,
  ShieldAlert,
  ThermometerSnowflake,
  Truck,
  X,
} from "lucide-react";

interface DisruptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  mission: RescueMission;
}

export const DisruptionModal: React.FC<DisruptionModalProps> = ({
  isOpen,
  onClose,
  mission,
}) => {
  const [selectedType, setSelectedType] = useState<DisruptionType>("STOCK_WITHDRAWN_CLINICAL_EMERGENCY");
  const [approverName, setApproverName] = useState("Dr. Ananya Rao, MD");
  const [approverRole, setApproverRole] = useState("HOSPITAL_CLINICIAN");
  const [approverNotes, setApproverNotes] = useState(
    "Approved emergency mission reroute to NIMHANS Blood Centre. 2 verified units O-neg PRBC reserved."
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTrigger = () => {
    sound.playAlert();
    MissionStore.triggerSimulatedDisruption(selectedType);
    setStatusMessage("Disruption triggered. Sentinel alert recorded in append-only cryptographic ledger.");
  };

  const handleAuthorize = async () => {
    setIsSubmitting(true);
    sound.playAlert();
    const result = await MissionStore.authorizeReroute(approverName, approverRole, approverNotes);
    setIsSubmitting(false);

    if (result.success) {
      sound.playSuccess();
      setStatusMessage("Human approval granted! Mission successfully rerouted with fresh active hold.");
      setTimeout(() => {
        onClose();
        setStatusMessage(null);
      }, 1400);
    } else {
      setStatusMessage(`Error: ${result.error}`);
    }
  };

  const isDisrupted = mission.status === "DISRUPTED";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0E1726] border border-crimson-600/60 rounded-2xl max-w-2xl w-full p-6 shadow-2xl overflow-hidden relative glow-border-crimson">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-crimson-950 border border-crimson-700/80 text-crimson-400">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">Innovation C — Failure-Aware Rescue Rerouting</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-crimson-900/60 text-crimson-300 border border-crimson-700/60">
                  CRITICAL DEMO
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Demonstrates how RedRelay handles disruptions responsibly without silent blood substitutions.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="mt-5 space-y-5 max-h-[75vh] overflow-y-auto pr-1">
          {/* Step 1: Disruption Selector */}
          <div>
            <label className="block text-xs font-mono font-medium text-slate-300 uppercase tracking-wider mb-2">
              Select Operational Disruption Scenario:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedType("STOCK_WITHDRAWN_CLINICAL_EMERGENCY")}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedType === "STOCK_WITHDRAWN_CLINICAL_EMERGENCY"
                    ? "bg-crimson-950/60 border-crimson-500 shadow-glow-crimson"
                    : "bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-400"
                }`}
              >
                <div className="flex items-center gap-2 text-white font-semibold text-xs mb-1">
                  <AlertOctagon className="w-4 h-4 text-crimson-400" />
                  Stock Withdrawn by Bank
                </div>
                <p className="text-[11px] text-slate-400">
                  Bank experiences local internal mass casualty and recalls reserved units before courier handoff.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedType("TEMPERATURE_EXCURSION")}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedType === "TEMPERATURE_EXCURSION"
                    ? "bg-crimson-950/60 border-crimson-500 shadow-glow-crimson"
                    : "bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-400"
                }`}
              >
                <div className="flex items-center gap-2 text-white font-semibold text-xs mb-1">
                  <ThermometerSnowflake className="w-4 h-4 text-amber-400" />
                  Cold-Chain Excursion (&gt;6°C)
                </div>
                <p className="text-[11px] text-slate-400">
                  IoT sensor logs 7.4°C breach inside transport cooler box, violating DGHS/NBTC 2-6°C standard.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedType("HOLD_EXPIRED")}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedType === "HOLD_EXPIRED"
                    ? "bg-crimson-950/60 border-crimson-500 shadow-glow-crimson"
                    : "bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-400"
                }`}
              >
                <div className="flex items-center gap-2 text-white font-semibold text-xs mb-1">
                  <Clock className="w-4 h-4 text-blue-400" />
                  Hold Window Expired
                </div>
                <p className="text-[11px] text-slate-400">
                  20-minute reservation elapsed without courier acknowledgement; stock returned to pool.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedType("COURIER_DELAY_VEHICLE_BREAKDOWN")}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedType === "COURIER_DELAY_VEHICLE_BREAKDOWN"
                    ? "bg-crimson-950/60 border-crimson-500 shadow-glow-crimson"
                    : "bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-400"
                }`}
              >
                <div className="flex items-center gap-2 text-white font-semibold text-xs mb-1">
                  <Truck className="w-4 h-4 text-purple-400" />
                  Courier Mechanical Delay
                </div>
                <p className="text-[11px] text-slate-400">
                  Vehicle breakdown halted transit with +35 min delay; rapid relief diversion required.
                </p>
              </button>
            </div>

            {!isDisrupted && (
              <button
                onClick={handleTrigger}
                className="mt-3 w-full py-2.5 px-4 rounded-xl bg-crimson-700 hover:bg-crimson-600 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-glow-crimson transition-all"
              >
                <AlertTriangle className="w-4 h-4" />
                Simulate Selected Disruption Now
              </button>
            )}
          </div>

          {/* Active Disruption Details (Appears when disrupted) */}
          {isDisrupted && (
            <div className="p-4 rounded-xl bg-crimson-950/70 border border-crimson-700/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-crimson-300 font-mono flex items-center gap-1.5">
                  <AlertOctagon className="w-4 h-4 text-crimson-400" />
                  ACTIVE OPERATIONAL DISRUPTION FLAGGED
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Immutable Event #{mission.custodyTrail.length}
                </span>
              </div>

              <p className="text-xs text-white">
                {mission.disruption?.description || "Disruption flagged by sentinel telemetry."}
              </p>

              {/* Proposed Backup Alternative */}
              <div className="mt-2 p-3 rounded-lg bg-navy-950/90 border border-slate-800 space-y-1.5">
                <div className="text-[11px] font-mono font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  AI Reroute Candidate: NIMHANS Blood Centre
                </div>
                <div className="text-xs text-slate-300 flex items-center justify-between">
                  <span>Stock: 2 Confirmed Units O-neg PRBC</span>
                  <span className="text-emerald-400 font-mono">5.1 km • ~14 min transit</span>
                </div>
                <p className="text-[11px] text-slate-400 italic">
                  Deterministic Rule: Never silently substitute units. Clinician authorization mandatory before re-allocation.
                </p>
              </div>

              {/* Human Approval Gate Form */}
              <div className="mt-3 pt-3 border-t border-crimson-900/60 space-y-3">
                <div className="text-xs font-bold text-slate-200">
                  Human Authorization Gate (Clinician or Emergency Coordinator)
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-400">Authorizing Clinician:</label>
                    <input
                      type="text"
                      value={approverName}
                      onChange={e => setApproverName(e.target.value)}
                      className="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-medium focus:outline-none focus:border-crimson-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400">Authorized Role:</label>
                    <select
                      value={approverRole}
                      onChange={e => setApproverRole(e.target.value)}
                      className="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-medium focus:outline-none focus:border-crimson-500"
                    >
                      <option value="HOSPITAL_CLINICIAN">👨‍⚕️ Clinician (Transfusion Head)</option>
                      <option value="COORDINATOR">🛰️ Emergency Coordinator</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400">Clinical Authorization Notes:</label>
                  <input
                    type="text"
                    value={approverNotes}
                    onChange={e => setApproverNotes(e.target.value)}
                    className="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-medium focus:outline-none focus:border-crimson-500"
                  />
                </div>

                <button
                  onClick={handleAuthorize}
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-glow-emerald transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {isSubmitting ? "Authorizing Reroute..." : "Authorize Reroute to NIMHANS Blood Centre"}
                </button>
              </div>
            </div>
          )}

          {statusMessage && (
            <div className="p-3 rounded-xl bg-slate-900/90 border border-emerald-600/60 text-emerald-300 text-xs text-center font-mono animate-pulse">
              {statusMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
