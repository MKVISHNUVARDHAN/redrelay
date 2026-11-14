"use client";

import React from "react";
import { ReadinessService } from "@/lib/services/readiness-service";
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clock,
  Compass,
  FileCheck2,
  LineChart,
  Radio,
  Shield,
  ShieldAlert,
  Sparkles,
  ThermometerSnowflake,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

export const ReadinessIntelligenceScreen: React.FC = () => {
  const metrics = ReadinessService.getReadinessOverview();

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#0D1524] border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-purple-950/80 border border-purple-800/80 text-purple-400">
              <LineChart className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-white">Innovation E — Emergency Readiness Intelligence</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Regional blood availability analytics, shortage predictive models, and cold-chain compliance.
              </p>
            </div>
          </div>
        </div>

        <div className="px-3 py-1 rounded-xl bg-navy-950 border border-slate-700 text-xs font-mono text-slate-300 flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Telemetry Freshness: 94.2%</span>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#0C1422] border border-slate-800">
          <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
            <span>Confirmation Turnaround</span>
            <Clock className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-2xl font-extrabold text-white mt-1 font-mono">
            {metrics.medianConfirmationMinutes} min
          </div>
          <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1 font-mono">
            <TrendingDown className="w-3 h-3" /> -2.4m vs conventional calls
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#0C1422] border border-slate-800">
          <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
            <span>Median Transit Duration</span>
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-2xl font-extrabold text-white mt-1 font-mono">
            {metrics.medianTransitMinutes} min
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-mono">
            Simulated arterial corridor
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#0C1422] border border-slate-800">
          <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
            <span>Cold-Chain Compliance</span>
            <ThermometerSnowflake className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 mt-1 font-mono">
            {metrics.overallColdChainCompliance}%
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-mono">
            2.0°C - 6.0°C adherence
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#0C1422] border border-slate-800">
          <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
            <span>Active Coordinated Missions</span>
            <Radio className="w-3.5 h-3.5 text-crimson-400" />
          </div>
          <div className="text-2xl font-extrabold text-crimson-400 mt-1 font-mono">
            {metrics.activeMissionsCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-mono">
            100% hash-verified custody
          </div>
        </div>
      </div>

      {/* Critical Shortage Risk Predictor */}
      <div className="p-6 rounded-2xl bg-[#0D1524] border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h2 className="text-base font-bold text-white">Regional Shortage Risk Forecasting</h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Predictive models identifying near-term stock depletion risk before critical surgery emergencies occur.
            </p>
          </div>

          <span className="px-2.5 py-1 rounded text-[10px] font-mono bg-amber-950/80 text-amber-300 border border-amber-800">
            UNCERTAINTY DISCLOSURE: STATISTICAL ESTIMATES
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="text-[10px] font-mono uppercase bg-slate-900/80 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Blood Component</th>
                <th className="py-2.5 px-3">ABO/Rh Group</th>
                <th className="py-2.5 px-3">Confirmed Stock</th>
                <th className="py-2.5 px-3">Safety Threshold</th>
                <th className="py-2.5 px-3">Est. Depletion Window</th>
                <th className="py-2.5 px-3 text-right">Confidence Interval</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {metrics.criticalShortageRiskComponents.map((item, i) => (
                <tr key={i} className="hover:bg-slate-900/40">
                  <td className="py-3 px-3 font-semibold text-white">{item.component}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded bg-crimson-950/80 text-crimson-300 border border-crimson-800 text-[10px] font-bold">
                      {item.bloodGroup}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-amber-400 font-bold">{item.currentStock} Units</td>
                  <td className="py-3 px-3 text-slate-400">{item.safetyThreshold} Units</td>
                  <td className="py-3 px-3 text-crimson-400 font-bold">
                    ~{item.estimatedDepletionHours} Hours
                  </td>
                  <td className="py-3 px-3 text-right text-slate-400 text-[11px]">
                    {item.confidenceInterval}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-[11px] text-slate-500 italic">
          Disclaimer: Predictive depletion estimates are derived from synthetic historical consumption frequencies. These figures are operational decision-support guides and do not guarantee blood availability or shortages.
        </p>
      </div>

      {/* Near-Expiry Unit Alerts (Wastage Prevention) & Logistics Heatmap */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Near Expiry Units */}
        <div className="p-5 rounded-2xl bg-[#0D1524] border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-400" />
              Near-Expiry Units (&lt;120 Hours)
            </h3>
            <span className="text-[10px] font-mono text-emerald-400">
              Wastage Prevention
            </span>
          </div>

          <div className="space-y-2.5">
            {metrics.nearExpiryUnits.length > 0 ? (
              metrics.nearExpiryUnits.map((u, i) => (
                <div key={i} className="p-3 rounded-xl bg-navy-950 border border-slate-800 flex items-center justify-between text-xs font-mono">
                  <div>
                    <span className="text-white font-bold">{u.unitBarcode}</span>
                    <span className="text-slate-400 block text-[10px]">{u.bloodBankName} • {u.component} ({u.bloodGroup})</span>
                  </div>
                  <div className="text-right">
                    <span className="text-amber-400 font-bold block">{u.hoursUntilExpiry}h Remaining</span>
                    <span className="text-[10px] text-slate-500">Scheduled for redistribution</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400">No units currently approaching critical expiry window.</p>
            )}
          </div>
        </div>

        {/* Regional Route Delay Risk Heatmap */}
        <div className="p-5 rounded-2xl bg-[#0D1524] border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-cyan-400" />
              Regional Logistics Delay Risk
            </h3>
            <span className="text-[10px] font-mono text-slate-400">
              Traffic Telemetry
            </span>
          </div>

          <div className="space-y-2.5">
            {metrics.regionalHeatmap.map((zone, i) => (
              <div key={i} className="p-3 rounded-xl bg-navy-950 border border-slate-800 space-y-1 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-white font-bold">{zone.zone}</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                    zone.demandLevel === "SURGE"
                      ? "bg-crimson-950 text-crimson-300 border border-crimson-800"
                      : zone.demandLevel === "ELEVATED"
                      ? "bg-amber-950 text-amber-300 border border-amber-800"
                      : "bg-emerald-950 text-emerald-300 border border-emerald-800"
                  }`}>
                    {zone.demandLevel}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                  <span>Chokepoint: {zone.lastIncidentRoute}</span>
                  <span className="text-amber-400">{zone.interruptionRiskPercent}% Interruption Risk</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
