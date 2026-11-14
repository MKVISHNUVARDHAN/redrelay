# RedRelay — Medical Safety, Regulatory Boundaries & Clinical Invariants

> **"RedRelay is a coordination and decision-support system, not a replacement for medical professionals, licensed blood banks, blood compatibility testing, or clinical judgment."**

---

## 1. Regulatory Context & Framework Alignment

RedRelay's clinical workflows and storage thresholds are modeled after the following statutory standards and guidance:
- **National Blood Transfusion Council (NBTC)**, Ministry of Health and Family Welfare, Government of India.
- **Directorate General of Health Services (DGHS)** Technical Manual for Blood Transfusion Services.
- **Drugs and Cosmetics Act, 1940 and Rules thereunder (Schedule F, Part XII-B)** governing blood bank licensing in India.
- **National Accreditation Board for Hospitals & Healthcare Providers (NABH)** Standards for Blood Banks / Transfusion Services.

*Notice*: Reference to these standards reflects design alignment for hackathon demonstration and research evaluation. It does not constitute formal regulatory certification or commercial licensing by the Central Drugs Standard Control Organisation (CDSCO).

---

## 2. Component Storage Physics & Cold-Chain Thresholds

Blood is not a generic homogeneous liquid. Different biological fractions require radically different temperature regimens, biophysical handling, and shelf lives:

| Component | Target Temperature | Regulatory Permissible Range | Shelf Life | Critical Handling Invariant |
|---|---|---|---|---|
| **Packed Red Blood Cells (PRBC)** | 4.0°C | **2.0°C to 6.0°C** | 35–42 days (CPDA-1/SAGM) | **Never freeze.** Temperatures >6°C accelerate bacterial growth and hemolysis. Temperatures <1°C cause RBC lysis. |
| **Fresh Frozen Plasma (FFP)** | -25.0°C | **≤ -18.0°C** | 1 year | Must be frozen solid within 6–8 hours of collection. Requires validated dry ice / sub-zero gel transport. Thaw at 37°C prior to transfusion. |
| **Platelet Concentrates (RDP/SDP)** | 22.0°C | **20.0°C to 24.0°C** | **5 days maximum** | **NEVER refrigerate.** Chilling damages platelet activation. Requires continuous gentle horizontal agitation (60 strokes/min) to prevent clumping. |
| **Cryoprecipitate AHF** | -25.0°C | **≤ -18.0°C** | 1 year | Rich in Factor VIII, von Willebrand factor, and Fibrinogen. Once thawed, must be transfused within 6 hours. |
| **Whole Blood** | 4.0°C | **2.0°C to 6.0°C** | 21–35 days | Reserved for massive casualty hemorrhage and military trauma resuscitation protocols. |

### RedRelay Enforcement:
- The system embeds these exact temperature bounds into IoT transport sensors.
- If a PRBC container exceeds 6.0°C for >10 minutes, an automated **Temperature Excursion Alert** transitions the mission to `DISRUPTED`.
- The compromised unit is flagged for mandatory immunohematology quarantine and cannot be cleared for issue.

---

## 3. Immunohematology & Compatibility Safety Rules

A lethal misconception in amateur software design is reducing blood compatibility to a single universal chart. Red-cell compatibility is **completely inverted** compared to plasma compatibility!

### 3.1 Red Blood Cell Compatibility (PRBC & Whole Blood)
Governed by ABO antigens on the erythrocyte membrane and reciprocal isohemagglutinins (anti-A, anti-B) in the recipient's serum:
- **Group O Negative** erythrocytes lack A, B, and Rh(D) antigens $\rightarrow$ **Universal Red Cell Donor**.
- **Group AB Positive** recipients lack circulating anti-A, anti-B, and anti-D antibodies $\rightarrow$ **Universal Red Cell Recipient**.
- *Bombay Phenotype ($O_h$)*: Individuals lack the H substance on RBCs and produce potent anti-H antibodies. **They can ONLY receive blood from other Bombay Phenotype donors**, even if tested as O-negative on standard forward grouping!

### 3.2 Plasma Compatibility (FFP & Cryoprecipitate)
Governed by antibodies present in the donor's plasma:
- **Group AB Plasma** contains neither anti-A nor anti-B antibodies $\rightarrow$ **Universal Plasma Donor**.
- **Group O Plasma** contains high-titer anti-A and anti-B antibodies and will cause severe hemolysis if given to an A, B, or AB recipient $\rightarrow$ **Group O is the Universal Plasma Recipient**, not donor!

### 3.3 Platelet Compatibility
- ABO identical platelets are preferred. Non-identical platelets may be issued in critical emergencies only if screened for low-titer anti-A/anti-B or plasma-volume reduced.

---

## 4. Human Approval Gates (Why AI Never Replaces Clinicians)

RedRelay enforces strict human-in-the-loop gates across all safety-critical transitions:

1. **Request Creation Gate**:
   - Only registered clinicians with medical council license numbers can submit STAT requests.
   - The platform never diagnoses patients or guesses components based on free text.
2. **Availability Confirmation Gate**:
   - Only licensed blood bank officers can verify physical stock in storage.
   - Algorithms never automatically mark reported inventory as confirmed.
3. **Pre-Transfusion Compatibility Gate**:
   - A successful custody scan or delivery QR token **does not constitute medical release**.
   - The receiving hospital transfusion laboratory must perform standard pre-transfusion testing:
     - Patient re-grouping (ABO/Rh front and reverse).
     - Antibody screening.
     - Major and minor cross-match (immediate spin and anti-human globulin phases).
4. **Disruption Rerouting Gate**:
   - If stock is recalled or cold-chain integrity is breached, the AI Sentinel suggests pre-ranked alternatives.
   - **Crucially**: The system never silently swaps blood units. The requesting clinician must formally inspect and authorize the reroute.

---

## 5. Synthetic Data & Patient Privacy (PHI) Safeguards

- In demonstration and pilot modes, all records are strictly synthetic:
  - Patient names are replaced with pseudonyms (e.g. `SYN-EM-OB-882`).
  - Unit barcodes follow standard ISBT 128 / NBTC structures but are generated as synthetic test vectors.
  - Public auditor views automatically mask internal unit identifiers (e.g. `KA-***-0419`).
- Expiring QR tokens carry **zero patient clinical data**, protecting patient confidentiality under HIPAA and Indian Digital Personal Data Protection Act (DPDP) principles.

---

## 6. Emergency Clinical Disclaimer

> RedRelay is designed as an operational command layer for licensed hospitals, blood centers, and authorized logistics operators. It does not provide medical treatment advice, patient triage diagnoses, or direct-to-consumer blood sales. In case of acute medical emergencies, individuals should immediately contact national emergency services (112 in India) or report to the nearest hospital emergency department.
