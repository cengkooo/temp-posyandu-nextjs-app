-- ============================================================================
-- POSYANDU TEST DATA GENERATOR
-- ============================================================================
-- Generate 1500 pasien dengan berbagai kategori + data lengkap
-- Kategori: Bayi (200), Balita (400), Ibu Hamil (300), Remaja & Dewasa (400), Lansia (200)
-- Include: Patient data, Extended data, Visits (avg 3-5 per patient), Immunizations
-- ============================================================================

-- Disable triggers untuk speed
SET session_replication_role = 'replica';

-- ============================================================================
-- 1. PASIEN BAYI (200 data) - Usia 0-11 bulan
-- ============================================================================

DO $$
DECLARE
  v_patient_id uuid;
  v_birth_date date;
  v_gender text;
  v_weight decimal;
  v_height decimal;
  v_head_circ decimal;
  v_visit_date date;
  v_visit_count int;
BEGIN
  FOR i IN 1..200 LOOP
    v_patient_id := gen_random_uuid();
    v_birth_date := CURRENT_DATE - (random() * 365)::int;
    v_gender := CASE WHEN random() > 0.5 THEN 'L' ELSE 'P' END;
    
    -- Insert patient
    INSERT INTO patients (
      id, full_name, nik, date_of_birth, gender, address, phone,
      patient_type, parent_name, created_at, updated_at
    ) VALUES (
      v_patient_id,
      'Bayi Test ' || i,
      '3201' || LPAD((1000000000 + i)::text, 12, '0'),
      v_birth_date,
      v_gender,
      'Jl. Test Bayi No. ' || i || ', Jakarta Selatan',
      '08' || LPAD((10000000 + i)::text, 10, '0'),
      'bayi',
      'Orang Tua Test ' || i,
      NOW(),
      NOW()
    );
    
    -- Insert extended data untuk bayi
    v_weight := 2.5 + (random() * 8)::decimal(4,2); -- 2.5-10.5 kg
    v_height := 45 + (random() * 30)::decimal(4,1); -- 45-75 cm
    v_head_circ := 32 + (random() * 15)::decimal(4,1); -- 32-47 cm
    
    INSERT INTO patient_extended_data (
      patient_id, weight, height, head_circumference, arm_circumference,
      measurement_date, asi_exclusive, vitamin_a_given,
      ispa_history, diare_history, created_at, updated_at
    ) VALUES (
      v_patient_id,
      v_weight,
      v_height,
      v_head_circ,
      9 + (random() * 6)::decimal(4,1), -- LILA 9-15 cm
      CURRENT_DATE - (random() * 30)::int,
      CASE WHEN random() > 0.7 THEN 'ya' WHEN random() > 0.3 THEN 'berlangsung' ELSE 'tidak' END,
      random() > 0.5,
      random() > 0.7,
      random() > 0.6,
      NOW(),
      NOW()
    );
    
    -- Insert 3-5 kunjungan per bayi
    v_visit_count := 3 + (random() * 2)::int;
    FOR j IN 1..v_visit_count LOOP
      v_visit_date := v_birth_date + (30 * j)::int;
      IF v_visit_date <= CURRENT_DATE THEN
        INSERT INTO visits (
          patient_id, visit_date, weight, height,
          head_circumference, arm_circumference,
          notes, created_at, updated_at
        ) VALUES (
          v_patient_id,
          v_visit_date,
          v_weight + (0.6 * j)::decimal(4,2),
          v_height + (2.5 * j)::decimal(4,1),
          v_head_circ + (1 * j)::decimal(4,1),
          9 + (0.3 * j)::decimal(4,1),
          'Pertumbuhan normal, ASI eksklusif',
          NOW(),
          NOW()
        );
      END IF;
    END LOOP;
    
    -- Insert imunisasi bayi (basic vaccines)
    INSERT INTO immunizations (patient_id, vaccine_name, vaccine_date, notes, created_at)
    SELECT 
      v_patient_id,
      vaccine,
      v_birth_date + days_after::int,
      'Imunisasi rutin',
      NOW()
    FROM (VALUES
      ('Hepatitis B (HB0)', 1),
      ('BCG', 30),
      ('Polio 1', 60),
      ('DPT-HB-Hib 1', 60),
      ('Polio 2', 90),
      ('DPT-HB-Hib 2', 90),
      ('Polio 3', 120),
      ('DPT-HB-Hib 3', 120)
    ) AS vaccines(vaccine, days_after)
    WHERE v_birth_date + days_after::int <= CURRENT_DATE;
    
  END LOOP;
  RAISE NOTICE '✓ 200 data Bayi berhasil dibuat';
