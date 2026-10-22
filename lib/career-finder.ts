import {
  kelompokJurusan,
  pertanyaanMinat,
  profilKarier,
  riasecOrder,
  type KelompokJurusan,
  type ProfilKarier,
  type RiasecType,
  type RiasecVector,
} from "@/data/riasec";

// Porsi skor akhir: minat dari tes vs kecocokan dengan jurusan kuliah.
export const BOBOT_MINAT = 0.7;
export const BOBOT_JURUSAN = 0.3;
export const JUMLAH_REKOMENDASI = 5;

// Skor tiap tipe 0–1 dari jawaban skala 1–5 (5 butir per tipe).
export function skorRiasec(jawaban: Record<number, number>): RiasecVector {
  const total = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
  const jumlah = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
  for (const p of pertanyaanMinat) {
    const nilai = jawaban[p.id];
    if (nilai === undefined) continue;
    total[p.tipe] += nilai - 1;
    jumlah[p.tipe] += 1;
  }
  return Object.fromEntries(
    riasecOrder.map((t) => [t, jumlah[t] ? total[t] / (jumlah[t] * 4) : 0]),
  ) as RiasecVector;
}

// Kode Holland: tiga tipe dengan skor tertinggi, misalnya "ISC".
export function kodeHolland(skor: RiasecVector, panjang = 3): RiasecType[] {
  return [...riasecOrder].sort((a, b) => skor[b] - skor[a]).slice(0, panjang);
}

// Korelasi Pearson antara dua profil RIASEC (-1..1). Dipakai sebagai ukuran kemiripan bentuk
// profil, bukan tinggi-rendahnya skor, sehingga orang yang memberi nilai tinggi untuk semua
// butir tidak otomatis cocok ke semua karier.
function korelasi(a: RiasecVector, b: RiasecVector) {
  const xs = riasecOrder.map((t) => a[t]);
  const ys = riasecOrder.map((t) => b[t]);
  const mx = xs.reduce((s, x) => s + x, 0) / xs.length;
  const my = ys.reduce((s, y) => s + y, 0) / ys.length;
  let sxy = 0;
  let sxx = 0;
  let syy = 0;
  xs.forEach((x, i) => {
    sxy += (x - mx) * (ys[i] - my);
    sxx += (x - mx) ** 2;
    syy += (ys[i] - my) ** 2;
  });
  if (sxx === 0 || syy === 0) return 0;
  return sxy / Math.sqrt(sxx * syy);
}

const keSkala01 = (r: number) => (r + 1) / 2;

export function cariKelompokJurusan(programStudi: string): KelompokJurusan | undefined {
  const teks = programStudi.toLowerCase();
  if (!teks.trim()) return undefined;
  return kelompokJurusan.find((k) => k.kataKunci.some((kata) => teks.includes(kata)));
}

export type Rekomendasi = {
  karier: ProfilKarier;
  skor: number;
  skorMinat: number;
  // null bila jurusan tidak diketahui.
  skorJurusan: number | null;
  jurusanSesuai: boolean;
};

// Rekomendasi karier dengan pendekatan nearest-neighbor: profil minat siswa dibandingkan dengan
// profil RIASEC setiap karier, lalu dipilih yang paling mirip. Bila jurusan kuliah diketahui,
// kemiripan dengan profil jurusan ikut dihitung, dan karier yang memang jalur umum jurusan
// tersebut mendapat nilai jurusan penuh.
export function rekomendasiKarier(
  skor: RiasecVector,
  jurusan: KelompokJurusan | undefined,
  jumlah = JUMLAH_REKOMENDASI,
): Rekomendasi[] {
  return profilKarier
    .map((karier) => {
      const skorMinat = keSkala01(korelasi(skor, karier.profil));
      const jurusanSesuai = !!jurusan && karier.jurusan.includes(jurusan.id);
      const skorJurusan = jurusan
        ? jurusanSesuai
          ? 1
          : keSkala01(korelasi(jurusan.profil, karier.profil)) * 0.8
        : null;
      const skorAkhir =
        skorJurusan === null ? skorMinat : BOBOT_MINAT * skorMinat + BOBOT_JURUSAN * skorJurusan;
      return { karier, skor: skorAkhir, skorMinat, skorJurusan, jurusanSesuai };
    })
    .sort((a, b) => b.skor - a.skor)
    .slice(0, jumlah);
}

// Profil yang hampir rata (selisih skor tertinggi dan terendah kecil) sulit dibedakan,
// sehingga hasilnya perlu dibaca dengan hati-hati.
export function profilRata(skor: RiasecVector) {
  const nilai = riasecOrder.map((t) => skor[t]);
  return Math.max(...nilai) - Math.min(...nilai) < 0.15;
}
