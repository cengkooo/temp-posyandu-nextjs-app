UI/UX Design Brief - Posyandu Web Application
Project Overview
Web application untuk Posyandu (Pos Pelayanan Terpadu) dengan dua bagian utama: Landing Page public untuk informasi umum dan Dashboard Admin untuk manajemen data kesehatan.
Target Users

Public Users: Masyarakat umum yang mencari informasi tentang posyandu, jadwal, dan layanan
Admin: Pengelola posyandu dengan akses penuh ke semua fitur
Kader: Petugas kesehatan dengan akses terbatas untuk input data

Design Requirements
Brand & Visual Identity

Tone: Professional, trustworthy, warm, approachable
Color Palette Suggestions:

Primary: Hijau/biru (kesehatan, kepercayaan)
Secondary: Orange/kuning (kehangatan, semangat)
Neutral: Abu-abu untuk teks, putih untuk background


Typography: Clean, readable (Sans-serif untuk modern look)
Imagery: Foto-foto kegiatan posyandu, ibu dan anak, aktivitas kesehatan


PART 1: PUBLIC LANDING PAGE
1.1 Hero Section
Purpose: First impression, explain what this posyandu is
Content Elements:

Large hero image/background (foto kegiatan posyandu yang welcoming)
Headline: Nama Posyandu + Tagline singkat
Sub-headline: Lokasi dan deskripsi singkat layanan
CTA Buttons:

"Lihat Jadwal Kegiatan"
"Hubungi Kami"


Quick stats (optional): Jumlah pasien terlayani, tahun berdiri, dll

Design Notes:

Full-width section
Overlay gradient untuk readability text di atas image
Responsive: Stack vertically di mobile

1.2 Tentang Posyandu Section
Purpose: Memberikan informasi profil posyandu
Content Elements:

Visi & Misi (bisa dalam cards atau kolom)
Lokasi & Kontak

Alamat lengkap
Nomor telepon
Email
Embed Google Maps (optional)


Jadwal Operasional

Hari dan jam buka
Presentasi dalam table atau list yang clean



Design Notes:

Two-column layout (desktop), stacked di mobile
Icons untuk setiap info point
Map embed dengan border radius dan shadow

1.3 Layanan Kami Section
Purpose: Showcase semua layanan yang ditawarkan
Content Elements:
Cards untuk setiap layanan:

Imunisasi Balita

Icon: Syringe/vaccine
Deskripsi singkat


Penimbangan & Pengukuran Balita

Icon: Weight scale/height chart
Deskripsi singkat


Pemeriksaan Ibu Hamil

Icon: Pregnant woman
Deskripsi singkat


Keluarga Berencana (KB)

Icon: Family planning
Deskripsi singkat


Pemeriksaan Lansia

Icon: Elderly care
Deskripsi singkat


Konseling Gizi

Icon: Nutrition/food
Deskripsi singkat



Design Notes:

Grid layout: 3 columns (desktop), 2 columns (tablet), 1 column (mobile)
Card dengan icon di atas, judul, dan deskripsi
Hover effect: Lift/shadow atau color change
Consistent spacing

1.4 Jadwal & Pengumuman Section
Purpose: Inform users tentang kegiatan mendatang dan info penting
Content Elements:

Tab Navigation atau Split Section:

Tab 1: Jadwal Kegiatan Mendatang
Tab 2: Pengumuman Terbaru



Jadwal Kegiatan:

List/Cards dengan:

Tanggal & waktu (prominent)
Judul kegiatan
Lokasi
Icon kalender


Sort by: Nearest date first
"Lihat Semua Jadwal" button jika ada banyak

Pengumuman:

Cards dengan:

Badge/tag untuk tipe (Info, Jadwal, Event)
Judul pengumuman
Excerpt/preview konten
Tanggal publish
"Baca Selengkapnya" link


Max 3-5 pengumuman terbaru
"Lihat Semua Pengumuman" button

Design Notes:

Timeline style atau card grid
Color-coded badges untuk announcement types
Clear date formatting (e.g., "17 Jan 2026")

