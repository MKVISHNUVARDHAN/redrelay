"use client";

import React, { useState, useEffect } from "react";
import { BloodComponentType, BloodGroup, BloodUnit, RescueMission } from "@/types";
import { InventoryService } from "@/lib/services/inventory-service";
import { MissionStore } from "@/lib/services/mission-store";
import { DEMO_BLOOD_BANKS } from "@/lib/demo-data";
import { BLOOD_GROUP_LABELS, COMPONENT_LABELS } from "@/lib/constants";
import { sound } from "@/lib/audio";
import {
  AlertOctagon,
  AlertTriangle,
  Building2,
  CheckCircle2,
  Clock,
  Lock,
  Plus,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Stethoscope,
  Trash2,
} from "lucide-react";

export const BloodBankOperationsScreen: React.FC = () => {
  const [selectedBankId, setSelectedBankId] = useState<string>("bank-ttk");
  const [units, setUnits] = useState<BloodUnit[]>(InventoryService.getAllUnits());
  const [mission, setMission] = useState<RescueMission>(MissionStore.getMission());
  const [officerStaffId, setOfficerStaffId] = useState("STAFF-TTK-881");
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // New Unit form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [newComponent, setNewComponent] = useState<BloodComponentType>("PRBC");
  const [newBloodGroup, setNewBloodGroup] = useState<BloodGroup>("O_NEG");
  const [newVolume, setNewVolume] = useState<number>(350);

  const refreshState = () => {
    setUnits(InventoryService.getAllUnits());
    setMission(MissionStore.getMission());
  };

  useEffect(() => {
    return MissionStore.subscribe(() => {
      refreshState();
    });
  }, []);

  const activeBank = DEMO_BLOOD_BANKS.find(b => b.id === selectedBankId) || DEMO_BLOOD_BANKS[0];
  const bankUnits = units.filter(u => u.bloodBankId === selectedBankId);

  const handleConfirmUnit = (unitId: string) => {
    sound.playSuccess();
    const result = InventoryService.confirmUnitAvailability(unitId, officerStaffId, "BLOOD_BANK_OFFICER");
    if (result.success) {
      setActionMessage(`Physical confirmation verified for unit ${result.unit?.unitBarcode}. Ready for hold.`);
      refreshState();
    } else {
      setActionMessage(`Error: ${result.error}`);
    }
  };

  const handleApproveHold = async () => {
    sound.playAlert();
    const res = await InventoryService.reserveUnitsForMission(
      selectedBankId,
      mission.request.component,
      mission.request.bloodGroup,
      mission.request.unitsRequested,
      activeBank.activeHoldTimeoutMinutes,
      mission.requestId
    );

    if (res.success) {
      sound.playSuccess();
      setActionMessage(`Active hold approved for ${mission.request.unitsRequested} unit(s). Courier dispatch notified.`);
      await MissionStore.advanceToStep(4);
      refreshState();
    } else {
      setActionMessage(`Reservation failed: ${res.message}`);
    }
  };

  const handleIssueToCourier = () => {
    sound.playSuccess();
    const heldUnits = bankUnits.filter(u => u.status === "HELD").map(u => u.id);
    if (heldUnits.length === 0) {
      setActionMessage("No units currently in HELD status for this bank.");
      return;
    }

    const res = InventoryService.issueUnitsToCourier(heldUnits, "BLOOD_BANK_OFFICER");
    if (res.success) {
      setActionMessage(`Authorized issue confirmed for ${res.issuedUnitIds.length} unit(s). Handoff token generated.`);
      MissionStore.advanceToStep(5);
      refreshState();
    } else {
      setActionMessage(`Issuance failed: ${res.error}`);
    }
  };

  const handleWithdrawUnit = (unitId: string) => {
    sound.playAlert();
    InventoryService.withdrawUnit(unitId, "Emergency internal surgical recall by blood bank");
    setActionMessage(`Unit marked UNAVAILABLE. Mission sentinel notified.`);
    refreshState();
  };

  const handleAddDemoUnit = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playSuccess();

    const newUnit: BloodUnit = {
      id: `unit-${Date.now()}`,
      unitBarcode: `KA-${selectedBankId.toUpperCase().slice(5)}-2026-${newComponent}-${Math.floor(1000 + Math.random() * 9000)}`,
      bloodBankId: selectedBankId,
      component: newComponent,
      bloodGroup: newBloodGroup,
      volumeMl: newVolume,
      collectionDate: new Date().toISOString(),
      expiryDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString(),
      status: "CONFIRMED",
      testingClearance: {
        hivElisa: "NEGATIVE",
        hbsAg: "NEGATIVE",
        hcv: "NEGATIVE",
        vdrlSyphilis: "NEGATIVE",
        malaria: "NEGATIVE",
        natTested: true,
        testedAt: new Date().toISOString(),
        verifiedByStaffId: officerStaffId,
      },
      storageLocation: "Cooler A-2, Shelf 1",
      specialAttributes: {
        leukoreduced: true,
        irradiated: false,
        cmvNegative: true,
        washed: false,
        paediatricAliquot: false,
      },
    };

    (InventoryService as any).units.set(newUnit.id, newUnit);
    setShowAddForm(false);
    setActionMessage(`New synthetic unit ${newUnit.unitBarcode} registered with negative infectious testing clearance.`);
    refreshState();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Blood Bank Console Header */}
      <div className="p-6 rounded-2xl bg-[#0D1524] border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-800/80 text-emerald-400">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-extrabold text-white">{activeBank.name}</h1>
              {activeBank.nabhAccredited && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                  NABH ACCREDITED
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              License: <span className="font-mono text-slate-300">{activeBank.licenseNumber}</span> • {activeBank.location.address}
            </p>
            <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400">
              <span>Transfusion Officer: <strong className="text-slate-200">{activeBank.transfusionOfficer}</strong></span>
              <span>•</span>
              <span className="font-mono text-slate-300">Staff ID: {officerStaffId}</span>
            </div>
          </div>
        </div>

        {/* Bank Selector Switcher */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400 font-mono hidden sm:inline">Active Bank Desk:</label>
          <select
            value={selectedBankId}
            onChange={e => {
              setSelectedBankId(e.target.value);
              sound.playSuccess();
            }}
            className="px-3 py-2 rounded-xl bg-navy-950 border border-slate-700 text-white text-xs font-semibold focus:outline-none"
          >
            {DEMO_BLOOD_BANKS.map(b => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {actionMessage && (
        <div className="p-3.5 rounded-xl bg-navy-950/90 border border-emerald-600/60 text-emerald-300 text-xs font-mono flex items-center justify-between animate-fade-in">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Incoming Rescue Requests Alert Queue */}
      <div className="p-5 rounded-2xl bg-[#0D1524] border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-crimson-500 animate-ping"></span>
            <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
              Incoming STAT Rescue Requests
            </h2>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            Auto-Escalation in 15 mins
          </span>
        </div>

        <div className="p-4 rounded-xl bg-navy-950/80 border border-crimson-900/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-white text-sm">{mission.missionCode}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-crimson-950 text-crimson-300 border border-crimson-800">
                CRASH CODE RED
              </span>
              <span className="text-xs text-slate-300">
                {COMPONENT_LABELS[mission.request.component]} • {BLOOD_GROUP_LABELS[mission.request.bloodGroup]}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              From: <strong className="text-white">Victoria Hospital Trauma Centre</strong> • Units Needed: <strong className="text-emerald-400">{mission.request.unitsRequested}</strong>
            </p>
            <p className="text-[11px] text-slate-400 italic">
              &quot;{mission.request.clinicalJustification}&quot;
            </p>
          </div>

          {/* Officer Authorization Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0">
            <button
              onClick={handleApproveHold}
              className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-glow-emerald transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              Approve 20-Min Hold ({mission.request.unitsRequested} Units)
            </button>

            <button
              onClick={handleIssueToCourier}
              className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-600 text-white font-bold text-xs flex items-center gap-1.5 transition-all"
            >
              <ShieldCheck className="w-4 h-4" />
              Issue & Release to Courier
            </button>
          </div>
        </div>
      </div>

      {/* Concurrency-Safe Inventory Table */}
      <div className="p-6 rounded-2xl bg-[#0D1524] border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white">Unit-Level Inventory Management</h2>
            <p className="text-xs text-slate-400">
              Proof of Availability: Mandatory physical inspection and viral clearance checklist before hold confirmation.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Register Demo Unit
            </button>

            <button
              onClick={refreshState}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Refresh Inventory"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Add Demo Unit Drawer */}
        {showAddForm && (
          <form onSubmit={handleAddDemoUnit} className="p-4 rounded-xl bg-navy-950 border border-slate-700 space-y-3 animate-fade-in text-xs">
            <h4 className="font-bold text-white text-xs">Register New Synthetic Blood Unit</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-slate-400">Component</label>
                <select
                  value={newComponent}
                  onChange={e => setNewComponent(e.target.value as BloodComponentType)}
                  className="w-full mt-1 px-2.5 py-1.5 rounded bg-slate-900 border border-slate-700 text-white"
                >
                  {Object.entries(COMPONENT_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400">ABO/Rh Group</label>
                <select
                  value={newBloodGroup}
                  onChange={e => setNewBloodGroup(e.target.value as BloodGroup)}
                  className="w-full mt-1 px-2.5 py-1.5 rounded bg-slate-900 border border-slate-700 text-white"
                >
                  {Object.entries(BLOOD_GROUP_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400">Volume (mL)</label>
                <input
                  type="number"
                  value={newVolume}
                  onChange={e => setNewVolume(parseInt(e.target.value) || 350)}
                  className="w-full mt-1 px-2.5 py-1.5 rounded bg-slate-900 border border-slate-700 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
              >
                Save & Clear Infectious Screening
              </button>
            </div>
          </form>
        )}

        {/* Inventory Units Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="text-[10px] font-mono uppercase bg-slate-900/80 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Unit Barcode</th>
                <th className="py-2.5 px-3">Component / Group</th>
                <th className="py-2.5 px-3">Viral Testing Clearance</th>
                <th className="py-2.5 px-3">Expiry Date</th>
                <th className="py-2.5 px-3">Availability Status</th>
                <th className="py-2.5 px-3 text-right">Officer Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {bankUnits.map(unit => {
                const isHeld = unit.status === "HELD";
                const isConfirmed = unit.status === "CONFIRMED";
                const isReported = unit.status === "REPORTED";

                return (
                  <tr key={unit.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 px-3 font-bold text-white">
                      {unit.unitBarcode}
                      <span className="block text-[10px] text-slate-500 font-normal">
                        {unit.storageLocation}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-white font-semibold">{unit.component}</span>
                      <span className="block text-slate-400 text-[10px]">
                        {BLOOD_GROUP_LABELS[unit.bloodGroup]}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[10px]">
                      <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                        <CheckCircle2 className="w-3 h-3" /> HIV/HBV/HCV Negative
                      </span>
                      <span className="text-slate-400 block">
                        NAT Verified • Staff: {unit.testingClearance.verifiedByStaffId}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[11px] text-slate-400">
                      {new Date(unit.expiryDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3">
                      {isHeld ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-700 animate-pulse">
                          HELD (LOCKED)
                        </span>
                      ) : isConfirmed ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700">
                          CONFIRMED
                        </span>
                      ) : isReported ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                          REPORTED (UNVERIFIED)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-950 text-red-400 border border-red-800">
                          {unit.status}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {isReported && (
                          <button
                            onClick={() => handleConfirmUnit(unit.id)}
                            className="px-2.5 py-1 rounded bg-emerald-800 hover:bg-emerald-700 text-white text-[11px] font-semibold"
                          >
                            Physically Confirm
                          </button>
                        )}

                        <button
                          onClick={() => handleWithdrawUnit(unit.id)}
                          className="p-1 rounded bg-slate-800 hover:bg-red-900/60 text-slate-400 hover:text-rose-200 transition-colors"
                          title="Simulate sudden recall or quarantine"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
