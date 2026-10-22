// Laporan Dashboard dalam satu file Excel: satu sheet untuk setiap bagian dashboard.

import {
  admissionChannels,
  dashboardData,
  kpiCards,
  statusAlumni,
  topStudyPrograms,
  topUniversities,
  trendAlumni,
} from "@/data/dashboard";

export type FilterDashboard = {
  tahunLulus: string;
  sekolah: string;
  periodeData: string;
};

const persen = (n: number) => `${n.toFixed(2).replace(".", ",")}%`;

// Membuat workbook laporan; dipisah dari unduhan agar bisa diuji.
export async function buatLaporanDashboard(filter: FilterDashboard, sekarang = new Date()) {
  const XLSX = await import("xlsx");
  const tanggal = new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(sekarang);

  const sheet = (rows: (string | number)[][], lebar: number[]) => {
    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws["!cols"] = lebar.map((wch) => ({ wch }));
    return ws;
  };

  const wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    wb,
    sheet(
      [
        ["Laporan Dashboard Alumni Tracking System"],
        ["Diunduh", `${tanggal} WIB`],
        ["Tahun Lulus", filter.tahunLulus],
        ["Sekolah", filter.sekolah],
        ["Periode Data", filter.periodeData],
        [],
        ["Indikator", "Nilai", "Keterangan"],
        ...kpiCards.map((k) => [k.label, Number(k.value), k.caption]),
        ["Alumni Terkonfirmasi", dashboardData.confirmed, ""],
        ["Alumni Belum Terverifikasi", dashboardData.unverified, ""],
      ],
      [30, 32, 30],
    ),
    "Ringkasan",
  );

  XLSX.utils.book_append_sheet(
    wb,
    sheet(
      [
        ["Status Alumni", "Jumlah", "Persentase"],
        ...statusAlumni.map((s) => [s.name, s.value, persen(s.pct)]),
        ["Total", statusAlumni.reduce((acc, s) => acc + s.value, 0), ""],
      ],
      [34, 10, 12],
    ),
    "Status Alumni",
  );

  XLSX.utils.book_append_sheet(
    wb,
    sheet(
      [
        ["Tahun Lulus", "Melanjutkan ke PT", "Persentase"],
        ...trendAlumni.map((t) => [t.year, t.jumlah, persen(t.persentase)]),
      ],
      [14, 18, 12],
    ),
    "Tren Alumni",
  );

  XLSX.utils.book_append_sheet(
    wb,
    sheet(
      [
        ["Peringkat", "Perguruan Tinggi", "Jumlah Alumni", "Persentase"],
        ...topUniversities.map((u, i) => [i + 1, u.name, u.value, persen(u.pct)]),
      ],
      [10, 32, 14, 12],
    ),
    "Perguruan Tinggi",
  );

  XLSX.utils.book_append_sheet(
    wb,
    sheet(
      [
        ["Peringkat", "Program Studi", "Jumlah Alumni", "Persentase"],
        ...topStudyPrograms.map((p, i) => [i + 1, p.name, p.value, persen(p.pct)]),
      ],
      [10, 26, 14, 12],
    ),
    "Program Studi",
  );

  XLSX.utils.book_append_sheet(
    wb,
    sheet(
      [
        ["Jalur Penerimaan", "Jumlah", "Persentase"],
        ...admissionChannels.map((a) => [a.name, a.value, persen(a.pct)]),
      ],
      [18, 10, 12],
    ),
    "Jalur Penerimaan",
  );

  const stamp = [
    sekarang.getFullYear(),
    String(sekarang.getMonth() + 1).padStart(2, "0"),
    String(sekarang.getDate()).padStart(2, "0"),
  ].join("-");
  return { wb, namaFile: `laporan-dashboard-${stamp}.xlsx` };
}

export async function unduhLaporanDashboard(filter: FilterDashboard) {
  const XLSX = await import("xlsx");
  const { wb, namaFile } = await buatLaporanDashboard(filter);
  XLSX.writeFile(wb, namaFile);
}