1.5 Tim Kader Section
Purpose: Showcase tim kader dan tenaga kesehatan
Content Elements:

Grid of cards, setiap card berisi:

Foto profile (jika ada, atau avatar placeholder)
Nama lengkap
Posisi/Role (Kader, Bidan, dll)
Kontak (optional)



Design Notes:

Circle atau rounded square untuk foto
3-4 columns (desktop), 2 (tablet), 1 (mobile)
Subtle shadow on cards
Consistent image sizes

1.6 Galeri Kegiatan Section
Purpose: Visual showcase aktivitas posyandu
Content Elements:

Photo grid/masonry layout
Setiap foto dengan:

Caption/title (on hover atau below)
Tanggal foto (optional)


Lightbox/modal untuk view full image
"Lihat Galeri Lengkap" button

Design Notes:

Masonry atau uniform grid
Lazy loading untuk performance
Hover overlay dengan title
Modal dengan prev/next navigation
Responsive: 3-4 cols (desktop), 2 (tablet), 1-2 (mobile)

1.7 Footer
Purpose: Navigation dan informasi kontak
Content Elements:

Column 1: Logo + tagline singkat
Column 2: Quick Links

Tentang Kami
Layanan
Jadwal
Galeri
Kontak


Column 3: Kontak Info

Alamat
Telepon
Email
Jam operasional


Column 4: Social Media (jika ada)

Facebook, Instagram, WhatsApp icons



Bottom Bar:

Copyright notice
"Login Admin" link (subtle, di pojok)

Design Notes:

Dark background (contrast dengan main content)
Light text
4 columns (desktop), stacked (mobile)
Icons untuk kontak info

1.8 Navigation Bar
Purpose: Easy navigation throughout landing page
Content Elements:

Logo posyandu (kiri)
Menu items (center atau kanan):

Beranda
Tentang
Layanan
Jadwal
Galeri
Kontak


"Login" button (outlined, di kanan)

Design Notes:

Sticky/fixed on scroll
Transparent dengan blur effect atau solid background
Hamburger menu di mobile
Active state untuk current section
Smooth scroll to sections


PART 2: ADMIN DASHBOARD
2.1 Login Page
Purpose: Authentication untuk admin/kader
Content Elements:

Logo posyandu (center top)
Judul: "Login Admin"
Form fields:

Email input
Password input (dengan show/hide toggle)
"Ingat Saya" checkbox (optional)
"Lupa Password?" link


"Masuk" button (primary, full width)
Error messages area
"Kembali ke Beranda" link (subtle, di bawah)

Design Notes:

Center aligned card/box
Clean, minimal design
Soft shadow pada card
Background: Subtle pattern atau gradient
Responsive: Full width card di mobile
Form validation states (error, success)

2.2 Dashboard Layout Structure
Purpose: Consistent layout untuk semua admin pages
Components:
Sidebar (Left):

Logo + Nama Posyandu (top)
User info card:

Avatar
Nama user
Role badge (Admin/Kader)


Navigation menu dengan icons:

Dashboard (Home icon)
Data Pasien (Users icon)
Kunjungan (Calendar icon)
Imunisasi (Shield/syringe icon)
Laporan & Statistik (Chart icon)
Konten Website (Edit icon)

Sub: Pengumuman
Sub: Jadwal
Sub: Galeri


Pengaturan (Settings icon)
Keluar (Logout icon)


Collapse/expand button (mobile)

Top Bar:

Page title (kiri)
Breadcrumb (optional)
Search bar (center, untuk search global)
Notifications icon dengan badge
User profile dropdown (kanan):

Lihat Profile
Pengaturan
Logout



Main Content Area:

Padding yang cukup
Background: Light gray atau white
Cards/sections dengan shadow

Design Notes:

Sidebar: 250-280px width (desktop), collapsible
Top bar: 60-70px height, sticky
Sidebar overlay di mobile dengan backdrop
Active menu item highlighted
Icons consistency (gunakan lucide-react)

