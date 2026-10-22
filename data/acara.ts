// Dummy data acara alumni untuk Alumni Network – belum terhubung ke database.

export type JenisAcara =
  | "Reuni"
  | "Mentoring"
  | "Seminar Karier"
  | "Kegiatan Sosial";

export const jenisAcaraOptions: JenisAcara[] = [
  "Reuni",
  "Mentoring",
  "Seminar Karier",
  "Kegiatan Sosial",
];

export type AcaraAlumni = {
  id: string;
  // Sekolah penyelenggara; acara hanya terlihat oleh alumni sekolah ini.
  sekolah: string;
  judul: string;
  jenis: JenisAcara;
  // Tanggal & jam mulai, format ISO dengan zona waktu WIB.
  tanggal: string;
  lokasi: string;
  deskripsi: string;
  kuota: number;
  // Peserta yang terdaftar di luar portal (misalnya lewat formulir manual) sebagai data awal.
  terdaftar: number;
};

export const acaraList: AcaraAlumni[] = [
  {
    id: "ACR-001",
    sekolah: "SMA Negeri 1",
    judul: "Reuni Akbar Angkatan 2023-2025",
    jenis: "Reuni",
    tanggal: "2026-11-14T09:00:00+07:00",
    lokasi: "Aula SMA Negeri 1",
    deskripsi:
      "Temu kangen lintas angkatan bersama guru dan wali kelas. Ada sesi foto bersama, bazar alumni, dan pemutaran video kenangan.",
    kuota: 300,
    terdaftar: 187,
  },
  {
    id: "ACR-002",
    sekolah: "SMA Negeri 1",
    judul: "Mentoring: Persiapan SNBT & Seleksi Mandiri",
    jenis: "Mentoring",
    tanggal: "2026-10-25T13:00:00+07:00",
    lokasi: "Online (Zoom)",
    deskripsi:
      "Alumni yang kini kuliah di PTN berbagi strategi belajar, memilih jurusan, dan menghadapi seleksi masuk perguruan tinggi.",
    kuota: 100,
    terdaftar: 64,
  },
  {
    id: "ACR-003",
    sekolah: "SMA Negeri 1",
    judul: "Seminar Karier: Dari Magang ke Pekerjaan Pertama",
    jenis: "Seminar Karier",
    tanggal: "2026-12-06T10:00:00+07:00",
    lokasi: "Ruang Multimedia SMA Negeri 1",
    deskripsi:
      "Diskusi bersama alumni yang sudah bekerja tentang membuat CV, mencari lowongan, dan menghadapi wawancara kerja.",
    kuota: 80,
    terdaftar: 80,
  },
  {
    id: "ACR-004",
    sekolah: "SMA Negeri 1",
    judul: "Bakti Sosial Alumni Peduli Pendidikan",
    jenis: "Kegiatan Sosial",
    tanggal: "2027-01-18T08:00:00+07:00",
    lokasi: "SDN Cibeunying 3, Bandung",
    deskripsi:
      "Donasi buku dan kegiatan mengajar bersama untuk siswa sekolah dasar di sekitar sekolah.",
    kuota: 50,
    terdaftar: 21,
  },
  {
    id: "ACR-005",
    sekolah: "SMA Negeri 2",
    judul: "Temu Alumni SMA Negeri 2",
    jenis: "Reuni",
    tanggal: "2026-11-21T09:00:00+07:00",
    lokasi: "Lapangan SMA Negeri 2",
    deskripsi:
      "Silaturahmi alumni SMA Negeri 2 bersama guru dan pengurus OSIS.",
    kuota: 200,
    terdaftar: 95,
  },
];

// Contoh alumni yang sudah mendaftar lewat portal (NIK), untuk mencoba fitur Broadcast Email.
// Disimpan terpisah dari acaraList agar daftar peserta tidak ikut terkirim ke browser alumni.
export const pendaftarPortalAwal: Record<string, string[]> = {
  "ACR-002": [
    "3273050806070002", // Dimas Arya
    "3273051511070003", // Nabila Sari
    "3273050109070005", // Citra Lestari
    "3273051507070007", // Kevin Wijaya
    "3273050105070009", // Bagas Pratama
  ],
};
