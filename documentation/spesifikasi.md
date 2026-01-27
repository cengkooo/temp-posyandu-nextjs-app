PART 2: ADMIN DASHBOARD (UPDATED)
2.4 Data Pasien Page (REVISED)
Content Elements:
Top Action Bar:

"Tambah Pasien Baru" button (primary, kanan)
Search bar (kiri)
Filter dropdowns:

Tipe Pasien: Semua / Bayi (0-11 bulan) / Balita (1-5 tahun) / Ibu Hamil / Remaja & Dewasa (15-45 tahun) / Lansia (≥60 tahun)
Status (Aktif/Tidak Aktif)
Sort by (Nama, Tanggal Daftar, Umur)



Data Table:
Columns (adjusted based on patient type):

Nama Lengkap
NIK (partial/masked: ***1234)
Tanggal Lahir / Umur
Jenis Kelamin (L/P dengan badge)
Tipe Pasien (Badge dengan color-coding):

Bayi (0-11 bulan) - Blue
Balita (1-5 tahun) - Cyan
Ibu Hamil - Pink
Remaja/Dewasa (15-45) - Purple
Lansia (≥60) - Orange


Status Gizi/Kesehatan (icon indicator: ✓ Baik, ⚠ Perhatian, ✗ Buruk)
Nama Orang Tua (untuk bayi/balita)
Telepon
Aksi (View/Edit/Delete icons)


2.5 Form Tambah/Edit Pasien (REVISED)
Dynamic Form Based on Patient Type
Step 1: Pilih Tipe Pasien (jika tambah baru)

Radio cards dengan icons:

👶 Bayi (0-11 bulan)
🧒 Balita (1-5 tahun)
🤰 Ibu Hamil
👨 Remaja & Dewasa (15-45 tahun)
👴 Lansia (≥60 tahun)



Step 2: Form Sections (tabs atau accordion, conditional based on type)
Universal Fields (Semua Tipe):

Nama Lengkap (required)
NIK (optional, encrypted)
Tanggal Lahir (date picker, required)
Jenis Kelamin (radio: L/P, required)
Alamat Lengkap (textarea)
Nomor Telepon
Nama Orang Tua/Wali (conditional: jika Bayi/Balita)


A. FORM KHUSUS BAYI (0-11 bulan)
Tab 1: Data Bayi

Semua universal fields
Umur (auto-calculate dari tanggal lahir, display: X bulan)

Tab 2: Pengukuran Antropometri (dapat diisi saat kunjungan atau langsung)

Berat Badan (kg) - number input
Panjang Badan (cm) - number input
Lingkar Kepala (cm) - number input
Tanggal Pengukuran (auto: today)

Tab 3: Riwayat ASI & MP-ASI

ASI Eksklusif:

Radio: Ya / Tidak / Sedang Berlangsung
Durasi ASI eksklusif (bulan)


Pemberian MP-ASI:

Sudah Dimulai: Ya/Tidak
Usia mulai MP-ASI (bulan)
Jenis MP-ASI (textarea)



Tab 4: Imunisasi & Vitamin

Status Imunisasi (checklist):

HB0, BCG, Polio 1-4, DPT-HB-Hib 1-3, IPV, Campak/MR
Setiap item: Checkbox + Tanggal


Vitamin A:

Sudah diberikan: Ya/Tidak
Tanggal pemberian terakhir



Tab 5: Riwayat Kesehatan

Riwayat Sakit:

ISPA: Ya/Tidak + Tanggal terakhir
Diare: Ya/Tidak + Tanggal terakhir
Penyakit lain (textarea)


Catatan Khusus (textarea)

Auto-Calculated Display (read-only, update saat save):

BB/U (Berat Badan menurut Umur) - indicator: Normal/Kurang/Buruk
PB/U (Panjang Badan menurut Umur) - indicator
BB/PB (Berat Badan menurut Panjang Badan) - indicator
Status Gizi Final (badge): Gizi Baik / Kurang / Buruk / Stunting / Wasting


B. FORM KHUSUS BALITA (1-5 tahun)
Similar to Bayi, dengan adjustment:

