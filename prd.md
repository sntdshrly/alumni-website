# PRD – Sistem Pencatatan Alumni SMA
## MVP Tahap 1: Login & Dashboard

**Status:** Simplified MVP  
**Versi:** 1.0  
**Bahasa aplikasi:** Bahasa Indonesia  
**Frontend:** Next.js App Router  
**Target:** Desktop web application

---

# 1. Tujuan MVP

Tahap pertama sistem hanya berfokus pada:

1. Login pengguna.
2. Menampilkan Dashboard setelah login.
3. Menampilkan ringkasan data alumni dalam bentuk KPI, chart, dan tabel sederhana.
4. Menyiapkan struktur aplikasi agar fitur lain dapat ditambahkan pada tahap berikutnya.

Pada tahap ini **belum perlu membangun seluruh modul Data Master, Data Alumni, Verifikasi, Dokumen, Laporan, dan Audit Log**.

---

# 2. Scope MVP

## 2.1 Fitur yang Dibangun

| Fitur | Status |
|---|---|
| Login | ✅ Dibangun |
| Dashboard | ✅ Dibangun |
| Logout | ✅ Dibangun |
| Filter Tahun Lulus | ✅ UI saja / data dummy |
| Filter Sekolah | ✅ UI saja / data dummy |
| Filter Periode Data | ✅ UI saja / data dummy |
| KPI Alumni | ✅ |
| Chart Status Alumni | ✅ |
| Chart Tren Alumni | ✅ |
| Top Perguruan Tinggi | ✅ |
| Top Program Studi | ✅ |
| Jalur Penerimaan | ✅ |
| Kelengkapan Verifikasi | ✅ |
| Bukti Dokumen | ✅ |
| Aktivitas Terbaru | ✅ |
| Pengingat & Tindak Lanjut | ✅ |
| Database alumni lengkap | ❌ Tahap berikutnya |
| Upload dokumen | ❌ Tahap berikutnya |
| Verifikasi data | ❌ Tahap berikutnya |
| Export PDF | ❌ Tahap berikutnya |
| Audit Log | ❌ Tahap berikutnya |

---

# 3. User

Untuk MVP cukup menggunakan satu akun contoh:

**Admin / Super Admin**

Contoh:

```text
Email    : superadmin@binus.ac.id
Password : password123
Role     : Super Admin
Sekolah  : SMA Negeri 1
```

Akun tersebut hanya digunakan untuk pengembangan awal.

Pengelolaan banyak role dan school scope akan dibuat pada tahap berikutnya.

---

# 4. Flow Aplikasi

Flow utama:

```text
User
  │
  ▼
Login
  │
  │ berhasil
  ▼
Dashboard
  │
  ├── Lihat KPI
  ├── Lihat status alumni
  ├── Lihat tren
  ├── Lihat perguruan tinggi tujuan
  ├── Lihat program studi tujuan
  ├── Lihat jalur penerimaan
  └── Lihat aktivitas & pengingat
```

Jika login gagal:

```text
Login
  │
  ▼
Validasi
  │
  ├── benar ──► Dashboard
  │
  └── salah ─► Pesan error
```

---

# 5. Halaman Login

Route:

```text
/login
```

## 5.1 Komponen

Halaman login minimal memiliki:

- Logo / icon sekolah
- Nama aplikasi
- Input Email
- Input Password
- Tombol Masuk
- Pesan error jika login gagal

Contoh:

```text
┌──────────────────────────────────┐
│                                  │
│              [ S ]               │
│                                  │
│     Sistem Pencatatan Alumni     │
│                                  │
│     Email                        │
│     [ superadmin@binus.ac.id   ] │
│                                  │
│     Password                     │
│     [ •••••••••••              ] │
│                                  │
│     [          MASUK           ] │
│                                  │
└──────────────────────────────────┘
```

---

# 6. Dashboard

Route:

```text
/dashboard
```

Dashboard mengikuti konsep UI yang telah disediakan:

- Sidebar kiri
- Header
- Filter
- KPI cards
- Charts
- Tables
- Aktivitas terbaru
- Pengingat dan tindak lanjut

Dashboard merupakan halaman utama setelah login.

---

# 7. Sidebar

Sidebar ditampilkan seperti desain aplikasi.

Menu:

```text
Dashboard

DATA MASTER
├── Sekolah
├── Tahun Ajaran
├── Perguruan Tinggi
├── Program Studi
└── Jalur Penerimaan

DATA ALUMNI
├── Data Alumni
├── Penerimaan PT
├── Status Alumni
└── Bukti & Dokumen

VERIFIKASI
└── Verifikasi Data

LAPORAN
├── Laporan Sekolah
└── Laporan Yayasan

PENGATURAN
├── Pengguna
└── Audit Log
```

