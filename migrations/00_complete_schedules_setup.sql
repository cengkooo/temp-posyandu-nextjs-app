-- ============================================
-- COMPLETE SCHEDULES TABLE SETUP
-- Run this entire script in Supabase SQL Editor
-- ============================================

-- Drop existing table if needed (WARNING: This will delete existing data!)
-- Uncomment the line below if you want to start fresh
-- DROP TABLE IF EXISTS schedules CASCADE;

-- Create schedules table with all required fields
CREATE TABLE IF NOT EXISTS schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Basic Info
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  
  -- Date & Time
  date DATE NOT NULL,
  time TEXT,  -- Changed to TEXT to support formats like "08:00 - 12:00 WIB"
  duration TEXT,
  
  -- Location
  location TEXT,
  full_address TEXT,
  map_link TEXT,
  
  -- Capacity
  capacity INTEGER,
  
  -- Pricing
  price TEXT DEFAULT 'GRATIS',
  price_note TEXT,
  
  -- Coordinator
  coordinator_name TEXT,
  coordinator_role TEXT,
  
  -- Contact
  contact_phone TEXT,
  contact_whatsapp TEXT,
  
  -- Additional Info
  requirements TEXT[],  -- Array of text
  important_note_title TEXT,
  important_note_message TEXT,
  tags TEXT[],  -- Array of text
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- If table already exists, alter the time column to TEXT
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'schedules' AND column_name = 'time' AND data_type != 'text'
  ) THEN
    ALTER TABLE schedules ALTER COLUMN time TYPE TEXT;
  END IF;
END $$;

-- Add missing columns if table already exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'schedules' AND column_name = 'subtitle') THEN
    ALTER TABLE schedules ADD COLUMN subtitle TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'schedules' AND column_name = 'duration') THEN
    ALTER TABLE schedules ADD COLUMN duration TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'schedules' AND column_name = 'full_address') THEN
    ALTER TABLE schedules ADD COLUMN full_address TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'schedules' AND column_name = 'map_link') THEN
    ALTER TABLE schedules ADD COLUMN map_link TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'schedules' AND column_name = 'capacity') THEN
    ALTER TABLE schedules ADD COLUMN capacity INTEGER;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'schedules' AND column_name = 'price') THEN
    ALTER TABLE schedules ADD COLUMN price TEXT DEFAULT 'GRATIS';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'schedules' AND column_name = 'price_note') THEN
    ALTER TABLE schedules ADD COLUMN price_note TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'schedules' AND column_name = 'coordinator_name') THEN
    ALTER TABLE schedules ADD COLUMN coordinator_name TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'schedules' AND column_name = 'coordinator_role') THEN
    ALTER TABLE schedules ADD COLUMN coordinator_role TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'schedules' AND column_name = 'contact_phone') THEN
    ALTER TABLE schedules ADD COLUMN contact_phone TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'schedules' AND column_name = 'contact_whatsapp') THEN
    ALTER TABLE schedules ADD COLUMN contact_whatsapp TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'schedules' AND column_name = 'requirements') THEN
    ALTER TABLE schedules ADD COLUMN requirements TEXT[];
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'schedules' AND column_name = 'important_note_title') THEN
    ALTER TABLE schedules ADD COLUMN important_note_title TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'schedules' AND column_name = 'important_note_message') THEN
    ALTER TABLE schedules ADD COLUMN important_note_message TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'schedules' AND column_name = 'tags') THEN
    ALTER TABLE schedules ADD COLUMN tags TEXT[];
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_schedules_date ON schedules(date);
CREATE INDEX IF NOT EXISTS idx_schedules_created_at ON schedules(created_at DESC);

-- Enable Row Level Security
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Public can view schedules" ON schedules;
DROP POLICY IF EXISTS "Authenticated users can insert schedules" ON schedules;
DROP POLICY IF EXISTS "Authenticated users can update schedules" ON schedules;
DROP POLICY IF EXISTS "Authenticated users can delete schedules" ON schedules;

-- Create RLS policies
CREATE POLICY "Public can view schedules"
  ON schedules FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert schedules"
  ON schedules FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update schedules"
  ON schedules FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete schedules"
  ON schedules FOR DELETE
  TO authenticated
  USING (true);

-- Success message
DO $$ 
BEGIN
  RAISE NOTICE 'Schedules table setup complete!';
END $$;
