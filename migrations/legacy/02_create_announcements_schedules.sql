-- Create announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'schedule', 'event', 'warning')),
  published BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create schedules table
CREATE TABLE IF NOT EXISTS schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  time TEXT,
  location TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_announcements_published ON announcements(published);
CREATE INDEX IF NOT EXISTS idx_announcements_type ON announcements(type);
CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON announcements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_schedules_date ON schedules(date);
CREATE INDEX IF NOT EXISTS idx_schedules_created_at ON schedules(created_at DESC);

-- Enable Row Level Security
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;

-- Create policies for announcements
-- Allow public read access to published announcements
CREATE POLICY "Public can view published announcements"
  ON announcements FOR SELECT
  USING (published = true);

-- Allow authenticated users to view all announcements
CREATE POLICY "Authenticated users can view all announcements"
  ON announcements FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert announcements
CREATE POLICY "Authenticated users can insert announcements"
  ON announcements FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update announcements
CREATE POLICY "Authenticated users can update announcements"
  ON announcements FOR UPDATE
  TO authenticated
  USING (true);

-- Allow authenticated users to delete announcements
CREATE POLICY "Authenticated users can delete announcements"
  ON announcements FOR DELETE
  TO authenticated
  USING (true);

-- Create policies for schedules
-- Allow public read access to schedules
CREATE POLICY "Public can view schedules"
  ON schedules FOR SELECT
  USING (true);

-- Allow authenticated users to insert schedules
CREATE POLICY "Authenticated users can insert schedules"
  ON schedules FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update schedules
CREATE POLICY "Authenticated users can update schedules"
  ON schedules FOR UPDATE
  TO authenticated
  USING (true);

-- Allow authenticated users to delete schedules
CREATE POLICY "Authenticated users can delete schedules"
  ON schedules FOR DELETE
  TO authenticated
  USING (true);

-- Insert sample data for announcements
INSERT INTO announcements (title, content, type, published) VALUES
  ('Jadwal Posyandu Bulan Februari', 'Posyandu bulan Februari akan dilaksanakan pada tanggal 10 Februari 2026 pukul 08.00-12.00 WIB.', 'schedule', true),
  ('Pemberian Vitamin A Gratis', 'Program pemberian vitamin A gratis untuk balita usia 6-59 bulan pada bulan Februari dan Agustus.', 'event', true),
  ('Selamat Datang di Posyandu Sehat Mandiri', 'Kami berkomitmen memberikan pelayanan kesehatan terbaik untuk masyarakat.', 'info', true);

-- Insert sample data for schedules
INSERT INTO schedules (title, description, date, time, location) VALUES
  ('Imunisasi Bulanan', 'Pemberian vaksin lengkap untuk balita sesuai jadwal Kemenkes RI.', '2026-01-27', '08:00 - 12:00 WIB', 'Balai Desa Sukamaju'),
  ('Penimbangan Balita', 'Pemantauan tumbuh kembang balita dengan penimbangan dan pengukuran.', '2026-01-29', '09:00 - 11:00 WIB', 'Posyandu Sehat Mandiri'),
  ('Pemeriksaan Ibu Hamil', 'Pemeriksaan kesehatan rutin untuk ibu hamil dan konsultasi kehamilan.', '2026-02-03', '08:00 - 14:00 WIB', 'Posyandu Sehat Mandiri'),
  ('Pemeriksaan Lansia', 'Cek kesehatan lansia termasuk tekanan darah dan gula darah.', '2026-02-10', '08:00 - 12:00 WIB', 'Balai Desa Sukamaju');