Panjang Badan → Tinggi Badan
Parameter: TB/U (Tinggi Badan menurut Umur)
IMT/U (Indeks Massa Tubuh menurut Umur)
Tambahan: Perkembangan motorik (opsional)


C. FORM KHUSUS IBU HAMIL
Tab 1: Data Ibu

Semua universal fields
Umur Ibu (auto-calculate)

Tab 2: Data Kehamilan

Gravida (G) - number input (kehamilan ke-berapa)
Para (P) - number input (melahirkan berapa kali)
Abortus (A) - number input (keguguran berapa kali)
Usia Kehamilan:

Input: Minggu (number)
Auto-calculate: Trimester (1/2/3)


HPHT (Hari Pertama Haid Terakhir) - date picker
Taksiran Persalinan (HPL) - auto-calculate atau manual input

Tab 3: Antropometri & Gizi

Berat Badan Awal (sebelum hamil) - kg
Berat Badan Saat Ini - kg
Kenaikan BB - auto-calculate, dengan indicator (Normal/Kurang/Berlebih)
Tinggi Badan - cm
Lingkar Lengan Atas (LILA) - cm

Auto-indicator: ✓ Normal (≥23.5 cm) / ⚠ Risiko KEK (<23.5 cm)



Tab 4: Kesehatan Ibu

Tekanan Darah - format: 120/80

Auto-indicator: Normal / Prehipertensi / Hipertensi


Hemoglobin (Hb) - g/dL (optional)

Auto-indicator: Normal / Anemia Ringan / Sedang / Berat


Status Risiko KEK:

Auto dari LILA atau manual select: Tidak Berisiko / Berisiko


Keluhan Kehamilan (textarea):

Mual/muntah, pusing, dll



Tab 5: Layanan ANC

Kunjungan ANC (checklist dengan tanggal):

K1 (Trimester 1)
K2, K3 (Trimester 2)
K4, K5, K6 (Trimester 3)


Tablet Tambah Darah (TTD):

Sudah diberikan: Ya/Tidak
Jumlah yang diterima (tablet)
Kepatuhan minum: Rutin / Kadang / Tidak


Imunisasi TT:

TT1, TT2, TT3, TT4, TT5
Setiap item: Checkbox + Tanggal



Tab 6: Edukasi & Rencana

Edukasi yang diberikan (checklist):

Gizi ibu hamil
Persiapan persalinan
ASI eksklusif
Perawatan bayi
Tanda bahaya kehamilan


Rencana Persalinan:

Tempat: Rumah/Puskesmas/RS
Penolong: Bidan/Dokter


Catatan Khusus (textarea)


D. FORM KHUSUS REMAJA & DEWASA (15-45 tahun)
Tab 1: Data Pribadi

Semua universal fields
Pekerjaan (optional)
Status Pernikahan (optional)

Tab 2: Antropometri

Berat Badan (kg)
Tinggi Badan (cm)
IMT - auto-calculate dengan indicator:

Underweight (<18.5)
Normal (18.5-24.9)
Overweight (25-29.9)
Obesitas (≥30)


Lingkar Perut (cm)

Auto-indicator risiko metabolik:

Pria: Normal (<90 cm) / Berisiko (≥90 cm)
Wanita: Normal (<80 cm) / Berisiko (≥80 cm)





Tab 3: Faktor Risiko PTM (Penyakit Tidak Menular)

Tekanan Darah - format: 120/80

Auto-indicator: Normal / Prehipertensi / Hipertensi Stage 1/2


Riwayat Merokok:

Radio: Tidak Pernah / Pernah (sudah berhenti) / Aktif
Jika aktif: Batang per hari (number)


Aktivitas Fisik:

Radio: Kurang Aktif / Cukup Aktif / Sangat Aktif
Durasi per minggu (menit)


Pola Makan:

Konsumsi Sayur per hari: Porsi (number)
Konsumsi Buah per hari: Porsi (number)
Auto-indicator: Cukup (≥5 porsi) / Kurang



Tab 4: Pemeriksaan Lab (Optional)

Gula Darah Sewaktu (mg/dL)

Auto-indicator: Normal / Prediabetes / Diabetes


Gula Darah Puasa (mg/dL) - optional
Kolesterol Total (mg/dL)