END $$;

-- ============================================================================
-- 2. PASIEN BALITA (400 data) - Usia 1-5 tahun
-- ============================================================================

DO $$
DECLARE
  v_patient_id uuid;
  v_birth_date date;
  v_gender text;
  v_weight decimal;
  v_height decimal;
  v_visit_count int;
BEGIN
  FOR i IN 1..400 LOOP
    v_patient_id := gen_random_uuid();
    v_birth_date := CURRENT_DATE - (365 + (random() * 1460))::int; -- 1-5 tahun
    v_gender := CASE WHEN random() > 0.5 THEN 'L' ELSE 'P' END;
    
    -- Insert patient
    INSERT INTO patients (
      id, full_name, nik, date_of_birth, gender, address, phone,
      patient_type, parent_name, created_at, updated_at
    ) VALUES (
      v_patient_id,
      'Balita Test ' || i,
      '3202' || LPAD((1000000000 + i)::text, 12, '0'),
      v_birth_date,
      v_gender,
      'Jl. Test Balita No. ' || i || ', Jakarta Utara',
      '08' || LPAD((20000000 + i)::text, 10, '0'),
      'balita',
      'Orang Tua Balita ' || i,
      NOW(),
      NOW()
    );
    
    -- Insert extended data untuk balita
    v_weight := 8 + (random() * 12)::decimal(4,2); -- 8-20 kg
    v_height := 75 + (random() * 35)::decimal(4,1); -- 75-110 cm
    
    INSERT INTO patient_extended_data (
      patient_id, weight, height, arm_circumference,
      measurement_date, asi_exclusive, asi_duration_months,
      mpasi_started, mpasi_age_months, mpasi_types,
      vitamin_a_given, vitamin_a_date,
      ispa_history, diare_history,
      immunizations, created_at, updated_at
    ) VALUES (
      v_patient_id,
      v_weight,
      v_height,
      11 + (random() * 5)::decimal(4,1), -- LILA 11-16 cm
      CURRENT_DATE - (random() * 90)::int,
      CASE WHEN random() > 0.6 THEN 'ya' ELSE 'tidak' END,
      6 + (random() * 18)::int,
      true,
      6 + (random() * 6)::int,
      'Bubur, nasi tim, sayur, buah',
      random() > 0.3,
      CURRENT_DATE - (random() * 180)::int,
      random() > 0.6,
      random() > 0.5,
      '{"DPT": true, "Polio": true, "Campak": true}'::jsonb,
      NOW(),
      NOW()
    );
    
    -- Insert 4-6 kunjungan per balita
    v_visit_count := 4 + (random() * 2)::int;
    FOR j IN 1..v_visit_count LOOP
      INSERT INTO visits (
        patient_id, visit_date, weight, height,
        arm_circumference, notes, created_at, updated_at
      ) VALUES (
        v_patient_id,
        CURRENT_DATE - ((v_visit_count - j) * 60)::int,
        v_weight + (0.2 * j)::decimal(4,2),
        v_height + (0.5 * j)::decimal(4,1),
        11 + (0.1 * j)::decimal(4,1),
        CASE 
          WHEN random() > 0.8 THEN 'Gizi baik, tumbuh kembang normal'
          WHEN random() > 0.5 THEN 'Perlu perhatian pola makan'
          ELSE 'Status gizi cukup'
        END,
        NOW(),
        NOW()
      );
    END LOOP;
    
    -- Insert imunisasi lengkap balita
    INSERT INTO immunizations (patient_id, vaccine_name, vaccine_date, notes, created_at)
    SELECT 
      v_patient_id,
      vaccine,
      v_birth_date + days_after::int,
      'Imunisasi lengkap',
      NOW()
    FROM (VALUES
      ('Hepatitis B (HB0)', 1),
      ('BCG', 30),
      ('DPT-HB-Hib 1', 60),
      ('Polio 1', 60),
      ('DPT-HB-Hib 2', 90),
      ('Polio 2', 90),
      ('DPT-HB-Hib 3', 120),
      ('Polio 3', 120),
      ('Campak/MR', 270),
      ('DPT-HB-Hib Booster', 540)
    ) AS vaccines(vaccine, days_after)
    WHERE v_birth_date + days_after::int <= CURRENT_DATE;
    
  END LOOP;
  RAISE NOTICE '✓ 400 data Balita berhasil dibuat';
