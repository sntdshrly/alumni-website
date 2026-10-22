// Template & pembaca file Excel untuk impor data massal (Sekolah, Perguruan Tinggi, Alumni).
// SheetJS dimuat dinamis agar tidak membebani halaman sampai fitur impor dipakai.

export type KolomImpor = {
  // Judul kolom di template; kolom wajib diberi tanda * otomatis.
  header: string;
  wajib: boolean;
  contoh: string;
  // Penjelasan & nilai yang diperbolehkan, ditampilkan di sheet "Petunjuk".
  keterangan: string;
  // Kolom angka panjang (NIK, NISN, telepon) diformat sebagai Teks agar Excel tidak membulatkan
  // angka di atas 15 digit atau membuang angka 0 di depan.
  teks?: boolean;
};

export type BarisImpor = {
  // Nomor baris di Excel (baris 1 = header), dipakai di pesan error.
  nomor: number;
  nilai: Record<string, string>;
};

const BARIS_TEKS_KOSONG = 1000;

function judulKolom(kolom: KolomImpor) {
  return kolom.wajib ? `${kolom.header}*` : kolom.header;
}

// Header dibandingkan tanpa tanda *, spasi berlebih, dan huruf besar/kecil.
export function normalisasiHeader(header: string) {
  return header.replace(/\*/g, "").replace(/\s+/g, " ").trim().toLowerCase();
}

// Membuat workbook template: sheet "Data" (header + 1 baris contoh) dan sheet "Petunjuk".
export async function buatTemplate(kolom: KolomImpor[], catatan: string[] = []) {
  const XLSX = await import("xlsx");

  const data = XLSX.utils.aoa_to_sheet([kolom.map(judulKolom), kolom.map((k) => k.contoh)]);
  data["!cols"] = kolom.map((k) => ({ wch: Math.max(14, judulKolom(k).length + 2, k.contoh.length + 2) }));
  kolom.forEach((k, c) => {
    if (!k.teks) return;
    for (let r = 1; r <= BARIS_TEKS_KOSONG; r++) {
      const ref = XLSX.utils.encode_cell({ r, c });
      data[ref] = data[ref] ? { ...data[ref], t: "s", z: "@" } : { t: "s", v: "", z: "@" };
    }
  });
  data["!ref"] = XLSX.utils.encode_range({
    s: { r: 0, c: 0 },
    e: { r: kolom.some((k) => k.teks) ? BARIS_TEKS_KOSONG : 1, c: kolom.length - 1 },
  });

  const petunjuk = XLSX.utils.aoa_to_sheet([
    ["Petunjuk Pengisian"],
    [],
    ["1. Isi data mulai baris ke-2 pada sheet \"Data\". Baris contoh boleh ditimpa atau dihapus."],
    ["2. Kolom bertanda * wajib diisi. Jangan mengubah atau menghapus judul kolom."],
    ["3. Satu baris = satu data. Baris yang tidak valid akan dilewati dan ditampilkan alasannya saat upload."],
    ...catatan.map((c, i) => [`${i + 4}. ${c}`]),
    [],
    ["Kolom", "Wajib", "Keterangan", "Contoh"],
    ...kolom.map((k) => [k.header, k.wajib ? "Ya" : "Tidak", k.keterangan, k.contoh]),
  ]);
  petunjuk["!cols"] = [{ wch: 28 }, { wch: 8 }, { wch: 70 }, { wch: 28 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, data, "Data");
  XLSX.utils.book_append_sheet(wb, petunjuk, "Petunjuk");
  return wb;
}

export async function unduhTemplate(namaFile: string, kolom: KolomImpor[], catatan: string[] = []) {
  const XLSX = await import("xlsx");
  XLSX.writeFile(await buatTemplate(kolom, catatan), namaFile);
}

function keTeks(nilai: unknown) {
  if (nilai === null || nilai === undefined) return "";
  if (typeof nilai === "number") return Number.isInteger(nilai) ? String(nilai) : String(nilai);
  return String(nilai).trim();
}

export type HasilBaca =
  | { error: string }
  | { baris: BarisImpor[] };

// Membaca sheet pertama (atau sheet "Data") dan mencocokkan kolom berdasarkan judul header.
export async function bacaFile(file: File, kolom: KolomImpor[]): Promise<HasilBaca> {
  const XLSX = await import("xlsx");
  let wb;
  try {
    wb = XLSX.read(await file.arrayBuffer());
  } catch {
    return { error: "File tidak dapat dibaca. Gunakan file .xlsx, .xls, atau .csv dari template." };
  }
  const sheet = wb.Sheets.Data ?? wb.Sheets[wb.SheetNames[0]];
  if (!sheet) return { error: "File tidak memiliki sheet data." };

  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: "", raw: true });
  if (rows.length === 0) return { error: "File kosong." };

  const headerFile = rows[0].map((h) => normalisasiHeader(keTeks(h)));
  const indeks = new Map(kolom.map((k) => [k.header, headerFile.indexOf(normalisasiHeader(k.header))]));
  const hilang = kolom.filter((k) => k.wajib && indeks.get(k.header) === -1).map((k) => k.header);
  if (hilang.length > 0) {
    return { error: `Kolom wajib tidak ditemukan: ${hilang.join(", ")}. Gunakan template terbaru.` };
  }

  const baris: BarisImpor[] = [];
  rows.slice(1).forEach((row, i) => {
    const nilai = Object.fromEntries(
      kolom.map((k) => {
        const idx = indeks.get(k.header) ?? -1;
        return [k.header, idx === -1 ? "" : keTeks(row[idx])];
      }),
    );
    // Lewati baris kosong (termasuk baris yang hanya diformat Teks di template).
    if (Object.values(nilai).every((v) => v === "")) return;
    baris.push({ nomor: i + 2, nilai });
  });

  if (baris.length === 0) return { error: "Tidak ada data yang diisi di file ini." };
  return { baris };
}
