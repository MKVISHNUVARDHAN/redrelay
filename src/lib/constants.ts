/**
 * RedRelay — Clinical & Operational Constants
 * Derived from Indian National Blood Transfusion Council (NBTC) guidelines
 * & Directorate General of Health Services (DGHS) Technical Manual
 */

import { BloodComponentType, BloodGroup } from "@/types";

export const COMPONENT_TEMPERATURE_SPECIFICATIONS: Record<
  BloodComponentType,
  {
    name: string;
    targetTemp: string;
    minCelsius: number;
    maxCelsius: number;
    shelfLifeDays: number;
    specialHandling: string;
  }
> = {
  PRBC: {
    name: "Packed Red Blood Cells",
    targetTemp: "2°C to 6°C",
    minCelsius: 2.0,
    maxCelsius: 6.0,
    shelfLifeDays: 42,
    specialHandling: "Maintain continuous validated cold-chain. Never freeze.",
  },
  FFP: {
    name: "Fresh Frozen Plasma",
    targetTemp: "≤ -18°C",
    minCelsius: -35.0,
    maxCelsius: -18.0,
    shelfLifeDays: 365,
    specialHandling: "Transport on dry ice or validated sub-zero gel packs. Thaw at 37°C prior to issue.",
  },
  PLATELETS: {
    name: "Platelet Concentrate (RDP/SDP)",
    targetTemp: "20°C to 24°C",
    minCelsius: 20.0,
    maxCelsius: 24.0,
    shelfLifeDays: 5,
    specialHandling: "Continuous gentle horizontal agitation required. NEVER refrigerate.",
  },
  CRYOPRECIPITATE: {
    name: "Cryoprecipitate Antihemophilic Factor",
    targetTemp: "≤ -18°C",
    minCelsius: -35.0,
    maxCelsius: -18.0,
    shelfLifeDays: 365,
    specialHandling: "Sub-zero storage. Transfuse within 6 hours of thawing.",
  },
  WHOLE_BLOOD: {
    name: "Whole Blood (CPDA-1)",
    targetTemp: "2°C to 6°C",
    minCelsius: 2.0,
    maxCelsius: 6.0,
    shelfLifeDays: 35,
    specialHandling: "Cold chain 2-6°C. Reserved for massive casualty hemorrhage.",
  },
};

/**
 * COMPONENT-SPECIFIC COMPATIBILITY MATRIX
 * CRITICAL CLINICAL SAFETY RULE: Red-cell compatibility is DIFFERENT from plasma or platelet compatibility!
 * AB+ is universal RBC recipient, but AB is universal PLASMA donor!
 * O- is universal RBC donor, but O is universal PLASMA recipient!
 */
export const RBC_COMPATIBILITY_RULES: Record<BloodGroup, BloodGroup[]> = {
  O_NEG: ['O_NEG'],
  O_POS: ['O_POS', 'O_NEG'],
  A_NEG: ['A_NEG', 'O_NEG'],
  A_POS: ['A_POS', 'A_NEG', 'O_POS', 'O_NEG'],
  B_NEG: ['B_NEG', 'O_NEG'],
  B_POS: ['B_POS', 'B_NEG', 'O_POS', 'O_NEG'],
  AB_NEG: ['AB_NEG', 'A_NEG', 'B_NEG', 'O_NEG'],
  AB_POS: ['AB_POS', 'AB_NEG', 'A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'O_POS', 'O_NEG'],
  BOMBAY_PHENOTYPE: ['BOMBAY_PHENOTYPE'], // Oh can ONLY receive Oh!
};

export const PLASMA_COMPATIBILITY_RULES: Record<BloodGroup, BloodGroup[]> = {
  O_NEG: ['O_NEG', 'O_POS', 'A_NEG', 'A_POS', 'B_NEG', 'B_POS', 'AB_NEG', 'AB_POS'],
  O_POS: ['O_POS', 'A_POS', 'B_POS', 'AB_POS'],
  A_NEG: ['A_NEG', 'A_POS', 'AB_NEG', 'AB_POS'],
  A_POS: ['A_POS', 'AB_POS'],
  B_NEG: ['B_NEG', 'B_POS', 'AB_NEG', 'AB_POS'],
  B_POS: ['B_POS', 'AB_POS'],
  AB_NEG: ['AB_NEG', 'AB_POS'],
  AB_POS: ['AB_POS'], // AB is universal donor for plasma!
  BOMBAY_PHENOTYPE: ['BOMBAY_PHENOTYPE', 'AB_POS', 'AB_NEG', 'A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'O_POS', 'O_NEG'],
};

export const PLATELET_COMPATIBILITY_RULES: Record<BloodGroup, BloodGroup[]> = {
  // ABO identical is preferred; non-identical acceptable if volume reduced or titre screened
  O_NEG: ['O_NEG', 'A_NEG', 'B_NEG', 'AB_NEG', 'O_POS'],
  O_POS: ['O_POS', 'O_NEG', 'A_POS', 'B_POS', 'AB_POS'],
  A_NEG: ['A_NEG', 'A_POS', 'O_NEG', 'AB_NEG'],
  A_POS: ['A_POS', 'A_NEG', 'AB_POS', 'O_POS'],
  B_NEG: ['B_NEG', 'B_POS', 'O_NEG', 'AB_NEG'],
  B_POS: ['B_POS', 'B_NEG', 'AB_POS', 'O_POS'],
  AB_NEG: ['AB_NEG', 'AB_POS', 'A_NEG', 'B_NEG'],
  AB_POS: ['AB_POS', 'AB_NEG', 'A_POS', 'B_POS', 'O_POS'],
  BOMBAY_PHENOTYPE: ['BOMBAY_PHENOTYPE'],
};

export const BLOOD_GROUP_LABELS: Record<BloodGroup, string> = {
  O_NEG: 'O -ve (Universal Red Cell)',
  O_POS: 'O +ve',
  A_NEG: 'A -ve',
  A_POS: 'A +ve',
  B_NEG: 'B -ve',
  B_POS: 'B +ve',
  AB_NEG: 'AB -ve',
  AB_POS: 'AB +ve (Universal Red Cell Recipient)',
  BOMBAY_PHENOTYPE: 'Bombay Phenotype (Oh) Rare',
};

export const COMPONENT_LABELS: Record<BloodComponentType, string> = {
  PRBC: 'Packed Red Blood Cells (PRBC)',
  FFP: 'Fresh Frozen Plasma (FFP)',
  PLATELETS: 'Platelet Concentrate (RDP/SDP)',
  CRYOPRECIPITATE: 'Cryoprecipitate AHF',
  WHOLE_BLOOD: 'Whole Blood (CPDA-1)',
};
