// Data untuk menu Career Finder: pertanyaan minat, profil karier, dan profil jurusan.
// Mengacu pada model Holland RIASEC seperti yang dipakai O*NET Interest Profiler (Mini-IP).
// Butir pertanyaan dan bobot profil disusun ulang dalam bahasa Indonesia untuk MVP, bukan
// salinan resmi instrumen O*NET.

export type RiasecType = "R" | "I" | "A" | "S" | "E" | "C";

export const riasecOrder: RiasecType[] = ["R", "I", "A", "S", "E", "C"];

// Bobot tiap tipe pada skala 0–1.
export type RiasecVector = Record<RiasecType, number>;

export const riasecInfo: Record<
  RiasecType,
  { nama: string; julukan: string; deskripsi: string; warna: string }
> = {
  R: {
    nama: "Realistic",
    julukan: "Doers",
    deskripsi: "Suka bekerja dengan tangan, alat, mesin, tanaman, atau hewan; menyukai hasil kerja yang nyata.",
    warna: "#f59e0b",
  },
  I: {
    nama: "Investigative",
    julukan: "Thinkers",
    deskripsi: "Suka mengamati, meneliti, menganalisis, dan memecahkan masalah dengan logika.",
    warna: "#3b82f6",
  },
  A: {
    nama: "Artistic",
    julukan: "Creators",
    deskripsi: "Suka berekspresi lewat ide, desain, tulisan, musik, atau karya kreatif lain.",
    warna: "#a855f7",
  },
  S: {
    nama: "Social",
    julukan: "Helpers",
    deskripsi: "Suka membantu, mengajar, merawat, dan bekerja bersama orang lain.",
    warna: "#22c55e",
  },
  E: {
    nama: "Enterprising",
    julukan: "Persuaders",
    deskripsi: "Suka memimpin, memengaruhi, menjual, dan mengambil keputusan bisnis.",
    warna: "#ef4444",
  },
  C: {
    nama: "Conventional",
    julukan: "Organizers",
    deskripsi: "Suka bekerja dengan data, angka, dan prosedur yang rapi dan terstruktur.",
    warna: "#64748b",
  },
};

export type PertanyaanMinat = { id: number; tipe: RiasecType; teks: string };

const butir: Record<RiasecType, string[]> = {
  R: [
    "Merakit atau memperbaiki peralatan elektronik",
    "Mengoperasikan mesin atau peralatan di bengkel",
    "Membuat perabot atau kerajinan dari kayu",
    "Merawat tanaman atau hewan di kebun atau peternakan",
    "Memasang instalasi listrik atau jaringan komputer",
  ],
  I: [
    "Melakukan eksperimen di laboratorium",
    "Mempelajari cara kerja tubuh manusia",
    "Menganalisis data untuk menemukan pola",
    "Meneliti penyebab suatu fenomena alam",
    "Memecahkan soal matematika atau logika yang rumit",
  ],
  A: [
    "Menggambar, melukis, atau membuat desain",
    "Menulis cerita, puisi, atau naskah",
    "Bermain alat musik atau bernyanyi",
    "Membuat video, foto, atau konten kreatif",
    "Merancang tampilan ruangan, panggung, atau busana",
  ],
  S: [
    "Mengajari atau membimbing orang lain",
    "Membantu orang menyelesaikan masalah pribadinya",
    "Merawat orang sakit atau lanjut usia",
    "Menjadi relawan kegiatan sosial",
    "Bekerja dalam tim untuk melayani masyarakat",
  ],
  E: [
    "Memimpin sebuah tim atau organisasi",
    "Menjual produk atau meyakinkan orang lain",
    "Memulai dan menjalankan usaha sendiri",
    "Bernegosiasi untuk mencapai kesepakatan",
    "Berbicara di depan umum untuk mempromosikan ide",
  ],
  C: [
    "Merapikan catatan atau arsip dokumen",
    "Menyusun laporan keuangan atau anggaran",
    "Memasukkan dan memeriksa data di spreadsheet",
    "Mengikuti prosedur kerja yang jelas dan detail",
    "Mengatur jadwal dan administrasi kantor",
  ],
};

// 30 butir disusun bergiliran R-I-A-S-E-C seperti Mini-IP, agar tipe tidak berkelompok.
export const pertanyaanMinat: PertanyaanMinat[] = Array.from({ length: 5 }, (_, putaran) =>
  riasecOrder.map((tipe) => ({ tipe, teks: butir[tipe][putaran] })),
)
  .flat()
  .map((p, i) => ({ id: i + 1, ...p }));

