-- ========================================================================
-- RedRelay — Supabase Seed Data (Bengaluru Medical Hub Scenario)
-- ========================================================================

-- Insert Hospitals
INSERT INTO hospitals (id, name, license_number, trauma_level, contact_phone, transfusion_head, latitude, longitude, address, city)
VALUES
  ('a1111111-1111-1111-1111-111111111111', 'Victoria Hospital & Trauma Care Centre', 'KA-HOSP-TRAUMA-0012', 'Level 1', '+91 80 2670 1150', 'Dr. Ananya Rao, MD', 12.9634, 77.5756, 'Fort Road, Kalasipalya, Bengaluru 560002', 'Bengaluru'),
  ('a2222222-2222-2222-2222-222222222222', 'Manipal Hospital Old Airport Road', 'KA-HOSP-PVT-0821', 'Level 1', '+91 80 2502 4444', 'Dr. Rajesh K. Sundaram, MD', 12.9587, 77.6489, '98 HAL Old Airport Rd, Kodihalli, Bengaluru 560017', 'Bengaluru')
ON CONFLICT (license_number) DO NOTHING;

-- Insert Blood Banks
INSERT INTO blood_banks (id, name, license_number, nabh_accredited, contact_phone, transfusion_officer, latitude, longitude, address, city, active_hold_timeout_minutes, avg_confirmation_minutes, cold_chain_compliance_rate)
VALUES
  ('b1111111-1111-1111-1111-111111111111', 'Rotary Bangalore TTK Blood Centre', 'KA-BLB-NABH-1049', TRUE, '+91 80 2528 7903', 'Dr. B. S. Shanthala, MD', 12.9784, 77.6408, 'New Thippasandra Main Rd, HAL 3rd Stage, Bengaluru 560075', 'Bengaluru', 20, 7.4, 99.7),
  ('b2222222-2222-2222-2222-222222222222', 'Indian Red Cross Society Karnataka Blood Centre', 'KA-BLB-GOV-0044', TRUE, '+91 80 2226 8435', 'Dr. C. Mahadev, DNB', 12.9847, 77.5881, 'Race Course Rd, High Grounds, Bengaluru 560001', 'Bengaluru', 20, 14.2, 97.4),
  ('b3333333-3333-3333-3333-333333333333', 'NIMHANS Blood Centre & Transfusion Medicine', 'KA-BLB-INST-0311', TRUE, '+91 80 2699 5000', 'Dr. V. Shivashankar, MD', 12.9392, 77.5956, 'Hosur Road, Lakkasandra, Bengaluru 560029', 'Bengaluru', 25, 9.1, 99.2),
  ('b4444444-4444-4444-4444-444444444444', 'Bowring & Lady Curzon Hospital Blood Bank', 'KA-BLB-DIST-0112', FALSE, '+91 80 2559 1325', 'Dr. K. Pradeep, MBBS', 12.9822, 77.6044, 'Lady Curzon Rd, Shivaji Nagar, Bengaluru 560001', 'Bengaluru', 15, 34.5, 88.5)
ON CONFLICT (license_number) DO NOTHING;

-- Insert Blood Units (Rotary TTK, Red Cross, NIMHANS)
INSERT INTO blood_units (id, unit_barcode, blood_bank_id, component, blood_group, volume_ml, status, collection_date, expiry_date, storage_location, leukoreduced, cmv_negative)
VALUES
  ('u1111111-1111-1111-1111-111111111111', 'KA-TTK-2026-PRBC-0419', 'b1111111-1111-1111-1111-111111111111', 'PRBC', 'O_NEG', 350, 'CONFIRMED', NOW() - INTERVAL '10 days', NOW() + INTERVAL '32 days', 'Cooler A-1, Shelf 3, Bin 04', TRUE, TRUE),
  ('u2222222-2222-2222-2222-222222222222', 'KA-TTK-2026-PRBC-0420', 'b1111111-1111-1111-1111-111111111111', 'PRBC', 'O_NEG', 350, 'CONFIRMED', NOW() - INTERVAL '8 days', NOW() + INTERVAL '34 days', 'Cooler A-1, Shelf 3, Bin 05', TRUE, TRUE),
  ('u3333333-3333-3333-3333-333333333333', 'KA-IRC-2026-PRBC-1102', 'b2222222-2222-2222-2222-222222222222', 'PRBC', 'O_NEG', 350, 'CONFIRMED', NOW() - INTERVAL '12 days', NOW() + INTERVAL '30 days', 'Cold Room 2, Tray 12', FALSE, FALSE),
  ('u4444444-4444-4444-4444-444444444444', 'KA-NIM-2026-PRBC-9912', 'b3333333-3333-3333-3333-333333333333', 'PRBC', 'O_NEG', 350, 'CONFIRMED', NOW() - INTERVAL '7 days', NOW() + INTERVAL '35 days', 'Transfusion Bank Cooler 1, Bin 18', TRUE, TRUE),
  ('u5555555-5555-5555-5555-555555555555', 'KA-NIM-2026-PRBC-9913', 'b3333333-3333-3333-3333-333333333333', 'PRBC', 'O_NEG', 350, 'CONFIRMED', NOW() - INTERVAL '7 days', NOW() + INTERVAL '35 days', 'Transfusion Bank Cooler 1, Bin 19', TRUE, TRUE),
  ('u6666666-6666-6666-6666-666666666666', 'KA-BOW-2026-PRBC-3301', 'b4444444-4444-4444-4444-444444444444', 'PRBC', 'O_NEG', 350, 'REPORTED', NOW() - INTERVAL '18 days', NOW() + INTERVAL '24 days', 'Main Refrigerator 1', FALSE, FALSE)
ON CONFLICT (unit_barcode) DO NOTHING;

-- Insert Initial Active Mission
INSERT INTO rescue_missions (id, mission_code, hospital_id, primary_blood_bank_id, backup_blood_bank_id, patient_pseudonym, component, blood_group, units_requested, priority, status, required_by, clinical_justification)
VALUES
  ('m1111111-1111-1111-1111-111111111111', 'RESCUE-BLR-041', 'a1111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 'b3333333-3333-3333-3333-333333333333', 'SYN-EM-OB-882', 'PRBC', 'O_NEG', 2, 'CRASH_CODE_RED', 'REQUEST_SUBMITTED', NOW() + INTERVAL '45 minutes', 'Severe postpartum hemorrhage with hemodynamic shock. MTP Protocol activated.')
ON CONFLICT (mission_code) DO NOTHING;
