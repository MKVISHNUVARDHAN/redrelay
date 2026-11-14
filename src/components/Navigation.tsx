"use client";

import React, { useState, useEffect } from "react";
import { Role } from "@/types";
import { MissionStore } from "@/lib/services/mission-store";
import { sound } from "@/lib/audio";
import {
  Activity,
  AlertTriangle,
  Building2,
  CheckCircle2,
  Eye,
  FileCheck2,
  HeartHandshake,
  LineChart,
  MapPin,
  PlusCircle,
  Radio,
  Shield,
  Truck,
  Volume2,
  VolumeX,
} from "lucide-react";

export type ScreenTab =
  | "LANDING"
  | "HOSPITAL"
  | "MISSION_CONTROL"
  | "BLOOD_BANK"
  | "TRANSPORT"
  | "READINESS"
  | "AUDIT";

interface NavigationProps {
  currentTab: ScreenTab;
  onTabChange: (tab: ScreenTab) => void;
  onOpenWizard: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onTabChange,
  onOpenWizard,
}) => {
  const [mission, setMission] = useState(MissionStore.getMission());
  const [role, setRole] = useState<Role>(MissionStore.getActiveRole());
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    return MissionStore.subscribe(() => {
      setMission(MissionStore.getMission());
      setRole(MissionStore.getActiveRole());
    });
  }, []);

  const handleRoleChange = (newRole: Role) => {
    MissionStore.setActiveRole(newRole);
    setRole(newRole);
    sound.playSuccess();
    
    // Auto navigate to natural screen for role
    if (newRole === "HOSPITAL_CLINICIAN") onTabChange("HOSPITAL");
    else if (newRole === "BLOOD_BANK_OFFICER") onTabChange("BLOOD_BANK");
    else if (newRole === "COURIER") onTabChange("TRANSPORT");
    else if (newRole === "COORDINATOR") onTabChange("MISSION_CONTROL");
    else if (newRole === "AUDITOR") onTabChange("AUDIT");
  };

  const toggleSound = () => {
    const nextState = !isMuted;
    setIsMuted(nextState);
    sound.setMuted(nextState);
    if (!nextState) sound.playSuccess();
  };

  const getStatusBadge = () => {
    switch (mission.status) {
      case "REQUEST_SUBMITTED":
        return { label: "REQUEST SUBMITTED", bg: "bg-blue-900/60 text-blue-300 border-blue-500/40" };
      case "BANKS_NOTIFIED":
        return { label: "BANKS NOTIFIED", bg: "bg-amber-900/60 text-amber-300 border-amber-500/40 animate-pulse" };
      case "HOLD_CONFIRMED":
        return { label: "HOLD CONFIRMED (20m)", bg: "bg-emerald-900/60 text-emerald-300 border-emerald-500/40" };
      case "IN_TRANSIT":
        return { label: "COLD-CHAIN IN TRANSIT", bg: "bg-cyan-900/60 text-cyan-300 border-cyan-500/40" };
      case "DISRUPTED":
        return { label: "DISRUPTION DETECTED", bg: "bg-crimson-900/80 text-rose-200 border-crimson-500 animate-bounce" };
      case "HANDOFF_COMPLETED":
        return { label: "HANDOFF COMPLETED", bg: "bg-emerald-800 text-emerald-100 border-emerald-400" };
      default:
        return { label: mission.status, bg: "bg-slate-800 text-slate-300 border-slate-600" };
    }
  };

  const statusBadge = getStatusBadge();

  return (
    <header className="sticky top-0 z-40 bg-[#0A111E]/95 backdrop-blur-md border-b border-slate-800/80">
      {/* Top Telemetry Notification Banner */}
      <div className="bg-navy-900/90 border-b border-slate-800/60 px-4 py-1.5 flex flex-wrap items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-crimson-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-crimson-600"></span>
          </span>
          <span className="font-mono text-slate-300 font-semibold tracking-wider">REDRELAY SENTINEL</span>
          <span className="text-slate-600">|</span>
          <span className="hidden sm:inline text-slate-400">
            Emergency Transfusion Coordination Node • Karnataka Medical Corridor
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-mono">
            <Radio className="w-3.5 h-3.5 text-medical-green animate-pulse" />
            <span className="text-slate-300">Live Mission:</span>
            <span className="text-white font-bold">{mission.missionCode}</span>
          </div>

          <div className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold border ${statusBadge.bg}`}>
            {statusBadge.label}
          </div>

          <button
            onClick={toggleSound}
            title={isMuted ? "Enable Audio Chimes" : "Mute Audio Chimes"}
            className="p-1 text-slate-400 hover:text-white transition-colors"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-slate-500" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Main Command Bar */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
        {/* Logo and Tagline */}
        <div
          onClick={() => onTabChange("LANDING")}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-crimson-600 to-crimson-800 shadow-glow-crimson group-hover:scale-105 transition-transform">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-extrabold tracking-tight text-white font-sans">
                Red<span className="text-crimson-500">Relay</span>
              </span>
              <span className="px-1.5 py-0.5 text-[9px] font-mono tracking-widest uppercase bg-crimson-950/80 text-crimson-300 border border-crimson-800/60 rounded">
                AI RESCUE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden md:block">
              Every unit. Every minute. Every handoff.
            </p>
          </div>
        </div>

        {/* Screen Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1 bg-[#0E1726] p-1 rounded-lg border border-slate-800/80">
          <button
            onClick={() => onTabChange("LANDING")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              currentTab === "LANDING"
                ? "bg-slate-800 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => onTabChange("MISSION_CONTROL")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-1.5 transition-all ${
              currentTab === "MISSION_CONTROL"
                ? "bg-crimson-700 text-white shadow-glow-crimson"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            Mission Control
          </button>
          <button
            onClick={() => onTabChange("HOSPITAL")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-1.5 transition-all ${
              currentTab === "HOSPITAL"
                ? "bg-slate-800 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            Hospital
          </button>
          <button
            onClick={() => onTabChange("BLOOD_BANK")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-1.5 transition-all ${
              currentTab === "BLOOD_BANK"
                ? "bg-slate-800 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            Blood Bank
          </button>
          <button
            onClick={() => onTabChange("TRANSPORT")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-1.5 transition-all ${
              currentTab === "TRANSPORT"
                ? "bg-slate-800 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            Cold-Chain
          </button>
          <button
            onClick={() => onTabChange("READINESS")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-1.5 transition-all ${
              currentTab === "READINESS"
                ? "bg-slate-800 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <LineChart className="w-3.5 h-3.5" />
            AI Readiness
          </button>
          <button
            onClick={() => onTabChange("AUDIT")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-1.5 transition-all ${
              currentTab === "AUDIT"
                ? "bg-slate-800 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            Audit Ledger
          </button>
        </nav>

        {/* Right actions: Role perspective switcher + Emergency Action */}
        <div className="flex items-center gap-2.5">
          {/* Role Perspective Selector */}
          <div className="flex items-center gap-1.5 bg-[#0E1726] px-2.5 py-1 rounded-lg border border-slate-800/80">
            <span className="text-[11px] text-slate-400 hidden sm:inline">Role:</span>
            <select
              value={role}
              onChange={e => handleRoleChange(e.target.value as Role)}
              className="bg-transparent text-xs font-medium text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="COORDINATOR" className="bg-navy-900 text-white">🛰️ Coordinator (Command)</option>
              <option value="HOSPITAL_CLINICIAN" className="bg-navy-900 text-white">👨‍⚕️ Clinician (Hospital)</option>
              <option value="BLOOD_BANK_OFFICER" className="bg-navy-900 text-white">🩸 Blood Bank Officer</option>
              <option value="COURIER" className="bg-navy-900 text-white">🏍️ Cold-Chain Courier</option>
              <option value="AUDITOR" className="bg-navy-900 text-white">🔍 Public & Auditor</option>
            </select>
          </div>

          {/* Emergency Button */}
          <button
            onClick={onOpenWizard}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-crimson-600 hover:bg-crimson-500 text-white text-xs font-semibold shadow-glow-crimson transition-all active:scale-95"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Create Emergency Request</span>
            <span className="sm:hidden">Request</span>
          </button>
        </div>
      </div>
    </header>
  );
};
