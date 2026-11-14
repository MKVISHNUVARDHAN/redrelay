"use client";

import React, { useState, useEffect } from "react";
import { Navigation, ScreenTab } from "@/components/Navigation";
import { GuidedDemoBar } from "@/components/GuidedDemoBar";
import { DisruptionModal } from "@/components/DisruptionModal";
import { EmergencyWizardModal } from "@/components/EmergencyWizardModal";
import { LandingScreen } from "@/components/screens/LandingScreen";
import { HospitalDashboardScreen } from "@/components/screens/HospitalDashboardScreen";
import { MissionControlScreen } from "@/components/screens/MissionControlScreen";
import { BloodBankOperationsScreen } from "@/components/screens/BloodBankOperationsScreen";
import { TransportCustodyScreen } from "@/components/screens/TransportCustodyScreen";
import { ReadinessIntelligenceScreen } from "@/components/screens/ReadinessIntelligenceScreen";
import { AuditTrailScreen } from "@/components/screens/AuditTrailScreen";
import { MissionStore } from "@/lib/services/mission-store";
import { RescueMission } from "@/types";

export default function Home() {
  const [currentTab, setCurrentTab] = useState<ScreenTab>("LANDING");
  const [isDisruptionOpen, setIsDisruptionOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [mission, setMission] = useState<RescueMission>(MissionStore.getMission());

  useEffect(() => {
    return MissionStore.subscribe(() => {
      setMission(MissionStore.getMission());
    });
  }, []);

  const handleStartDemo = () => {
    MissionStore.advanceToStep(2);
    setCurrentTab("MISSION_CONTROL");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#090F19] text-slate-100">
      {/* Top Main Command Bar */}
      <Navigation
        currentTab={currentTab}
        onTabChange={tab => setCurrentTab(tab)}
        onOpenWizard={() => setIsWizardOpen(true)}
      />

      {/* Floating 90-Second Guided Rescue Demo Controller */}
      <GuidedDemoBar
        onSimulateDisruptionClick={() => setIsDisruptionOpen(true)}
        onNavigateTab={tab => setCurrentTab(tab as ScreenTab)}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 pt-6">
        {currentTab === "LANDING" && (
          <LandingScreen
            onNavigateTab={tab => setCurrentTab(tab)}
            onOpenWizard={() => setIsWizardOpen(true)}
            onStartDemo={handleStartDemo}
          />
        )}

        {currentTab === "HOSPITAL" && (
          <HospitalDashboardScreen
            onOpenWizard={() => setIsWizardOpen(true)}
            onNavigateTab={tab => setCurrentTab(tab)}
          />
        )}

        {currentTab === "MISSION_CONTROL" && (
          <MissionControlScreen
            onSimulateDisruptionClick={() => setIsDisruptionOpen(true)}
            onOpenWizard={() => setIsWizardOpen(true)}
          />
        )}

        {currentTab === "BLOOD_BANK" && <BloodBankOperationsScreen />}

        {currentTab === "TRANSPORT" && <TransportCustodyScreen />}

        {currentTab === "READINESS" && <ReadinessIntelligenceScreen />}

        {currentTab === "AUDIT" && <AuditTrailScreen />}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-[#080E18] py-6 px-4 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-extrabold text-white">RedRelay</span>
            <span className="text-slate-600">|</span>
            <span>AI Emergency Blood Rescue Network</span>
          </div>

          <div className="text-center sm:text-right text-[11px] text-slate-400">
            <span>Aligned with Indian NBTC & DGHS Transfusion Guidelines • Built for Google Antigravity</span>
          </div>
        </div>
      </footer>

      {/* Interactive Modals */}
      <DisruptionModal
        isOpen={isDisruptionOpen}
        onClose={() => setIsDisruptionOpen(false)}
        mission={mission}
      />

      <EmergencyWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onSuccess={() => setCurrentTab("MISSION_CONTROL")}
      />
    </div>
  );
}