Auto-indicator: Normal / Borderline / Tinggi


Asam Urat (mg/dL) - optional

Tab 5: Riwayat Penyakit

Penyakit Tidak Menular (checklist):

Diabetes Melitus
Hipertensi
Jantung
Stroke
Kanker
Lainnya (textarea)


Riwayat Penyakit Keluarga (textarea)
Obat yang Dikonsumsi Rutin (textarea)

Tab 6: Konseling & Tindak Lanjut

Konseling yang diberikan (checklist):

Diet sehat
Aktivitas fisik
Stop merokok
Manajemen stress


Rujukan:

Perlu Rujuk: Ya/Tidak
Rujuk ke: Puskesmas/RS
Alasan rujukan (textarea)




E. FORM KHUSUS LANSIA (≥60 tahun)
Tab 1: Data Lansia

Semua universal fields
Nama Keluarga/Pendamping (yang bisa dihubungi)
Telepon Keluarga

Tab 2: Antropometri

Berat Badan (kg)
Tinggi Badan (cm)

Atau: Tinggi Lutut (cm) - jika tidak bisa berdiri
Auto-convert ke estimasi TB


IMT - auto-calculate dengan kategori khusus lansia
Lingkar Perut (cm)

Tab 3: Pemeriksaan Vital

Tekanan Darah - format: 120/80
Denyut Nadi (kali/menit)

Auto-indicator: Bradikardia / Normal / Takikardia


Gula Darah (mg/dL) - optional
Suhu Tubuh (°C) - optional

Tab 4: Status Fungsional

Kemandirian (ADL - Activities of Daily Living):
Radio cards untuk setiap aktivitas:

Makan: Mandiri / Bantuan / Tergantung
Berpakaian: Mandiri / Bantuan / Tergantung
Mandi: Mandiri / Bantuan / Tergantung
Toileting: Mandiri / Bantuan / Tergantung
Mobilitas: Mandiri / Bantuan / Tergantung
Auto-score: Mandiri / Sebagian Mandiri / Tergantung Total


Risiko Jatuh:
Checklist screening:

Riwayat jatuh dalam 1 tahun terakhir
Gangguan keseimbangan
Menggunakan alat bantu jalan
Pusing saat berdiri
Auto-indicator: Risiko Rendah / Sedang / Tinggi


Status Mental/Emosional (sederhana):

Mood: Baik / Cemas / Depresi
Orientasi: Baik / Gangguan Ringan / Gangguan Berat
Memori: Baik / Gangguan Ringan / Gangguan Berat



Tab 5: Keluhan & Penyakit

Keluhan Utama (textarea)
Penyakit Kronis (checklist):

Hipertensi
Diabetes
Jantung
Stroke
Asam urat
Osteoporosis
Demensia
Lainnya (textarea)


Obat Rutin (textarea)

Nama obat & dosis



Tab 6: Layanan & Konseling

Konseling yang Diberikan (checklist):

Gizi seimbang lansia
Aktivitas fisik lansia (senam, jalan santai)
Pencegahan jatuh
Manajemen penyakit kronis
Kesehatan mental


Aktivitas Fisik yang Disarankan (textarea)
Rujukan:

Perlu Rujuk: Ya/Tidak
Rujuk ke: Puskesmas/RS
Alasan rujukan (textarea)


Jadwal Kontrol Berikutnya (date picker)


2.6 Detail Pasien Page (UPDATED)
Header Section (sama untuk semua):

Nama pasien (large)
Patient info cards dengan content conditional based on type

Conditional Tabs Based on Patient Type:
BAYI (0-11 bulan):

Riwayat Pertumbuhan

Table dengan: Tanggal, Umur (bulan), BB, PB, LK, Status Gizi


Grafik Pertumbuhan

3 charts: BB/U, PB/U, LK/U
Overlay WHO growth curves


Imunisasi

Timeline checklist dengan status


ASI & MP-ASI

History pemberian


Riwayat Sakit

Log ISPA, diare, dll



IBU HAMIL:

Data Kehamilan

Summary GPA, usia kehamilan, HPL


Riwayat ANC

Timeline kunjungan K1-K6
Grafik kenaikan BB


Hasil Pemeriksaan

