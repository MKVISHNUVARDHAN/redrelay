# RedRelay — System Architecture & Technical Specifications

> **"From urgent blood request to verified hospital handoff — one coordinated mission."**

---

## 1. Executive Architectural Overview

RedRelay is an AI-assisted emergency blood coordination and decision-support network connecting five primary stakeholders:
1. **Hospital Clinicians & Transfusion Medicine Specialists**
2. **Licensed Blood Banks & Transfusion Centers**
3. **Authorized Cold-Chain Medical Transport Couriers**
4. **State/District Emergency Response Coordinators**
5. **Regulatory Authorities & Quality Auditors**

Rather than serving as a passive public directory or an uncontrolled chatbot, RedRelay implements an **active state machine** that coordinates verified physical availability, cold-chain monitoring, disruption exception rerouting, and cryptographic proof of handoff.

```
       [ Clinician Emergency STAT Request ]
                       │
                       ▼
      ┌─────────────────────────────────┐
      │     Coordination Engine         │
      │  (Deterministic Safety Tiers)   │
      └────────────────┬────────────────┘
                       │
       ┌───────────────┴───────────────┐
       ▼                               ▼
[ Candidate Evaluation ]       [ Stale Data Rejection ]
• Physical inspection gate     • >24h unverified excluded
• Exact component matching     • Universal rules checked
       │
       ▼
[ Authorized Blood Bank Hold ] ──(20-Min Lock)──► [ Courier Dispatched ]
       │                                                 │
       ├─────────────── Failure Disruption? ─────────────┤
       │                       │                         │
       │                       ▼                         │
       │           [ Sentinel AI Detection ]             │
       │           [ Evidence Preserved ]                │
       │           [ Clinician Approval Gate ]           │
       │                       │                         │
       │                       ▼                         │
       │           [ Authorized Reroute ]                │
       │                                                 ▼
       └────────────────────────────────────────► [ Cold-Chain Transit ]
                                                  (2-6°C IoT Telemetry)
                                                         │
                                                         ▼
                                              [ Proof of Handoff ]
                                              (Cryptographic SHA-256 Ledger)
```

---

## 2. Core Architectural Components

### 2.1 Innovation A: Proof of Availability State Machine
Traditional blood platforms confound reported inventory listings with actual deliverable stock. RedRelay isolates three unambiguous statuses:
- **`REPORTED`**: An unverified listing exists in a blood bank database feed. It is never treated as reserved stock and cannot be issued to couriers.
- **`CONFIRMED`**: Authorized blood bank personnel have physically inspected the cold storage bin, verified viral marker clearance (HIV, HBV, HCV, Syphilis, Malaria negative), and confirmed unit eligibility.
- **`HELD`**: An active, concurrency-locked reservation is placed for a specific emergency mission with an auto-expiring timer (typically 20 minutes) to prevent phantom stock and double-booking.

### 2.2 Innovation B: Deterministic Safety Rules vs. AI Supporting Logic
To satisfy clinical safety and regulatory requirements:
- **Deterministic Rules (Hard Boundary)**:
  - Exact component type filtering (Packed Red Blood Cells, Fresh Frozen Plasma, Platelet Concentrates, Cryoprecipitate, Whole Blood).
  - Component-specific immunohematology rules (e.g. AB+ is universal RBC recipient, but AB is universal Plasma donor; O- is universal RBC donor, but O is universal Plasma recipient; Bombay phenotype Oh can only receive Oh).
  - Automatic exclusion of stale inventory (>24 hours without confirmation).
  - Rejection of expired units or unverified infectious screenings.
- **AI Decision Support (Gemini API / Deterministic NLP Fallback)**:
  - Natural-language triage summaries for surgical teams.
  - Prioritization explanations highlighting distance, turnaround history, and cold-chain adherence.
  - Operational anomaly detection (e.g., telemetry spikes, traffic stalls).
  - *Strict Rule*: AI never autonomously clears biological compatibility, issues units, or authorizes transfusion.