END $$;

-- ============================================================================
-- 3. PASIEN IBU HAMIL (300 data)
-- ============================================================================

DO $$
DECLARE
  v_patient_id uuid;
  v_birth_date date;
  v_pregnancy_week int;
  v_visit_count int;
BEGIN
  FOR i IN 1..300 LOOP
    v_patient_id := gen_random_uuid();
    v_birth_date := CURRENT_DATE - (6570 + (random() * 7300))::int; -- 18-38 tahun
    v_pregnancy_week := 4 + (random() * 36)::int; -- 4-40 minggu
    
    -- Insert patient
    INSERT INTO patients (
      id, full_name, nik, date_of_birth, gender, address, phone,
      patient_type, created_at, updated_at
    ) VALUES (
      v_patient_id,
      'Ibu Hamil Test ' || i,
      '3203' || LPAD((1000000000 + i)::text, 12, '0'),
      v_birth_date,
      'P',
      'Jl. Test Ibu Hamil No. ' || i || ', Jakarta Barat',
      '08' || LPAD((30000000 + i)::text, 10, '0'),
      'ibu_hamil',
      NOW(),
      NOW()
    );
    
    -- Insert pregnancy record
    INSERT INTO pregnancies (
      patient_id, pregnancy_order, estimated_due_date,
      status, created_at, updated_at
    ) VALUES (
      v_patient_id,
      1 + (random() * 3)::int,
      CURRENT_DATE + ((40 - v_pregnancy_week) * 7)::int,
      'ongoing',
      NOW(),
      NOW()
    );
    
    -- Insert extended data untuk ibu hamil
    INSERT INTO patient_extended_data (
      patient_id, weight, height, arm_circumference, waist_circumference,
      measurement_date, pregnancy_week, usg_count,
      pregnancy_risk_level, ttd_received, ttd_compliance,
      blood_sugar_random,
      chronic_diseases, current_medications,
      created_at, updated_at
    ) VALUES (
      v_patient_id,
      45 + (random() * 40)::decimal(5,2), -- 45-85 kg
      145 + (random() * 25)::decimal(4,1), -- 145-170 cm
      23 + (random() * 10)::decimal(4,1), -- LILA 23-33 cm
      70 + (random() * 40)::decimal(4,1),
      CURRENT_DATE - (random() * 30)::int,
      v_pregnancy_week,
      (v_pregnancy_week / 12)::int + 1,
      CASE 
        WHEN random() > 0.8 THEN 'tinggi'
        WHEN random() > 0.5 THEN 'sedang'
        ELSE 'rendah'
      END,
      30 + (random() * 60)::int,
      CASE WHEN random() > 0.7 THEN 'rutin' WHEN random() > 0.3 THEN 'kadang' ELSE 'tidak' END,
      80 + (random() * 40)::decimal(5,1),
      CASE WHEN random() > 0.9 THEN '["hipertensi"]'::jsonb ELSE '[]'::jsonb END,
      '["Asam folat", "Zat besi"]'::jsonb,
      NOW(),
      NOW()
    );
    
    -- Insert 3-8 kunjungan ANC
    v_visit_count := 3 + (random() * 5)::int;
    FOR j IN 1..v_visit_count LOOP
      INSERT INTO visits (
        patient_id, visit_date, weight, height,
        arm_circumference, blood_pressure,
        notes, recommendations,
        created_at, updated_at
      ) VALUES (
        v_patient_id,
        CURRENT_DATE - ((v_visit_count - j) * 30)::int,
        45 + (random() * 40 + j * 2)::decimal(5,2),
        145 + (random() * 25)::decimal(4,1),
        23 + (random() * 10)::decimal(4,1),
        (100 + (random() * 40))::int || '/' || (60 + (random() * 30))::int,
        'Pemeriksaan ANC rutin, kondisi ibu dan janin baik',
        'Konsumsi TTD rutin, istirahat cukup, kontrol ulang 4 minggu',
        NOW(),
        NOW()
      );
    END LOOP;
    
  END LOOP;
  RAISE NOTICE '✓ 300 data Ibu Hamil berhasil dibuat';
END $$;

-- ============================================================================
-- 4. PASIEN REMAJA & DEWASA (400 data) - Usia 15-45 tahun
-- ============================================================================