2.3 Dashboard Home/Overview
Purpose: Quick overview dan stats penting
Content Elements:
Stats Cards Row (Top):
4 cards dengan icons:

Total Pasien Aktif

Large number
Icon: Users
Trend indicator (↑ 5% dari bulan lalu)


Kunjungan Bulan Ini

Large number
Icon: Calendar
Comparison dengan bulan lalu


Imunisasi Pending

Large number dengan warning jika > 0
Icon: Alert/syringe
List yang perlu follow-up


Balita Gizi Buruk/Stunting

Large number dengan warning color
Icon: Alert triangle
Perlu perhatian khusus



Charts Section:

Grafik Kunjungan (Line/bar chart):

X-axis: Bulan (6-12 bulan terakhir)
Y-axis: Jumlah kunjungan
Filter: Semua/Balita/Ibu Hamil/Lansia


Status Gizi Balita (Pie/donut chart):

Segments: Gizi Baik, Gizi Kurang, Gizi Buruk, Stunting
Color coded
Percentages



Recent Activities:

Table atau list dengan:

Kunjungan terbaru (5-10 terakhir)
Columns: Nama Pasien, Tipe, Tanggal, Petugas
"Lihat Semua" link



Quick Actions:
Floating action buttons atau card dengan:

Tambah Pasien Baru
Catat Kunjungan
Input Imunisasi

Design Notes:

Stats cards: 4 columns (desktop), 2 (tablet), 1 (mobile)
Color coded: Green (good), Yellow (warning), Red (danger)
Charts responsive
Use recharts library

2.4 Data Pasien Page
Purpose: Manage semua data pasien
Content Elements:
Top Action Bar:

"Tambah Pasien Baru" button (primary, kanan)
Search bar (kiri)
Filter dropdowns:

Tipe Pasien (Semua/Balita/Ibu Hamil/Lansia)
Status (Aktif/Tidak Aktif)
Sort by (Nama, Tanggal Daftar, Umur)



Data Table:
Columns:

Nama Lengkap
NIK (partial/masked: ***1234)
Tanggal Lahir / Umur
Jenis Kelamin (L/P dengan icon atau badge)
Tipe Pasien (Badge dengan color)
Nama Orang Tua (untuk balita)
Telepon
Aksi (View/Edit/Delete icons)

Pagination:

Rows per page selector (10, 25, 50, 100)
Page numbers
Previous/Next buttons
Total count

Design Notes:

Striped rows atau hover highlight
Responsive: Horizontal scroll di mobile atau card view
Action buttons: Icon buttons dengan tooltip
Color-coded badges untuk tipe pasien
Delete dengan confirmation modal

2.5 Form Tambah/Edit Pasien
Purpose: Input data pasien baru atau edit existing
Content Elements:
Form Sections (menggunakan tabs atau accordion):
Tab 1: Data Pribadi

Nama Lengkap (required)
NIK (optional, dengan note tentang privacy)
Tanggal Lahir (date picker, required)
Jenis Kelamin (radio buttons: L/P, required)
Alamat Lengkap (textarea)
Nomor Telepon
Tipe Pasien (select: Balita/Ibu Hamil/Lansia, required)
Nama Orang Tua/Wali (conditional: jika balita)

Tab 2: Data Kesehatan (optional, bisa diisi nanti):

Golongan Darah
Alergi (textarea)
Riwayat Penyakit (textarea)
Kondisi Khusus

Consent Checkbox (bottom):

"Saya menyetujui data pasien ini disimpan dan diproses sesuai kebijakan privasi"

Action Buttons (bottom right):

"Batal" (secondary)
"Simpan" (primary)

Design Notes:

Two column layout untuk form (desktop)
Stacked di mobile
Clear field labels
Placeholder text untuk guidance
Inline validation
Required field indicators (*)
Success/error toast notifications
Loading state pada submit button

2.6 Detail Pasien Page
Purpose: View comprehensive patient data dan history
Content Elements:
Header Section:

Nama pasien (large)
Patient info cards in row:

Umur & Tanggal Lahir
NIK (masked)
Tipe Pasien (badge)
Nomor Telepon