Table: Tanggal, BB, TD, LILA, Keluhan, Petugas


Imunisasi TT

Checklist dengan tanggal


Edukasi & Konseling

Log edukasi yang sudah diberikan



REMAJA & DEWASA (15-45):

Riwayat Kunjungan

Table pemeriksaan rutin


Trend Antropometri

Line chart: BB, IMT, Lingkar Perut over time


Faktor Risiko PTM

Visualization: Traffic light indicator untuk setiap faktor
Trend TD, Gula Darah, Kolesterol


Hasil Lab

Table hasil lab dengan tanggal


Konseling

Log konseling & tindak lanjut



LANSIA (≥60):

Riwayat Pemeriksaan

Table comprehensive dengan semua parameter


Trend Kesehatan

Charts: TD, Gula Darah, BB over time


Status Fungsional

Timeline ADL scores
Risiko jatuh tracking


Penyakit & Obat

List penyakit kronis
Daftar obat rutin


Rujukan & Follow-up

History rujukan
Jadwal kontrol berikutnya




2.7 Form Catat Kunjungan (UPDATED)
Dynamic form based on selected patient type:
Common Fields:

Pilih Pasien (searchable dropdown - shows: Nama, Tipe, Umur)
Tanggal Kunjungan (date picker, default: today)
Petugas yang Memeriksa (auto-fill: current user)

Conditional Measurement Sections:
For BAYI/BALITA:
[Anthropometry Card]
├─ Berat Badan (kg) ━━ increment/decrement buttons
├─ Panjang/Tinggi Badan (cm)
├─ Lingkar Kepala (cm) - jika bayi
└─ Lingkar Lengan Atas (cm)

[Auto-calculated Indicators - Real-time]
├─ BB/U: [●●●○○] Normal
├─ TB/U: [●●○○○] Pendek (Stunting Risk)
└─ BB/TB: [●●●●○] Gizi Baik

[Additional]
├─ Keluhan (textarea)
├─ Pemeriksaan Fisik (textarea)
└─ Tindakan/Vitamin (checkboxes)
For IBU HAMIL:
[Vital Signs Card]
├─ Berat Badan (kg)
├─ Tinggi Badan (cm) - read-only jika sudah ada
├─ LILA (cm)
├─ Tekanan Darah (120/80)
└─ Usia Kehamilan (auto-calculate or manual)

[Auto-calculated]
├─ Kenaikan BB: +X kg [indicator: Normal/Kurang/Berlebih]
└─ Status LILA: [✓ Normal / ⚠ Risiko KEK]

[Pregnancy Specific]
├─ Tinggi Fundus Uteri (cm)
├─ Denyut Jantung Janin (kali/menit)
├─ Presentasi/Letak Janin
├─ Keluhan (textarea)
├─ Edema: Ya/Tidak
└─ Protein Urine: Negatif/Positif

[Services Provided]
├─ Tablet Tambah Darah (jumlah yang diberikan)
├─ Imunisasi TT (jika applicable)
└─ Konseling (checkboxes)
For REMAJA/DEWASA:
[Measurements]
├─ Berat Badan (kg)
├─ Tinggi Badan (cm)
├─ Lingkar Perut (cm)
└─ Tekanan Darah (120/80)

[Auto-calculated]
├─ IMT: 23.5 [●●●○○] Normal
└─ Risiko Metabolik: [✓ Rendah / ⚠ Tinggi]

[Optional Lab Results]
├─ Gula Darah (mg/dL)
├─ Kolesterol (mg/dL)
└─ Asam Urat (mg/dL)

[Lifestyle Assessment]
├─ Aktivitas Fisik: [Radio buttons]
├─ Konsumsi Sayur/Buah: [Porsi/hari]
└─ Status Merokok: [Radio buttons]

[Notes]
├─ Keluhan (textarea)
├─ Pemeriksaan (textarea)
└─ Konseling yang Diberikan (checkboxes)
For LANSIA:
[Vital Signs]
├─ Berat Badan (kg)
├─ Tinggi Badan (cm) atau Tinggi Lutut
├─ Tekanan Darah (120/80)
├─ Denyut Nadi (x/menit)
└─ Gula Darah (mg/dL) - optional