Pada MVP tahap 1:

- **Dashboard aktif dan dapat dibuka.**
- Menu lainnya boleh ditampilkan sebagai UI.
- Menu lainnya **belum perlu memiliki halaman/fungsi lengkap**.
- Jika diklik, dapat menampilkan placeholder "Fitur belum tersedia".

---

# 8. Dashboard Header

Header memiliki:

```text
Dashboard
Ringkasan data alumni yang masuk perguruan tinggi

[Tahun Lulus ▼]
[Sekolah ▼]
[Periode Data ▼]

[Unduh Laporan]

Admin
Super Admin
```

Pada MVP, filter dapat menggunakan data dummy.

Filter belum harus benar-benar mengubah data database.

---

# 9. KPI Cards

Dashboard menampilkan 5 KPI utama.

### 9.1 Total Alumni

Contoh:

```text
Total Alumni
428
Semua angkatan
```

### 9.2 Data Terkonfirmasi

```text
Data Terkonfirmasi
312
72,90% dari total alumni
```

### 9.3 Belum Terverifikasi

```text
Belum Terverifikasi
116
27,10% dari total alumni
```

### 9.4 Melanjutkan ke PT

```text
Melanjutkan ke PT
256
59,81% dari total alumni
```

### 9.5 Perguruan Tinggi

```text
Perguruan Tinggi
86
86 tujuan berbeda
```

Nilai di atas adalah **contoh data dummy untuk tampilan**, bukan data produksi.

---

# 10. Chart Status Alumni

Dashboard menampilkan donut chart:

**Status Alumni Setelah Lulus**

Contoh kategori:

- Melanjutkan ke Perguruan Tinggi
- Menunggu Hasil Seleksi
- Gap Year
- Bekerja
- Berwirausaha
- Mengikuti Pelatihan
- Belum Melanjutkan
- Tidak Dapat Dihubungi
- Status Belum Diketahui

Chart menggunakan data dummy pada MVP.

---

# 11. Chart Tren Alumni

Dashboard menampilkan grafik tren alumni yang melanjutkan ke perguruan tinggi.

Contoh:

```text
2020/2021
2021/2022
2022/2023
2023/2024
2024/2025
```

Grafik dapat menggunakan kombinasi:

- Bar chart
- Line chart

Pada MVP, data grafik dapat berasal dari dummy data.

---

# 12. Top Perguruan Tinggi

Dashboard menampilkan 5 perguruan tinggi tujuan teratas.

Contoh:

```text
Universitas Indonesia
Universitas Gadjah Mada
Institut Teknologi Bandung
Universitas Diponegoro
Universitas Brawijaya
```

Untuk MVP hanya perlu menampilkan nama, jumlah alumni, dan persentase.

---

# 13. Top Program Studi

Dashboard menampilkan 5 program studi tujuan teratas.

Contoh:

```text
Manajemen
Teknik Informatika
Psikologi
Teknik Sipil
Kedokteran
```

Kolom:

```text
Program Studi | Jumlah | %
```

---

# 14. Jalur Penerimaan

Dashboard menampilkan distribusi jalur penerimaan.

Contoh kategori:

- SNBP
- SNBT
- Mandiri
- Kedinasan
- Lainnya

Gunakan donut chart atau visualisasi sederhana.

---

# 15. Kelengkapan Verifikasi

Dashboard menampilkan:

```text
Terverifikasi
Menunggu Verifikasi
Ditolak / Perlu Perbaikan
```

Contoh:

```text
Terverifikasi           312
Menunggu Verifikasi     116
Ditolak/Perbaikan        14
```

Data masih dummy.

---

# 16. Bukti Dokumen

Dashboard menampilkan ringkasan jumlah dokumen.

Contoh:

```text
Penerimaan PT       298
Daftar Ulang        241
Kartu Mahasiswa     188
Surat Aktif Kuliah   98
```

Belum ada fitur upload pada MVP.

---

# 17. Aktivitas Terbaru

Dashboard menampilkan tabel aktivitas sederhana.

Kolom:

```text
Waktu | Aktivitas | Pengguna | Keterangan
```

Contoh:

```text
31 Mei 2025 10:15 | Verifikasi data alumni | Karyawan TU | Disetujui
31 Mei 2025 09:40 | Input data penerimaan | Guru Wali Kelas | ...
31 Mei 2025 08:50 | Koreksi data alumni | Karyawan TU | ...
```

Data masih dummy.

---

# 18. Pengingat & Tindak Lanjut

Dashboard menampilkan beberapa reminder.

Contoh:

