"use client";

import React, { useState, useEffect } from "react";
import { RescueMission } from "@/types";
import { MissionStore } from "@/lib/services/mission-store";
import { DEMO_HOSPITALS } from "@/lib/demo-data";
import { BLOOD_GROUP_LABELS, COMPONENT_LABELS } from "@/lib/constants";
import { ScreenTab } from "../Navigation";
import { sound } from "@/lib/audio";
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  Building2,
  CheckCircle2,
  Clock,
  HeartPulse,
  PlusCircle,
  Radio,
  ShieldCheck,
  Stethoscope,
  Truck,
  UserCheck,
} from "lucide-react";

interface HospitalDashboardScreenProps {
  onOpenWizard: () => void;
  onNavigateTab: (tab: ScreenTab) => void;
}

export const HospitalDashboardScreen: React.FC<HospitalDashboardScreenProps> = ({
  onOpenWizard,
  onNavigateTab,
}) => {
  const [mission, setMission] = useState<RescueMission>(MissionStore.getMission());
  const hospital = DEMO_HOSPITALS[0];

  useEffect(() => {
    return MissionStore.subscribe(() => {
      setMission(MissionStore.getMission());
    });
  }, []);

  const getStatusDisplay = (status: RescueMission["status"]) => {
    switch (status) {
      case "REQUEST_SUBMITTED":
        return { label: "Awaiting Bank Pings", color: "text-blue-400 bg-blue-950 border-blue-800" };
      case "BANKS_NOTIFIED":
        return { label: "Candidate Verification Active", color: "text-amber-400 bg-amber-950 border-amber-800 animate-pulse" };
      case "HOLD_CONFIRMED":
        return { label: "Active 20-Min Hold Confirmed", color: "text-emerald-400 bg-emerald-950 border-emerald-800" };
      case "IN_TRANSIT":
        return { label: "Cold-Chain En Route (3.8°C)", color: "text-cyan-400 bg-cyan-950 border-cyan-800" };
      case "DISRUPTED":
        return { label: "Disruption Detected — Reroute Required", color: "text-crimson-400 bg-crimson-950 border-crimson-700 animate-bounce" };
      case "HANDOFF_COMPLETED":
        return { label: "Received & Verified at Hospital Lab", color: "text-emerald-300 bg-emerald-900 border-emerald-600" };
      default:
        return { label: status, color: "text-slate-400 bg-slate-900 border-slate-700" };
    }
  };

  const statusMeta = getStatusDisplay(mission.status);

  return (
    <div className="space-y-6 pb-12">
      {/* Hospital Identity Header Card */}
      <div className="p-6 rounded-2xl bg-[#0D1524] border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-crimson-950/80 border border-crimson-800/80 text-crimson-400 shadow-glow-crimson">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-extrabold text-white">{hospital.name}</h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-crimson-900/60 text-crimson-300 border border-crimson-700/60">
                {hospital.traumaCenterLevel}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              License: <span className="font-mono text-slate-300">{hospital.licenseNumber}</span> • {hospital.location.address}
            </p>
            <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <Stethoscope className="w-3.5 h-3.5 text-emerald-400" />
                Head: {hospital.transfusionHead}
              </span>
              <span>•</span>
              <span className="font-mono text-slate-300">Desk: {hospital.contactPhone}</span>
            </div>
          </div>
        </div>

        {/* Emergency Action */}
        <button
          onClick={() => {
            sound.playAlert();
            onOpenWizard();
          }}
          className="px-5 py-3 rounded-xl bg-crimson-600 hover:bg-crimson-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-glow-crimson transition-all active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          Create Emergency Request
        </button>
      </div>

      {/* Hospital Operations Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#0C1422] border border-slate-800">
          <div className="text-[11px] text-slate-400 font-medium">Active Rescue Missions</div>
          <div className="text-2xl font-extrabold text-white mt-1 font-mono">1</div>
          <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
            <Radio className="w-3 h-3 animate-pulse" /> Sentinel Monitored
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#0C1422] border border-slate-800">
          <div className="text-[11px] text-slate-400 font-medium">Confirmed Active Holds</div>
          <div className="text-2xl font-extrabold text-emerald-400 mt-1 font-mono">
            {mission.status === "HOLD_CONFIRMED" || mission.status === "IN_TRANSIT" ? "1" : "0"}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">20-min safety timer</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0C1422] border border-slate-800">
          <div className="text-[11px] text-slate-400 font-medium">Cold-Chain En Route</div>
          <div className="text-2xl font-extrabold text-cyan-400 mt-1 font-mono">
            {mission.status === "IN_TRANSIT" ? "1" : "0"}
          </div>
          <div className="text-[10px] text-cyan-300 mt-1">IoT Telemetry: 3.8°C</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0C1422] border border-slate-800">
          <div className="text-[11px] text-slate-400 font-medium">Internal O- PRBC Stock</div>
          <div className="text-2xl font-extrabold text-crimson-400 mt-1 font-mono">0 Units</div>
          <div className="text-[10px] text-crimson-300 mt-1 font-semibold">🚨 Depleted (MTP Active)</div>
        </div>
      </div>

      {/* Active Hospital Rescue Missions Table */}
      <div className="p-6 rounded-2xl bg-[#0D1524] border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-crimson-400" />
            <h2 className="text-base font-bold text-white">Active Emergency Rescue Missions</h2>
          </div>
          <button
            onClick={() => onNavigateTab("MISSION_CONTROL")}
            className="text-xs text-crimson-400 hover:text-crimson-300 font-mono font-medium"
          >
            Open Mission Control Map →
          </button>
        </div>

        {/* Mission Card */}
        <div className="p-4 rounded-xl bg-navy-950/80 border border-slate-800 hover:border-slate-700 transition-colors space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-sm font-extrabold text-white">
                {mission.missionCode}
              </span>
              <span className="text-slate-600">|</span>
              <span className="text-xs text-slate-300 font-medium">
                {COMPONENT_LABELS[mission.request.component]}
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-crimson-950 text-crimson-300 border border-crimson-800">
                {BLOOD_GROUP_LABELS[mission.request.bloodGroup]}
              </span>
            </div>

            <div className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold border ${statusMeta.color}`}>
              {statusMeta.label}
            </div>
          </div>

          {/* Details Row */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs text-slate-400 pt-1 border-t border-slate-800/80">
            <div>
              <span className="text-slate-500 block text-[10px]">PATIENT CODE</span>
              <span className="font-mono text-slate-200">{mission.request.patientPseudonym}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">QUANTITY</span>
              <span className="font-mono text-slate-200">{mission.request.unitsRequested} Unit(s)</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">REQUESTING CLINICIAN</span>
              <span className="text-slate-200">{mission.request.requestingClinician.name}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">REQUIRED-BY TIME</span>
              <span className="font-mono text-amber-300">
                {new Date(mission.request.requiredBy).toLocaleTimeString()}
              </span>
            </div>
          </div>

          {/* Clinical Justification summary */}
          <div className="p-2.5 rounded-lg bg-[#0A101C] border border-slate-800 text-[11px] text-slate-300 font-mono">
            <span className="text-slate-500">Clinical Protocol: </span>
            {mission.request.clinicalJustification}
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-1">
            <div className="text-[11px] text-slate-400 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Registered: {new Date(mission.startedAt).toLocaleTimeString()}</span>
            </div>

            <button
              onClick={() => {
                sound.playSuccess();
                onNavigateTab("MISSION_CONTROL");
              }}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Radio className="w-3.5 h-3.5 text-crimson-400" />
              Track Mission Telemetry
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