[Functional Assessment - Quick Check]
├─ Kemandirian: [5 Radio buttons: Mandiri/Bantuan/Tergantung]
├─ Mobilitas: [Normal / Alat Bantu / Kursi Roda]
└─ Status Mental: [Baik / Gangguan Ringan / Gangguan Berat]

[Screening]
├─ Risiko Jatuh: [Checklist] → Auto-score
└─ Nyeri: [Skala 0-10]

[Keluhan & Tindakan]
├─ Keluhan Utama (textarea)
├─ Pemeriksaan (textarea)
├─ Obat yang Diberikan (textarea)
└─ Konseling (checkboxes)

[Follow-up]
├─ Perlu Rujukan: Ya/Tidak
├─ Jadwal Kontrol: [Date picker]
Bottom Action Buttons (All Types):

"Batal"
"Simpan & Cetak KMS/Kartu"
"Simpan & Tutup"
"Simpan & Tambah Lagi"


2.8 Laporan & Statistik Page (UPDATED)
New Report Types:
Filter Section:

Periode (date range)
Tipe Laporan (dropdown dengan lebih banyak opsi):
Laporan Bayi & Balita:

Distribusi Status Gizi
Cakupan Imunisasi
Prevalensi Stunting
ASI Eksklusif

Laporan Ibu Hamil:

Cakupan ANC (K1, K4, K6)
Distribusi Risiko KEK
Cakupan Imunisasi TT
Cakupan Tablet Tambah Darah

Laporan Remaja & Dewasa:

Distribusi IMT
Prevalensi Faktor Risiko PTM
Deteksi Dini Hipertensi & Diabetes

Laporan Lansia:

Distribusi Status Fungsional
Prevalensi Penyakit Kronis
Risiko Jatuh

Laporan Umum:

Laporan Bulanan Posyandu
Rekap Kunjungan per Tipe Pasien



Dynamic Charts Based on Selected Report:
Laporan Bayi/Balita - Status Gizi:
[Donut Chart] Status Gizi Balita
├─ Gizi Baik: 75% (hijau)
├─ Gizi Kurang: 15% (kuning)
├─ Gizi Buruk: 5% (merah)
└─ Stunting: 5% (orange)

[Bar Chart] Trend 6 Bulan Terakhir
└─ Stacked bar: Baik/Kurang/Buruk/Stunting per bulan

[Table] Detail per Balita dengan Status Gizi Buruk/Stunting
└─ Action: Export list untuk follow-up
Laporan Ibu Hamil - Cakupan ANC:
[Progress Bar Indicators]
├─ K1: 95% (target: 100%)
├─ K4: 85% (target: 95%)
└─ K6: 70% (target: 90%)

[Pie Chart] Distribusi Risiko KEK
├─ Normal: 80%
└─ Risiko KEK: 20%

[Line Chart] Trend Cakupan per Bulan
Laporan PTM (Remaja/Dewasa):
[Multi-bar Chart] Prevalensi Faktor Risiko
├─ Hipertensi: X%
├─ Obesitas: X%
├─ Merokok: X%
├─ Kurang Aktif: X%
└─ Kurang Sayur/Buah: X%

[Scatter Plot] IMT vs Lingkar Perut
└─ Color-coded by risk level

[Table] High-Risk Individuals → Perlu follow-up
Laporan Lansia:
[Stacked Bar] Status Kemandirian
├─ Mandiri: 60%
├─ Sebagian Mandiri: 30%
└─ Tergantung: 10%

[Horizontal Bar] Penyakit Kronis Terbanyak
├─ Hipertensi: 45%
├─ Diabetes: 30%
├─ Jantung: 15%
└─ Lainnya: 10%

[Risk Matrix] Risiko Jatuh
└─ Heatmap: Risiko Rendah/Sedang/Tinggi
Export Options:

PDF (Professional report dengan cover, charts, tables)
Excel (Raw data dengan multiple sheets per kategori)
CSV (For further analysis)
Print (Print-optimized layout)