```text
116 data alumni menunggu verifikasi
14 data perlu perbaikan
Periode pelaporan sedang berjalan
```

Pada MVP hanya tampilan.

---

# 19. Data Dummy

Pada tahap awal, dashboard **tidak wajib mengambil data dari database**.

Data dapat dibuat dalam file:

```text
data/
└── dashboard.ts
```

Contoh:

```typescript
export const dashboardData = {
  totalAlumni: 428,
  confirmed: 312,
  unverified: 116,
  continuingEducation: 256,
  universities: 86
}
```

Tujuannya adalah menyelesaikan UI dan alur aplikasi terlebih dahulu.

---

# 20. Teknologi MVP

## Frontend

```text
Next.js
TypeScript
Tailwind CSS
shadcn/ui
Recharts
```

## Backend

Pada tahap awal, backend cukup menggunakan kemampuan bawaan Next.js.

```text
Next.js Server Components
Next.js Server Actions / Route Handlers
```

Backend yang lebih lengkap akan dibuat pada tahap berikutnya.

## Database

Database belum wajib digunakan untuk Dashboard MVP.

Tahap berikutnya:

```text
PostgreSQL
Prisma ORM
```

## Authentication

Authentication dapat menggunakan:

```text
Auth.js
```

Untuk MVP dapat menggunakan satu akun admin terlebih dahulu.

---

# 21. Struktur Project Awal

Struktur sederhana:

```text
alumni-system/
│
├── app/
│   ├── login/
│   │   └── page.tsx
│   │
│   ├── dashboard/
│   │   └── page.tsx
│   │
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│   ├── sidebar.tsx
│   ├── header.tsx
│   ├── kpi-card.tsx
│   ├── status-chart.tsx
│   ├── trend-chart.tsx
│   ├── university-chart.tsx
│   ├── study-program-table.tsx
│   ├── admission-chart.tsx
│   ├── verification-card.tsx
│   ├── document-card.tsx
│   ├── recent-activity.tsx
│   └── reminders.tsx
│
├── data/
│   └── dashboard.ts
│
├── public/
│   └── ...
│
├── package.json
└── README.md
```

---

# 22. Acceptance Criteria MVP

MVP dianggap selesai jika:

### Login

- [ ] User dapat membuka `/login`.
- [ ] User dapat memasukkan email dan password.
- [ ] Login berhasil menggunakan akun dummy.
- [ ] Login gagal menampilkan pesan error.
- [ ] Setelah login berhasil, user diarahkan ke `/dashboard`.

### Dashboard

- [ ] Dashboard dapat dibuka setelah login.
- [ ] Sidebar tampil.
- [ ] Header tampil.
- [ ] Filter tampil.
- [ ] 5 KPI cards tampil.
- [ ] Chart status alumni tampil.
- [ ] Chart tren alumni tampil.
- [ ] Top perguruan tinggi tampil.
- [ ] Top program studi tampil.
- [ ] Jalur penerimaan tampil.
- [ ] Kelengkapan verifikasi tampil.
- [ ] Bukti dokumen tampil.
- [ ] Aktivitas terbaru tampil.
- [ ] Pengingat & tindak lanjut tampil.
- [ ] Tampilan desktop menyerupai desain dashboard yang diberikan.
- [ ] Data dashboard masih boleh menggunakan dummy data.

---

# 23. Fitur Tahap Berikutnya

Setelah Login + Dashboard selesai, fitur dikembangkan bertahap.

## Phase 2 – Database

```text
PostgreSQL
Prisma
Users
Schools
Academic Periods
Alumni
```

## Phase 3 – Data Alumni

```text
Data Alumni
Penerimaan PT
Status Alumni
```

## Phase 4 – Dokumen & Verifikasi

```text
Bukti & Dokumen
Upload file
Verification
Verification History
```

## Phase 5 – Reporting

```text
Laporan Sekolah
Laporan Yayasan
PDF Export
```

## Phase 6 – Administration

```text
Pengguna
Role & Permission
School Scope
Audit Log
```

---

# 24. Prinsip MVP

Untuk tahap pertama:

> **Buat Login → Dashboard → pastikan UI berjalan dengan baik → baru sambungkan database dan fitur bisnis satu per satu.**

Jangan membuat seluruh sistem sekaligus.

Fokus utama MVP:

```text
        LOGIN
          │
          ▼
     DASHBOARD
          │
    ┌─────┴─────┐
    ▼           ▼
   UI       Dummy Data
```

Setelah stabil:

```text
Dashboard
    ↓
PostgreSQL
    ↓
Data Alumni
    ↓
Penerimaan PT
    ↓
Status
    ↓
Dokumen
    ↓
Verifikasi
    ↓
Laporan
```
