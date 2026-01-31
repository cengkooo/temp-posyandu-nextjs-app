-- ============================================================================
-- FIX RLS POLICIES FOR DASHBOARD
-- ============================================================================
-- Pastikan admin bisa read semua data untuk dashboard

-- 1. Enable SELECT untuk authenticated users di patients
DROP POLICY IF EXISTS "Allow authenticated users to read patients" ON patients;
CREATE POLICY "Allow authenticated users to read patients"
  ON patients FOR SELECT
  TO authenticated
  USING (true);

-- 2. Enable SELECT untuk authenticated users di visits
DROP POLICY IF EXISTS "Allow authenticated users to read visits" ON visits;
CREATE POLICY "Allow authenticated users to read visits"
  ON visits FOR SELECT
  TO authenticated
  USING (true);

-- 3. Enable SELECT untuk authenticated users di immunizations
DROP POLICY IF EXISTS "Allow authenticated users to read immunizations" ON immunizations;
CREATE POLICY "Allow authenticated users to read immunizations"
  ON immunizations FOR SELECT
  TO authenticated
  USING (true);

-- 4. Enable SELECT untuk authenticated users di patient_extended_data
DROP POLICY IF EXISTS "Allow authenticated users to read extended data" ON patient_extended_data;
CREATE POLICY "Allow authenticated users to read extended data"
  ON patient_extended_data FOR SELECT
  TO authenticated
  USING (true);

-- 5. Enable SELECT untuk authenticated users di profiles
DROP POLICY IF EXISTS "Allow authenticated users to read profiles" ON profiles;
CREATE POLICY "Allow authenticated users to read profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

-- 6. Verify policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('patients', 'visits', 'immunizations', 'patient_extended_data', 'profiles')
ORDER BY tablename, policyname;