NEW SECTION: 2.11 KMS Digital (Kartu Menuju Sehat)
Purpose: Digital version dari KMS kertas untuk tracking pertumbuhan
Page Design:
For Bayi/Balita:
[Header Card]
├─ Foto Anak (optional)
├─ Nama: [Auto-fill]
├─ NIK: [Masked]
├─ Tanggal Lahir: [Auto]
├─ Jenis Kelamin: [Badge]
└─ Nama Orang Tua: [Auto]

[WHO Growth Charts - Tabs]
Tab 1: Berat Badan / Umur
├─ Interactive line chart
├─ WHO percentile curves (3rd, 15th, 50th, 85th, 97th)
├─ Child's actual data points (colored by status)
└─ Zoom & pan controls

Tab 2: Tinggi Badan / Umur
└─ Similar layout

Tab 3: Berat Badan / Tinggi Badan
└─ Similar layout

Tab 4: Lingkar Kepala / Umur (Bayi only)
└─ Similar layout

[Imunisasi Timeline]
├─ Visual timeline dengan checkmarks
├─ Color-coded: Completed (green) / Due (yellow) / Overdue (red)
└─ Click to see details

[Vitamin & Supplements]
├─ Vitamin A pemberian
└─ Suplemen lain

[Development Milestones] (Optional)
├─ Motorik
├─ Bahasa
└─ Sosial-Emosional

[Action Buttons]
├─ Cetak KMS (PDF)
├─ Export Data (Excel)
└─ Bagikan ke Orang Tua (Generate shareable link - view only)
Design Notes:

Responsive charts (recharts)
Color-coded status indicators
Print-friendly PDF output
Parent-shareable read-only version (via secure link)


NEW SECTION: 2.12 Buku KIA Digital (Ibu Hamil)
Purpose: Digital MCH (Maternal Child Health) handbook
Structure:
[Tabs Navigation]
├─ Data Ibu
├─ Riwayat Kehamilan
├─ Grafik Kesehatan Ibu
├─ Catatan ANC
└─ Persiapan Persalinan

[Tab: Data Ibu]
├─ Identitas lengkap
├─ Riwayat obstetri (GPA)
└─ Riwayat penyakit

[Tab: Riwayat Kehamilan]
├─ Timeline kehamilan (visual)
├─ Trimester saat ini (highlighted)
├─ Countdown to HPL
└─ Kenaikan BB chart

[Tab: Grafik Kesehatan]
├─ Line chart: BB vs Minggu Kehamilan
├─ Line chart: Tekanan Darah trends
├─ LILA tracking
└─ Tinggi Fundus Uteri

[Tab: Catatan ANC]
├─ Table: Tanggal, Usia Kehamilan, BB, TD, Keluhan, Tindakan
├─ Checklist K1-K6 dengan status
├─ Imunisasi TT timeline
└─ Tablet Tambah Darah tracking

[Tab: Persiapan Persalinan]
├─ Rencana persalinan
├─ Tanda bahaya yang harus diwaspadai
├─ Checklist perlengkapan
└─ Edukasi ASI & perawatan bayi

[Action Buttons]
├─ Cetak Buku KIA (PDF)
├─ Reminder Setting (SMS/WA untuk kontrol)
└─ Bagikan ke Ibu