export const skalaJawaban = [
  { nilai: 1, label: "Sangat Tidak Suka" },
  { nilai: 2, label: "Tidak Suka" },
  { nilai: 3, label: "Ragu-ragu" },
  { nilai: 4, label: "Suka" },
  { nilai: 5, label: "Sangat Suka" },
];

function v(R: number, I: number, A: number, S: number, E: number, C: number): RiasecVector {
  return { R, I, A, S, E, C };
}

export type KelompokJurusan = {
  id: string;
  nama: string;
  // Kata kunci untuk mencocokkan teks program studi di profil alumni.
  kataKunci: string[];
  profil: RiasecVector;
};

export const kelompokJurusan: KelompokJurusan[] = [
  { id: "informatika", nama: "Informatika / Ilmu Komputer", kataKunci: ["informatika", "computing", "computer", "komputer"], profil: v(0.6, 0.9, 0.3, 0.1, 0.2, 0.7) },
  { id: "sistem-informasi", nama: "Sistem Informasi", kataKunci: ["sistem informasi", "information system"], profil: v(0.4, 0.8, 0.2, 0.3, 0.5, 0.8) },
  { id: "manajemen", nama: "Manajemen / Bisnis", kataKunci: ["manajemen", "management", "bisnis", "business", "commerce"], profil: v(0.1, 0.4, 0.3, 0.5, 1, 0.7) },
  { id: "akuntansi", nama: "Akuntansi / Keuangan", kataKunci: ["akuntansi", "accounting", "keuangan", "finance"], profil: v(0.1, 0.5, 0.1, 0.2, 0.6, 1) },
  { id: "ekonomi", nama: "Ekonomi", kataKunci: ["ekonomi", "economics"], profil: v(0.1, 0.8, 0.1, 0.3, 0.7, 0.7) },
  { id: "komunikasi", nama: "Ilmu Komunikasi", kataKunci: ["komunikasi", "communication", "jurnalistik"], profil: v(0.1, 0.4, 0.8, 0.7, 0.8, 0.3) },
  { id: "kedokteran", nama: "Kedokteran / Kesehatan", kataKunci: ["kedokteran", "medicine", "keperawatan", "nursing", "kesehatan", "kebidanan"], profil: v(0.5, 1, 0.1, 0.9, 0.3, 0.4) },
  { id: "farmasi", nama: "Farmasi", kataKunci: ["farmasi", "pharmacy"], profil: v(0.4, 0.9, 0.1, 0.6, 0.3, 0.8) },
  { id: "psikologi", nama: "Psikologi", kataKunci: ["psikologi", "psychology"], profil: v(0.1, 0.8, 0.4, 1, 0.4, 0.3) },
  { id: "pendidikan", nama: "Pendidikan / Keguruan", kataKunci: ["pendidikan", "education", "keguruan", "pgsd"], profil: v(0.2, 0.4, 0.5, 1, 0.4, 0.4) },
  { id: "teknik-mesin", nama: "Teknik Mesin / Elektro / Industri", kataKunci: ["teknik mesin", "mechanical", "elektro", "electrical", "teknik industri"], profil: v(1, 0.9, 0.2, 0.1, 0.3, 0.5) },
  { id: "teknik-sipil", nama: "Teknik Sipil / Arsitektur", kataKunci: ["teknik sipil", "civil", "arsitektur", "architecture"], profil: v(0.9, 0.8, 0.5, 0.2, 0.4, 0.6) },
  { id: "desain", nama: "Desain / Seni", kataKunci: ["desain", "design", "dkv", "seni", "art", "film", "musik"], profil: v(0.3, 0.3, 1, 0.3, 0.5, 0.2) },
  { id: "hukum", nama: "Hukum", kataKunci: ["hukum", "law"], profil: v(0.1, 0.7, 0.4, 0.5, 0.9, 0.6) },
  { id: "sains", nama: "MIPA / Sains Murni", kataKunci: ["matematika", "statistika", "fisika", "kimia", "biologi", "science"], profil: v(0.5, 1, 0.2, 0.2, 0.2, 0.7) },
  { id: "sastra", nama: "Sastra / Bahasa", kataKunci: ["sastra", "bahasa", "literature", "linguistik"], profil: v(0.1, 0.5, 0.9, 0.6, 0.4, 0.3) },
];