DO $$
DECLARE
  v_patient_id uuid;
  v_birth_date date;
  v_gender text;
  v_bmi decimal;
  v_visit_count int;
BEGIN
  FOR i IN 1..400 LOOP
    v_patient_id := gen_random_uuid();
    v_birth_date := CURRENT_DATE - (5475 + (random() * 10950))::int; -- 15-45 tahun
    v_gender := CASE WHEN random() > 0.5 THEN 'L' ELSE 'P' END;
    
    -- Insert patient
    INSERT INTO patients (
      id, full_name, nik, date_of_birth, gender, address, phone,
      patient_type, created_at, updated_at
    ) VALUES (
      v_patient_id,
      'Remaja Dewasa Test ' || i,
      '3204' || LPAD((1000000000 + i)::text, 12, '0'),
      v_birth_date,
      v_gender,
      'Jl. Test Remaja Dewasa No. ' || i || ', Jakarta Timur',
      '08' || LPAD((40000000 + i)::text, 10, '0'),
      'remaja_dewasa',
      NOW(),
      NOW()
    );
    
    -- Insert extended data untuk remaja & dewasa
    v_bmi := 17 + (random() * 13)::decimal(4,2); -- BMI 17-30
    
    INSERT INTO patient_extended_data (
      patient_id, weight, height, waist_circumference,
      measurement_date, occupation, marital_status,
      smoking_status, cigarettes_per_day,
      physical_activity, activity_minutes_per_week,
      vegetable_portions_per_day, fruit_portions_per_day,
      blood_sugar_random, blood_sugar_fasting,
      cholesterol_total, cholesterol_ldl, cholesterol_hdl,
      chronic_diseases, created_at, updated_at
    ) VALUES (
      v_patient_id,
      50 + (random() * 40)::decimal(5,2),
      155 + (random() * 25)::decimal(4,1),
      70 + (random() * 40)::decimal(4,1),
      CURRENT_DATE - (random() * 180)::int,
      CASE 
        WHEN random() > 0.7 THEN 'Pegawai Swasta'
        WHEN random() > 0.4 THEN 'Wiraswasta'
        ELSE 'Ibu Rumah Tangga'
      END,
      CASE WHEN random() > 0.5 THEN 'Menikah' ELSE 'Belum Menikah' END,
      CASE 
        WHEN random() > 0.85 THEN 'aktif'
        WHEN random() > 0.7 THEN 'pernah'
        ELSE 'tidak_pernah'
      END,
      CASE WHEN random() > 0.85 THEN 5 + (random() * 15)::int ELSE 0 END,
      CASE 
        WHEN random() > 0.7 THEN 'sangat'
        WHEN random() > 0.4 THEN 'cukup'
        ELSE 'kurang'
      END,
      30 + (random() * 300)::int,
      1 + (random() * 4)::int,
      1 + (random() * 4)::int,
      80 + (random() * 100)::decimal(5,1),
      70 + (random() * 60)::decimal(5,1),
      150 + (random() * 100)::decimal(5,1),
      80 + (random() * 80)::decimal(5,1),
      40 + (random() * 40)::decimal(5,1),
      CASE WHEN random() > 0.9 THEN '["hipertensi"]'::jsonb ELSE '[]'::jsonb END,
      NOW(),
      NOW()
    );
    
    -- Insert 2-4 kunjungan
    v_visit_count := 2 + (random() * 2)::int;
    FOR j IN 1..v_visit_count LOOP
      INSERT INTO visits (
        patient_id, visit_date, weight, height,
        blood_pressure,
        notes, recommendations,
        created_at, updated_at
      ) VALUES (
        v_patient_id,
        CURRENT_DATE - ((v_visit_count - j) * 90)::int,
        50 + (random() * 40)::decimal(5,2),
        155 + (random() * 25)::decimal(4,1),
        (100 + (random() * 50))::int || '/' || (60 + (random() * 40))::int,
        'Pemeriksaan kesehatan rutin',
        CASE 
          WHEN v_bmi > 25 THEN 'Perhatikan pola makan, tingkatkan aktivitas fisik'
          WHEN v_bmi < 18.5 THEN 'Tingkatkan asupan nutrisi'
          ELSE 'Pertahankan pola hidup sehat'
        END,
        NOW(),
        NOW()
      );
    END LOOP;
    
  END LOOP;
  RAISE NOTICE '✓ 400 data Remaja & Dewasa berhasil dibuat';
