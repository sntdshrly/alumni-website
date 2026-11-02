// Mengisi database dengan data awal (data dummy MVP + SMA Permai).
// Jalankan: npm run db:seed            -> hanya bila database masih kosong
//           npm run db:seed -- --reset -> HAPUS semua data lalu isi ulang

import { count } from "drizzle-orm";
import { alumniList, type Alumni } from "@/data/alumni";
import { acaraList, pendaftarPortalAwal, type AcaraAlumni } from "@/data/acara";
import { ceritaList } from "@/data/cerita";
import { penggunaList, type Pengguna } from "@/data/pengguna";
import { perguruanTinggiList } from "@/data/perguruan-tinggi";
import { sekolahList, type Sekolah } from "@/data/sekolah";
import { db, schema } from "@/lib/db";
import type { StatistikSekolah } from "@/lib/dashboard-stats";
import { hashPassword } from "@/lib/password";

const SMA_PERMAI = "SMA Permai";

const sekolahPermai: Sekolah = {
  id: "sma-permai",
  nama: SMA_PERMAI,
  kepalaSekolah: "Dra. Lestari Wulandari, M.Pd.",
  lokasi: "Jakarta Utara",
  alumni: 186,
  status: "Aktif",
  perluPembaruan: false,
  npsn: "20109876",
  jenisSekolah: "Swasta",
  email: "info@smapermai.sch.id",
  telepon: "021-6601-2233",
  tahunBergabung: 2026,
  terakhirDiperbarui: "02 Nov 2026",
};

const adminPermai: Pengguna = {
  id: "USR-013",
  nama: "Admin SMA Permai",
  email: "admin@smapermai.sch.id",
  noHp: "0812-3300-4455",
  role: "Admin Sekolah",
  sekolah: SMA_PERMAI,
  status: "Aktif",
  terakhirLogin: "",
  dibuatPada: new Date().toISOString(),
};

function alumniPermai(
  data: Pick<Alumni, "nik" | "nama" | "nisn" | "kelas" | "tahunLulus" | "telepon" | "email" | "statusSetelahLulus"> &
    Partial<Alumni>,
): Alumni {
  return {
    sekolah: SMA_PERMAI,
    waliKelas: data.kelas.includes("IPA") ? "Bapak Yohanes Prasetyo" : "Ibu Maria Kristiani",
    linkedin: "",
    instagram: "",
    tiktok: "",
    perguruanTinggiId: "",
    programStudi: "",
    jabatan: "",
    tempatKerja: "",
    terakhirDikonfirmasi: "15 Okt 2026",
    validasi: "Valid",
    pemeriksa: "Admin SMA Permai",
    catatanValidasi: "",
    tampilDiJaringan: true,
    bersediaMentor: false,
    bagikanEmail: true,
    bagikanTelepon: false,
    bagikanMediaSosial: false,
    ...data,
  };
}

const alumniSmaPermai: Alumni[] = [
  alumniPermai({ nik: "3172010304070101", nama: "Rafael Gunawan", nisn: "0071234501", kelas: "XII IPA 1", tahunLulus: 2025, telepon: "081290001101", email: "rafael.gunawan@gmail.com", statusSetelahLulus: "Aktif Kuliah", perguruanTinggiId: "binus", programStudi: "S1 Teknik Informatika", linkedin: "rafael-gunawan", bagikanMediaSosial: true, bersediaMentor: true }),
  alumniPermai({ nik: "3172014507070102", nama: "Jessica Halim", nisn: "0071234502", kelas: "XII IPS 1", tahunLulus: 2025, telepon: "081290001102", email: "jessica.halim@gmail.com", statusSetelahLulus: "Aktif Kuliah", perguruanTinggiId: "ui", programStudi: "S1 Akuntansi" }),
  alumniPermai({ nik: "3172011209070103", nama: "Michael Santoso", nisn: "0071234503", kelas: "XII IPA 2", tahunLulus: 2025, telepon: "081290001103", email: "michael.santoso@gmail.com", statusSetelahLulus: "Diterima", perguruanTinggiId: "itb", programStudi: "S1 Teknik Elektro", validasi: "Pending", pemeriksa: "" }),
  alumniPermai({ nik: "3172016601070104", nama: "Clarissa Wijaya", nisn: "0071234504", kelas: "XII IPS 2", tahunLulus: 2025, telepon: "081290001104", email: "clarissa.wijaya@gmail.com", statusSetelahLulus: "Aktif Kuliah", perguruanTinggiId: "uph", programStudi: "S1 Desain Komunikasi Visual", instagram: "clarissa.design", bagikanMediaSosial: true }),
  alumniPermai({ nik: "3172012008060105", nama: "Daniel Pratama", nisn: "0061234505", kelas: "XII IPA 1", tahunLulus: 2024, telepon: "081290001105", email: "daniel.pratama@gmail.com", statusSetelahLulus: "Bekerja", jabatan: "Junior Data Analyst", tempatKerja: "PT Nusantara Digital" }),
  alumniPermai({ nik: "3172015503060106", nama: "Felicia Tanoto", nisn: "0061234506", kelas: "XII IPS 1", tahunLulus: 2024, telepon: "081290001106", email: "felicia.tanoto@gmail.com", statusSetelahLulus: "Wirausaha", jabatan: "Kuliner", tempatKerja: "Felicia Bakes", validasi: "On Review", pemeriksa: "Admin SMA Permai" }),
  alumniPermai({ nik: "3172010711060107", nama: "Kevin Hartono", nisn: "0061234507", kelas: "XII IPA 3", tahunLulus: 2024, telepon: "081290001107", email: "kevin.hartono@gmail.com", statusSetelahLulus: "Aktif Kuliah", perguruanTinggiId: "unpad", programStudi: "S1 Kedokteran" }),
  alumniPermai({ nik: "3172016912060108", nama: "Natasha Lim", nisn: "0061234508", kelas: "XII IPS 2", tahunLulus: 2024, telepon: "081290001108", email: "natasha.lim@gmail.com", statusSetelahLulus: "Gap Year", tampilDiJaringan: false, bagikanEmail: false }),
];

