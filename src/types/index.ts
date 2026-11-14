/**
 * RedRelay — Emergency Blood Rescue Network
 * Core Domain Models & Type Definitions
 */

export type Role = 
  | 'HOSPITAL_CLINICIAN'
  | 'BLOOD_BANK_OFFICER'
  | 'COURIER'
  | 'COORDINATOR'
  | 'AUDITOR';

export type BloodComponentType = 
  | 'PRBC'             // Packed Red Blood Cells (2-6°C)
  | 'FFP'              // Fresh Frozen Plasma (≤ -18°C)
  | 'PLATELETS'        // Platelet Concentrate RDP/SDP (20-24°C with agitation)
  | 'CRYOPRECIPITATE'  // Cryoprecipitate AHF (≤ -18°C)
  | 'WHOLE_BLOOD';     // Whole Blood (2-6°C)

export type BloodGroup = 
  | 'O_NEG'
  | 'O_POS'
  | 'A_NEG'
  | 'A_POS'
  | 'B_NEG'
  | 'B_POS'
  | 'AB_NEG'
  | 'AB_POS'
  | 'BOMBAY_PHENOTYPE';

export type AvailabilityStatus = 
  | 'REPORTED'     // Unverified listing reported by bank
  | 'CONFIRMED'    // Authorized staff physically verified stock in storage
  | 'HELD'         // Authorized staff placed active temporary reservation
  | 'RELEASED'     // Unit issued and handed to authorized courier
  | 'UNAVAILABLE'; // Allocated, quarantined, or withdrawn

export type MissionPriority = 
  | 'CRASH_CODE_RED' // Immediate life threat: postpartum hemorrhage, massive trauma (<30 min)
  | 'URGENT'         // Surgery/ICU critical (<2 hours)
  | 'PRIORITY';      // Semi-urgent scheduled transfusion (<6 hours)

export type MissionStatus = 
  | 'REQUEST_SUBMITTED'
  | 'BANKS_NOTIFIED'
  | 'HOLD_CONFIRMED'
  | 'TRANSPORT_DISPATCHED'
  | 'CUSTODY_PICKUP_VERIFIED'
  | 'IN_TRANSIT'
  | 'DISRUPTED'
  | 'REROUTED_PENDING_APPROVAL'
  | 'HANDOFF_COMPLETED'
  | 'CANCELLED';

export type DisruptionType = 
  | 'HOLD_EXPIRED'
  | 'STOCK_WITHDRAWN_CLINICAL_EMERGENCY'
  | 'COURIER_DELAY_VEHICLE_BREAKDOWN'
  | 'TEMPERATURE_EXCURSION'
  | 'SEAL_TAMPERED';

export interface LocationCoordinates {
  lat: number;
  lng: number;
  address: string;
  city: string;
}

export interface Hospital {
  id: string;
  name: string;
  licenseNumber: string;
  location: LocationCoordinates;
  traumaCenterLevel: 'Level 1' | 'Level 2' | 'District Hospital' | 'Specialty';
  contactPhone: string;
  transfusionHead: string;
}

export interface TestingClearance {
  hivElisa: 'NEGATIVE' | 'POSITIVE';
  hbsAg: 'NEGATIVE' | 'POSITIVE';
  hcv: 'NEGATIVE' | 'POSITIVE';
  vdrlSyphilis: 'NEGATIVE' | 'POSITIVE';
  malaria: 'NEGATIVE' | 'POSITIVE';
  natTested: boolean; // Nucleic Acid Testing
  testedAt: string;
  verifiedByStaffId: string;
}

export interface BloodUnit {
  id: string; // Internal system ID
  unitBarcode: string; // e.g. "KA-01-2026-PRBC-8891" (Masked for public)
  bloodBankId: string;
  component: BloodComponentType;
  bloodGroup: BloodGroup;
  volumeMl: number;
  collectionDate: string;
  expiryDate: string;
  status: AvailabilityStatus;
  currentHoldId?: string;
  testingClearance: TestingClearance;
  storageLocation: string; // e.g., "Walk-in Cooler 2, Shelf B-4"
  specialAttributes: {
    leukoreduced: boolean;
    irradiated: boolean;
    cmvNegative: boolean;
    washed: boolean;
    paediatricAliquot: boolean;
  };
}