END $$;

-- ============================================================================
-- 5. PASIEN LANSIA (200 data) - Usia 60+ tahun
-- ============================================================================

DO $$
DECLARE
  v_patient_id uuid;
  v_birth_date date;
  v_gender text;
  v_visit_count int;
BEGIN
  FOR i IN 1..200 LOOP
    v_patient_id := gen_random_uuid();
    v_birth_date := CURRENT_DATE - (21900 + (random() * 7300))::int; -- 60-80 tahun
    v_gender := CASE WHEN random() > 0.5 THEN 'L' ELSE 'P' END;
    
    -- Insert patient
    INSERT INTO patients (
      id, full_name, nik, date_of_birth, gender, address, phone,
      patient_type, created_at, updated_at
    ) VALUES (
      v_patient_id,
      'Lansia Test ' || i,
      '3205' || LPAD((1000000000 + i)::text, 12, '0'),
      v_birth_date,
      v_gender,
      'Jl. Test Lansia No. ' || i || ', Jakarta Pusat',
      '08' || LPAD((50000000 + i)::text, 10, '0'),
      'lansia',
      NOW(),
      NOW()
    );
    
    -- Insert extended data untuk lansia
    INSERT INTO patient_extended_data (
      patient_id, weight, height, waist_circumference,
      measurement_date,
      blood_sugar_random, blood_sugar_fasting,
      cholesterol_total, cholesterol_ldl, cholesterol_hdl,
      triglycerides, uric_acid,
      adl_score, iadl_score, cognitive_status,
      chronic_diseases, current_medications,
      physical_activity, special_notes,
      created_at, updated_at
    ) VALUES (
      v_patient_id,
      45 + (random() * 35)::decimal(5,2),
      145 + (random() * 20)::decimal(4,1),
      75 + (random() * 35)::decimal(4,1),
      CURRENT_DATE - (random() * 90)::int,
      90 + (random() * 150)::decimal(5,1),
      80 + (random() * 100)::decimal(5,1),
      160 + (random() * 120)::decimal(5,1),
      90 + (random() * 100)::decimal(5,1),
      35 + (random() * 35)::decimal(5,1),
      100 + (random() * 200)::decimal(5,1),
      4 + (random() * 6)::decimal(4,1),
      80 + (random() * 20)::int, -- ADL score
      70 + (random() * 30)::int, -- IADL score
      CASE 
        WHEN random() > 0.8 THEN 'Gangguan ringan'
        WHEN random() > 0.9 THEN 'Gangguan sedang'
        ELSE 'Normal'
      END,
      CASE 
        WHEN random() > 0.3 THEN '["hipertensi", "diabetes"]'::jsonb
        ELSE '["hipertensi"]'::jsonb
      END,
      '["Antihipertensi", "Antidiabetes", "Statin"]'::jsonb,
      CASE WHEN random() > 0.6 THEN 'cukup' ELSE 'kurang' END,
      'Kontrol rutin penyakit kronis',
      NOW(),
      NOW()
    );
    
    -- Insert 4-6 kunjungan (lansia perlu kontrol lebih sering)
    v_visit_count := 4 + (random() * 2)::int;
    FOR j IN 1..v_visit_count LOOP
      INSERT INTO visits (
        patient_id, visit_date, weight, height,
        blood_pressure, notes, recommendations,
        created_at, updated_at
      ) VALUES (
        v_patient_id,
        CURRENT_DATE - ((v_visit_count - j) * 60)::int,
        45 + (random() * 35)::decimal(5,2),
        145 + (random() * 20)::decimal(4,1),
        (110 + (random() * 60))::int || '/' || (70 + (random() * 40))::int,
        'Pemeriksaan rutin lansia, monitoring penyakit kronis',
        'Minum obat teratur, kontrol gula darah dan tekanan darah, aktivitas ringan rutin',
        NOW(),
        NOW()
      );
    END LOOP;
    
  END LOOP;
  RAISE NOTICE '✓ 200 data Lansia berhasil dibuat';
END $$;

-- ============================================================================
-- 6. GENERATE ADDITIONAL DATA
-- ============================================================================

