"use client";

import React, { useState, useEffect } from "react";
import { RescueMission } from "@/types";
import { MissionStore } from "@/lib/services/mission-store";
import { MissionMap } from "../MissionMap";
import { BLOOD_GROUP_LABELS, COMPONENT_LABELS } from "@/lib/constants";
import { sound } from "@/lib/audio";
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  Brain,
  CheckCircle2,
  Clock,
  Compass,
  FileCheck2,
  Lock,
  Radio,
  RotateCcw,
  Shield,
  ShieldAlert,
  Sparkles,
  ThermometerSnowflake,
  Truck,
  Zap,
} from "lucide-react";

interface MissionControlScreenProps {
  onSimulateDisruptionClick: () => void;
  onOpenWizard: () => void;
}

export const MissionControlScreen: React.FC<MissionControlScreenProps> = ({
  onSimulateDisruptionClick,
  onOpenWizard,
}) => {
  const [mission, setMission] = useState<RescueMission>(MissionStore.getMission());
  const [selectedBankId, setSelectedBankId] = useState<string | null>(mission.primaryBloodBankId || "bank-ttk");

  useEffect(() => {
    return MissionStore.subscribe(() => {
      const m = MissionStore.getMission();
      setMission(m);
      if (m.primaryBloodBankId) setSelectedBankId(m.primaryBloodBankId);
    });
  }, []);

  const isDisrupted = mission.status === "DISRUPTED";

  return (
    <div className="space-y-6 pb-12">
      {/* Top Mission Telemetry Bar */}
      <div className="p-4 rounded-2xl bg-[#0D1524] border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-crimson-950 border border-crimson-800 text-crimson-400">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-white tracking-wider">
                {mission.missionCode}
              </span>
              <span className="text-slate-600">|</span>
              <span className="text-xs text-slate-300 font-semibold">
                {COMPONENT_LABELS[mission.request.component]}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-crimson-950 text-crimson-300 border border-crimson-800">
                {BLOOD_GROUP_LABELS[mission.request.bloodGroup]}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Protocol: {mission.request.priority} • Needed: {mission.request.unitsRequested} Unit(s) • Patient: {mission.request.patientPseudonym}
            </p>
          </div>
        </div>

        {/* Live Cold-Chain Quick Gauge */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="p-2 rounded-xl bg-navy-950 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-500 block">COLD-BOX TEMP</span>
            <span className={`text-sm font-bold flex items-center justify-center gap-1 ${
              isDisrupted && mission.disruption?.type === "TEMPERATURE_EXCURSION"
                ? "text-crimson-400 animate-pulse"
                : "text-emerald-400"
            }`}>
              <ThermometerSnowflake className="w-3.5 h-3.5" />
              {isDisrupted && mission.disruption?.type === "TEMPERATURE_EXCURSION" ? "7.4°C" : "3.8°C"}
            </span>
          </div>

          <div className="p-2 rounded-xl bg-navy-950 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-500 block">EST. TRANSIT</span>
            <span className="text-sm font-bold text-cyan-300">
              ~{mission.candidateEvaluations[0]?.estimatedTransitMinutes || 18}m (Sim)
            </span>
          </div>

          <button
            onClick={onSimulateDisruptionClick}
            className="px-3 py-2 rounded-xl bg-crimson-700 hover:bg-crimson-600 text-white font-semibold text-xs flex items-center gap-1.5 shadow-glow-crimson transition-all animate-pulse"
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Simulate Disruption</span>
            <span className="sm:hidden">Disrupt</span>
          </button>
        </div>
      </div>

      {/* Main Split View: Tactical Map on Left (60%), Intelligence Panel on Right (40%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Tactical Interactive Radar Map */}
        <div className="lg:col-span-7 space-y-4">
          <MissionMap mission={mission} onSelectBank={id => setSelectedBankId(id)} />

          {/* Operational Transport Telemetry Details */}
          <div className="p-4 rounded-2xl bg-[#0D1524] border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-cyan-400" />
                AUTHORIZED MEDICAL TRANSPORT & COLD-CHAIN TELEMETRY
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                Peltier Active Cooling
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono text-slate-300">
              <div>
                <span className="text-[10px] text-slate-500 block">COURIER</span>
                <span>{mission.assignedCourier?.courierName || "Suresh Kumar"}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">VEHICLE PLATE</span>
                <span>{mission.assignedCourier?.vehiclePlate || "KA-01-EQ-9920"}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">CONTAINER ID</span>
                <span className="text-cyan-300">{mission.assignedCourier?.coldBoxId || "CC-BLR-09"}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">SEAL / LID STATUS</span>
                <span className="text-emerald-400">LOCKED & SEALED</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: AI Rescue Mission Intelligence Panel */}
        <div className="lg:col-span-5 space-y-4">
          {/* AI Decision-Support Triage Box */}
          <div className="p-5 rounded-2xl bg-[#0D1524] border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-purple-950 border border-purple-800 text-purple-400">
                  <Brain className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                  AI Clinical Decision Support
                </h3>
              </div>

              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-950 text-purple-300 border border-purple-800">
                {mission.aiInsights.isAiFallback ? "Deterministic Engine" : "Gemini 1.5 Flash"}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-navy-950 border border-purple-900/40 text-xs text-slate-200 leading-relaxed font-sans">
              {mission.aiInsights.triageExplanation}
            </div>

            <div className="p-2.5 rounded-lg bg-[#0A101C] border border-slate-800 text-[11px] text-slate-400 font-mono">
              <span className="text-emerald-400 font-semibold">Route Rationale: </span>
              {mission.aiInsights.routeRecommendation}
            </div>
          </div>

          {/* Proof of Availability — Candidate Banks Scorecard */}
          <div className="p-5 rounded-2xl bg-[#0D1524] border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                  Proof of Availability (Candidate Tiers)
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                Exact Component Filter
              </span>
            </div>

            <p className="text-[11px] text-slate-400">
              Only physically confirmed units can be reserved. Unconfirmed reported listings or stale feeds are excluded from the verified tier.
            </p>

            {/* Candidate List */}
            <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
              {mission.candidateEvaluations.map((c, idx) => {
                const isPrimary = mission.primaryBloodBankId === c.bloodBankId;
                const isBackup = mission.backupBloodBankId === c.bloodBankId;

                return (
                  <div
                    key={c.bloodBankId}
                    className={`p-3 rounded-xl border transition-all ${
                      c.isStaleData
                        ? "bg-red-950/20 border-red-900/60 opacity-80"
                        : isPrimary
                        ? "bg-navy-950 border-emerald-500/80 shadow-glow-emerald"
                        : "bg-navy-950/60 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-slate-500">#{idx + 1}</span>
                        <h4 className="text-xs font-bold text-white">{c.bloodBankName}</h4>
                      </div>

                      {c.isStaleData ? (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-red-950 text-red-400 border border-red-800">
                          STALE &gt;38H
                        </span>
                      ) : isPrimary ? (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-700">
                          PRIMARY TARGET
                        </span>
                      ) : isBackup ? (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-blue-950 text-blue-300 border border-blue-800">
                          BACKUP
                        </span>
                      ) : null}
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-slate-800 text-[11px] font-mono">
                      <div>
                        <span className="text-slate-500 text-[9px] block">CONFIRMED STOCK</span>
                        <span className={c.confirmedUnitsCount > 0 ? "text-emerald-400 font-bold" : "text-slate-400"}>
                          {c.confirmedUnitsCount} Unit(s)
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[9px] block">TRANSIT (SIM)</span>
                        <span className="text-slate-300">{c.distanceKm}km • ~{c.estimatedTransitMinutes}m</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[9px] block">READINESS</span>
                        <span className="text-amber-400 font-bold">{c.readinessScore}/100</span>
                      </div>
                    </div>

                    <div className="mt-2 text-[10px] text-slate-400 italic">
                      {c.rationale}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Mission Event Timeline (Cryptographic Chain of Custody) */}
      <div className="p-6 rounded-2xl bg-[#0D1524] border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">Immutable Chain of Custody Event Ledger</h2>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>SHA-256 Chained Block Verification:</span>
            <span className="text-emerald-400 font-bold">100% VALID</span>
          </div>
        </div>

        {/* Timeline Event Cards */}
        <div className="space-y-3">
          {mission.custodyTrail.map((event, index) => (
            <div
              key={event.id}
              className="p-3.5 rounded-xl bg-navy-950/80 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center font-mono text-slate-300 font-bold text-xs flex-shrink-0">
                  {index + 1}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-white text-xs">
                      {event.stepName}
                    </span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-300 font-medium">{event.actorName}</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-slate-900 border border-slate-700 text-slate-400">
                      {event.actorRole}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {event.notes}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-1 font-mono text-[10px] text-slate-400 flex-shrink-0">
                <div className="text-slate-300">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </div>
                {event.temperatureAtEvent !== undefined && (
                  <div className="text-cyan-400">
                    Temp: {event.temperatureAtEvent}°C
                  </div>
                )}
                <div className="text-[9px] text-slate-500 font-mono">
                  Hash: {event.eventHash}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