export interface BloodBank {
  id: string;
  name: string;
  licenseNumber: string; // e.g. "KA-DRUG-LIC-10492"
  nabhAccredited: boolean;
  governmentRegistered: boolean;
  location: LocationCoordinates;
  contactPhone: string;
  transfusionOfficer: string;
  operatingHours: string;
  activeHoldTimeoutMinutes: number; // typically 20-30 mins
  historicalMetrics: {
    avgConfirmationMinutes: number;
    fulfillmentRate: number; // percentage
    coldChainComplianceRate: number; // percentage
  };
}

export interface SpecialRequirements {
  leukoreduced?: boolean;
  irradiated?: boolean;
  cmvNegative?: boolean;
  washed?: boolean;
  paediatricAliquot?: boolean;
}

export interface EmergencyRescueRequest {
  id: string;
  requestNumber: string; // e.g. "REQ-2026-BLR-0914"
  hospitalId: string;
  requestingClinician: {
    name: string;
    registrationNumber: string;
    department: string;
    phone: string;
  };
  patientPseudonym: string; // NEVER real PII: e.g. "EM-TRAUMA-774"
  component: BloodComponentType;
  bloodGroup: BloodGroup;
  unitsRequested: number;
  priority: MissionPriority;
  requiredBy: string; // ISO timestamp
  specialRequirements: SpecialRequirements;
  clinicalJustification: string;
  createdAt: string;
}

export interface CandidateEvaluation {
  bloodBankId: string;
  bloodBankName: string;
  availableUnitsCount: number;
  reportedUnitsCount: number;
  confirmedUnitsCount: number;
  heldUnitsCount: number;
  distanceKm: number;
  estimatedTransitMinutes: number;
  readinessScore: number; // 0-100 composite score
  rationale: string;
  coldChainRating: string;
  isStaleData: boolean;
  dataTimestamp: string;
}

export interface ColdChainTelemetry {
  currentTempCelsius: number;
  minAllowedCelsius: number;
  maxAllowedCelsius: number;
  humidityPercent: number;
  batteryPercent: number;
  lidClosed: boolean;
  excursionDetected: boolean;
  lastReadingTimestamp: string;
  deviceImei: string;
  tempHistory: Array<{
    timestamp: string;
    temp: number;
  }>;
}

export interface CourierAssignment {
  id: string;
  courierName: string;
  badgeNumber: string;
  vehicleType: 'Refrigerated Ambulance' | 'Emergency Medical Moto' | 'Cold-Box Van';
  vehiclePlate: string;
  phone: string;
  currentLocation: {
    lat: number;
    lng: number;
    lastPing: string;
  };
  coldBoxId: string;
  telemetry: ColdChainTelemetry;
}

export interface CustodyProofEvent {
  id: string;
  missionId: string;
  stepName: 
    | 'HOLD_ISSUED' 
    | 'CROSSMATCH_CLEARED'
    | 'COURIER_PICKUP' 
    | 'TRANSIT_CHECKPOINT' 
    | 'DISRUPTION_FLAGGED'
    | 'REROUTED_AUTHORIZED'
    | 'HOSPITAL_ARRIVAL' 
    | 'FINAL_RECEIPT_VERIFIED';
  actorName: string;
  actorRole: Role;
  organization: string;
  timestamp: string;
  qrVerificationCode?: string;
  unitBarcodesReferenced: string[];
  temperatureAtEvent?: number;
  notes: string;
  previousEventHash: string;
  eventHash: string; // SHA-256 tamper-evident chaining
}

export interface RescueMission {
  id: string;
  missionCode: string; // e.g. "RESCUE-BLR-041"
  requestId: string;
  request: EmergencyRescueRequest;
  status: MissionStatus;
  primaryBloodBankId?: string;
  backupBloodBankId?: string;
  assignedCourier?: CourierAssignment;
  candidateEvaluations: CandidateEvaluation[];
  allocatedUnitIds: string[];
  holdExpiresAt?: string;
  aiInsights: {
    triageExplanation: string;
    anomalyWarning?: string;
    routeRecommendation: string;
    generatedAt: string;
    isAiFallback: boolean;
  };
  disruption?: {
    type: DisruptionType;
    description: string;
    occurredAt: string;
    originalBankId: string;
    proposedBackupBankId: string;
    humanApprovalRequired: boolean;
    approvedBy?: string;
    approvalTimestamp?: string;
  };
  custodyTrail: CustodyProofEvent[];
  startedAt: string;
  completedAt?: string;
}
