"use client";

import React, { useState, useEffect } from "react";
import { CustodyProofEvent, RescueMission } from "@/types";
import { MissionStore } from "@/lib/services/mission-store";
import { CustodyAuditService } from "@/lib/services/audit-service";
import { sound } from "@/lib/audio";
import {
  CheckCircle2,
  FileCheck2,
  Fingerprint,
  Link2,
  Lock,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ThermometerSnowflake,
  UserCheck,
} from "lucide-react";

export const AuditTrailScreen: React.FC = () => {
  const [mission, setMission] = useState<RescueMission>(MissionStore.getMission());
  const [integrityStatus, setIntegrityStatus] = useState<{
    verified: boolean;
    valid: boolean;
    message?: string;
  }>({ verified: false, valid: true });

  useEffect(() => {
    return MissionStore.subscribe(() => {
      setMission(MissionStore.getMission());
    });
  }, []);

  const handleVerifyLedger = () => {
    sound.playSuccess();
    const result = CustodyAuditService.verifyChainIntegrity(mission.custodyTrail);
    setIntegrityStatus({
      verified: true,
      valid: result.isValid,
      message: result.isValid
        ? `Ledger Integrity Verified: All ${mission.custodyTrail.length} custody blocks are cryptographically linked without gaps or unauthorized alterations.`
        : `Cryptographic Alert: ${result.reason}`,
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Card */}
      <div className="p-6 rounded-2xl bg-[#0D1524] border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-emerald-950/80 border border-emerald-800/80 text-emerald-400">
            <Fingerprint className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-white">Innovation D — Tamper-Evident Chain of Custody Ledger</h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                AUDITOR VIEW
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Append-only cryptographic audit trail linking every actor, unit barcode, temperature reading, and status change.
            </p>
          </div>
        </div>

        {/* Audit Verification Trigger */}
        <button
          onClick={handleVerifyLedger}
          className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-2 shadow-glow-emerald transition-all"
        >
          <ShieldCheck className="w-4 h-4" />
          Verify SHA-256 Chain Integrity
        </button>
      </div>

      {/* Integrity Verification Result Banner */}
      {integrityStatus.verified && (
        <div className={`p-4 rounded-xl border flex items-center justify-between text-xs font-mono animate-fade-in ${
          integrityStatus.valid
            ? "bg-emerald-950/80 border-emerald-500/80 text-emerald-200"
            : "bg-crimson-950/80 border-crimson-500 text-rose-200"
        }`}>
          <div className="flex items-center gap-2">
            {integrityStatus.valid ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            ) : (
              <ShieldAlert className="w-5 h-5 text-crimson-400 flex-shrink-0" />
            )}
            <span>{integrityStatus.message}</span>
          </div>
          <span className="text-[10px] text-slate-400">Deterministic Proof</span>
        </div>
      )}

      {/* Cryptographic Event Blocks */}
      <div className="space-y-4">
        {mission.custodyTrail.map((event, index) => {
          const isGenesis = index === 0;
          const isDisruption = event.stepName === "DISRUPTION_FLAGGED";
          const isFinal = event.stepName === "FINAL_RECEIPT_VERIFIED";

          return (
            <div
              key={event.id}
              className={`p-5 rounded-2xl border transition-all ${
                isDisruption
                  ? "bg-crimson-950/30 border-crimson-800/80 shadow-glow-crimson"
                  : isFinal
                  ? "bg-emerald-950/30 border-emerald-800/80 shadow-glow-emerald"
                  : "bg-[#0D1524] border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono font-bold text-xs flex items-center justify-center">
                    #{index + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white font-mono">{event.stepName}</span>
                      {isGenesis && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-blue-950 text-blue-300 border border-blue-800">
                          GENESIS BLOCK
                        </span>
                      )}
                      {isDisruption && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-crimson-950 text-crimson-300 border border-crimson-800 animate-pulse">
                          DISRUPTION
                        </span>
                      )}
                      {isFinal && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">
                          FINAL HANDOFF
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 font-medium">
                      {event.actorName} • <span className="text-slate-400">{event.organization}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right font-mono text-xs">
                  <span className="text-slate-400 block text-[11px]">
                    {new Date(event.timestamp).toLocaleString()}
                  </span>
                  {event.temperatureAtEvent !== undefined && (
                    <span className="text-cyan-400 text-[11px] font-bold flex items-center gap-1 sm:justify-end">
                      <ThermometerSnowflake className="w-3 h-3" />
                      {event.temperatureAtEvent}°C Cold-Box
                    </span>
                  )}
                </div>
              </div>

              {/* Event Notes & Evidence */}
              <div className="py-3 text-xs text-slate-200 font-sans leading-relaxed">
                {event.notes}
              </div>

              {/* Cryptographic Linkage Footer */}
              <div className="pt-3 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono text-slate-400">
                <div className="truncate">
                  <span className="text-slate-500">Previous Block Hash: </span>
                  <span className="text-slate-300 select-all">{event.previousEventHash}</span>
                </div>

                <div className="truncate sm:text-right">
                  <span className="text-slate-500">Current Block Hash: </span>
                  <span className="text-emerald-400 font-bold select-all">{event.eventHash}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