-- Generate beberapa schedule/jadwal posyandu
INSERT INTO schedules (title, description, date, time, location, created_at, updated_at)
VALUES
  ('Posyandu Rutin Januari', 'Pemeriksaan kesehatan rutin balita dan ibu hamil', '2026-01-15', '08:00-12:00', 'Balai RW 05', NOW(), NOW()),
  ('Posyandu Rutin Februari', 'Penimbangan dan imunisasi', '2026-02-15', '08:00-12:00', 'Balai RW 05', NOW(), NOW()),
  ('Posyandu Lansia Januari', 'Pemeriksaan kesehatan lansia', '2026-01-20', '08:00-11:00', 'Puskesmas Kelurahan', NOW(), NOW()),
  ('Penyuluhan Gizi Balita', 'Edukasi gizi seimbang untuk balita', '2026-02-05', '13:00-15:00', 'Aula RW 05', NOW(), NOW()),
  ('Vaksinasi Campak MR', 'Program vaksinasi massal', '2026-02-25', '08:00-14:00', 'Sekolah Dasar Negeri 01', NOW(), NOW());

-- Generate announcements
INSERT INTO announcements (title, content, type, published, created_at, updated_at)
VALUES
  ('Jadwal Posyandu Bulan Ini', 'Posyandu akan dilaksanakan setiap tanggal 15 setiap bulannya. Harap membawa KMS/buku kesehatan.', 'schedule', true, NOW(), NOW()),
  ('Tips Kesehatan Ibu Hamil', 'Konsumsi makanan bergizi, istirahat cukup, dan rutin kontrol kehamilan untuk kesehatan ibu dan janin.', 'info', true, NOW(), NOW()),
  ('Pentingnya Imunisasi Lengkap', 'Imunisasi melindungi anak dari penyakit berbahaya. Pastikan anak Anda mendapat imunisasi lengkap.', 'info', true, NOW(), NOW()),
  ('Lomba Balita Sehat', 'Akan diadakan lomba balita sehat pada tanggal 10 Maret 2026. Daftarkan putra-putri Anda!', 'event', true, NOW(), NOW());

-- Re-enable triggers
SET session_replication_role = 'origin';

-- ============================================================================
-- SUMMARY & VERIFICATION
-- ============================================================================

DO $$
DECLARE
  v_patient_count int;
  v_bayi_count int;
  v_balita_count int;
  v_ibu_hamil_count int;
  v_remaja_count int;
  v_lansia_count int;
  v_visit_count int;
  v_immunization_count int;
  v_extended_count int;
  v_pregnancy_count int;
BEGIN
  SELECT COUNT(*) INTO v_patient_count FROM patients;
  SELECT COUNT(*) INTO v_bayi_count FROM patients WHERE patient_type = 'bayi';
  SELECT COUNT(*) INTO v_balita_count FROM patients WHERE patient_type = 'balita';
  SELECT COUNT(*) INTO v_ibu_hamil_count FROM patients WHERE patient_type = 'ibu_hamil';
  SELECT COUNT(*) INTO v_remaja_count FROM patients WHERE patient_type = 'remaja_dewasa';
  SELECT COUNT(*) INTO v_lansia_count FROM patients WHERE patient_type = 'lansia';
  SELECT COUNT(*) INTO v_visit_count FROM visits;
  SELECT COUNT(*) INTO v_immunization_count FROM immunizations;
  SELECT COUNT(*) INTO v_extended_count FROM patient_extended_data;
  SELECT COUNT(*) INTO v_pregnancy_count FROM pregnancies;
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '  TEST DATA GENERATION COMPLETE!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Total Patients: %', v_patient_count;
  RAISE NOTICE '  - Bayi (0-11 bulan): %', v_bayi_count;
  RAISE NOTICE '  - Balita (1-5 tahun): %', v_balita_count;
  RAISE NOTICE '  - Ibu Hamil: %', v_ibu_hamil_count;
  RAISE NOTICE '  - Remaja & Dewasa (15-45 tahun): %', v_remaja_count;
  RAISE NOTICE '  - Lansia (60+ tahun): %', v_lansia_count;
  RAISE NOTICE '';
  RAISE NOTICE 'Total Visits: %', v_visit_count;
  RAISE NOTICE 'Total Immunizations: %', v_immunization_count;
  RAISE NOTICE 'Total Extended Data: %', v_extended_count;
  RAISE NOTICE 'Total Pregnancy Records: %', v_pregnancy_count;
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE '✓ Semua data berhasil di-generate!';
  RAISE NOTICE '✓ Siap untuk testing fitur aplikasi';
  RAISE NOTICE '';
END $$;
