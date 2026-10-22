// Dummy data untuk MVP Dashboard – belum terhubung ke database.
// Lihat prd.md bagian 19 "Data Dummy".

export const dashboardData = {
  totalAlumni: 428,
  confirmed: 312,
  unverified: 116,
  continuingEducation: 256,
  universities: 86,
};

export const kpiCards = [
  {
    label: "Total Alumni",
    value: "428",
    caption: "Semua angkatan",
    icon: "users" as const,
  },
  {
    label: "Melanjutkan ke PT",
    value: "256",
    caption: "59,81% dari total alumni",
    icon: "graduation" as const,
  },
  {
    label: "Perguruan Tinggi",
    value: "86",
    caption: "86 tujuan berbeda",
    icon: "university" as const,
  },
];

export const statusAlumni = [
  {
    name: "Melanjutkan ke Perguruan Tinggi",
    value: 256,
    pct: 59.81,
    color: "#22c55e",
  },
  { name: "Menunggu Hasil Seleksi", value: 38, pct: 8.88, color: "#38bdf8" },
  { name: "Gap Year", value: 32, pct: 7.48, color: "#fbbf24" },
  { name: "Bekerja", value: 28, pct: 6.54, color: "#a78bfa" },
  { name: "Berwirausaha", value: 12, pct: 2.8, color: "#fb923c" },
  { name: "Mengikuti Pelatihan", value: 9, pct: 2.1, color: "#f472b6" },
  { name: "Belum Melanjutkan", value: 26, pct: 6.07, color: "#818cf8" },
  { name: "Tidak Dapat Dihubungi", value: 17, pct: 3.97, color: "#ef4444" },
  { name: "Status Belum Diketahui", value: 10, pct: 2.33, color: "#cbd5e1" },
];

export const trendAlumni = [
  { year: "2020/2021", jumlah: 150, persentase: 51.3 },
  { year: "2021/2022", jumlah: 164, persentase: 55.6 },
  { year: "2022/2023", jumlah: 183, persentase: 58.4 },
  { year: "2023/2024", jumlah: 212, persentase: 61.4 },
  { year: "2024/2025", jumlah: 256, persentase: 59.81 },
];

export const topUniversities = [
  { name: "Universitas Indonesia", value: 32, pct: 12.5 },
  { name: "Universitas Gadjah Mada", value: 28, pct: 10.94 },
  { name: "Institut Teknologi Bandung", value: 24, pct: 9.38 },
  { name: "Universitas Diponegoro", value: 21, pct: 8.2 },
  { name: "Universitas Brawijaya", value: 18, pct: 7.03 },
];

export const topStudyPrograms = [
  { name: "Manajemen", value: 28, pct: 10.94 },
  { name: "Teknik Informatika", value: 26, pct: 10.16 },
  { name: "Psikologi", value: 20, pct: 7.81 },
  { name: "Teknik Sipil", value: 17, pct: 6.64 },
  { name: "Kedokteran", value: 15, pct: 5.86 },
];

export const admissionChannels = [
  { name: "SNBP", value: 104, pct: 40.63, color: "#22c55e" },
  { name: "SNBT", value: 98, pct: 38.28, color: "#3b82f6" },
  { name: "Mandiri", value: 42, pct: 16.41, color: "#fbbf24" },
  { name: "Kedinasan", value: 8, pct: 3.13, color: "#a78bfa" },
  { name: "Lainnya", value: 4, pct: 1.56, color: "#94a3b8" },
];

export const filterOptions = {
  tahunLulus: ["2024/2025", "2023/2024", "2022/2023", "2021/2022", "2020/2021"],
  sekolah: ["SMA Negeri 1"],
  periodeData: ["01 Jan - 31 Mei 2025", "01 Jun - 31 Des 2024"],
};
