-- ============================================
-- FIX RLS POLICY FOR SCHEDULES
-- Allow public insert for admin panel
-- ============================================

-- Drop existing insert policy
DROP POLICY IF EXISTS "Authenticated users can insert schedules" ON schedules;
DROP POLICY IF EXISTS "Anyone can insert schedules" ON schedules;

-- Allow anyone to insert schedules (for admin panel)
CREATE POLICY "Public can insert schedules"
  ON schedules FOR INSERT
  WITH CHECK (true);

-- Drop and recreate update/delete policies to allow public access
DROP POLICY IF EXISTS "Authenticated users can update schedules" ON schedules;
DROP POLICY IF EXISTS "Authenticated users can delete schedules" ON schedules;

CREATE POLICY "Public can update schedules"
  ON schedules FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can delete schedules"
  ON schedules FOR DELETE
  USING (true);

-- Success message
DO $$ 
BEGIN
  RAISE NOTICE 'RLS policies updated - public access enabled for schedules!';
END $$;
