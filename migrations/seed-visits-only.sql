-- ============================================================================
-- GENERATE VISITS DATA ONLY
-- ============================================================================
-- Script untuk generate kunjungan untuk pasien yang sudah ada
-- Akan create 3-8 kunjungan per pasien tergantung tipe
-- ============================================================================

DO $$
DECLARE
  rec RECORD;
  v_visit_count int;
  v_weight decimal;
  v_height decimal;
  v_head_circ decimal;
  v_arm_circ decimal;
  v_age_days int;
BEGIN
  RAISE NOTICE 'Mulai generate data kunjungan...';
  
  -- Loop through all patients
  FOR rec IN 
    SELECT id, patient_type, date_of_birth, gender FROM patients
  LOOP
    v_age_days := CURRENT_DATE - rec.date_of_birth;
    
    -- BAYI: 3-5 kunjungan
    IF rec.patient_type = 'bayi' THEN
      v_visit_count := 3 + (random() * 2)::int;
      v_weight := 2.5 + (random() * 8)::decimal(4,2);
      v_height := 45 + (random() * 30)::decimal(4,1);
      v_head_circ := 32 + (random() * 15)::decimal(4,1);
      
      FOR j IN 1..v_visit_count LOOP
        IF (rec.date_of_birth + (30 * j)::int) <= CURRENT_DATE THEN
          INSERT INTO visits (
            patient_id, visit_date, weight, height,
            head_circumference, arm_circumference,
            notes, created_at, updated_at
          ) VALUES (
            rec.id,
            rec.date_of_birth + (30 * j)::int,
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
    
    -- BALITA: 4-6 kunjungan
    ELSIF rec.patient_type = 'balita' THEN
      v_visit_count := 4 + (random() * 2)::int;
      v_weight := 8 + (random() * 12)::decimal(4,2);
      v_height := 75 + (random() * 35)::decimal(4,1);
      v_arm_circ := 11 + (random() * 5)::decimal(4,1);
      
      FOR j IN 1..v_visit_count LOOP
        INSERT INTO visits (
          patient_id, visit_date, weight, height,
          arm_circumference, notes, created_at, updated_at
        ) VALUES (
          rec.id,
          CURRENT_DATE - ((v_visit_count - j) * 60)::int,
          v_weight + (0.2 * j)::decimal(4,2),
          v_height + (0.5 * j)::decimal(4,1),
          v_arm_circ + (0.1 * j)::decimal(4,1),
          CASE 
            WHEN random() > 0.8 THEN 'Gizi baik, tumbuh kembang normal'
            WHEN random() > 0.5 THEN 'Perlu perhatian pola makan'
            ELSE 'Status gizi cukup'
          END,
          NOW(),
          NOW()
        );
      END LOOP;
    
    -- IBU HAMIL: 3-8 kunjungan ANC
    ELSIF rec.patient_type = 'ibu_hamil' THEN
      v_visit_count := 3 + (random() * 5)::int;
      
      FOR j IN 1..v_visit_count LOOP
        INSERT INTO visits (
          patient_id, visit_date, weight, height,
          arm_circumference, blood_pressure,
          notes, recommendations,
          created_at, updated_at
        ) VALUES (
          rec.id,
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
    
    -- REMAJA & DEWASA: 2-4 kunjungan
    ELSIF rec.patient_type = 'remaja_dewasa' THEN
      v_visit_count := 2 + (random() * 2)::int;
      
      FOR j IN 1..v_visit_count LOOP
        INSERT INTO visits (
          patient_id, visit_date, weight, height,
          blood_pressure, notes, recommendations,
          created_at, updated_at
        ) VALUES (
          rec.id,
          CURRENT_DATE - ((v_visit_count - j) * 90)::int,
          50 + (random() * 40)::decimal(5,2),
          155 + (random() * 25)::decimal(4,1),
          (100 + (random() * 50))::int || '/' || (60 + (random() * 40))::int,
          'Pemeriksaan kesehatan rutin',
          CASE 
            WHEN random() > 0.7 THEN 'Perhatikan pola makan, tingkatkan aktivitas fisik'
            WHEN random() > 0.4 THEN 'Pertahankan pola hidup sehat'
            ELSE 'Konsultasi gizi untuk pola makan lebih baik'
          END,
          NOW(),
          NOW()
        );
      END LOOP;
    
    -- LANSIA: 4-6 kunjungan
    ELSIF rec.patient_type = 'lansia' THEN
      v_visit_count := 4 + (random() * 2)::int;
      
      FOR j IN 1..v_visit_count LOOP
        INSERT INTO visits (
          patient_id, visit_date, weight, height,
          blood_pressure, notes, recommendations,
          created_at, updated_at
        ) VALUES (
          rec.id,
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
    END IF;
    
  END LOOP;
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '  VISITS DATA GENERATED SUCCESSFULLY!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Total Visits Created: %', (SELECT COUNT(*) FROM visits);
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  
END $$;

-- Tampilkan summary per tipe pasien
SELECT 
  p.patient_type,
  COUNT(DISTINCT p.id) as total_patients,
  COUNT(v.id) as total_visits,
  ROUND(AVG(visit_count), 2) as avg_visits_per_patient
FROM patients p
LEFT JOIN visits v ON p.id = v.patient_id
LEFT JOIN (
  SELECT patient_id, COUNT(*) as visit_count
  FROM visits
  GROUP BY patient_id
) vc ON p.id = vc.patient_id
GROUP BY p.patient_type
ORDER BY p.patient_type;
