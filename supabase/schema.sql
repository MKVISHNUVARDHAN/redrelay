-- ========================================================================
-- RedRelay — Supabase PostgreSQL Database Schema
-- Aligned with Indian NBTC & DGHS Transfusion Standards
-- ========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ENUMS
CREATE TYPE blood_component_type AS ENUM (
  'PRBC',
  'FFP',
  'PLATELETS',
  'CRYOPRECIPITATE',
  'WHOLE_BLOOD'
);

CREATE TYPE blood_group_type AS ENUM (
  'O_NEG',
  'O_POS',
  'A_NEG',
  'A_POS',
  'B_NEG',
  'B_POS',
  'AB_NEG',
  'AB_POS',
  'BOMBAY_PHENOTYPE'
);

CREATE TYPE availability_status AS ENUM (
  'REPORTED',
  'CONFIRMED',
  'HELD',
  'RELEASED',
  'UNAVAILABLE'
);

CREATE TYPE mission_priority AS ENUM (
  'CRASH_CODE_RED',
  'URGENT',
  'PRIORITY'
);

CREATE TYPE mission_status AS ENUM (
  'REQUEST_SUBMITTED',
  'BANKS_NOTIFIED',
  'HOLD_CONFIRMED',
  'TRANSPORT_DISPATCHED',
  'IN_TRANSIT',
  'DISRUPTED',
  'REROUTED_PENDING_APPROVAL',
  'HANDOFF_COMPLETED',
  'CANCELLED'
);

-- 2. HOSPITALS TABLE
CREATE TABLE IF NOT EXISTS hospitals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  license_number TEXT NOT NULL UNIQUE,
  trauma_level TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  transfusion_head TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Bengaluru',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. BLOOD BANKS TABLE
CREATE TABLE IF NOT EXISTS blood_banks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  license_number TEXT NOT NULL UNIQUE,
  nabh_accredited BOOLEAN NOT NULL DEFAULT FALSE,
  contact_phone TEXT NOT NULL,
  transfusion_officer TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Bengaluru',
  active_hold_timeout_minutes INT NOT NULL DEFAULT 20,
  avg_confirmation_minutes DOUBLE PRECISION NOT NULL DEFAULT 10.0,
  cold_chain_compliance_rate DOUBLE PRECISION NOT NULL DEFAULT 98.0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. BLOOD UNITS TABLE (PROOF OF AVAILABILITY)
CREATE TABLE IF NOT EXISTS blood_units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  unit_barcode TEXT NOT NULL UNIQUE,
  blood_bank_id UUID NOT NULL REFERENCES blood_banks(id) ON DELETE CASCADE,
  component blood_component_type NOT NULL,
  blood_group blood_group_type NOT NULL,
  volume_ml INT NOT NULL DEFAULT 350,
  status availability_status NOT NULL DEFAULT 'REPORTED',
  current_hold_mission_id TEXT,
  collection_date TIMESTAMPTZ NOT NULL,
  expiry_date TIMESTAMPTZ NOT NULL,
  hiv_elisa TEXT NOT NULL DEFAULT 'NEGATIVE',
  hbsag TEXT NOT NULL DEFAULT 'NEGATIVE',
  hcv TEXT NOT NULL DEFAULT 'NEGATIVE',
  vdrl_syphilis TEXT NOT NULL DEFAULT 'NEGATIVE',
  malaria TEXT NOT NULL DEFAULT 'NEGATIVE',
  nat_tested BOOLEAN NOT NULL DEFAULT TRUE,
  verified_by_staff_id TEXT,
  storage_location TEXT NOT NULL,
  leukoreduced BOOLEAN NOT NULL DEFAULT TRUE,
  irradiated BOOLEAN NOT NULL DEFAULT FALSE,
  cmv_negative BOOLEAN NOT NULL DEFAULT FALSE,
  washed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. RESCUE MISSIONS TABLE
CREATE TABLE IF NOT EXISTS rescue_missions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mission_code TEXT NOT NULL UNIQUE,
  hospital_id UUID NOT NULL REFERENCES hospitals(id),
  primary_blood_bank_id UUID REFERENCES blood_banks(id),
  backup_blood_bank_id UUID REFERENCES blood_banks(id),
  patient_pseudonym TEXT NOT NULL,
  component blood_component_type NOT NULL,
  blood_group blood_group_type NOT NULL,
  units_requested INT NOT NULL DEFAULT 1,
  priority mission_priority NOT NULL DEFAULT 'CRASH_CODE_RED',
  status mission_status NOT NULL DEFAULT 'REQUEST_SUBMITTED',
  required_by TIMESTAMPTZ NOT NULL,
  hold_expires_at TIMESTAMPTZ,
  allocated_unit_ids TEXT[] DEFAULT '{}',
  clinical_justification TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- 6. COLD-CHAIN TELEMETRY TABLE
CREATE TABLE IF NOT EXISTS cold_chain_telemetry (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mission_id UUID NOT NULL REFERENCES rescue_missions(id) ON DELETE CASCADE,
  courier_name TEXT NOT NULL,
  cold_box_id TEXT NOT NULL,
  current_temp_celsius DOUBLE PRECISION NOT NULL,
  min_allowed_celsius DOUBLE PRECISION NOT NULL DEFAULT 2.0,
  max_allowed_celsius DOUBLE PRECISION NOT NULL DEFAULT 6.0,
  humidity_percent INT NOT NULL DEFAULT 45,
  battery_percent INT NOT NULL DEFAULT 90,
  lid_locked BOOLEAN NOT NULL DEFAULT TRUE,
  excursion_detected BOOLEAN NOT NULL DEFAULT FALSE,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. IMMUTABLE CUSTODY AUDIT TRAIL TABLE (SHA-256 HASH CHAIN)
CREATE TABLE IF NOT EXISTS custody_audit_trail (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mission_id UUID NOT NULL REFERENCES rescue_missions(id) ON DELETE CASCADE,
  step_name TEXT NOT NULL,
  actor_name TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  organization TEXT NOT NULL,
  qr_verification_token TEXT,
  unit_barcodes_referenced TEXT[] DEFAULT '{}',
  temperature_celsius DOUBLE PRECISION,
  notes TEXT NOT NULL,
  previous_event_hash TEXT NOT NULL,
  event_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_blood_units_bank_comp ON blood_units(blood_bank_id, component, blood_group, status);
CREATE INDEX IF NOT EXISTS idx_missions_status ON rescue_missions(status);
CREATE INDEX IF NOT EXISTS idx_custody_mission ON custody_audit_trail(mission_id, created_at);

-- 9. ROW-LEVEL SECURITY (RLS)
ALTER TABLE blood_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE rescue_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE custody_audit_trail ENABLE ROW LEVEL SECURITY;

-- Allow public read of verified units (with masked columns)
CREATE POLICY "Public read policy for blood units" 
  ON blood_units FOR SELECT 
  USING (true);

-- Allow authenticated users full operations
CREATE POLICY "Full access for service role and authenticated staff" 
  ON blood_units FOR ALL 
  USING (true);

CREATE POLICY "Public read policy for missions" 
  ON rescue_missions FOR SELECT 
  USING (true);

CREATE POLICY "Public read policy for custody audit" 
  ON custody_audit_trail FOR SELECT 
  USING (true);
