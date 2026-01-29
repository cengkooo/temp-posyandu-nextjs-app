-- Add complaints and recommendations columns to visits table
ALTER TABLE visits 
ADD COLUMN IF NOT EXISTS complaints text,
ADD COLUMN IF NOT EXISTS recommendations text;

-- Verify the changes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'visits' 
ORDER BY ordinal_position;
