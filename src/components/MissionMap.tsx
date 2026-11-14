"use client";

import React, { useState } from "react";
import { RescueMission } from "@/types";
import { DEMO_BLOOD_BANKS, DEMO_HOSPITALS } from "@/lib/demo-data";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  Crosshair,
  Info,
  Layers,
  MapPin,
  Maximize2,
  Navigation,
  Radio,
  Shield,
  ShieldAlert,
  ThermometerSnowflake,
  Truck,
  Zap,
} from "lucide-react";

interface MissionMapProps {
  mission: RescueMission;
  onSelectBank?: (bankId: string) => void;
}

export const MissionMap: React.FC<MissionMapProps> = ({
  mission,
  onSelectBank,
}) => {
  const [selectedNode, setSelectedNode] = useState<string | null>(mission.primaryBloodBankId || "bank-ttk");
  const [mapLayer, setMapLayer] = useState<"tactical" | "satellite">("tactical");

  const hospital = DEMO_HOSPITALS[0];
  const banks = DEMO_BLOOD_BANKS;
  const isDisrupted = mission.status === "DISRUPTED";

  // Bengaluru coordinates bounds for projection
  // Lat: 12.930 to 12.990 (approx 6.6 km)
  // Lng: 77.560 to 77.660 (approx 10.8 km)
  const minLat = 12.930;
  const maxLat = 12.995;
  const minLng = 77.565;
  const maxLng = 77.655;

  const project = (lat: number, lng: number) => {
    const x = ((lng - minLng) / (maxLng - minLng)) * 100;
    const y = 100 - ((lat - minLat) / (maxLat - minLat)) * 100; // Invert latitude for SVG
    return { x: Math.max(8, Math.min(92, x)), y: Math.max(8, Math.min(92, y)) };
  };

  const hospPos = project(hospital.location.lat, hospital.location.lng);

  // Active target blood bank (Primary or rerouted)
  const activeBank = banks.find(b => b.id === (isDisrupted ? mission.backupBloodBankId : mission.primaryBloodBankId)) || banks[0];
  const targetPos = project(activeBank.location.lat, activeBank.location.lng);

  // Courier position (interpolated between target bank and hospital, or at bank)
  let courierPos = { x: 50, y: 50 };
  if (mission.status === "REQUEST_SUBMITTED" || mission.status === "BANKS_NOTIFIED") {
    courierPos = { x: targetPos.x - 2, y: targetPos.y + 2 };
  } else if (mission.status === "HOLD_CONFIRMED") {
    courierPos = { x: targetPos.x + 3, y: targetPos.y - 1 };
  } else if (mission.status === "IN_TRANSIT") {
    // Halfway along the trajectory
    courierPos = {
      x: targetPos.x + (hospPos.x - targetPos.x) * 0.48,
      y: targetPos.y + (hospPos.y - targetPos.y) * 0.48,
    };
  } else if (mission.status === "DISRUPTED") {
    courierPos = {
      x: targetPos.x + (hospPos.x - targetPos.x) * 0.35,
      y: targetPos.y + (hospPos.y - targetPos.y) * 0.35,
    };
  } else if (mission.status === "HANDOFF_COMPLETED") {
    courierPos = { x: hospPos.x + 1, y: hospPos.y - 1 };
  }

  const selectedBankData = banks.find(b => b.id === selectedNode);
  const evaluationData = mission.candidateEvaluations.find(c => c.bloodBankId === selectedNode);

  return (
    <div className="relative w-full h-[540px] rounded-2xl bg-[#080E18] border border-slate-800 overflow-hidden shadow-2xl flex flex-col">
      {/* Top Map HUD Bar */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto bg-[#0A1220]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 text-xs shadow-lg">
          <Crosshair className="w-4 h-4 text-crimson-400 animate-spin" style={{ animationDuration: "12s" }} />
          <span className="font-mono text-slate-300 font-semibold">TACTICAL RESCUE RADAR</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400 font-mono text-[11px]">BENGALURU CORRIDOR</span>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="bg-[#0A1220]/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-slate-700/80 text-xs text-slate-300 font-mono flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>GPS FIX: LOCK</span>
            <span className="text-slate-500">|</span>
            <span className="text-[10px] text-amber-300">Transit: Simulated</span>
          </div>

          <div className="bg-[#0A1220]/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-700/80 text-slate-400 flex items-center gap-1">
            <button
              onClick={() => setMapLayer(mapLayer === "tactical" ? "satellite" : "tactical")}
              className="px-2 py-1 text-[11px] font-mono rounded bg-slate-800 hover:text-white transition-colors"
            >
              {mapLayer === "tactical" ? "TACTICAL" : "SATELLITE"}
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Tactical Canvas & SVG Map */}
      <div className="relative flex-1 w-full h-full select-none overflow-hidden bg-tactical-grid">
        {/* Subtle grid concentric rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <div className="w-[450px] h-[450px] rounded-full border border-slate-600 border-dashed"></div>
          <div className="w-[300px] h-[300px] rounded-full border border-slate-600 border-dashed absolute"></div>
          <div className="w-[150px] h-[150px] rounded-full border border-slate-600 absolute"></div>
        </div>

        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#177A63" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#D33D56" stopOpacity="0.9" />
            </linearGradient>

            <linearGradient id="disruptGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F43F5E" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.9" />
            </linearGradient>
          </defs>

          {/* Active Mission Route Polyline */}
          <line
            x1={`${targetPos.x}%`}
            y1={`${targetPos.y}%`}
            x2={`${hospPos.x}%`}
            y2={`${hospPos.y}%`}
            stroke={isDisrupted ? "url(#disruptGradient)" : "url(#routeGradient)"}
            strokeWidth="3.5"
            strokeDasharray={isDisrupted ? "6,4" : "none"}
            className={isDisrupted ? "animate-pulse" : ""}
          />

          {/* Secondary backup route when disrupted */}
          {isDisrupted && (
            <line
              x1={`${courierPos.x}%`}
              y1={`${courierPos.y}%`}
              x2={`${project(DEMO_BLOOD_BANKS[2].location.lat, DEMO_BLOOD_BANKS[2].location.lng).x}%`}
              y2={`${project(DEMO_BLOOD_BANKS[2].location.lat, DEMO_BLOOD_BANKS[2].location.lng).y}%`}
              stroke="#10B981"
              strokeWidth="2.5"
              strokeDasharray="4,4"
            />
          )}
        </svg>

        {/* Hospital Node (Receiving Center) */}
        <div
          style={{ left: `${hospPos.x}%`, top: `${hospPos.y}%` }}
          className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-30 group"
          onClick={() => setSelectedNode(null)}
        >
          <div className="relative flex items-center justify-center">
            {/* Pulsing Beacon */}
            <span className="absolute w-12 h-12 rounded-full bg-crimson-600/30 animate-ping pointer-events-none"></span>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-crimson-600 to-crimson-800 border-2 border-white text-white flex items-center justify-center shadow-glow-crimson group-hover:scale-110 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="absolute top-11 left-1/2 -translate-x-1/2 bg-[#09111D]/95 px-2.5 py-1 rounded-md border border-crimson-500/80 whitespace-nowrap shadow-lg text-center">
            <p className="text-[11px] font-bold text-white tracking-wide">{hospital.name.split("&")[0]}</p>
            <p className="text-[9px] font-mono text-crimson-300 uppercase font-semibold">Receiving Hospital • Level 1</p>
          </div>
        </div>

        {/* Candidate Blood Bank Nodes */}
        {banks.map(bank => {
          const pos = project(bank.location.lat, bank.location.lng);
          const isSelected = selectedNode === bank.id;
          const isPrimary = mission.primaryBloodBankId === bank.id;
          const isBackup = mission.backupBloodBankId === bank.id;
          const evalItem = mission.candidateEvaluations.find(c => c.bloodBankId === bank.id);

          let nodeColor = "bg-slate-800 border-slate-600 text-slate-300";
          let badgeText = "REPORTED";
          let badgeColor = "bg-slate-800 text-slate-300 border-slate-700";

          if (evalItem?.isStaleData) {
            nodeColor = "bg-red-950/80 border-red-700 text-red-300";
            badgeText = "STALE (REJECTED)";
            badgeColor = "bg-red-950 text-red-300 border-red-800";
          } else if (isPrimary) {
            nodeColor = isDisrupted
              ? "bg-amber-950 border-amber-500 text-amber-200 animate-pulse"
              : "bg-emerald-950 border-emerald-500 text-emerald-200";
            badgeText = isDisrupted ? "DISRUPTED" : "CONFIRMED HOLD";
            badgeColor = isDisrupted ? "bg-amber-950 text-amber-300 border-amber-700" : "bg-emerald-950 text-emerald-300 border-emerald-700";
          } else if (isBackup) {
            nodeColor = "bg-blue-950 border-blue-500 text-blue-200";
            badgeText = "VERIFIED BACKUP";
            badgeColor = "bg-blue-950 text-blue-300 border-blue-700";
          }

          return (
            <div
              key={bank.id}
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-30 group"
              onClick={() => {
                setSelectedNode(bank.id);
                if (onSelectBank) onSelectBank(bank.id);
              }}
            >
              <div className="relative flex items-center justify-center">
                {isPrimary && (
                  <span className="absolute w-10 h-10 rounded-full bg-emerald-500/20 animate-ping pointer-events-none"></span>
                )}
                <div
                  className={`w-9 h-9 rounded-xl border-2 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform ${nodeColor}`}
                >
                  <Shield className="w-4 h-4" />
                </div>
              </div>

              <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-[#09111D]/95 px-2 py-0.5 rounded-md border border-slate-700 whitespace-nowrap shadow-md text-center">
                <p className="text-[10px] font-bold text-slate-200">{bank.name.split(" ")[0]} {bank.name.split(" ")[1]}</p>
                <span className={`inline-block px-1.5 py-0.2 rounded text-[8px] font-mono font-bold border ${badgeColor}`}>
                  {badgeText}
                </span>
              </div>
            </div>
          );
        })}

        {/* Courier Moving Marker */}
        <div
          style={{ left: `${courierPos.x}%`, top: `${courierPos.y}%` }}
          className="absolute -translate-x-1/2 -translate-y-1/2 z-40 transition-all duration-1000 ease-in-out pointer-events-none"
        >
          <div className="relative flex items-center justify-center">
            <span className="absolute w-8 h-8 rounded-full bg-cyan-500/30 animate-ping"></span>
            <div className="w-8 h-8 rounded-full bg-cyan-600 border-2 border-white text-white flex items-center justify-center shadow-lg">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-navy-950/95 px-2 py-0.5 rounded text-[9px] font-mono font-bold text-cyan-300 border border-cyan-500/60 whitespace-nowrap shadow">
            🏍️ 3.8°C • COLD-BOX #09
          </div>
        </div>
      </div>

      {/* Bottom Floating Node Inspection Drawer */}
      {selectedBankData && (
        <div className="absolute bottom-3 left-3 right-3 z-30 bg-[#0B1422]/95 backdrop-blur-md p-3.5 rounded-xl border border-slate-700/80 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-800 text-slate-200">
              <Shield className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-white text-sm">{selectedBankData.name}</h4>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-navy-900 border border-slate-700 text-slate-300">
                  {selectedBankData.licenseNumber}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {selectedBankData.location.address} • {selectedBankData.contactPhone}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="text-center font-mono">
              <div className="text-slate-400 text-[10px]">DISTANCE / TRANSIT</div>
              <div className="text-white font-bold">
                {evaluationData?.distanceKm} km • ~{evaluationData?.estimatedTransitMinutes} mins
              </div>
            </div>

            <div className="text-center font-mono">
              <div className="text-slate-400 text-[10px]">VERIFIED AVAILABILITY</div>
              <div className="font-bold text-emerald-400">
                {evaluationData?.confirmedUnitsCount} Confirmed Unit(s)
              </div>
            </div>

            <div className="text-center font-mono">
              <div className="text-slate-400 text-[10px]">COLD-CHAIN AUDIT</div>
              <div className="font-bold text-cyan-400">
                {selectedBankData.historicalMetrics.coldChainComplianceRate}% Compliance
              </div>
            </div>

            <div className="text-center font-mono">
              <div className="text-slate-400 text-[10px]">READINESS SCORE</div>
              <div className="text-sm font-extrabold text-amber-400">
                {evaluationData?.readinessScore}/100
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