export type ProfilKarier = {
  id: string;
  nama: string;
  deskripsi: string;
  profil: RiasecVector;
  // Kelompok jurusan yang paling umum menjadi jalur ke karier ini.
  jurusan: string[];
};

// Bobot mengikuti kode minat (interest code) okupasi serupa di O*NET, disederhanakan ke 0–1.
export const profilKarier: ProfilKarier[] = [
  { id: "software-engineer", nama: "Software Engineer", deskripsi: "Merancang dan membangun aplikasi atau sistem perangkat lunak.", profil: v(0.6, 0.9, 0.3, 0.1, 0.2, 0.7), jurusan: ["informatika", "sistem-informasi"] },
  { id: "data-scientist", nama: "Data Scientist", deskripsi: "Mengolah data dan membangun model untuk membantu pengambilan keputusan.", profil: v(0.3, 1, 0.2, 0.1, 0.3, 0.8), jurusan: ["informatika", "sains", "sistem-informasi"] },
  { id: "ui-ux", nama: "UI/UX Designer", deskripsi: "Merancang tampilan dan pengalaman pengguna aplikasi atau situs web.", profil: v(0.1, 0.6, 1, 0.4, 0.3, 0.2), jurusan: ["desain", "informatika", "sistem-informasi"] },
  { id: "business-analyst", nama: "IT Business Analyst", deskripsi: "Menjembatani kebutuhan bisnis dengan solusi teknologi.", profil: v(0.2, 0.8, 0.2, 0.3, 0.5, 0.8), jurusan: ["sistem-informasi", "manajemen", "informatika"] },
  { id: "network-engineer", nama: "Network & Cloud Engineer", deskripsi: "Membangun dan merawat infrastruktur jaringan serta server.", profil: v(0.8, 0.8, 0.1, 0.1, 0.2, 0.7), jurusan: ["informatika", "teknik-mesin"] },
  { id: "dokter", nama: "Dokter", deskripsi: "Mendiagnosis dan menangani masalah kesehatan pasien.", profil: v(0.5, 1, 0.1, 0.9, 0.3, 0.3), jurusan: ["kedokteran"] },
  { id: "perawat", nama: "Perawat", deskripsi: "Merawat pasien dan mendampingi proses pemulihan.", profil: v(0.5, 0.6, 0.1, 1, 0.2, 0.3), jurusan: ["kedokteran"] },
  { id: "apoteker", nama: "Apoteker", deskripsi: "Menyiapkan obat dan memberi informasi penggunaan obat yang aman.", profil: v(0.4, 0.9, 0.1, 0.6, 0.3, 0.8), jurusan: ["farmasi", "sains"] },
  { id: "psikolog", nama: "Psikolog", deskripsi: "Membantu orang memahami dan mengatasi masalah psikologis.", profil: v(0.1, 0.9, 0.4, 1, 0.3, 0.2), jurusan: ["psikologi"] },
  { id: "guru", nama: "Guru / Pendidik", deskripsi: "Mengajar dan membimbing peserta didik.", profil: v(0.2, 0.3, 0.5, 1, 0.3, 0.3), jurusan: ["pendidikan", "sastra", "sains"] },
  { id: "hr", nama: "HR Specialist", deskripsi: "Mengelola rekrutmen, pengembangan, dan kesejahteraan karyawan.", profil: v(0.1, 0.3, 0.2, 0.9, 0.7, 0.6), jurusan: ["psikologi", "manajemen"] },
  { id: "akuntan", nama: "Akuntan", deskripsi: "Mencatat, menyusun, dan menganalisis laporan keuangan.", profil: v(0.1, 0.4, 0.1, 0.1, 0.5, 1), jurusan: ["akuntansi"] },
  { id: "auditor", nama: "Auditor", deskripsi: "Memeriksa kewajaran laporan keuangan dan kepatuhan prosedur.", profil: v(0.1, 0.6, 0.1, 0.2, 0.5, 0.9), jurusan: ["akuntansi", "ekonomi"] },
  { id: "analis-keuangan", nama: "Analis Keuangan", deskripsi: "Menilai investasi dan kondisi keuangan perusahaan.", profil: v(0.1, 0.8, 0.1, 0.1, 0.7, 0.8), jurusan: ["akuntansi", "ekonomi", "manajemen"] },
  { id: "marketing", nama: "Marketing Manager", deskripsi: "Merancang strategi untuk memperkenalkan dan menjual produk.", profil: v(0.1, 0.3, 0.5, 0.5, 1, 0.4), jurusan: ["manajemen", "komunikasi"] },
  { id: "wirausaha", nama: "Wirausahawan", deskripsi: "Membangun dan menjalankan bisnis sendiri.", profil: v(0.3, 0.3, 0.4, 0.4, 1, 0.4), jurusan: ["manajemen", "ekonomi"] },
  { id: "konsultan", nama: "Konsultan Manajemen", deskripsi: "Membantu organisasi memecahkan masalah bisnis dan meningkatkan kinerja.", profil: v(0.1, 0.7, 0.2, 0.5, 0.9, 0.6), jurusan: ["manajemen", "ekonomi"] },
  { id: "sales", nama: "Business Development", deskripsi: "Mencari peluang kerja sama dan klien baru.", profil: v(0.1, 0.2, 0.2, 0.6, 1, 0.4), jurusan: ["manajemen", "komunikasi"] },
  { id: "jurnalis", nama: "Jurnalis", deskripsi: "Meliput, menulis, dan menyajikan berita.", profil: v(0.1, 0.6, 0.9, 0.5, 0.6, 0.2), jurusan: ["komunikasi", "sastra"] },
  { id: "pr", nama: "Public Relations", deskripsi: "Membangun citra dan komunikasi organisasi dengan publik.", profil: v(0.1, 0.2, 0.7, 0.8, 0.9, 0.3), jurusan: ["komunikasi"] },
  { id: "content-creator", nama: "Content Creator", deskripsi: "Membuat konten kreatif untuk media sosial dan platform digital.", profil: v(0.2, 0.2, 1, 0.5, 0.7, 0.1), jurusan: ["komunikasi", "desain"] },
  { id: "desainer-grafis", nama: "Desainer Grafis", deskripsi: "Membuat karya visual untuk kebutuhan komunikasi dan branding.", profil: v(0.4, 0.2, 1, 0.2, 0.3, 0.2), jurusan: ["desain"] },
  { id: "arsitek", nama: "Arsitek", deskripsi: "Merancang bangunan yang fungsional dan estetis.", profil: v(0.6, 0.8, 0.9, 0.2, 0.4, 0.4), jurusan: ["teknik-sipil", "desain"] },
  { id: "insinyur-sipil", nama: "Insinyur Sipil", deskripsi: "Merancang dan mengawasi pembangunan infrastruktur.", profil: v(0.9, 0.9, 0.2, 0.1, 0.4, 0.6), jurusan: ["teknik-sipil"] },
  { id: "insinyur-mesin", nama: "Insinyur Mesin", deskripsi: "Merancang, menguji, dan memelihara mesin serta sistem mekanis.", profil: v(1, 0.9, 0.2, 0.1, 0.2, 0.5), jurusan: ["teknik-mesin"] },
  { id: "teknisi", nama: "Teknisi / Mekanik", deskripsi: "Memasang, memperbaiki, dan merawat peralatan teknis.", profil: v(1, 0.4, 0.1, 0.2, 0.2, 0.5), jurusan: ["teknik-mesin"] },
  { id: "admin", nama: "Staf Administrasi", deskripsi: "Mengelola dokumen, jadwal, dan operasional kantor.", profil: v(0.1, 0.1, 0.1, 0.4, 0.3, 1), jurusan: ["manajemen", "akuntansi"] },
  { id: "pengacara", nama: "Pengacara", deskripsi: "Memberi nasihat hukum dan mewakili klien dalam perkara.", profil: v(0.1, 0.7, 0.4, 0.5, 0.9, 0.5), jurusan: ["hukum"] },
  { id: "peneliti", nama: "Peneliti / Ilmuwan", deskripsi: "Melakukan riset untuk menghasilkan pengetahuan baru.", profil: v(0.5, 1, 0.4, 0.2, 0.2, 0.5), jurusan: ["sains", "kedokteran", "farmasi"] },
  { id: "supply-chain", nama: "Supply Chain Analyst", deskripsi: "Mengatur alur pengadaan, gudang, dan distribusi barang.", profil: v(0.4, 0.5, 0.1, 0.2, 0.8, 0.9), jurusan: ["manajemen", "teknik-mesin"] },
];
