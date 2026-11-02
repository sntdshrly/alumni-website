// Akun staf: hanya Super Admin (semua sekolah) dan Admin Sekolah (satu sekolah).
// Alumni login lewat data alumni, bukan sebagai pengguna di sini.

export type RolePengguna = "Super Admin" | "Admin Sekolah";

export type StatusPengguna = "Aktif" | "Nonaktif";

export type Pengguna = {
  id: string;
  nama: string;
  email: string;
  noHp: string;
  role: RolePengguna;
  // Nama sekolah, atau SEMUA_SEKOLAH untuk role dengan akses lintas sekolah.
  sekolah: string;
  status: StatusPengguna;
  // ISO timestamp; kosong jika pengguna belum pernah masuk.
  terakhirLogin: string;
  dibuatPada: string;
};

export const SEMUA_SEKOLAH = "Semua Sekolah";

export const rolePenggunaOptions: RolePengguna[] = ["Super Admin", "Admin Sekolah"];

export const statusPenggunaOptions: StatusPengguna[] = ["Aktif", "Nonaktif"];

// Role yang aksesnya mencakup seluruh sekolah (school scope global).
export const roleLintasSekolah: RolePengguna[] = ["Super Admin"];

export const deskripsiRole: Record<RolePengguna, string> = {
  "Super Admin": "Akses penuh ke seluruh modul dan sekolah",
  "Admin Sekolah": "Mengelola data alumni, acara, verifikasi, dan pengguna di sekolahnya",
};

function minutesAgo(minutes: number) {
  return new Date(Date.now() - minutes * 60_000).toISOString();
}

const HOUR = 60;
const DAY = 24 * HOUR;

export const penggunaList: Pengguna[] = [
  {
    id: "USR-001",
    nama: "Admin",
    email: "superadmin@binus.ac.id",
    noHp: "0812-1000-0001",
    role: "Super Admin",
    sekolah: SEMUA_SEKOLAH,
    status: "Aktif",
    terakhirLogin: minutesAgo(5),
    dibuatPada: minutesAgo(180 * DAY),
  },
  {
    id: "USR-002",
    nama: "Rina Kartika",
    email: "rina.kartika@sman1.sch.id",
    noHp: "0812-2233-4410",
    role: "Admin Sekolah",
    sekolah: "SMA Negeri 1",
    status: "Aktif",
    terakhirLogin: minutesAgo(2 * HOUR),
    dibuatPada: minutesAgo(150 * DAY),
  },
  {
    id: "USR-006",
    nama: "Agus Pratama",
    email: "agus.pratama@sman2.sch.id",
    noHp: "0821-4455-6677",
    role: "Admin Sekolah",
    sekolah: "SMA Negeri 2",
    status: "Aktif",
    terakhirLogin: minutesAgo(5 * HOUR),
    dibuatPada: minutesAgo(110 * DAY),
  },
  {
    id: "USR-012",
    nama: "Rudi Hartono",
    email: "rudi.hartono@binaprestasi.sch.id",
    noHp: "0817-5566-3030",
    role: "Admin Sekolah",
    sekolah: "SMA Bina Prestasi",
    status: "Nonaktif",
    terakhirLogin: minutesAgo(60 * DAY),
    dibuatPada: minutesAgo(175 * DAY),
  },
];
