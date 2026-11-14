"use client";

import React, { useState } from "react";
import { BloodComponentType, BloodGroup, EmergencyRescueRequest, MissionPriority } from "@/types";
import { MissionStore } from "@/lib/services/mission-store";
import { sound } from "@/lib/audio";
import {
  BLOOD_GROUP_LABELS,
  COMPONENT_LABELS,
  COMPONENT_TEMPERATURE_SPECIFICATIONS,
} from "@/lib/constants";
import { DEMO_HOSPITALS } from "@/lib/demo-data";
import {
  AlertCircle,
  AlertTriangle,
  Building2,
  CheckCircle2,
  Clock,
  HeartPulse,
  Info,
  ShieldAlert,
  Sparkles,
  Stethoscope,
  X,
} from "lucide-react";

interface EmergencyWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const EmergencyWizardModal: React.FC<EmergencyWizardModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [hospitalId, setHospitalId] = useState(DEMO_HOSPITALS[0].id);
  const [clinicianName, setClinicianName] = useState("Dr. Ananya Rao, MD");
  const [regNumber, setRegNumber] = useState("KMC-62914-REG");
  const [department, setDepartment] = useState("Transfusion Medicine & Emergency Obstetrics");
  const [phone, setPhone] = useState("+91 98450 12891");
  const [patientPseudonym, setPatientPseudonym] = useState("SYN-EM-OB-882");
  const [component, setComponent] = useState<BloodComponentType>("PRBC");
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>("O_NEG");
  const [unitsRequested, setUnitsRequested] = useState<number>(2);
  const [priority, setPriority] = useState<MissionPriority>("CRASH_CODE_RED");
  const [requiredMinutes, setRequiredMinutes] = useState<number>(45);
  const [leukoreduced, setLeukoreduced] = useState(true);
  const [irradiated, setIrradiated] = useState(false);
  const [cmvNegative, setCmvNegative] = useState(true);
  const [washed, setWashed] = useState(false);
  const [clinicalJustification, setClinicalJustification] = useState(
    "Severe postpartum hemorrhage with hemodynamic shock (BP 70/40, HR 138). Massive Transfusion Protocol (MTP) activated. 2 units O-neg PRBC required immediately pending emergency cross-match."
  );

  if (!isOpen) return null;

  const applyPreset = (presetName: string) => {
    sound.playSuccess();
    if (presetName === "PPH") {
      setComponent("PRBC");
      setBloodGroup("O_NEG");
      setUnitsRequested(2);
      setPriority("CRASH_CODE_RED");
      setRequiredMinutes(30);
      setLeukoreduced(true);
      setCmvNegative(true);
      setClinicalJustification("Postpartum hemorrhage (estimated blood loss > 1800mL). Severe hemorrhagic shock. Stat uncrossmatched O-neg PRBC.");
    } else if (presetName === "TRAUMA") {
      setComponent("PRBC");
      setBloodGroup("O_POS");
      setUnitsRequested(4);
      setPriority("CRASH_CODE_RED");
      setRequiredMinutes(45);
      setLeukoreduced(true);
      setClinicalJustification("Polytrauma high-speed motor vehicle collision with pelvic fracture and active retroperitoneal bleeding. MTP Pack 1.");
    } else if (presetName === "DENGUE") {
      setComponent("PLATELETS");
      setBloodGroup("B_POS");
      setUnitsRequested(4);
      setPriority("URGENT");
      setRequiredMinutes(90);
      setLeukoreduced(true);
      setClinicalJustification("Severe Dengue Hemorrhagic Fever with platelet count < 8,000/mcL and mucosal GI bleeding.");
    } else if (presetName === "DIC") {
      setComponent("FFP");
      setBloodGroup("AB_POS");
      setUnitsRequested(4);
      setPriority("URGENT");
      setRequiredMinutes(60);
      setClinicalJustification("Disseminated Intravascular Coagulation (DIC) with severe hypofibrinogenemia and prolonged PT/INR > 3.2.");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playAlert();

    const newRequest: EmergencyRescueRequest = {
      id: `req-${Date.now()}`,
      requestNumber: `REQ-2026-BLR-${Math.floor(1000 + Math.random() * 9000)}`,
      hospitalId,
      requestingClinician: {
        name: clinicianName,
        registrationNumber: regNumber,
        department,
        phone,
      },
      patientPseudonym,
      component,
      bloodGroup,
      unitsRequested,
      priority,
      requiredBy: new Date(Date.now() + requiredMinutes * 60 * 1000).toISOString(),
      specialRequirements: {
        leukoreduced,
        irradiated,
        cmvNegative,
        washed,
      },
      clinicalJustification,
      createdAt: new Date().toISOString(),
    };

    MissionStore.createEmergencyRequest(newRequest);
    sound.playSuccess();
    onSuccess();
    onClose();
  };

  const compSpecs = COMPONENT_TEMPERATURE_SPECIFICATIONS[component];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0D1524] border border-slate-700 rounded-2xl max-w-3xl w-full p-6 shadow-2xl overflow-hidden relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-crimson-950 border border-crimson-800/80 text-crimson-400">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">Create Emergency Blood Rescue Request</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-950 text-blue-300 border border-blue-800">
                  CLINICIAN GATED
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Directives comply with Indian NBTC Transfusion Safety and DGHS Technical Protocols.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4 max-h-[75vh] overflow-y-auto pr-1 text-xs">
          {/* Emergency Presets Bar */}
          <div className="p-3 rounded-xl bg-navy-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono text-slate-300 font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Instant Emergency Presets:
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => applyPreset("PPH")}
                className="px-2.5 py-1 rounded bg-crimson-950 hover:bg-crimson-900 border border-crimson-700/60 text-crimson-200 font-medium transition-colors"
              >
                🚨 Obstetric PPH (O- PRBC)
              </button>
              <button
                type="button"
                onClick={() => applyPreset("TRAUMA")}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-medium transition-colors"
              >
                💥 Polytrauma MTP (O+ PRBC)
              </button>
              <button
                type="button"
                onClick={() => applyPreset("DENGUE")}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-medium transition-colors"
              >
                🩸 Severe Dengue (Platelets)
              </button>
              <button
                type="button"
                onClick={() => applyPreset("DIC")}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-medium transition-colors"
              >
                🧪 Coagulopathy / DIC (FFP)
              </button>
            </div>
          </div>

          {/* Clinician & Hospital Identity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <div>
              <label className="text-slate-400 font-medium">Receiving Hospital</label>
              <select
                value={hospitalId}
                onChange={e => setHospitalId(e.target.value)}
                className="w-full mt-1 px-3 py-1.5 rounded-lg bg-navy-950 border border-slate-700 text-white font-medium"
              >
                {DEMO_HOSPITALS.map(h => (
                  <option key={h.id} value={h.id}>
                    {h.name} ({h.traumaCenterLevel})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-400 font-medium">Patient Synthetic Code (No PII)</label>
              <input
                type="text"
                value={patientPseudonym}
                onChange={e => setPatientPseudonym(e.target.value)}
                className="w-full mt-1 px-3 py-1.5 rounded-lg bg-navy-950 border border-slate-700 text-white font-mono"
              />
            </div>

            <div>
              <label className="text-slate-400 font-medium">Requesting Clinician Name & Degree</label>
              <input
                type="text"
                value={clinicianName}
                onChange={e => setClinicianName(e.target.value)}
                className="w-full mt-1 px-3 py-1.5 rounded-lg bg-navy-950 border border-slate-700 text-white"
              />
            </div>

            <div>
              <label className="text-slate-400 font-medium">Medical Council Reg. Number</label>
              <input
                type="text"
                value={regNumber}
                onChange={e => setRegNumber(e.target.value)}
                className="w-full mt-1 px-3 py-1.5 rounded-lg bg-navy-950 border border-slate-700 text-white font-mono"
              />
            </div>
          </div>

          {/* Component & ABO/Rh Selection */}
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-slate-400 font-medium">Clinician-Approved Component</label>
                <select
                  value={component}
                  onChange={e => setComponent(e.target.value as BloodComponentType)}
                  className="w-full mt-1 px-3 py-1.5 rounded-lg bg-navy-950 border border-slate-700 text-white font-medium"
                >
                  {Object.entries(COMPONENT_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-medium">Clinician-Specified ABO/Rh Group</label>
                <select
                  value={bloodGroup}
                  onChange={e => setBloodGroup(e.target.value as BloodGroup)}
                  className="w-full mt-1 px-3 py-1.5 rounded-lg bg-navy-950 border border-slate-700 text-white font-medium"
                >
                  {Object.entries(BLOOD_GROUP_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-medium">Units Requested</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={unitsRequested}
                  onChange={e => setUnitsRequested(parseInt(e.target.value) || 1)}
                  className="w-full mt-1 px-3 py-1.5 rounded-lg bg-navy-950 border border-slate-700 text-white font-mono text-center text-sm font-bold"
                />
              </div>
            </div>

            {/* Cold Chain Specifications Callout */}
            <div className="p-2.5 rounded-lg bg-navy-950/80 border border-slate-800 flex items-center justify-between text-[11px] text-slate-300">
              <span className="font-mono text-emerald-400">
                Validated Storage Temp: {compSpecs.targetTemp}
              </span>
              <span className="text-slate-400">
                Shelf Life: {compSpecs.shelfLifeDays} days
              </span>
              <span className="text-slate-400 hidden sm:inline">
                {compSpecs.specialHandling}
              </span>
            </div>
          </div>

          {/* Urgency & Special Requirements */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <div>
              <label className="text-slate-400 font-medium">Medical Urgency Classification</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as MissionPriority)}
                className="w-full mt-1 px-3 py-1.5 rounded-lg bg-navy-950 border border-slate-700 text-white font-medium"
              >
                <option value="CRASH_CODE_RED">🚨 CRASH CODE RED — Immediate Life Threat (&lt;30m)</option>
                <option value="URGENT">⚠️ URGENT — Critical Surgery/ICU (&lt;2h)</option>
                <option value="PRIORITY">🕒 PRIORITY — Semi-Urgent Transfusion (&lt;6h)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 font-medium">Required-By Time Window</label>
              <select
                value={requiredMinutes}
                onChange={e => setRequiredMinutes(parseInt(e.target.value))}
                className="w-full mt-1 px-3 py-1.5 rounded-lg bg-navy-950 border border-slate-700 text-white font-medium"
              >
                <option value={30}>Within 30 Minutes (Crash)</option>
                <option value={45}>Within 45 Minutes</option>
                <option value={60}>Within 60 Minutes (1 Hour)</option>
                <option value={120}>Within 120 Minutes (2 Hours)</option>
                <option value={180}>Within 180 Minutes (3 Hours)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="text-slate-400 font-medium block mb-1">
                Special Processing & Modifications (Approved by Clinician)
              </label>
              <div className="flex flex-wrap gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={leukoreduced}
                    onChange={e => setLeukoreduced(e.target.checked)}
                    className="rounded bg-navy-950 border-slate-700 text-crimson-600 focus:ring-0"
                  />
                  <span>Leuko-depleted / Leuko-reduced</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={cmvNegative}
                    onChange={e => setCmvNegative(e.target.checked)}
                    className="rounded bg-navy-950 border-slate-700 text-crimson-600 focus:ring-0"
                  />
                  <span>CMV Seronegative</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={irradiated}
                    onChange={e => setIrradiated(e.target.checked)}
                    className="rounded bg-navy-950 border-slate-700 text-crimson-600 focus:ring-0"
                  />
                  <span>Irradiated (GVHD Prevention)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={washed}
                    onChange={e => setWashed(e.target.checked)}
                    className="rounded bg-navy-950 border-slate-700 text-crimson-600 focus:ring-0"
                  />
                  <span>Washed Red Cells / Platelets</span>
                </label>
              </div>
            </div>
          </div>

          {/* Clinical Justification */}
          <div>
            <label className="text-slate-400 font-medium">Clinical Justification & Supporting Notes</label>
            <textarea
              rows={2}
              value={clinicalJustification}
              onChange={e => setClinicalJustification(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-lg bg-navy-950 border border-slate-700 text-white text-xs font-mono"
            />
          </div>

          {/* Mandatory Safety Disclaimer */}
          <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-700/60 flex items-start gap-2.5 text-amber-300 text-[11px]">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-400" />
            <div>
              <span className="font-bold">Medical Safety & Regulatory Disclaimer:</span> RedRelay is an emergency coordination and decision-support layer. It does NOT diagnose or autonomously prescribe blood products. Final compatibility testing (major/minor cross-match) and release authorization must be performed by qualified immunohematologists.
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-crimson-600 hover:bg-crimson-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-glow-crimson transition-all active:scale-98"
          >
            <HeartPulse className="w-4 h-4" />
            Dispatch AI Rescue Mission Control
          </button>
        </form>
      </div>
    </div>
  );
};
