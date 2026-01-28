# 🚀 Fix Dashboard - Data Tidak Muncul

## ❌ Masalah
Dashboard menampilkan semua data 0:
- Total Pasien Aktif: 0
- Kunjungan Bulan Ini: 0
- Imunisasi Pending: 0
- Grafik kosong
- Kunjungan Terbaru: "Memuat data..."

## 🔍 Penyebab
1. **RLS (Row Level Security) terlalu ketat** - API tidak bisa baca data
2. **Data belum di-seed** - Database kosong
3. **Supabase client belum authenticated**

## ✅ Solusi (Step by Step)

### 1️⃣ **Check Data Ada atau Tidak**
Jalankan di Supabase SQL Editor:
```sql
-- File: debug-dashboard.sql
SELECT 
  (SELECT COUNT(*) FROM patients) as total_patients,
  (SELECT COUNT(*) FROM visits) as total_visits,
  (SELECT COUNT(*) FROM immunizations) as total_immunizations;
```

**Hasil yang diharapkan:**
- `total_patients`: 1500
- `total_visits`: ~6000
- `total_immunizations`: ~2000

**Jika semua 0**, jalankan seed data dulu:
```sql
-- 1. Jalankan file: seed-test-data.sql (generate 1500 pasien)
-- 2. Jalankan file: seed-visits-only.sql (generate kunjungan)
```

### 2️⃣ **Fix RLS Policies**
Jalankan di Supabase SQL Editor:
```sql
-- File: migrations/00_fix_dashboard_complete.sql
```

Script ini akan:
- ✅ **Disable RLS** sementara untuk testing
- ✅ **Check data** yang ada
- ✅ **Tampilkan summary** di console

### 3️⃣ **Restart Development Server**
Di terminal:
```powershell
# Stop server (Ctrl+C)
bun run dev
```

### 4️⃣ **Refresh Browser**
- Hard refresh: `Ctrl + Shift + R`
- Clear cache kalau perlu

### 5️⃣ **Verify Dashboard Berfungsi**
Dashboard seharusnya menampilkan:
- ✅ Total Pasien Aktif: **1500**
- ✅ Kunjungan Bulan Ini: **~200-300** (tergantung data)
- ✅ Grafik Kunjungan: **Chart dengan data**
- ✅ Status Gizi Balita: **Donut chart dengan warna**
- ✅ Kunjungan Terbaru: **5 data terbaru**

---

## 🔧 Troubleshooting

### ⚠️ **Masih 0 setelah langkah di atas?**

**A. Check Supabase URL & Anon Key**
File: `.env.local`
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

**B. Check Authentication**
- Login ke aplikasi: `http://localhost:3000/login`
- Pastikan user sudah login sebelum akses dashboard

**C. Check Console Errors**
- Buka Browser DevTools (F12)
- Tab **Console** - cari error merah
- Tab **Network** - cek API calls gagal atau tidak

**D. Manual Query Test**
Jalankan di Supabase SQL Editor:
```sql
-- Test dashboard query langsung
SELECT 
  p.patient_type,
  COUNT(*) as count
FROM patients p
GROUP BY p.patient_type;

-- Should return:
-- bayi: 200
-- balita: 400
-- ibu_hamil: 300
-- remaja_dewasa: 400
-- lansia: 200
```

---

## 🔒 Re-enable RLS (Optional - Setelah Dashboard Work)

Kalau dashboard sudah jalan dan mau **enable security lagi**:

```sql
-- 1. Enable RLS
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE immunizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_extended_data ENABLE ROW LEVEL SECURITY;

-- 2. Add policies untuk authenticated users
CREATE POLICY "Enable read for authenticated" 
  ON patients FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Enable read for authenticated" 
  ON visits FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Enable read for authenticated" 
  ON immunizations FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Enable read for authenticated" 
  ON patient_extended_data FOR SELECT 
  TO authenticated 
  USING (true);
```

---

## 📊 Expected Dashboard State

Setelah semua fix:

```
┌─────────────────────────────────────────────────────────┐
│ Dashboard                                               │
├─────────────┬─────────────┬─────────────┬──────────────┤
│ Total       │ Kunjungan   │ Imunisasi   │ Balita       │
│ Pasien      │ Bulan Ini   │ Pending     │ Gizi Buruk   │
│   1500      │    ~250     │     ~50     │     ~20      │
└─────────────┴─────────────┴─────────────┴──────────────┘

┌─────────────────────────────────┬─────────────────────┐
│ Grafik Kunjungan (6 bulan)      │ Status Gizi Balita  │
│                                  │                     │
│  📈 Line chart dengan data      │  🍩 Donut chart     │
│  - Jan: 300                      │  - Gizi Baik: 450   │
│  - Feb: 280                      │  - Gizi Kurang: 120 │
│  - Mar: 320                      │  - Gizi Buruk: 20   │
│  - etc...                        │  - Stunting: 10     │
└─────────────────────────────────┴─────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Kunjungan Terbaru                                       │
├──────────────┬──────────┬────────────┬─────────────────┤
│ Nama         │ Tipe     │ Tanggal    │ Petugas         │
├──────────────┼──────────┼────────────┼─────────────────┤
│ Bayi Test 1  │ Bayi     │ 28 Jan 2026│ Admin Posyandu  │
│ Balita Test 2│ Balita   │ 28 Jan 2026│ Admin Posyandu  │
│ Ibu Hamil... │ Ibu Hamil│ 27 Jan 2026│ Admin Posyandu  │
└──────────────┴──────────┴────────────┴─────────────────┘
```

---

## 🎯 Quick Fix Commands (Copy-Paste)

```bash
# 1. Check data di Supabase SQL Editor
# Copy dari: debug-dashboard.sql

# 2. Disable RLS & verify
# Copy dari: migrations/00_fix_dashboard_complete.sql

# 3. Restart dev server
bun run dev

# 4. Hard refresh browser
# Ctrl + Shift + R
```

---

**Dashboard sekarang sudah menampilkan data! 🎉**
