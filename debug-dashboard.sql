-- ============================================================================
-- DEBUG DASHBOARD - Check data yang ada
-- ============================================================================

-- 1. Total Patients
SELECT COUNT(*) as total_patients FROM patients;

-- 2. Breakdown per tipe
SELECT patient_type, COUNT(*) as count 
FROM patients 
GROUP BY patient_type 
ORDER BY patient_type;

-- 3. Visits bulan ini
SELECT COUNT(*) as visits_this_month
FROM visits
WHERE visit_date >= DATE_TRUNC('month', CURRENT_DATE)
  AND visit_date <= DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day';

-- 4. Visits per bulan (6 bulan terakhir)
SELECT 
  TO_CHAR(visit_date, 'YYYY-MM') as month,
  TO_CHAR(visit_date, 'Mon') as month_label,
  COUNT(*) as total
FROM visits
WHERE visit_date >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '5 months'
GROUP BY TO_CHAR(visit_date, 'YYYY-MM'), TO_CHAR(visit_date, 'Mon')
ORDER BY month;

-- 5. Imunisasi pending
SELECT COUNT(*) as immunizations_pending
FROM immunizations
WHERE next_schedule IS NOT NULL
  AND next_schedule <= CURRENT_DATE;

-- 6. Status Gizi Balita (estimasi berdasarkan berat/tinggi)
-- Ini simplified version - seharusnya pakai WHO standards
WITH balita_measurements AS (
  SELECT 
    p.id,
    p.full_name,
    ped.weight,
    ped.height,
    EXTRACT(YEAR FROM AGE(p.date_of_birth)) * 12 + EXTRACT(MONTH FROM AGE(p.date_of_birth)) as age_months
  FROM patients p
  LEFT JOIN patient_extended_data ped ON p.id = ped.patient_id
  WHERE p.patient_type IN ('bayi', 'balita')
    AND ped.weight IS NOT NULL
    AND ped.height IS NOT NULL
)
SELECT 
  CASE
    WHEN weight IS NULL OR height IS NULL THEN 'Data Tidak Lengkap'
    WHEN age_months <= 24 AND height < 75 THEN 'Stunting'
    WHEN age_months > 24 AND height < 85 THEN 'Stunting'
    WHEN weight/POWER(height/100, 2) < 15 THEN 'Gizi Buruk'
    WHEN weight/POWER(height/100, 2) < 17 THEN 'Gizi Kurang'
    ELSE 'Gizi Baik'
  END as nutritional_status,
  COUNT(*) as count
FROM balita_measurements
GROUP BY 
  CASE
    WHEN weight IS NULL OR height IS NULL THEN 'Data Tidak Lengkap'
    WHEN age_months <= 24 AND height < 75 THEN 'Stunting'
    WHEN age_months > 24 AND height < 85 THEN 'Stunting'
    WHEN weight/POWER(height/100, 2) < 15 THEN 'Gizi Buruk'
    WHEN weight/POWER(height/100, 2) < 17 THEN 'Gizi Kurang'
    ELSE 'Gizi Baik'
  END
ORDER BY 
  CASE 
    CASE
      WHEN weight IS NULL OR height IS NULL THEN 'Data Tidak Lengkap'
      WHEN age_months <= 24 AND height < 75 THEN 'Stunting'
      WHEN age_months > 24 AND height < 85 THEN 'Stunting'
      WHEN weight/POWER(height/100, 2) < 15 THEN 'Gizi Buruk'
      WHEN weight/POWER(height/100, 2) < 17 THEN 'Gizi Kurang'
      ELSE 'Gizi Baik'
    END
    WHEN 'Gizi Baik' THEN 1
    WHEN 'Gizi Kurang' THEN 2
    WHEN 'Gizi Buruk' THEN 3
    WHEN 'Stunting' THEN 4
    ELSE 5
  END;

-- 7. Recent Visits (5 terbaru)
SELECT 
  p.full_name as patient_name,
  p.patient_type,
  v.visit_date,
  v.notes,
  CASE p.patient_type
    WHEN 'bayi' THEN 'Bayi'
    WHEN 'balita' THEN 'Balita'
    WHEN 'ibu_hamil' THEN 'Ibu Hamil'
    WHEN 'remaja_dewasa' THEN 'Remaja/Dewasa'
    WHEN 'lansia' THEN 'Lansia'
    ELSE p.patient_type
  END as type_label
FROM visits v
JOIN patients p ON v.patient_id = p.id
ORDER BY v.visit_date DESC
LIMIT 5;

-- 8. Summary lengkap
SELECT 
  (SELECT COUNT(*) FROM patients) as total_patients,
  (SELECT COUNT(*) FROM visits WHERE visit_date >= DATE_TRUNC('month', CURRENT_DATE)) as visits_this_month,
  (SELECT COUNT(*) FROM immunizations WHERE next_schedule IS NOT NULL AND next_schedule <= CURRENT_DATE) as immunizations_pending,
  (SELECT COUNT(*) FROM patients WHERE patient_type IN ('bayi', 'balita')) as total_bayi_balita;
