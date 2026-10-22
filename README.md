# Alumni Tracking System

Sistem pencatatan dan pelacakan alumni SMA: admin memantau ke mana alumni melanjutkan studi atau
bekerja, sementara alumni dapat memperbarui profil, terhubung dengan sesama alumni, dan mencari
rekomendasi karier.

**Demo:** https://binus-alumni.vercel.app

> Status: MVP. Semua data masih **dummy** dan disimpan di memori server, jadi perubahan akan
> kembali ke data awal ketika server di-restart. Belum terhubung ke database.

## Akun Demo

| Role | Email | Password |
|---|---|---|
| Super Admin | `superadmin@binus.ac.id` | `password123` |
| Alumni | `alya.putri@gmail.com` | `alumni123` |

## Fitur

### Dashboard Admin (`/dashboard`)

- **Dashboard** – KPI alumni, status setelah lulus, top perguruan tinggi, dan tren alumni yang
  melanjutkan ke perguruan tinggi dengan prediksi 2 tahun ke depan (regresi linear).
- **Data Master** – kelola Sekolah dan Perguruan Tinggi, termasuk import dari Excel.
- **Data Alumni** – daftar, filter, edit, dan import data alumni.
- **Acara Alumni** – buat acara, lihat pendaftar, dan broadcast email ke peserta.
- **Verifikasi Data** – review perubahan data dari alumni (Valid, Pending, On Review, Rejected).
- **Daftar Pengguna** dan **Pengaturan Akun**.
- Unduh laporan CSV di setiap halaman data.

### Portal Alumni (`/alumni`)

- **Profil Saya** – perbarui status setelah lulus, kampus, program studi, atau pekerjaan.
- **Alumni Network** – cari alumni sesekolah, mentor, dan acara; kontak hanya tampil bila
  pemiliknya mengizinkan.
- **Share Your Journey** – tulis dan baca cerita perjalanan alumni.
- **Career Finder** – tes minat 30 pertanyaan berbasis model Holland RIASEC (mengacu pada O*NET
  Interest Profiler). Rekomendasi karier dihitung dengan pendekatan nearest-neighbor yang
  mencocokkan profil minat dan jurusan kuliah dengan profil karier. Hasilnya bisa bias dan
  sebaiknya dipakai sebagai bahan pertimbangan.

### Autentikasi

Login, registrasi (menunggu persetujuan admin), dan lupa password. Akses halaman dibatasi per
role lewat `proxy.ts`.

## Teknologi

- [Next.js 16](https://nextjs.org) (App Router) dan React 19
- TypeScript
- Tailwind CSS 4 dengan komponen shadcn/ui (Base UI)
- Recharts untuk grafik
- SheetJS (`xlsx`) untuk import Excel

## Menjalankan Secara Lokal

Butuh Node.js 20 atau lebih baru.

```bash
npm install
npm run dev
```

Buka http://localhost:3000 lalu login dengan salah satu akun demo di atas.

Perintah lain:

```bash
npm run build   # build production
npm run start   # jalankan hasil build
npm run lint    # cek ESLint
```

## Struktur Folder

```text
app/          Halaman (App Router): login, register, dashboard admin, portal alumni
components/   Komponen UI per fitur, plus components/ui untuk komponen dasar
data/         Data dummy: alumni, sekolah, perguruan tinggi, acara, RIASEC
lib/          Logika: auth & sesi, forecasting, career finder, export CSV, import Excel
proxy.ts      Pembatasan akses halaman berdasarkan role
prd.md        Product requirements document
```

## Deploy

Aplikasi di-deploy ke Vercel. Setiap push ke branch `main` otomatis ter-deploy ke
https://binus-alumni.vercel.app.