const acaraPermai: AcaraAlumni = {
  id: "ACR-006",
  sekolah: SMA_PERMAI,
  judul: "Career Day SMA Permai 2026",
  jenis: "Seminar Karier",
  tanggal: "2026-12-05T09:00:00+07:00",
  lokasi: "Aula SMA Permai",
  deskripsi:
    "Alumni berbagi pengalaman kuliah dan dunia kerja kepada siswa kelas XII, dilanjutkan sesi konsultasi jurusan per kelompok.",
  kuota: 120,
  terdaftar: 34,
};

// Rekap statistik dashboard per sekolah. Angka SMA Negeri 1 mengikuti data dashboard MVP.
const statistik: Record<string, StatistikSekolah> = {
  "SMA Negeri 1": {
    totalAlumni: 428,
    terkonfirmasi: 312,
    belumTerverifikasi: 116,
    melanjutkanPT: 256,
    jumlahPT: 86,
    status: [
      { name: "Melanjutkan ke Perguruan Tinggi", value: 256, color: "#22c55e" },
      { name: "Menunggu Hasil Seleksi", value: 38, color: "#38bdf8" },
      { name: "Gap Year", value: 32, color: "#fbbf24" },
      { name: "Bekerja", value: 28, color: "#a78bfa" },
      { name: "Berwirausaha", value: 12, color: "#fb923c" },
      { name: "Mengikuti Pelatihan", value: 9, color: "#f472b6" },
      { name: "Belum Melanjutkan", value: 26, color: "#818cf8" },
      { name: "Tidak Dapat Dihubungi", value: 17, color: "#ef4444" },
      { name: "Status Belum Diketahui", value: 10, color: "#cbd5e1" },
    ],
    tren: [
      { year: "2020/2021", jumlah: 150, totalLulusan: 292 },
      { year: "2021/2022", jumlah: 164, totalLulusan: 295 },
      { year: "2022/2023", jumlah: 183, totalLulusan: 313 },
      { year: "2023/2024", jumlah: 212, totalLulusan: 345 },
      { year: "2024/2025", jumlah: 256, totalLulusan: 428 },
    ],
    universitas: [
      { name: "Universitas Indonesia", value: 32 },
      { name: "Universitas Gadjah Mada", value: 28 },
      { name: "Institut Teknologi Bandung", value: 24 },
      { name: "Universitas Diponegoro", value: 21 },
      { name: "Universitas Brawijaya", value: 18 },
    ],
    prodi: [
      { name: "Manajemen", value: 28 },
      { name: "Teknik Informatika", value: 26 },
      { name: "Psikologi", value: 20 },
      { name: "Teknik Sipil", value: 17 },
      { name: "Kedokteran", value: 15 },
    ],
    jalur: [
      { name: "SNBP", value: 104, color: "#22c55e" },
      { name: "SNBT", value: 98, color: "#3b82f6" },
      { name: "Mandiri", value: 42, color: "#fbbf24" },
      { name: "Kedinasan", value: 8, color: "#a78bfa" },
      { name: "Lainnya", value: 4, color: "#94a3b8" },
    ],
  },
  [SMA_PERMAI]: {
    totalAlumni: 186,
    terkonfirmasi: 140,
    belumTerverifikasi: 46,
    melanjutkanPT: 118,
    jumlahPT: 41,
    status: [
      { name: "Melanjutkan ke Perguruan Tinggi", value: 118, color: "#22c55e" },
      { name: "Menunggu Hasil Seleksi", value: 14, color: "#38bdf8" },
      { name: "Gap Year", value: 12, color: "#fbbf24" },
      { name: "Bekerja", value: 15, color: "#a78bfa" },
      { name: "Berwirausaha", value: 6, color: "#fb923c" },
      { name: "Mengikuti Pelatihan", value: 4, color: "#f472b6" },
      { name: "Belum Melanjutkan", value: 9, color: "#818cf8" },
      { name: "Tidak Dapat Dihubungi", value: 5, color: "#ef4444" },
      { name: "Status Belum Diketahui", value: 3, color: "#cbd5e1" },
    ],
    tren: [
      { year: "2020/2021", jumlah: 82, totalLulusan: 150 },
      { year: "2021/2022", jumlah: 90, totalLulusan: 158 },
      { year: "2022/2023", jumlah: 97, totalLulusan: 164 },
      { year: "2023/2024", jumlah: 108, totalLulusan: 175 },
      { year: "2024/2025", jumlah: 118, totalLulusan: 186 },
    ],
    universitas: [
      { name: "Universitas Indonesia", value: 14 },
      { name: "Universitas Padjadjaran", value: 11 },
      { name: "BINUS University", value: 10 },
      { name: "Institut Teknologi Bandung", value: 9 },
      { name: "Universitas Pelita Harapan", value: 7 },
    ],
    prodi: [
      { name: "Teknik Informatika", value: 15 },
      { name: "Manajemen", value: 13 },
      { name: "Akuntansi", value: 10 },
      { name: "Ilmu Komunikasi", value: 9 },
      { name: "Desain Komunikasi Visual", value: 8 },
    ],
    jalur: [
      { name: "SNBP", value: 41, color: "#22c55e" },
      { name: "SNBT", value: 39, color: "#3b82f6" },
      { name: "Mandiri", value: 30, color: "#fbbf24" },
      { name: "Kedinasan", value: 3, color: "#a78bfa" },
      { name: "Lainnya", value: 5, color: "#94a3b8" },
    ],
  },
};