Action buttons:

Edit Data
Cetak Riwayat
Hapus Pasien (admin only, dengan confirm)



Tabs Navigation:

Riwayat Kunjungan
Imunisasi
Grafik Pertumbuhan (untuk balita)
Data Kehamilan (untuk ibu hamil)

Tab 1: Riwayat Kunjungan:

Timeline atau table dengan:

Tanggal kunjungan
Berat badan
Tinggi badan
Lingkar kepala (balita)
Lingkar lengan
Tekanan darah
Catatan pemeriksaan
Petugas yang input


"Tambah Kunjungan Baru" button (floating atau top)
Filter by date range

Tab 2: Imunisasi:

Timeline/checklist imunisasi:

Nama vaksin
Tanggal diberikan
Jadwal berikutnya
Status (Selesai/Pending dengan icon)
Catatan


"Tambah Imunisasi" button
Color coded: Green (completed), Yellow (upcoming), Red (overdue)

Tab 3: Grafik Pertumbuhan (Balita):

Line charts:

Berat Badan vs Umur (dengan WHO growth chart reference)
Tinggi Badan vs Umur
Lingkar Kepala vs Umur


Legend: Patient data line, WHO standard (percentiles)
Date range filter
Export chart button

Tab 4: Data Kehamilan (Ibu Hamil):

Kehamilan ke- berapa
Usia kehamilan (minggu)
Taksiran persalinan (HPL)
Status kehamilan
Riwayat pemeriksaan kehamilan (table)

Design Notes:

Card-based layout
Charts dengan hover tooltips
Responsive tables
Print-friendly views
Empty states ketika belum ada data
Loading skeletons

2.7 Form Catat Kunjungan
Purpose: Quick input untuk kunjungan/pemeriksaan
Content Elements:

Pilih Pasien (searchable dropdown/autocomplete)
Tanggal Kunjungan (date picker, default: today)
Pengukuran section:

Berat Badan (kg) - number input dengan increment/decrement
Tinggi Badan (cm)
Lingkar Kepala (cm) - conditional untuk balita
Lingkar Lengan (cm)
Tekanan Darah (format: 120/80)


Catatan Pemeriksaan (textarea)
Keluhan (textarea, optional)
Tindakan/Rekomendasi (textarea, optional)

Auto-calculated Indicators:

Status Gizi (berdasarkan BB/TB)
BMI (jika applicable)
Alert jika ada anomali

Action Buttons:

"Batal"
"Simpan & Tutup"
"Simpan & Tambah Lagi"

Design Notes:

Modal atau dedicated page
Smart defaults
Quick number input controls
Validation untuk ranges yang masuk akal
Warning indicators untuk abnormal values
Auto-save draft (optional)

2.8 Laporan & Statistik Page
Purpose: Generate reports dan lihat analytics
Content Elements:
Filter Section (Top):

Periode (date range picker)
Tipe Laporan (dropdown):

Laporan Kunjungan
Laporan Imunisasi
Status Gizi Balita
Laporan Ibu Hamil
Laporan Lansia


Export Format:

PDF
Excel
Print


"Generate Laporan" button

Dashboard Stats:

Summary cards based on selected period:

Total Kunjungan
Total Pasien Baru
Cakupan Imunisasi (%)
Status Gizi Distribution



Charts:

Trend Kunjungan:

Line chart per bulan/minggu
Breakdown by tipe pasien


Cakupan Imunisasi:

Bar chart per jenis vaksin
Target vs Actual


Distribusi Pasien:

Pie chart by tipe
By gender
By age group


Status Gizi Balita:

Stacked bar chart atau pie
Trend over time



Data Tables:

Detail breakdown berdasarkan laporan type
Sortable columns
Export individual tables

Design Notes:

Print-optimized layout
Color-coded charts (consistent palette)
Responsive charts
Loading states during generation
Empty states dengan helpful message
Professional look untuk print/PDF

2.9 Konten Website Management
2.9.1 Pengumuman Page:

Table dengan columns:

