-- ============================================
-- COMPLETE FIX FOR VISITS TABLE
-- Remove metadata column + Fix RLS policies
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Drop metadata column if exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'visits' AND column_name = 'metadata'
  ) THEN
    ALTER TABLE visits DROP COLUMN metadata;
    RAISE NOTICE 'Metadata column dropped from visits table';
  ELSE
    RAISE NOTICE 'Metadata column does not exist in visits table';
  END IF;
END $$;

-- Step 2: Ensure required columns exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'visits' AND column_name = 'complaints'
  ) THEN
    ALTER TABLE visits ADD COLUMN complaints TEXT;
    RAISE NOTICE 'Added complaints column';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'visits' AND column_name = 'recommendations'
  ) THEN
    ALTER TABLE visits ADD COLUMN recommendations TEXT;
    RAISE NOTICE 'Added recommendations column';
  END IF;
END $$;

-- Step 3: Enable RLS if not enabled
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;

-- Step 4: Drop existing policies
DROP POLICY IF EXISTS "Public can view visits" ON visits;
DROP POLICY IF EXISTS "Authenticated users can view visits" ON visits;
DROP POLICY IF EXISTS "Authenticated users can insert visits" ON visits;
DROP POLICY IF EXISTS "Authenticated users can update visits" ON visits;
DROP POLICY IF EXISTS "Authenticated users can delete visits" ON visits;
DROP POLICY IF EXISTS "Public can insert visits" ON visits;
DROP POLICY IF EXISTS "Public can update visits" ON visits;
DROP POLICY IF EXISTS "Public can delete visits" ON visits;

-- Step 5: Create new permissive policies (for development/admin panel)
CREATE POLICY "Public can view visits"
  ON visits FOR SELECT
  USING (true);

CREATE POLICY "Public can insert visits"
  ON visits FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can update visits"
  ON visits FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can delete visits"
  ON visits FOR DELETE
  USING (true);

-- Step 6: Verify the changes
SELECT 
  'Columns:' as info,
  column_name, 
  data_type, 
  is_nullable 
FROM information_schema.columns 
WHERE table_name = 'visits' 
ORDER BY ordinal_position;

-- Success message
DO $$ 
BEGIN
  RAISE NOTICE 'Visits table fix completed successfully!';
END $$;
