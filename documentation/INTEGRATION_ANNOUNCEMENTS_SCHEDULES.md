# Integrasi Pengumuman & Jadwal

## Ringkasan
Integrasi backend, admin dashboard, dan frontend untuk fitur **Pengumuman & Jadwal** dengan **Jadwal & Kegiatan**.

## Perubahan yang Dilakukan

### 1. API Routes
Dibuat API routes untuk mengelola announcements dan schedules:

#### Announcements API
- **GET /api/announcements** - Mengambil semua pengumuman
  - Query params: `active=true` (filter yang dipublikasikan), `type` (filter berdasarkan tipe)
- **GET /api/announcements/[id]** - Mengambil satu pengumuman
- **POST /api/announcements** - Membuat pengumuman baru
- **PUT /api/announcements/[id]** - Update pengumuman
- **DELETE /api/announcements/[id]** - Hapus pengumuman

#### Schedules API
- **GET /api/schedules** - Mengambil semua jadwal
  - Query params: `upcoming=true` (filter upcoming), `limit` (batasi jumlah)
- **GET /api/schedules/[id]** - Mengambil satu jadwal
- **POST /api/schedules** - Membuat jadwal baru
- **PUT /api/schedules/[id]** - Update jadwal
- **DELETE /api/schedules/[id]** - Hapus jadwal

### 2. Database Migration
**File:** `migrations/02_create_announcements_schedules.sql`

Membuat tabel:
- `announcements` - Menyimpan pengumuman dengan kolom:
  - id, title, content, type, published, created_by, created_at, updated_at
- `schedules` - Menyimpan jadwal dengan kolom:
  - id, title, description, date, time, location, created_by, created_at, updated_at

Row Level Security (RLS) sudah diaktifkan dengan policy:
- Public dapat melihat pengumuman yang dipublikasikan
- Public dapat melihat semua jadwal
- User yang terautentikasi dapat melakukan CRUD

### 3. Frontend Landing Page
**File:** `src/components/landing/ScheduleSection.tsx`

Diubah dari data statis menjadi fetch dari API:
- Mengambil data dari `/api/schedules?upcoming=true&limit=4`
- Menampilkan 4 jadwal terdekat
- Loading state dan empty state
- Link ke detail jadwal

### 4. Admin Dashboard
**File:** `src/app/admin/pengumuman/page.tsx`

Integrasi dengan API:
- Fetch announcements dan schedules dari API
- CRUD operations menggunakan API endpoints
- Toggle published/active status
- Modal untuk tambah/edit dengan field yang sesuai dengan database schema

### 5. Detail Jadwal Page
**File:** `src/app/jadwal/[id]/page.tsx`

Diubah dari data mock menjadi fetch dari Supabase:
- Server-side rendering dengan data dari database
- Fallback jika jadwal tidak ditemukan
- Format tanggal dalam Bahasa Indonesia

## Cara Menjalankan Migration

1. Buka Supabase Dashboard
2. Pergi ke SQL Editor
3. Jalankan file `migrations/02_create_announcements_schedules.sql`
4. Verifikasi tabel dan data sample sudah dibuat

## Testing

### Test Landing Page
1. Buka halaman utama (/)
2. Scroll ke section "Jadwal & Kegiatan"
3. Pastikan jadwal muncul dari database
4. Klik "Lihat Detail" untuk test detail page

### Test Admin Dashboard
1. Login sebagai admin
2. Pergi ke `/admin/pengumuman`
3. Test CRUD operations:
   - Tambah pengumuman baru
   - Edit pengumuman
   - Toggle status published
   - Hapus pengumuman
4. Ulangi untuk tab "Jadwal Posyandu"

### Test Detail Page
1. Dari landing page, klik salah satu jadwal
2. Pastikan data ditampilkan dengan benar
3. Test dengan ID yang tidak ada untuk test fallback

## Struktur Database

### Tabel: announcements
```sql
id          UUID PRIMARY KEY
title       TEXT NOT NULL
content     TEXT NOT NULL
type        TEXT (info|schedule|event|warning)
published   BOOLEAN DEFAULT true
created_by  UUID REFERENCES auth.users(id)
created_at  TIMESTAMP
updated_at  TIMESTAMP
```

### Tabel: schedules
```sql
id          UUID PRIMARY KEY
title       TEXT NOT NULL
description TEXT
date        DATE NOT NULL
time        TEXT
location    TEXT
created_by  UUID REFERENCES auth.users(id)
created_at  TIMESTAMP
updated_at  TIMESTAMP
```

## API Response Format

### Success Response
```json
{
  "data": [...] // array of objects or single object
}
```

### Error Response
```json
{
  "error": "Error message",
  "details": "Detailed error message"
}
```

## Notes
- Semua API menggunakan Supabase client untuk database operations
- RLS policies mengatur akses data berdasarkan autentikasi
- Frontend menggunakan fetch API untuk komunikasi dengan backend
- Admin page mapping `published` field ke `is_active` untuk backward compatibility
