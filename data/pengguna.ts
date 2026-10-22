// Dummy data untuk MVP menu Pengguna – belum terhubung ke database.

export type RolePengguna =
  | "Super Admin"
  | "Admin Sekolah"
  | "Karyawan TU"
  | "Guru Wali Kelas"
  | "Kepala Sekolah"
  | "Yayasan";

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

export const rolePenggunaOptions: RolePengguna[] = [
  "Super Admin",
  "Admin Sekolah",
  "Karyawan TU",
  "Guru Wali Kelas",
  "Kepala Sekolah",
  "Yayasan",
];

export const statusPenggunaOptions: StatusPengguna[] = ["Aktif", "Nonaktif"];

// Role yang aksesnya mencakup seluruh sekolah (school scope global).
export const roleLintasSekolah: RolePengguna[] = ["Super Admin", "Yayasan"];

export const deskripsiRole: Record<RolePengguna, string> = {
  "Super Admin": "Akses penuh ke seluruh modul dan sekolah",
  "Admin Sekolah": "Mengelola data master dan pengguna di sekolahnya",
  "Karyawan TU": "Input, koreksi, dan verifikasi data alumni",
  "Guru Wali Kelas": "Input data penerimaan siswa kelasnya",
  "Kepala Sekolah": "Melihat dashboard dan laporan sekolah",
  Yayasan: "Melihat laporan gabungan seluruh sekolah",
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
    id: "USR-003",
    nama: "Budi Santoso",
    email: "budi.santoso@sman1.sch.id",
    noHp: "0813-5521-7781",
    role: "Karyawan TU",
    sekolah: "SMA Negeri 1",
    status: "Aktif",
    terakhirLogin: minutesAgo(40),
    dibuatPada: minutesAgo(140 * DAY),
  },
  {
    id: "USR-004",
    nama: "Siti Rahmawati",
    email: "siti.rahmawati@sman1.sch.id",
    noHp: "0857-1122-9034",
    role: "Guru Wali Kelas",
    sekolah: "SMA Negeri 1",
    status: "Aktif",
    terakhirLogin: minutesAgo(1 * DAY + 3 * HOUR),
    dibuatPada: minutesAgo(120 * DAY),
  },
  {
    id: "USR-005",
    nama: "Drs. Hendra Wijaya",
    email: "kepsek@sman1.sch.id",
    noHp: "0811-7788-1200",
    role: "Kepala Sekolah",
    sekolah: "SMA Negeri 1",
    status: "Aktif",
    terakhirLogin: minutesAgo(3 * DAY),
    dibuatPada: minutesAgo(170 * DAY),
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
    id: "USR-007",
    nama: "Dewi Lestari",
    email: "dewi.lestari@sman2.sch.id",
    noHp: "0822-9090-1212",
    role: "Karyawan TU",
    sekolah: "SMA Negeri 2",
    status: "Aktif",
    terakhirLogin: minutesAgo(1 * DAY),
    dibuatPada: minutesAgo(100 * DAY),
  },
  {
    id: "USR-008",
    nama: "Fajar Nugroho",
    email: "fajar.nugroho@sman3.sch.id",
    noHp: "0838-3311-4400",
    role: "Guru Wali Kelas",
    sekolah: "SMA Negeri 3",
    status: "Nonaktif",
    terakhirLogin: minutesAgo(45 * DAY),
    dibuatPada: minutesAgo(130 * DAY),
  },
  {
    id: "USR-009",
    nama: "Maria Ulfa",
    email: "maria.ulfa@harapanbangsa.sch.id",
    noHp: "0819-6677-2020",
    role: "Karyawan TU",
    sekolah: "SMA Harapan Bangsa",
    status: "Aktif",
    terakhirLogin: minutesAgo(6 * HOUR),
    dibuatPada: minutesAgo(90 * DAY),
  },
  {
    id: "USR-010",
    nama: "Yusuf Hidayat",
    email: "yusuf.hidayat@yayasan.or.id",
    noHp: "0812-8800-3131",
    role: "Yayasan",
    sekolah: SEMUA_SEKOLAH,
    status: "Aktif",
    terakhirLogin: minutesAgo(2 * DAY + 4 * HOUR),
    dibuatPada: minutesAgo(160 * DAY),
  },
  {
    id: "USR-011",
    nama: "Lina Marlina",
    email: "lina.marlina@mandiriutama.sch.id",
    noHp: "0856-2244-8899",
    role: "Guru Wali Kelas",
    sekolah: "SMA Mandiri Utama",
    status: "Aktif",
    terakhirLogin: "",
    dibuatPada: minutesAgo(2 * DAY),
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