// Password akun demo yang bisa login.
const PASSWORD_DEMO: Record<string, string> = {
  "superadmin@binus.ac.id": "password123",
  "admin@smapermai.sch.id": "permai123",
  "alya.putri@gmail.com": "alumni123",
};

export async function seed(reset: boolean) {
  const [{ n }] = await db.select({ n: count() }).from(schema.sekolah);
  if (n > 0 && !reset) {
    console.log("Database sudah berisi data. Jalankan dengan --reset untuk menghapus dan mengisi ulang.");
    return;
  }

  if (reset) {
    console.log("Menghapus data lama...");
    // Urutan mengikuti foreign key: tabel anak lebih dulu.
    for (const table of [
      schema.ceritaApresiasi,
      schema.cerita,
      schema.acaraPeserta,
      schema.acara,
      schema.alumni,
      schema.pengguna,
      schema.statistikSekolah,
      schema.pendaftaranAkun,
      schema.perguruanTinggi,
      schema.sekolah,
    ]) {
      await db.delete(table);
    }
  }

  const hashes = Object.fromEntries(
    await Promise.all(Object.entries(PASSWORD_DEMO).map(async ([email, pw]) => [email, await hashPassword(pw)])),
  ) as Record<string, string>;

  await db.insert(schema.sekolah).values([...sekolahList, sekolahPermai]);
  await db.insert(schema.perguruanTinggi).values(perguruanTinggiList);
  await db
    .insert(schema.alumni)
    .values([...alumniList, ...alumniSmaPermai].map((a) => ({ ...a, passwordHash: hashes[a.email] ?? null })));
  await db
    .insert(schema.pengguna)
    .values([...penggunaList, adminPermai].map((p) => ({ ...p, passwordHash: hashes[p.email] ?? null })));
  await db.insert(schema.acara).values([...acaraList, acaraPermai]);
  await db
    .insert(schema.acaraPeserta)
    .values(Object.entries(pendaftarPortalAwal).flatMap(([acaraId, niks]) => niks.map((nik) => ({ acaraId, nik }))));
  await db.insert(schema.cerita).values(ceritaList);
  await db
    .insert(schema.statistikSekolah)
    .values(Object.entries(statistik).map(([sekolah, data]) => ({ sekolah, data })));

  console.log(
    `Selesai: ${sekolahList.length + 1} sekolah, ${perguruanTinggiList.length} perguruan tinggi, ` +
      `${alumniList.length + alumniSmaPermai.length} alumni, ${penggunaList.length + 1} pengguna, ` +
      `${acaraList.length + 1} acara, ${ceritaList.length} cerita.`,
  );
}

// Dijalankan langsung lewat `npm run db:seed` (bukan saat diimpor oleh skrip lain).
if (process.argv[1]?.replaceAll("\\", "/").endsWith("scripts/seed.ts")) {
  seed(process.argv.includes("--reset")).catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
