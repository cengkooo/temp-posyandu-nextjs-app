# LANGKAH-LANGKAH MENJALANKAN MIGRATION (SINGLE FILE)

## ⚠️ PENTING - BACA DULU!

File schema ini akan membuat (atau melengkapi) seluruh struktur database Supabase yang dipakai aplikasi.
Kalau project Supabase Anda sudah ada data penting, backup dulu.

## File yang digunakan

- `migrations/00_supabase_schema.sql` (single migration untuk semua tabel + RLS + functions)

## Langkah 1: Masuk ke Supabase Dashboard

1. Buka https://supabase.com
2. Login dan pilih project Anda
3. Klik menu **SQL Editor** di sidebar kiri

## Langkah 2: Jalankan Migration

1. Buka file: `migrations/00_supabase_schema.sql`
2. Copy seluruh isi file tersebut
3. Paste ke SQL Editor di Supabase
4. Klik tombol **RUN** atau tekan `Ctrl+Enter`

## Langkah 3: Verifikasi

Di Supabase Dashboard → **Table Editor**, pastikan tabel ini muncul:

- `profiles`
- `patients`
- `visits`
- `immunizations`
- `pregnancies`
- `patient_extended_data`
- `schedules`
- `announcements`
- `gallery`
- `posyandu_settings`
- `audit_logs`

Di Supabase Dashboard → **Database** → **Functions**, pastikan ada:

- `dashboard_nutrition_counts`
- `dashboard_visit_trends`

## Langkah 4: Test Aplikasi

1. Jalankan aplikasi: `bun run dev`
2. Login, lalu buka menu admin
3. Test:
	- **Pengaturan → Profil Posyandu** (baca/simpan)
	- **Dashboard** (grafik/summary berjalan)
	- **Jadwal/Pengumuman** (create + list)

## Troubleshooting

### Error: permission denied / RLS

- Pastikan request dilakukan sebagai user **authenticated**.
- Untuk aksi tertentu (contoh: update `posyandu_settings`), user harus role `admin` di tabel `profiles`.

### Script sudah pernah dijalankan, tapi error “already exists”

- Script ini dibuat cukup idempotent (pakai `if not exists` / `create or replace`).
- Kalau masih error, kirim pesan error-nya (copy text SQL Editor) biar bisa disesuaikan.