Judul
Tipe (badge)
Status Publish (Published/Draft)
Tanggal Dibuat
Aksi (Edit/Delete/Toggle Publish)


"Buat Pengumuman Baru" button
Search dan filter

Form Pengumuman:

Judul (required)
Tipe (select: Info/Jadwal/Event)
Konten (rich text editor atau markdown)
Status Publish (toggle/checkbox)
Preview button
Save Draft / Publish buttons

2.9.2 Jadwal Page:

Calendar view atau table view toggle
Calendar view:

Month view dengan events
Click to add/edit


Table view:

Columns: Tanggal, Judul, Deskripsi, Lokasi, Aksi


"Tambah Jadwal" button

Form Jadwal:

Judul Kegiatan (required)
Tanggal (date picker, required)
Waktu (time picker)
Lokasi
Deskripsi (textarea)
Save/Cancel buttons

2.9.3 Galeri Page:

Grid view photos
Upload area (drag & drop)
Bulk upload support
Each photo card:

Thumbnail
Title/caption (editable)
Upload date
Uploaded by
Consent status (checkbox)
Delete button



Upload Modal:

Drag & drop zone
File picker
Preview sebelum upload
Title/description fields
Consent checkbox (IMPORTANT):

"Saya confirm sudah mendapat izin dari yang bersangkutan untuk publish foto ini"


Upload button dengan progress bar

Design Notes:

Rich text editor: Simple toolbar (bold, italic, link, list)
Calendar: Month view dengan event indicators
Gallery: Masonry grid, lightbox preview
Image upload: Max size indicator, accepted formats
Consent reminder prominent

2.10 Pengaturan Page
Purpose: App settings dan user management
Content Sections (Tabs):
Tab 1: Profil Posyandu:

Nama Posyandu (editable)
Alamat
Kontak (telepon, email)
Visi & Misi (textarea)
Logo Upload
Jam Operasional (repeater fields)
Save Changes button

Tab 2: Manajemen User:

Table of users:

Nama
Email
Role (Admin/Kader)
Status (Aktif/Tidak Aktif)
Aksi (Edit/Deactivate/Delete)


"Tambah User Baru" button

Form Add User:

Nama Lengkap
Email
Role (select: Admin/Kader)
Password (auto-generate option)
Telepon
Send invitation email (checkbox)

Tab 3: Profil Saya:

Foto profil
Nama
Email (read-only)
Nomor telepon
Ganti password section:

Password lama
Password baru
Konfirmasi password baru


Update Profile button

Design Notes:

Separated sections dengan clear headers
Save confirmation
Password strength indicator
Role-based: Hanya admin bisa manage users
Avatar upload dengan crop tool


DESIGN SYSTEM SPECIFICATIONS
Colors
Primary Palette:

Primary: #10B981 (Green) - Trust, health
Primary Dark: #059669
Primary Light: #D1FAE5

Secondary Palette:

Secondary: #F59E0B (Orange) - Warmth
Secondary Dark: #D97706
Secondary Light: #FEF3C7

Neutral:

Gray 50: #F9FAFB
Gray 100: #F3F4F6
Gray 200: #E5E7EB
Gray 300: #D1D5DB
Gray 400: #9CA3AF
Gray 500: #6B7280
Gray 600: #4B5563
Gray 700: #374151
Gray 800: #1F2937
Gray 900: #111827

Semantic:

Success: #10B981
Warning: #F59E0B
Danger: #EF4444
Info: #3B82F6

Typography
Font Family:

Primary: Inter, system-ui, sans-serif
Monospace: 'Courier New', monospace (untuk NIK, data sensitif)

Font Sizes:

xs: 0.75rem (12px)
sm: 0.875rem (14px)
base: 1rem (16px)
lg: 1.125rem (18px)
xl: 1.25rem (20px)
2xl: 1.5rem (24px)
3xl: 1.875rem (30px)
4xl: 2.25rem (36px)

Font Weights:

Normal: 400
Medium: 500
Semibold: 600
Bold: 700

Spacing

