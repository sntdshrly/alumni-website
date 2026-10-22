// Dummy data untuk MVP menu Sekolah – belum terhubung ke database.

export type SekolahStatus = "Aktif" | "Nonaktif";

export type Sekolah = {
  id: string;
  nama: string;
  kepalaSekolah: string;
  lokasi: string;
  alumni: number;
  status: SekolahStatus;
  perluPembaruan: boolean;
  npsn: string;
  jenisSekolah: string;
  email: string;
  telepon: string;
  tahunBergabung: number;
  terakhirDiperbarui: string;
};

export const sekolahList: Sekolah[] = [
  {
    id: "sman-01",
    nama: "SMA Negeri 1",
    kepalaSekolah: "Drs. Ahmad Hidayat",
    lokasi: "Jakarta Selatan",
    alumni: 428,
    status: "Aktif",
    perluPembaruan: false,
    npsn: "20123456",
    jenisSekolah: "Negeri",
    email: "admin@sman1.sch.id",
    telepon: "021-555-0148",
    tahunBergabung: 2019,
    terakhirDiperbarui: "31 Mei 2025",
  },
  {
    id: "sman-02",
    nama: "SMA Negeri 2",
    kepalaSekolah: "Dra. Siti Nurhaliza",
    lokasi: "Jakarta Barat",
    alumni: 391,
    status: "Aktif",
    perluPembaruan: false,
    npsn: "20123457",
    jenisSekolah: "Negeri",
    email: "admin@sman2.sch.id",
    telepon: "021-555-0212",
    tahunBergabung: 2019,
    terakhirDiperbarui: "28 Mei 2025",
  },
  {
    id: "sman-03",
    nama: "SMA Negeri 3",
    kepalaSekolah: "Hendra Wijaya",
    lokasi: "Depok",
    alumni: 366,
    status: "Aktif",
    perluPembaruan: false,
    npsn: "20123458",
    jenisSekolah: "Negeri",
    email: "admin@sman3.sch.id",
    telepon: "021-555-0339",
    tahunBergabung: 2020,
    terakhirDiperbarui: "25 Mei 2025",
  },
  {
    id: "shb-04",
    nama: "SMA Harapan Bangsa",
    kepalaSekolah: "Maya Lestari",
    lokasi: "Bekasi",
    alumni: 302,
    status: "Aktif",
    perluPembaruan: false,
    npsn: "20123459",
    jenisSekolah: "Swasta",
    email: "admin@shb.sch.id",
    telepon: "021-555-0456",
    tahunBergabung: 2020,
    terakhirDiperbarui: "20 Mei 2025",
  },
  {
    id: "smu-05",
    nama: "SMA Mandiri Utama",
    kepalaSekolah: "Rudi Hartono",
    lokasi: "Tangerang",
    alumni: 287,
    status: "Aktif",
    perluPembaruan: true,
    npsn: "20123460",
    jenisSekolah: "Swasta",
    email: "admin@smu.sch.id",
    telepon: "021-555-0567",
    tahunBergabung: 2021,
    terakhirDiperbarui: "12 Feb 2025",
  },
  {
    id: "sbp-06",
    nama: "SMA Bina Prestasi",
    kepalaSekolah: "Lilis Suryani",
    lokasi: "Bogor",
    alumni: 221,
    status: "Aktif",
    perluPembaruan: false,
    npsn: "20123461",
    jenisSekolah: "Swasta",
    email: "admin@sbp.sch.id",
    telepon: "021-555-0678",
    tahunBergabung: 2021,
    terakhirDiperbarui: "18 Mei 2025",
  },
  {
    id: "scn-07",
    nama: "SMA Cahaya Nusantara",
    kepalaSekolah: "Belum ditetapkan",
    lokasi: "Bogor",
    alumni: 112,
    status: "Aktif",
    perluPembaruan: true,
    npsn: "20123462",
    jenisSekolah: "Swasta",
    email: "admin@scn.sch.id",
    telepon: "-",
    tahunBergabung: 2024,
    terakhirDiperbarui: "05 Jan 2025",
  },
  {
    id: "stb-08",
    nama: "SMA Tunas Bangsa",
    kepalaSekolah: "Fitriani Anggraini",
    lokasi: "Depok",
    alumni: 64,
    status: "Nonaktif",
    perluPembaruan: false,
    npsn: "20123463",
    jenisSekolah: "Swasta",
    email: "admin@stb.sch.id",
    telepon: "021-555-0789",
    tahunBergabung: 2022,
    terakhirDiperbarui: "02 Nov 2024",
  },
];