UPDATED DESIGN SYSTEM
Color Coding for Patient Types:
Bayi (0-11 bulan):     #3B82F6 (Blue)
Balita (1-5 tahun):    #06B6D4 (Cyan)
Ibu Hamil:             #EC4899 (Pink)
Remaja/Dewasa:         #8B5CF6 (Purple)
Lansia (≥60):          #F59E0B (Orange)
Status Indicators:
Gizi (Nutrition):
Baik:    ●●●●● Green (#10B981)
Kurang:  ●
●●○○ Yellow (#F59E0B)
Buruk:   ●●○○○ Red (#EF4444)
Stunting: 📏 Orange (#F97316)
Wasting: 📉 Red (#DC2626)

**Kesehatan Umum:**
Normal:      ✓ Green
Perhatian:   ⚠ Yellow
Bahaya:      ✗ Red
Perlu Rujuk: 🏥 Red

**IMT (Adults):**
Underweight:  <18.5  - Blue
Normal:       18.5-24.9 - Green
Overweight:   25-29.9 - Yellow
Obesitas:     ≥30 - Red

**Tekanan Darah:**
Normal:        <120/80 - Green
Prehipertensi: 120-139/80-89 - Yellow
Hipertensi St1: 140-159/90-99 - Orange
Hipertensi St2: ≥160/≥100 - Red

### Icons Set (Lucide React):
```javascript
Patient Types:
- Baby: "baby" icon
- Child: "user" icon
- Pregnant: "heart-pulse" icon (or custom pregnant icon)
- Adult: "user-check" icon
- Elderly: "user-cog" icon

Measurements:
- Weight: "weight" icon
- Height: "ruler" icon
- Head circumference: "circle-dashed" icon
- Blood pressure: "heart-pulse" icon
- Temperature: "thermometer" icon

Health:
- Immunization: "shield" or "syringe" icon
- Vitamin: "pill" icon
- Lab: "flask-conical" icon
- Visit: "calendar-check" icon
- Referral: "hospital" icon

Status:
- Good: "check-circle" icon (green)
- Warning: "alert-triangle" icon (yellow)
- Danger: "alert-circle" icon (red)
- Info: "info" icon (blue)
```

### Form Components Additions:

**Number Input with Controls:**
[Label: Berat Badan]
┌─────────────────────┐
│  [-]  15.5  [+]    │ kg
└─────────────────────┘
├─ Decrement button (0.1 step)
├─ Direct input (number)
└─ Increment button (0.1 step)

**Blood Pressure Input:**
[Label: Tekanan Darah]
┌──────┬───┬──────┐
│ 120  │ / │  80  │ mmHg
└──────┴───┴──────┘
├─ Systolic (number)
└─ Diastolic (number)
→ Auto-indicator: [●●●○○] Normal

**Status Indicator Badge:**
┌──────────────────────┐
│ ✓ Gizi Baik         │ (Green background, white text)
└──────────────────────┘
┌──────────────────────┐
│ ⚠ Risiko Stunting   │ (Yellow background, dark text)
└──────────────────────┘
┌──────────────────────┐
│ ✗ Gizi Buruk        │ (Red background, white text)
└──────────────────────┘

---

## RESPONSIVE CONSIDERATIONS

### Mobile-First for Forms:

**Patient Type Selection (Mobile):**
[Vertical Stack of Cards]
┌─────────────────────┐
│  👶                 │
│  Bayi (0-11 bulan) │
└─────────────────────┘
┌─────────────────────┐
│  🧒                 │
│  Balita (1-5 tahun)│
└─────────────────────┘
...

**Measurement Input (Mobile):**
[Full-width stacked]
┌─────────────────────┐
│ Berat Badan        │
│ [  ] kg            │
└─────────────────────┘
┌─────────────────────┐
│ Tinggi Badan       │
│ [  ] cm            │
└─────────────────────┘

**Charts (Mobile):**
- Horizontal scroll untuk wide charts
- Simplified legend (collapsible)
- Touch-friendly zoom & pan
- Rotate untuk better view (landscape hint)

---

## PRINTING & PDF EXPORT

### KMS Print Layout:
Page 1: Cover
├─ Logo Posyandu
├─ "Kartu Menuju Sehat"
├─ Foto anak
└─ Data identitas
Page 2-3: Growth Charts
├─ BB/U chart (full page)
└─ TB/U chart (full page)
Page 4: Imunisasi
└─ Table dengan checkmarks
Page 5: Catatan Kesehatan
└─ Summary visits

### Report Print Layout:
Cover Page:
├─ Logo & Header
├─ Judul Laporan
├─ Periode
└─ Generated by & date
Content Pages:
├─ Executive Summary
├─ Charts (1-2 per page)
├─ Data Tables
└─ Recommendations
Footer:
├─ Page numbers
└─ "Dokumen Rahasia - Confidential"

---

## ACCESSIBILITY UPDATES

### For Elderly-Friendly Interface:
- **Larger font sizes** (base: 18px for lansia forms)
- **High contrast mode** toggle
- **Voice input option** (for filling forms)
- **Print-friendly** (bisa dicetak besar untuk dibaca)

### For Field Workers (Kader):
- **Offline capability** (save draft locally)
- **Quick entry mode** (streamlined forms)
- **Voice notes** (record instead of typ