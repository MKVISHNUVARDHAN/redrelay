# RedRelay — The AI Emergency Blood Rescue Network

> **"From urgent blood request to verified hospital handoff — one coordinated mission."**  
> *Tagline: Every unit. Every minute. Every handoff.*

[![Tests](https://img.shields.io/badge/Vitest-13%20Passed-177A63?style=for-the-badge&logo=vitest&logoColor=white)](./tests/redrelay.test.ts)
[![Next.js](https://img.shields.io/badge/Next.js-14.2.15-090F19?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict%20Mode-2563EB?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Compliance](https://img.shields.io/badge/NBTC%20%2F%20DGHS-Aligned-D33D56?style=for-the-badge)](./docs/MEDICAL_SAFETY.md)

---

## 1. What is RedRelay?

During medical emergencies, locating a blood component in a directory is only one challenge. A database listing does not guarantee that blood actually exists in storage, is cleared of viral markers, can be released to a courier, or will survive cold-chain transport without hemolysis.

**RedRelay** is an AI-assisted coordination and decision-support layer connecting:
1. **Hospital Clinicians & Transfusion Specialists**
2. **Licensed Blood Banks**
3. **Cold-Chain Medical Transport Couriers**
4. **Emergency Coordinators**
5. **Auditors & Quality Regulators**

Crucially, RedRelay is a **coordination and decision-support system**, not an automated replacement for medical professionals, pre-transfusion crossmatching, or clinical judgment.

---

## 2. Five Differentiating Innovations

1. **Innovation A — Proof of Availability**:
   - Isolates three strict visual tiers: `REPORTED` (unverified listing), `CONFIRMED` (staff verified physical stock), and `HELD` (active temporary lock).
   - Rejects stale data (>24h) and prevents phantom inventory double-booking.
2. **Innovation B — AI Rescue Mission Control**:
   - Deterministic safety engine filters exact clinician requirements and immunohematology compatibility (differentiating red cells vs. plasma vs. platelets).
   - AI provides natural-language triage summaries and route explanations without autonomously making clinical treatment decisions.
3. **Innovation C — Failure-Aware Rescue Rerouting (Signature Demo)**:
   - When a hold expires, stock is recalled for surgery, or a temperature sensor spikes, the system alerts humans, preserves evidence in the ledger, and ranks pre-screened backups.
   - **Never silently substitutes blood units**; clinician approval is mandatory.
4. **Innovation D — Proof of Handoff**:
   - Short-lived cryptographic QR tokens verify custody at each transition: Bank release, Courier pickup, and Hospital transfusion laboratory handoff.
   - Built on an immutable SHA-256 chained audit ledger. No patient PII is stored inside QR codes.
5. **Innovation E — Emergency Readiness Intelligence**:
   - Turnaround benchmarking, shortage predictive models with explicit statistical uncertainty intervals, and near-expiry unit alerts (<120h) to eliminate wastage.

---

## 3. Quick Start & Local Setup

### Prerequisites
- Node.js v18+ or v20+ (tested on Node v24.16.0)
- npm or yarn

### Installation
```bash
# 1. Clone or navigate to the directory
cd "c:\Users\vishnu vardhan\Downloads\New folder"

# 2. Install dependencies
npm install

# 3. (Optional) Configure environment
cp .env.example .env
# Set optional GEMINI_API_KEY if desired; otherwise deterministic clinical engine runs offline!

# 4. Run the development server
npm run dev

# 5. Open your browser
# Navigate to http://localhost:3000
```

### Running the Production Build
```bash
npm run build
npm start
```

---

## 4. Automated Invariant Verification (Vitest)

RedRelay includes a comprehensive test suite in `tests/redrelay.test.ts` covering all 13 critical safety, concurrency, and role invariants:

```bash
npm run test
```

### Test Results
```
 ✓ tests/redrelay.test.ts (13 tests) 70ms

 Test Files  1 passed (1)
      Tests  13 passed (13)
```

| # | Invariant Verified | Outcome |
|---|---|---|
| 1 | Two competing requests for the last available unit | **PASSED (Concurrency Locked)** |
| 2 | Stale inventory (>24h) cannot become automatically confirmed | **PASSED (Excluded from Verified)** |
| 3 | Expired units cannot be issued | **PASSED (Clinical Safety Rejection)** |
| 4 | Confirmation and hold expiration behavior | **PASSED (Auto-Release to Pool)** |
| 5 | Courier cannot issue blood units | **PASSED (Role Enforcement)** |
| 6 | Unauthorized users cannot view sensitive records | **PASSED (Barcodes Masked)** |
| 7 | Tamper-evident SHA-256 chained cryptographic linkage | **PASSED (100% Valid Ledger)** |
| 8 | Unit withdrawal triggers a mission disruption alert | **PASSED (Sentinel Flagged)** |
| 9 | Failed transport (temp excursion >6°C) triggers exception | **PASSED (Quarantine Triggered)** |
| 10 | Unconfirmed candidates are not presented as secured inventory | **PASSED (Rejection Enforced)** |
| 11 | Clinical approval gates cannot be bypassed during rerouting | **PASSED (Human Gate Enforced)** |
| 12 | AI unavailability does not break core mission workflow | **PASSED (Deterministic Fallback)** |
| 13 | Demo reset returns data to a known baseline | **PASSED (Pristine State Restored)** |

---

## 5. Experiencing the 90-Second Guided Rescue Demo

When you launch RedRelay in your browser:
1. Look at the top floating **90s Guided Rescue Demo Bar**.
2. Click **"Auto-Play 90s"** or step through Steps 1 to 10 manually using the arrow controls.
3. Click the glowing red **"Simulate Disruption"** button to experience **Innovation C**:
   - Watch the AI Sentinel detect an operational emergency.
   - Inspect the proposed alternative (NIMHANS Blood Centre).
   - Enter clinical authorization notes and approve the reroute.
4. Use the **Role Perspective Switcher** in the top-right corner to experience RedRelay as:
   - 👨‍⚕️ **Clinician (Hospital)**
   - 🩸 **Blood Bank Officer**
   - 🏍️ **Cold-Chain Courier**
   - 🛰️ **Emergency Coordinator**
   - 🔍 **Public & Quality Auditor**
5. Click **"Reset Demo"** at any time to return the database to the baseline state.

---

## 6. Directory Structure

```
redrelay/
├── src/
│   ├── app/
│   │   ├── globals.css              # Dark tactical styles, beacons, glow tokens
│   │   ├── layout.tsx               # Root layout with fonts & Leaflet
│   │   └── page.tsx                 # Central unified application controller
│   ├── components/
│   │   ├── Navigation.tsx           # Role switcher, status badge, audio feedback
│   │   ├── GuidedDemoBar.tsx        # 90-second guided demo controller
│   │   ├── DisruptionModal.tsx      # Failure-Aware Rescue Rerouting modal
│   │   ├── EmergencyWizardModal.tsx # Clinician-gated request wizard
│   │   ├── MissionMap.tsx           # Tactical interactive radar canvas map
│   │   └── screens/
│   │       ├── LandingScreen.tsx            # Screen 1: Public landing & problem
│   │       ├── HospitalDashboardScreen.tsx  # Screen 2: Hospital mission dashboard
│   │       ├── MissionControlScreen.tsx     # Screen 4: Visual masterpiece command
│   │       ├── BloodBankOperationsScreen.tsx# Screen 5: Blood bank inventory desk
│   │       ├── TransportCustodyScreen.tsx   # Screen 6: Courier mobile cold-chain
│   │       ├── ReadinessIntelligenceScreen.tsx # Screen 7: AI readiness & shortage
│   │       └── AuditTrailScreen.tsx         # Tamper-evident cryptographic ledger
│   ├── lib/
│   │   ├── audio.ts                 # Web Audio API tactical chimes
│   │   ├── constants.ts             # NBTC/DGHS storage temps & compatibility rules
│   │   ├── demo-data.ts             # Bengaluru medical corridor synthetic scenario
│   │   └── services/
│   │       ├── audit-service.ts     # SHA-256 hash chaining & chain verification
│   │       ├── inventory-service.ts # Concurrency-safe reservations & Proof of Availability
│   │       ├── coordination-engine.ts # Deterministic candidate scoring & routing
│   │       ├── rerouting-service.ts # Failure-aware rerouting & human gates
│   │       ├── ai-service.ts        # Gemini API & deterministic NLP engine
│   │       ├── readiness-service.ts # Predictive shortage & expiry models
│   │       └── mission-store.ts     # Multi-perspective reactive state store
│   └── types/
│       └── index.ts                 # Domain models, roles, components, statuses
├── tests/
│   └── redrelay.test.ts             # 13 automated verification tests (Vitest)
├── docs/
│   ├── ARCHITECTURE.md              # Technical specifications & design diagrams
│   ├── MEDICAL_SAFETY.md            # NBTC/DGHS compliance & clinical safety limits
│   ├── ROADMAP.md                   # Production cloud, IoT, and government roadmap
│   └── PRESENTATION_SCRIPT.md       # 90-second presentation script for judges
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

---

## 7. Medical Safety & Synthetic Data Disclosures

- **Regulatory Alignment**: Designed in accordance with National Blood Transfusion Council (NBTC) and Directorate General of Health Services (DGHS) Technical Manual guidelines.
- **Human Approval**: AI systems never approve crossmatching or biological release autonomously.
- **Synthetic Data**: All hospital patient records, barcodes, and physician registrations in demonstration mode are synthetic test vectors.
- **Emergency Disclaimer**: RedRelay does not provide medical treatment recommendations or personal medical triage. In acute emergencies, contact national emergency services (112 in India).

---

© 2026 RedRelay Team. Built with excellence for the Hackathon.
