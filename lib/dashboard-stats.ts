// Statistik dashboard disimpan per sekolah (tabel statistik_sekolah) lalu digabung sesuai sekolah
// yang boleh dilihat akun: satu sekolah untuk Admin Sekolah, semua sekolah untuk Super Admin.

export type ItemJumlah = { name: string; value: number; color?: string };

export type StatistikSekolah = {
  totalAlumni: number;
  terkonfirmasi: number;
  belumTerverifikasi: number;
  melanjutkanPT: number;
  // Jumlah perguruan tinggi tujuan yang berbeda.
  jumlahPT: number;
  status: ItemJumlah[];
  tren: { year: string; jumlah: number; totalLulusan: number }[];
  universitas: ItemJumlah[];
  prodi: ItemJumlah[];
  jalur: ItemJumlah[];
};

export type ItemPersen = ItemJumlah & { pct: number };

export type DashboardView = {
  totalAlumni: number;
  terkonfirmasi: number;
  belumTerverifikasi: number;
  melanjutkanPT: number;
  jumlahPT: number;
  status: ItemPersen[];
  tren: { year: string; jumlah: number; persentase: number }[];
  universitas: ItemPersen[];
  prodi: ItemPersen[];
  jalur: ItemPersen[];
};

const bulat2 = (n: number) => Math.round(n * 100) / 100;
const persenDari = (value: number, total: number) => (total ? bulat2((value / total) * 100) : 0);

// Menjumlahkan item dengan nama sama, mempertahankan urutan kemunculan pertama.
function gabungItem(lists: ItemJumlah[][]) {
  const map = new Map<string, ItemJumlah>();
  for (const list of lists) {
    for (const item of list) {
      const ada = map.get(item.name);
      if (ada) ada.value += item.value;
      else map.set(item.name, { ...item });
    }
  }
  return [...map.values()];
}

function denganPersen(items: ItemJumlah[], total: number): ItemPersen[] {
  return items.map((item) => ({ ...item, pct: persenDari(item.value, total) }));
}

const top5 = (items: ItemJumlah[]) => [...items].sort((a, b) => b.value - a.value).slice(0, 5);
const jumlahkan = (list: StatistikSekolah[], key: keyof StatistikSekolah) =>
  list.reduce((acc, s) => acc + (s[key] as number), 0);

export function gabungStatistik(list: StatistikSekolah[]): DashboardView {
  const totalAlumni = jumlahkan(list, "totalAlumni");
  const melanjutkanPT = jumlahkan(list, "melanjutkanPT");

  const trenMap = new Map<string, { jumlah: number; totalLulusan: number }>();
  for (const s of list) {
    for (const t of s.tren) {
      const ada = trenMap.get(t.year) ?? { jumlah: 0, totalLulusan: 0 };
      trenMap.set(t.year, { jumlah: ada.jumlah + t.jumlah, totalLulusan: ada.totalLulusan + t.totalLulusan });
    }
  }

  const jalur = gabungItem(list.map((s) => s.jalur));

  return {
    totalAlumni,
    terkonfirmasi: jumlahkan(list, "terkonfirmasi"),
    belumTerverifikasi: jumlahkan(list, "belumTerverifikasi"),
    melanjutkanPT,
    // Daftar lengkap PT per sekolah tidak disimpan, jadi gabungan memakai angka terbesar
    // sebagai batas bawah jumlah PT tujuan yang berbeda.
    jumlahPT: list.reduce((acc, s) => Math.max(acc, s.jumlahPT), 0),
    status: denganPersen(gabungItem(list.map((s) => s.status)), totalAlumni),
    tren: [...trenMap.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([year, t]) => ({ year, jumlah: t.jumlah, persentase: persenDari(t.jumlah, t.totalLulusan) })),
    universitas: denganPersen(top5(gabungItem(list.map((s) => s.universitas))), melanjutkanPT),
    prodi: denganPersen(top5(gabungItem(list.map((s) => s.prodi))), melanjutkanPT),
    jalur: denganPersen(jalur, jalur.reduce((acc, j) => acc + j.value, 0)),
  };
}

export const formatPersen = (n: number, digit = 2) => `${n.toFixed(digit).replace(".", ",")}%`;
