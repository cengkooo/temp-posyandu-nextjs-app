-- Add new columns to schedules table
ALTER TABLE schedules
ADD COLUMN IF NOT EXISTS subtitle TEXT,
ADD COLUMN IF NOT EXISTS duration TEXT,
ADD COLUMN IF NOT EXISTS full_address TEXT,
ADD COLUMN IF NOT EXISTS map_link TEXT,
ADD COLUMN IF NOT EXISTS capacity INTEGER,
ADD COLUMN IF NOT EXISTS registered INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS price TEXT DEFAULT 'GRATIS',
ADD COLUMN IF NOT EXISTS price_note TEXT,
ADD COLUMN IF NOT EXISTS coordinator_name TEXT,
ADD COLUMN IF NOT EXISTS coordinator_role TEXT,
ADD COLUMN IF NOT EXISTS contact_phone TEXT,
ADD COLUMN IF NOT EXISTS contact_whatsapp TEXT,
ADD COLUMN IF NOT EXISTS requirements TEXT[], -- Array of text
ADD COLUMN IF NOT EXISTS important_note_title TEXT,
ADD COLUMN IF NOT EXISTS important_note_message TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[]; -- Array of text

-- Update existing data with default values
UPDATE schedules
SET 
  subtitle = description,
  duration = '4 Jam',
  full_address = location,
  price = 'GRATIS',
  price_note = 'Didukung oleh Pemerintah',
  coordinator_name = 'dr. Siti Nurhaliza',
  coordinator_role = 'Bidan Kepala',
  contact_phone = '0812-3456-7890',
  contact_whatsapp = 'WhatsApp tersedia',
  requirements = ARRAY[
    'Membawa kartu identitas (KTP/KK)',
    'Datang tepat waktu sesuai jadwal',
    'Mengikuti protokol kesehatan yang berlaku'
  ],
  important_note_title = 'Catatan Penting',
  important_note_message = 'Jika memiliki kondisi kesehatan khusus, harap konsultasikan dengan petugas kesehatan terlebih dahulu.',
  capacity = 50,
  registered = 0
WHERE subtitle IS NULL;

-- Update tags based on title
UPDATE schedules
SET tags = ARRAY[title]
WHERE tags IS NULL;