### 2.3 Innovation C: Failure-Aware Rescue Rerouting
Emergency medicine is inherently vulnerable to disruptions. When an active mission experiences a failure:
1. **Hold Expired**: Courier arrival window lapses; stock returns to pool.
2. **Stock Recalled**: Local surgical emergency forces bank to withdraw units.
3. **Temperature Excursion**: IoT telemetry logs cold-box temperature > 6.0°C.
4. **Logistics Breakdown**: Courier vehicle stalled on transit corridor.

**Operational Invariants**:
- RedRelay **never silently substitutes** a blood unit.
- The disruption is timestamped and cryptographically recorded in the append-only ledger.
- The AI Sentinel identifies and ranks pre-screened backup centers (e.g. NIMHANS Blood Centre).
- A mandatory **Human Authorization Gate** requires the requesting clinician or emergency coordinator to review and sign off before re-dispatching.

### 2.4 Innovation D: Tamper-Evident Chain of Custody (Proof of Handoff)
RedRelay implements an append-only cryptographic ledger inspired by blockchain data structures:
- Each custody event contains:
  $$\text{EventHash} = \text{SHA-256}(\text{EventID} + \text{MissionID} + \text{Step} + \text{Actor} + \text{Units} + \text{Temp} + \text{PrevHash})$$
- Short-lived QR verification tokens (e.g. `RR-9841-PICKUP`) are generated for blood bank release and receiving hospital handoff.
- No protected health information (PHI) or patient names are embedded in QR codes.
- Cryptographic chain verification guarantees that retroactive record alteration is mathematically impossible.

### 2.5 Innovation E: Emergency Readiness Intelligence
Predictive modeling to transition healthcare systems from reactive searching to proactive readiness:
- Turnaround time benchmarking across participating centers.
- Stock data freshness index monitoring.
- Shortage forecasting with explicit **statistical uncertainty intervals** (e.g. 95% Confidence Intervals).
- Near-expiry inventory alerts (<120 hours) to enable regional redistribution before wastage.

---

## 3. Technology Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Framework** | Next.js 14 App Router | Server-rendered speed, static route optimization, modern React 18 architecture |
| **Language** | TypeScript (Strict Mode) | Strong static typing for clinical domain models and state transitions |
| **Styling** | Tailwind CSS + Custom Tokens | Tactical clinical HUD aesthetic, deep navy (`#090F19`), crimson accents (`#D33D56`), and glowing beacons |
| **Icons** | Lucide React | Consistent, accessible healthcare and tactical operational glyphs |
| **Mapping** | Tactical Radar Canvas + Geo-Projection | Low-latency coordinate projection of medical corridors with live pulse markers |
| **Testing** | Vitest | High-speed unit and invariant test execution (13/13 passing tests) |
| **Audio** | Web Audio API | Subtle, synthesized acoustic feedback for critical alerts and confirmations |
| **AI Integration** | Google Gemini 1.5 Flash + Deterministic NLP Engine | Resilient dual-mode intelligence that operates with or without internet/API keys |

---

## 4. Multi-Perspective Role-Based Access Control (RBAC)

1. **Hospital Clinician (`HOSPITAL_CLINICIAN`)**:
   - Authorized to create emergency STAT requests with medical priority classification.
   - Authorized to approve or decline disruption reroute plans.
   - Authorized to confirm final laboratory handoff receipt.
2. **Blood Bank Officer (`BLOOD_BANK_OFFICER`)**:
   - Authorized to physically inspect and confirm reported inventory.
   - Authorized to grant 20-minute active holds.
   - Authorized to release and issue units to couriers.
   - Authorized to trigger surgical inventory recalls.
3. **Cold-Chain Courier (`COURIER`)**:
   - Authorized to view transit routes and turn-by-turn checkpoints.
   - Authorized to present pickup tokens and record temperature sensor pings.
   - Prohibited from issuing units or approving blood compatibility.
4. **Emergency Coordinator (`COORDINATOR`)**:
   - Full tactical mission oversight across regional hospitals and blood banks.
   - Authorized to intervene during multi-center disruptions.
5. **Public & Quality Auditor (`AUDITOR`)**:
   - Masked public view (unit barcodes and patient pseudonyms redacted).
   - Full access to SHA-256 chain integrity verification tools.