Use 4px base unit
Scale: 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 56, 64

Border Radius

sm: 0.25rem (4px)
base: 0.375rem (6px)
md: 0.5rem (8px)
lg: 0.75rem (12px)
xl: 1rem (16px)
2xl: 1.5rem (24px)
full: 9999px (circle)

Shadows

sm: 0 1px 2px 0 rgb(0 0 0 / 0.05)
base: 0 1px 3px 0 rgb(0 0 0 / 0.1)
md: 0 4px 6px -1px rgb(0 0 0 / 0.1)
lg: 0 10px 15px -3px rgb(0 0 0 / 0.1)
xl: 0 20px 25px -5px rgb(0 0 0 / 0.1)

Components Standards
Buttons:

Height: 40px (base), 36px (sm), 44px (lg)
Padding: 12px 24px (base)
Border radius: md
Primary: Green background, white text
Secondary: White background, green border, green text
Danger: Red background, white text
States: Hover (darker), Active (darkest), Disabled (gray + opacity)

Input Fields:

Height: 40px
Border: 1px solid gray-300
Border radius: md
Focus: Border green + shadow
Error: Border red
Padding: 8px 12px

Cards:

Background: White
Border: 1px solid gray-200 (optional)
Border radius: lg
Shadow: base or md
Padding: 16px atau 24px

Tables:

Header: Gray background
Rows: Striped (alternating white/gray-50) atau hover highlight
Border: 1px solid gray-200
Cell padding: 12px 16px

Badges:

Padding: 4px 8px
Border radius: full
Font size: xs or sm
Colors: Match semantic colors (success, warning, danger, info)

Modals:

Backdrop: Black with 50% opacity
Container: White, centered
Max width: 600px (depends on content)
Border radius: xl
Shadow: xl
Padding: 24px

Icons

Library: Lucide React
Sizes: 16px, 20px, 24px
Stroke width: 2
Color: Inherit from parent atau semantic colors

Responsive Breakpoints

Mobile: < 640px
Tablet: 640px - 1024px
Desktop: > 1024px
Large Desktop: > 1280px

Accessibility

Minimum contrast ratio: 4.5:1 (text), 3:1 (large text)
Focus indicators: 2px outline green
Keyboard navigation support
ARIA labels untuk icons
Alt text untuk images
Form labels properly associated

Animation & Transitions

Duration: 150ms (fast), 300ms (base), 500ms (slow)
Easing: ease-in-out (default)
Hover transitions: transform, background, shadow
Page transitions: fade atau slide
Loading states: Skeleton screens atau spinners


ADDITIONAL NOTES
Mobile-First Considerations

Touch targets minimum 44x44px
Hamburger menu untuk navigation
Swipeable galleries
Collapsible sections untuk forms
Bottom navigation (optional untuk admin)
Sticky action buttons

Performance

Lazy load images
Pagination untuk large tables
Infinite scroll (optional)
Optimize chart rendering
Code splitting per route

Security Visual Indicators

Masked sensitive data (NIK: ***1234)
Lock icons untuk secure sections
Warning badges untuk data yang perlu consent
Audit trail visibility

Empty States

Friendly illustrations atau icons
Clear message: "Belum ada data"
CTA button: "Tambah [item] Pertama"
Helper text untuk guidance

Error States

Friendly error messages (no technical jargon)
Suggested actions untuk fix
Contact support option
Retry buttons

Success States

Toast notifications
Checkmark icons
Green highlights
Confirmation messages


DELIVERABLES EXPECTED

Wireframes (Low-fidelity):

All pages outlined above
User flows


Mockups (High-fidelity):

Landing page (all sections)
Login page
Dashboard home
Sample CRUD pages (min: Pasien, Kunjungan)
Mobile versions


Design System Documentation:

Color palette
Typography scale
Component library
Icon set


Prototype (Interactive):

Clickable prototype untuk user flow testing
Landing page navigation
Admin dashboard navigation
Form interactions


Assets:

Logo (SVG)
Icons (SVG)
Sample images (jika ada)
Style guide PDF



