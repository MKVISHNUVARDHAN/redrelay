"use client";

import React from "react";
import {
  Activity,
  AlertOctagon,
  ArrowRight,
  CheckCircle2,
  Clock,
  Compass,
  FileCheck2,
  HeartPulse,
  Lock,
  Radio,
  RotateCcw,
  Shield,
  ShieldAlert,
  Sparkles,
  ThermometerSnowflake,
  Truck,
  Users,
  Zap,
} from "lucide-react";
import { ScreenTab } from "../Navigation";
import { sound } from "@/lib/audio";

interface LandingScreenProps {
  onNavigateTab: (tab: ScreenTab) => void;
  onOpenWizard: () => void;
  onStartDemo: () => void;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({
  onNavigateTab,
  onOpenWizard,
  onStartDemo,
}) => {
  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative pt-6 sm:pt-12 pb-10 overflow-hidden">
        {/* Glow ambient effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-crimson-600/10 blur-[130px] rounded-full pointer-events-none"></div>

        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10 px-4">
          {/* Top Mission Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-crimson-950/80 border border-crimson-700/60 shadow-glow-crimson text-crimson-300 text-xs font-mono font-semibold">
            <span className="flex h-2 w-2 rounded-full bg-crimson-500 animate-ping"></span>
            <span>AI EMERGENCY BLOOD RESCUE NETWORK</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300">INDIA MEDICAL HUB PILOT</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.15] font-sans">
            From urgent blood request to verified hospital handoff —{" "}
            <span className="bg-gradient-to-r from-crimson-400 via-rose-300 to-crimson-500 bg-clip-text text-transparent">
              one coordinated mission.
            </span>
          </h1>

          {/* One-Sentence Problem Statement */}
          <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed">
            Finding blood on an online directory does not guarantee it exists, can be issued to your patient, or will survive cold-chain transport. RedRelay replaces disorganized phone calls with an accountable, AI-assisted emergency coordination layer.
          </p>

          {/* CTA Buttons */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => {
                sound.playSuccess();
                onStartDemo();
              }}
              className="px-6 py-3.5 rounded-xl bg-crimson-600 hover:bg-crimson-500 text-white font-bold text-sm flex items-center gap-2 shadow-glow-crimson transition-all active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              Launch 90-Second Guided Rescue Demo
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              onClick={() => {
                sound.playSuccess();
                onNavigateTab("MISSION_CONTROL");
              }}
              className="px-6 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-sm flex items-center gap-2 transition-all hover:text-white"
            >
              <Radio className="w-4 h-4 text-emerald-400" />
              Enter Live Mission Control
            </button>
          </div>

          {/* Real-World Operational Status Ticker */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-mono">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>NABH & NBTC Standards Aligned</span>
            </div>
            <div className="flex items-center gap-2">
              <ThermometerSnowflake className="w-4 h-4 text-cyan-400" />
              <span>IoT Cold-Chain Telemetry (2-6°C)</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-400" />
              <span>Cryptographic Chain of Custody</span>
            </div>
          </div>
        </div>
      </section>

      {/* Side-by-Side Comparison: Current Chaos vs RedRelay Solution */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white">The Difference in Emergency Transfusion</h2>
          <p className="text-xs text-slate-400 mt-1">
            Why directories and chatbots fail in real-world critical hemorrhage
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* The Broken Reality */}
          <div className="p-6 rounded-2xl bg-crimson-950/20 border border-crimson-900/40 space-y-4">
            <div className="flex items-center gap-2.5 text-crimson-400 font-bold text-sm font-mono">
              <AlertOctagon className="w-5 h-5 text-crimson-500" />
              CONVENTIONAL BLOOD DIRECTORIES
            </div>

            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-start gap-2.5">
                <span className="text-crimson-400 font-bold">✕</span>
                <span><strong>Phantom Stock:</strong> Shows inventory updated 48 hours ago that was already transfused to another patient.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-crimson-400 font-bold">✕</span>
                <span><strong>Unverified Phone Calls:</strong> Panicked families and doctors spend 90+ vital minutes calling banks one by one.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-crimson-400 font-bold">✕</span>
                <span><strong>Blind Transport:</strong> Blood carried in informal bags without temperature loggers, risking hemolysis.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-crimson-400 font-bold">✕</span>
                <span><strong>Zero Accountability:</strong> No chain of custody, no audit record when units expire or are rejected.</span>
              </li>
            </ul>
          </div>

          {/* The RedRelay Coordinated Mission */}
          <div className="p-6 rounded-2xl bg-emerald-950/20 border border-emerald-900/40 space-y-4 glow-border-emerald">
            <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-sm font-mono">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              REDRELAY COORDINATED RESCUE
            </div>

            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span><strong>Proof of Availability:</strong> Distinguishes unverified REPORTED listings from staff-CONFIRMED units.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span><strong>20-Minute Active Hold:</strong> Concurrency-safe reservations lock units so couriers never arrive to empty shelves.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span><strong>Failure-Aware Rerouting:</strong> AI Sentinel detects disruptions and reroutes with clinician approval.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span><strong>Proof of Handoff:</strong> Tamper-evident SHA-256 chained QR custody from donor bank to recipient lab.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* The 5 Differentiating Innovations */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-10">
          <span className="text-xs font-mono text-crimson-400 tracking-wider uppercase font-semibold">
            ARCHITECTURAL EXCELLENCE
          </span>
          <h2 className="text-3xl font-extrabold text-white mt-1">Five Differentiating Innovations</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl mx-auto">
            Engineered to bridge clinical decision safety, cold-chain physics, and multi-organization trust.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Innovation A */}
          <div className="p-5 rounded-2xl bg-[#0D1626] border border-slate-800 space-y-3 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-blue-950 border border-blue-800 flex items-center justify-center text-blue-400 font-bold">
              A
            </div>
            <h3 className="text-base font-bold text-white">Proof of Availability</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Never mistake reported listings for reserved stock. Categorizes inventory into three strict visual tiers: 
              <span className="text-slate-300 font-mono"> REPORTED</span>, 
              <span className="text-emerald-400 font-mono"> CONFIRMED</span>, and 
              <span className="text-amber-400 font-mono"> HELD</span>. Masks unit barcodes for security.
            </p>
          </div>

          {/* Innovation B */}
          <div className="p-5 rounded-2xl bg-[#0D1626] border border-slate-800 space-y-3 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-800 flex items-center justify-center text-purple-400 font-bold">
              B
            </div>
            <h3 className="text-base font-bold text-white">AI Rescue Mission Control</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Deterministic rules filter exact clinician requirements and reject stale data (&gt;24h). AI generates clear prioritization explanations and transit anomaly alerts without making unauthorized clinical judgments.
            </p>
          </div>

          {/* Innovation C */}
          <div className="p-5 rounded-2xl bg-[#0D1626] border border-crimson-800/80 space-y-3 glow-border-crimson">
            <div className="w-10 h-10 rounded-xl bg-crimson-950 border border-crimson-700 flex items-center justify-center text-crimson-400 font-bold">
              C
            </div>
            <h3 className="text-base font-bold text-white">Failure-Aware Rescue Rerouting</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              <strong>Signature Demonstration:</strong> When a hold expires, stock is recalled, or temperature spikes, the system alerts humans, preserves evidence, and presents ranked backups. Never silently substitutes blood.
            </p>
          </div>

          {/* Innovation D */}
          <div className="p-5 rounded-2xl bg-[#0D1626] border border-slate-800 space-y-3 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400 font-bold">
              D
            </div>
            <h3 className="text-base font-bold text-white">Proof of Handoff</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Short-lived cryptographic QR tokens verify custody at each transition: Bank release, Courier pickup, Transit checkpoints, and Hospital blood bank receipt. Built on an immutable append-only ledger.
            </p>
          </div>

          {/* Innovation E */}
          <div className="p-5 rounded-2xl bg-[#0D1626] border border-slate-800 space-y-3 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-amber-950 border border-amber-800 flex items-center justify-center text-amber-400 font-bold">
              E
            </div>
            <h3 className="text-base font-bold text-white">Emergency Readiness Intelligence</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Predictive models forecast regional shortages, flag near-expiry units before wastage occurs, and calculate logistics interruption risks. All statistical forecasts are transparently labeled with uncertainty intervals.
            </p>
          </div>

          {/* Multi-Perspective Switcher */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-navy-900 to-[#121E33] border border-slate-700 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-600 flex items-center justify-center text-white">
              <Users className="w-5 h-5 text-crimson-400" />
            </div>
            <h3 className="text-base font-bold text-white">5 Unified Perspectives</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Experience the platform as a Requesting Clinician, Blood Bank Officer, Cold-Chain Courier, Emergency Coordinator, or Regulatory Auditor in real time.
            </p>
          </div>
        </div>
      </section>

      {/* Regulatory & Safety Disclosures Section */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="p-6 rounded-2xl bg-[#0B1320] border border-slate-800 space-y-4">
          <div className="flex items-center gap-2.5 text-xs font-mono font-bold text-slate-300">
            <Shield className="w-4 h-4 text-emerald-400" />
            REGULATORY STANDARDS, MEDICAL SAFETY & DATA DISCLOSURE
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-400">
            <div>
              <p className="font-semibold text-slate-200 mb-1">NBTC & e-RaktKosh Research Alignment</p>
              <p>
                Modeled after Indian National Blood Transfusion Council (NBTC) guidelines and Directorate General of Health Services (DGHS) Technical Manual. RedRelay is designed as an operational coordination overlay and decision-support system.
              </p>
            </div>
            <div>
              <p className="font-semibold text-slate-200 mb-1">Human-Gated Transfusion Verification</p>
              <p>
                AI systems never approve crossmatching or issue blood units autonomously. Final clinical compatibility (major/minor tube crossmatch) and biological issue remain the strict responsibility of licensed transfusion medicine professionals.
              </p>
            </div>
            <div>
              <p className="font-semibold text-slate-200 mb-1">Synthetic Data Notice</p>
              <p>
                In demonstration mode, all patient identifiers (pseudonyms), blood unit barcodes, and inventory numbers are synthetic and fictional. No real patient health records (PHI) are collected or exposed.
              </p>
            </div>
            <div>
              <p className="font-semibold text-slate-200 mb-1">Emergency Disclaimer</p>
              <p>
                RedRelay is not a direct patient advisory or diagnostic website. If you are experiencing an acute personal medical emergency, immediately dial 112 or visit your nearest emergency department.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
