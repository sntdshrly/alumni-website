# Alumni Tracking System

Sistem pencatatan dan pelacakan alumni SMA: admin memantau ke mana alumni melanjutkan studi atau
bekerja, sementara alumni dapat memperbarui profil, terhubung dengan sesama alumni, dan mencari
rekomendasi karier.

**Demo:** https://binus-alumni.vercel.app

> Status: MVP. Data tersimpan di database Postgres (Neon). Isi awalnya masih data contoh,
> bukan data alumni asli.

## Akun Demo

| Role | Email | Password |
|---|---|---|
| Super Admin (semua sekolah) | `superadmin@binus.ac.id` | `password123` |
| Admin Sekolah (SMA Permai saja) | `admin@smapermai.sch.id` | `permai123` |
| Alumni | `alya.putri@gmail.com` | `alumni123` |

Admin Sekolah hanya bisa melihat dan mengubah data sekolahnya sendiri. Admin baru dibuat Super
Admin lewat menu Daftar Pengguna, lalu diberi password sementara dengan tombol **Reset Password**.

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

Login dengan password ber-hash (scrypt) dan cookie sesi bertanda tangan (JWT, `SESSION_SECRET`).
Registrasi tersimpan sebagai permintaan yang menunggu persetujuan admin. Akses halaman dibatasi
per role lewat `proxy.ts`, dan batas sekolah diperiksa ulang di setiap halaman dan server action.

## Teknologi

- [Next.js 16](https://nextjs.org) (App Router) dan React 19
- TypeScript
- Tailwind CSS 4 dengan komponen shadcn/ui (Base UI)
- Recharts untuk grafik
- SheetJS (`xlsx`) untuk import Excel
- Postgres (Neon) dengan Drizzle ORM

## Menjalankan Secara Lokal

Butuh Node.js 20 atau lebih baru dan akses ke project Vercel (untuk mengambil koneksi database).

```bash
npm install
npx vercel env pull .env.local   # DATABASE_URL dan SESSION_SECRET
npm run dev
```

Untuk database baru yang masih kosong:

```bash
npx drizzle-kit migrate          # membuat tabel dari folder drizzle/
npm run db:seed                  # mengisi data awal (hanya bila database kosong)
```

`npm run db:seed -- --reset` **menghapus semua data** lalu mengisi ulang data awal.

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
data/         Tipe, pilihan, dan data awal (seed): alumni, sekolah, perguruan tinggi, acara, RIASEC
drizzle/      File migrasi SQL database
lib/          Logika: database, auth & sesi, query per sekolah, forecasting, career finder
scripts/      Skrip seed database
proxy.ts      Pembatasan akses halaman berdasarkan role
prd.md        Product requirements document
```

## Deploy

Aplikasi di-deploy ke Vercel (https://binus-alumni.vercel.app) dengan `npx vercel deploy --prod`.
Environment variable yang dibutuhkan: `DATABASE_URL` (otomatis dari integrasi Neon) dan `SESSION_SECRET`.
