# LANGKAH-LANGKAH MENJALANKAN MIGRATION

## ⚠️ PENTING - BACA DULU!

Migration ini akan mengubah struktur database Supabase Anda. Pastikan Anda sudah backup data jika diperlukan.

## Langkah 1: Masuk ke Supabase Dashboard

1. Buka https://supabase.com
2. Login dan pilih project Anda
3. Klik menu **SQL Editor** di sidebar kiri

## Langkah 2: Jalankan Migration

1. Buka file: `migrations/01_update_patient_types_and_extended_data.sql`
2. Copy seluruh isi file tersebut
3. Paste ke SQL Editor di Supabase
4. Klik tombol **RUN** atau tekan `Ctrl+Enter`

## Langkah 3: Verifikasi

Setelah migration berhasil, Anda akan melihat:

### ✅ Tabel `patients` sudah support 5 tipe:
- bayi
- balita
- ibu_hamil
- remaja_dewasa
- lansia

### ✅ Tabel baru `patient_extended_data` sudah dibuat dengan field:
- Antropometri (weight, height, waist_circumference, dll)
- Data ASI & MP-ASI untuk bayi/balita
- Data kehamilan untuk ibu hamil
- Data PTM (Penyakit Tidak Menular) untuk dewasa/lansia
- Data fungsional untuk lansia
- Dan banyak lagi...

## Langkah 4: Regenerate TypeScript Types (Opsional tapi Disarankan)

Jika Anda ingin types yang lebih fresh dari database:

```bash
# Install Supabase CLI jika belum
npm install -g supabase

# Login ke Supabase
supabase login

# Link ke project Anda
supabase link --project-ref your-project-ref

# Generate types baru
supabase gen types typescript --local > src/types/database.types.ts
```

> **Catatan**: File `database.types.ts` sudah saya update manual, jadi step ini opsional.

## Langkah 5: Test Aplikasi

1. Jalankan aplikasi: `bun run dev`
2. Buka halaman **Tambah Pasien**
3. Coba pilih tipe **Bayi** atau **Remaja & Dewasa**
4. Isi form dan simpan
5. Cek di halaman **Data Pasien** apakah data tersimpan dengan benar

## Troubleshooting

### Error: "permission denied for table patient_extended_data"

**Solusi**: Row Level Security policies sudah dibuat di migration, tapi pastikan user authenticated.

### Error: "violates check constraint patients_patient_type_check"

**Solusi**: Database masih pakai constraint lama. Jalankan ulang migration dari awal.

### Data extended tidak tersimpan

**Solusi**: 
1. Cek di Supabase Dashboard > Table Editor
2. Lihat table `patient_extended_data`
3. Pastikan ada foreign key ke `patients` table

## Rollback (Jika Ada Masalah)

Jika Anda ingin rollback migration:

```sql
-- Hapus table baru
DROP TABLE IF EXISTS patient_extended_data CASCADE;

-- Kembalikan constraint lama
ALTER TABLE patients DROP CONSTRAINT IF EXISTS patients_patient_type_check;
ALTER TABLE patients 
ADD CONSTRAINT patients_patient_type_check 
CHECK (patient_type IN ('balita', 'ibu_hamil', 'lansia'));
```

## Support

Jika ada masalah, cek:
1. Logs di Supabase Dashboard > Logs
2. Browser Console untuk error di frontend
3. Terminal/cmd untuk error di backend

---

**Selamat! Database Anda sekarang sudah support 5 tipe pasien! 🎉**
