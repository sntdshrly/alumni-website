// Dummy data Share Your Journey – cerita perjalanan alumni setelah lulus.

export type KategoriCerita =
  | "Masuk Perguruan Tinggi"
  | "Pekerjaan Pertama"
  | "Tips Seleksi & Wawancara"
  | "Perkembangan Karier";

export const kategoriCeritaOptions: KategoriCerita[] = [
  "Masuk Perguruan Tinggi",
  "Pekerjaan Pertama",
  "Tips Seleksi & Wawancara",
  "Perkembangan Karier",
];

export type CeritaAlumni = {
  id: string;
  // Mengacu ke NIK pada data alumni.
  penulisNik: string;
  kategori: KategoriCerita;
  judul: string;
  isi: string;
  // Tanggal terbit, format ISO.
  tanggal: string;
  // Jumlah apresiasi dari alumni lain sebelum alumni yang login ikut memberi apresiasi.
  apresiasi: number;
};

export const ceritaList: CeritaAlumni[] = [
  {
    id: "CRT-001",
    penulisNik: "3273050810070010",
    kategori: "Masuk Perguruan Tinggi",
    judul: "Dari Ruang Kelas XII IPA ke National University of Singapore",
    isi: `Awalnya saya tidak yakin bisa kuliah di luar negeri. Kuncinya ternyata persiapan yang dimulai sejak kelas XI: menjaga nilai rapor, ikut lomba sains, dan rutin latihan IELTS setiap akhir pekan.

Untuk beasiswa, saya menyiapkan esai sekitar tiga bulan dan meminta guru BK serta wali kelas membaca drafnya. Jangan malu minta masukan! Esai saya berubah hampir lima kali sebelum dikirim.

Pesan saya untuk adik kelas: cari tahu syarat beasiswa sejak awal, catat tenggat waktunya, dan jangan menunda tes bahasa Inggris sampai kelas XII.`,
    tanggal: "2026-08-12",
    apresiasi: 48,
  },
  {
    id: "CRT-002",
    penulisNik: "3273051511070003",
    kategori: "Pekerjaan Pertama",
    judul: "Langsung Bekerja Setelah Lulus SMA? Ini Pengalaman Saya",
    isi: `Setelah lulus saya memutuskan bekerja dulu sambil menabung untuk kuliah. Saya melamar ke lebih dari 20 perusahaan dan baru dipanggil wawancara di minggu keenam.

Yang paling membantu: CV satu halaman yang rapi, pengalaman organisasi OSIS, dan sertifikat kursus komputer dari sekolah. Saat wawancara, saya jujur bahwa saya ingin terus belajar dan itu justru dihargai.

Sekarang saya bekerja sebagai staf administrasi dan mulai menyiapkan kuliah kelas karyawan tahun depan.`,
    tanggal: "2026-07-03",
    apresiasi: 31,
  },
  {
    id: "CRT-003",
    penulisNik: "3273050806070002",
    kategori: "Tips Seleksi & Wawancara",
    judul: "5 Kebiasaan yang Membantu Saya Lolos SNBT ke ITB",
    isi: `1. Mengerjakan satu paket soal setiap hari, sekecil apa pun waktunya.
2. Membuat catatan kesalahan yaitu soal yang salah dikerjakan ulang seminggu kemudian.
3. Tryout rutin tiap dua minggu untuk melatih manajemen waktu.
4. Belajar bareng teman agar saling menjelaskan materi.
5. Tidur cukup menjelang hari H; begadang justru bikin fokus turun.

Semoga membantu, dan semangat untuk adik-adik yang sedang berjuang!`,
    tanggal: "2026-09-01",
    apresiasi: 72,
  },
  {
    id: "CRT-004",
    penulisNik: "3273052204050016",
    kategori: "Perkembangan Karier",
    judul: "Kuliah Bisnis di Melbourne dan Belajar Beradaptasi",
    isi: `Tahun pertama di Melbourne adalah masa adaptasi terberat: cara belajar yang sangat mandiri, tugas kelompok dengan teman dari berbagai negara, dan kerja paruh waktu untuk tambahan biaya hidup.

Dari kerja paruh waktu di kafe, saya belajar komunikasi dan manajemen waktu yang ternyata sangat berguna saat melamar magang di perusahaan konsultan.

Untuk alumni yang ingin kuliah di luar negeri: siapkan mental untuk mandiri, dan manfaatkan layanan karier kampus sejak tahun pertama.`,
    tanggal: "2026-05-20",
    apresiasi: 26,
  },
];
