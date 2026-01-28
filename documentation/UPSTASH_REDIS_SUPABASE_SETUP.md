# Upstash Redis + Supabase (Serverless) — Setup

Dokumen ini jelasin kapan masuk akal pakai **Upstash Redis** bareng **Supabase** di aplikasi Next.js (App Router) ini, plus cara setup caching + rate limiting.

## Kenapa masuk akal?

Supabase tetap jadi **source of truth** (Postgres + RLS + auth). Upstash Redis masuk sebagai:

- **Cache** untuk query yang berat/sering di-hit (dashboard, agregasi, list schedules, coverage/tracking imunisasi).
- **Rate limiting** endpoint publik (contoh: jadwal / schedules) biar tidak gampang di-scrape / di-DDoS ringan.
- **Dedup / lock ringan** (opsional) untuk proses yang rawan double-submit.

Yang tidak disarankan:
- Menyimpan data utama menggantikan Supabase.
- Menyimpan data sensitif tanpa strategi enkripsi/TTL yang jelas.

## Integrasi yang sudah ada di repo ini

Saat dokumen ini dibuat, caching + rate limit sudah dipasang di route berikut:

- `GET /api/immunizations?type=tracking`
- `GET /api/immunizations?type=coverage`
- `GET /api/immunizations?patient_id=...`
- `GET /api/schedules` (dengan query `upcoming` dan `limit`)
- `GET /api/schedules/[id]`

Invalidate cache dilakukan otomatis saat write:

- `POST/PUT/DELETE /api/immunizations` → invalidate namespace `immunizations`
- `POST /api/schedules` dan `PUT/DELETE /api/schedules/[id]` → invalidate namespace `schedules`

Rate limit bersifat opsional via env `RATE_LIMIT_ENABLED=true`.

## Prasyarat

- Aplikasi sudah jalan dengan Supabase (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
- Punya akun Upstash.

## 1) Buat database Redis di Upstash

1. Masuk Upstash → Redis → Create Database.
2. Pilih region yang dekat dengan deployment (misalnya sama region Vercel).
3. Ambil kredensial **REST**:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

## 2) Set environment variables

Copy `.env.example` ke `.env.local` lalu isi nilai yang sesuai:

- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

Opsional:
- `RATE_LIMIT_ENABLED=true` untuk mengaktifkan rate limit.

Catatan: Upstash credentials itu **server-only**, jangan pernah dipakai di client component.

## 3) Jalankan lokal

Kalau sudah isi `.env.local`, jalankan:

```bash
bun dev
```

## 3) Cara kerja caching di repo ini

Repo ini pakai helper di `src/lib/upstash.ts`:

- `cachedJson({ namespace, key, ttlSeconds, producer })`
  - Cache disimpan sebagai JSON string.
  - Kalau Redis belum dikonfigurasi, otomatis **bypass** (tetap jalan tanpa Redis).
- `bumpCacheVersion(namespace)`
  - Invalidate cache per-namespace tanpa perlu scan keys.
  - Dipanggil setelah operasi write (POST/PUT/DELETE).

### Model invalidasi (versi per-namespace)

Cache key bentuknya seperti:

- `cache:<namespace>:v<angka>:<key>`

Saat ada write, namespace version dinaikkan (`cachever:<namespace>`), sehingga request berikutnya otomatis pakai versi baru dan cache lama “ditinggal”. Ini sederhana dan aman untuk serverless.

## 4) Cara kerja rate limiting

Repo ini pakai `checkRateLimit(request, { prefix, limit, window })`.

- Default: `RATE_LIMIT_ENABLED` = `false` → bypass.
- Identifier default: IP dari header `x-forwarded-for` / `x-real-ip`.

## 5) Cara verify (cek caching & rate limit)

### Cek caching

1. Hit endpoint yang sama 2x.
2. Lihat response header `x-cache`:
  - Request pertama biasanya `MISS`.
  - Request kedua biasanya `HIT`.
  - Kalau Redis belum dikonfigurasi → `BYPASS`.

Contoh (pakai curl):

```bash
curl -i "http://localhost:3000/api/immunizations?type=tracking"
```

### Cek invalidasi

1. Hit `GET /api/schedules` sampai `x-cache: HIT`.
2. Lakukan `POST /api/schedules`.
3. Hit `GET /api/schedules` lagi → harus balik `MISS` (karena namespace version naik).

### Cek rate limit

1. Set `RATE_LIMIT_ENABLED=true`.
2. Spam request cepat.
3. Kalau limit ke-trigger, kamu dapat status `429` dan header:
  - `x-ratelimit-limit`
  - `x-ratelimit-remaining`
  - `x-ratelimit-reset`

## 6) Saran TTL awal

- List schedules: 30–120 detik.
- Tracking/coverage imunisasi (agregasi): 60–300 detik.
- Detail by id: 30–120 detik.

Mulai dari TTL kecil dulu supaya risiko data basi rendah.

## 7) Deployment notes (Vercel)

- Tambahkan env vars di Project Settings → Environment Variables.
- Pastikan env vars tersedia di Environment yang benar (Preview/Production).

## 8) Tradeoffs (biar realistis)

- **Biaya & latency tambahan:** Redis call itu nambah network hop, tapi biasanya lebih cepat daripada query Supabase untuk agregasi berat.
- **Data bisa sedikit basi:** Karena TTL + caching. Makanya invalidasi per write + TTL kecil adalah baseline aman.
- **Konsistensi:** Supabase tetap source of truth. Redis cuma percepat read.
- **Operasional:** Ada satu dependency tambahan (Upstash). Tapi karena REST-based, cocok untuk environment serverless.

## 9) Kapan perlu invalidasi lebih presisi?

Kalau kamu butuh cache yang selalu "fresh" setelah write, versi-based invalidation ini sudah cukup aman.
Kalau nanti butuh lebih hemat Redis ops, baru optimasi ke invalidasi per-key.
