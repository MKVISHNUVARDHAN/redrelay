"use client";

import React, { useState, useEffect } from "react";
import { RescueMission } from "@/types";
import { MissionStore } from "@/lib/services/mission-store";
import { sound } from "@/lib/audio";
import {
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  BatteryCharging,
  CheckCircle2,
  Clock,
  Compass,
  FileCheck2,
  Lock,
  MapPin,
  QrCode,
  Radio,
  RotateCcw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ThermometerSnowflake,
  Truck,
  UserCheck,
} from "lucide-react";

export const TransportCustodyScreen: React.FC = () => {
  const [mission, setMission] = useState<RescueMission>(MissionStore.getMission());
  const [qrToken, setQrToken] = useState<string>("RR-9841-PICKUP");
  const [verificationInput, setVerificationInput] = useState<string>("");
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);
  const [showExceptionModal, setShowExceptionModal] = useState(false);

  useEffect(() => {
    return MissionStore.subscribe(() => {
      setMission(MissionStore.getMission());
    });
  }, []);

  const courier = mission.assignedCourier;
  const isDisrupted = mission.status === "DISRUPTED";
  const tempReading = isDisrupted && mission.disruption?.type === "TEMPERATURE_EXCURSION" ? 7.4 : 3.8;

  const handleVerifyPickup = async () => {
    sound.playSuccess();
    await MissionStore.advanceToStep(5);
    setStatusFeedback("Proof of Handoff: Pickup verified by blood bank officer. GPS cold-chain stream active.");
  };

  const handleConfirmHandoff = async () => {
    sound.playSuccess();
    await MissionStore.advanceToStep(10);
    setStatusFeedback("Proof of Handoff: Hospital transfusion lab verified delivery temp & intact physical seal.");
  };

  const handleReportDelay = () => {
    sound.playAlert();
    MissionStore.triggerSimulatedDisruption("COURIER_DELAY_VEHICLE_BREAKDOWN");
    setShowExceptionModal(false);
    setStatusFeedback("Logistics exception transmitted to Emergency Command Center.");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      {/* Mobile-First Courier Tactical Header */}
      <div className="p-5 rounded-2xl bg-[#0D1524] border border-slate-800 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-cyan-950/80 border border-cyan-800/80 text-cyan-400">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold text-white">Cold-Chain Courier Console</h1>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                ACTIVE COURIER
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Rider: <strong className="text-white">{courier?.courierName || "Suresh Kumar"}</strong> • Badge #{courier?.badgeNumber || "KA-MED-4421"}
            </p>
          </div>
        </div>

        <div className="text-right font-mono text-xs">
          <span className="text-slate-500 block text-[10px]">MISSION CODE</span>
          <span className="text-emerald-400 font-bold">{mission.missionCode}</span>
        </div>
      </div>

      {statusFeedback && (
        <div className="p-3.5 rounded-xl bg-navy-950 border border-emerald-500/60 text-emerald-300 text-xs font-mono flex items-center justify-between animate-fade-in">
          <span>{statusFeedback}</span>
          <button onClick={() => setStatusFeedback(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* IoT Cold-Box Telemetry Card */}
      <div className="p-6 rounded-2xl bg-[#0D1524] border border-slate-800 shadow-xl space-y-4 glow-border-emerald">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ThermometerSnowflake className="w-5 h-5 text-cyan-400" />
            <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              IoT Cold-Box Telemetry ({courier?.coldBoxId || "CC-BLR-09"})
            </h2>
          </div>
          <span className="flex items-center gap-1.5 text-xs font-mono text-emerald-400">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
            LIVE STREAM
          </span>
        </div>

        {/* Big Temperature Gauge Dial */}
        <div className="p-6 rounded-xl bg-navy-950/80 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-center sm:text-left">
            <span className="text-xs text-slate-400 block font-mono">INTERNAL TEMPERATURE</span>
            <div className={`text-4xl sm:text-5xl font-extrabold font-mono mt-1 ${
              tempReading > 6.0 ? "text-crimson-400 animate-bounce" : "text-emerald-400"
            }`}>
              {tempReading}°C
            </div>
            <span className="text-[11px] font-mono text-slate-400 mt-1 block">
              DGHS Validated Target: <strong className="text-white">2.0°C — 6.0°C</strong>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs font-mono text-slate-300">
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-500 block">CONTAINER SEAL</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
                <Lock className="w-3.5 h-3.5" /> LOCKED
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-500 block">BATTERY BACKUP</span>
              <span className="text-cyan-400 font-bold flex items-center gap-1 mt-0.5">
                <BatteryCharging className="w-3.5 h-3.5" /> 92%
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-500 block">COOLING METHOD</span>
              <span className="text-white font-bold mt-0.5">Peltier Solid State</span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-500 block">GPS TELEMETRY</span>
              <span className="text-emerald-400 font-bold mt-0.5">10 Hz Transmit</span>
            </div>
          </div>
        </div>
      </div>

      {/* Transit Route Overview */}
      <div className="p-5 rounded-2xl bg-[#0D1524] border border-slate-800 shadow-xl space-y-3">
        <h3 className="text-xs font-bold text-slate-400 font-mono uppercase tracking-wider">
          Active Transit Corridor
        </h3>

        <div className="flex items-center justify-between text-xs font-mono p-3 rounded-xl bg-navy-950 border border-slate-800">
          <div>
            <span className="text-slate-500 text-[10px] block">PICKUP BANK</span>
            <span className="text-white font-bold">
              {isDisrupted ? "NIMHANS Blood Centre" : "Rotary Bangalore TTK"}
            </span>
          </div>

          <ArrowRight className="w-4 h-4 text-slate-500 flex-shrink-0" />

          <div className="text-right">
            <span className="text-slate-500 text-[10px] block">DESTINATION HOSPITAL</span>
            <span className="text-crimson-400 font-bold">
              Victoria Hospital Trauma Centre
            </span>
          </div>
        </div>
      </div>

      {/* Proof of Handoff: Cryptographic Token & Verification Controls */}
      <div className="p-6 rounded-2xl bg-[#0D1524] border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-amber-400" />
            <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              Proof of Handoff (Token & QR Verification)
            </h2>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            Expires in 15 mins
          </span>
        </div>

        {/* Short-Lived QR Card */}
        <div className="p-5 rounded-xl bg-navy-950 border border-slate-800 flex flex-col items-center justify-center space-y-3 text-center">
          {/* Simulated Stylized QR Matrix */}
          <div className="w-36 h-36 bg-white p-3 rounded-2xl shadow-xl flex flex-col justify-between">
            <div className="flex justify-between">
              <div className="w-8 h-8 bg-black rounded-sm border-4 border-black"></div>
              <div className="w-8 h-8 bg-black rounded-sm border-4 border-black"></div>
            </div>
            <div className="flex justify-center items-center py-2">
              <div className="w-4 h-4 bg-crimson-600 rounded-sm"></div>
            </div>
            <div className="flex justify-between">
              <div className="w-8 h-8 bg-black rounded-sm border-4 border-black"></div>
              <div className="w-4 h-4 bg-black rounded-sm"></div>
            </div>
          </div>

          <div className="font-mono">
            <div className="text-xs text-slate-400">SHORT-LIVED VERIFICATION TOKEN</div>
            <div className="text-base font-extrabold text-white tracking-widest mt-0.5">
              {qrToken}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              No patient PII is stored inside QR tokens. Valid for authorized staff only.
            </div>
          </div>
        </div>

        {/* Verification Trigger Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            onClick={handleVerifyPickup}
            className="py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-glow-emerald transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            Verify Pickup at Blood Bank
          </button>

          <button
            onClick={handleConfirmHandoff}
            className="py-3 px-4 rounded-xl bg-crimson-700 hover:bg-crimson-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-glow-crimson transition-all"
          >
            <ShieldCheck className="w-4 h-4" />
            Confirm Hospital Receipt
          </button>
        </div>

        {/* Courier Exception Button */}
        <div className="pt-2 text-center">
          <button
            onClick={() => setShowExceptionModal(true)}
            className="text-xs font-mono text-amber-400 hover:text-amber-300 underline flex items-center justify-center gap-1.5 mx-auto"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Report Transit Delay or Vehicle Mechanical Issue
          </button>
        </div>
      </div>

      {/* Exception Reporting Modal */}
      {showExceptionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0D1524] border border-amber-600/60 rounded-2xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center gap-2.5 text-amber-400 font-bold text-sm">
              <AlertTriangle className="w-5 h-5" />
              Report Logistics Disruption
            </div>
            <p className="text-xs text-slate-300">
              Reporting a vehicle delay or mechanical stall will immediately alert the Emergency Coordination Sentinel to evaluate alternate couriers.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowExceptionModal(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleReportDelay}
                className="px-4 py-1.5 rounded-lg bg-crimson-700 text-white text-xs font-bold"
              >
                Transmit Delay Alert
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
