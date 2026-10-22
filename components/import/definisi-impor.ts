// Kolom template & aturan validasi impor Excel untuk Sekolah, Perguruan Tinggi, dan Alumni.
// Aturannya mengikuti form tambah data manual di masing-masing halaman.

import {
  isStatusBekerja,
  isStatusKuliah,
  kelasOptions,
  labelPekerjaan,
  statusSetelahLulusOptions,
  type Alumni,
  type StatusSetelahLulus,
} from "@/data/alumni";
import { jenisPTOptions, type JenisPT, type PerguruanTinggi } from "@/data/perguruan-tinggi";
import type { Sekolah } from "@/data/sekolah";
import type { BarisImpor, KolomImpor } from "@/lib/excel-import";
import { normalizeSocialHandle } from "@/lib/kontak";
import type { HasilValidasi } from "@/components/import/import-dialog";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const tahunSekarang = new Date().getFullYear();

// Mencocokkan isian dengan daftar pilihan tanpa memedulikan huruf besar/kecil.
function cocokkanPilihan<T extends string>(nilai: string, pilihan: readonly T[]) {
  return pilihan.find((p) => p.toLowerCase() === nilai.trim().toLowerCase());
}

function tahunValid(nilai: string) {
  const tahun = Number(nilai);
  return /^\d{4}$/.test(nilai) && tahun >= 1950 && tahun <= tahunSekarang + 1;
}

// Menjalankan validasi per baris; pesan error baris digabung menjadi satu kalimat.
function validasiBaris<T>(
  baris: BarisImpor[],
  cek: (nilai: Record<string, string>, error: string[]) => T | undefined,
): HasilValidasi<T>[] {
  return baris.map(({ nomor, nilai }) => {
    const error: string[] = [];
    const data = cek(nilai, error);
    return error.length > 0 || !data ? { nomor, error: error.join("; ") } : { nomor, data };
  });
}

// ---------------------------------------------------------------------------- Sekolah

export type SekolahImpor = Omit<Sekolah, "id" | "alumni" | "perluPembaruan" | "terakhirDiperbarui">;

export const kolomSekolah: KolomImpor[] = [
  { header: "Nama Sekolah", wajib: true, contoh: "SMA Negeri 9", keterangan: "Nama resmi sekolah." },
  { header: "NPSN", wajib: true, contoh: "20123470", teks: true, keterangan: "8 digit angka, unik untuk setiap sekolah." },
  { header: "Jenis Sekolah", wajib: true, contoh: "Negeri", keterangan: "Negeri atau Swasta." },
  { header: "Kepala Sekolah", wajib: true, contoh: "Drs. Bambang Sutrisno", keterangan: "Nama kepala sekolah saat ini." },
  { header: "Lokasi", wajib: true, contoh: "Bandung", keterangan: "Kota/kabupaten lokasi sekolah." },
  { header: "Email", wajib: true, contoh: "tu@sman9.sch.id", keterangan: "Email resmi sekolah." },
  { header: "Telepon", wajib: true, contoh: "022-555-0199", teks: true, keterangan: "Nomor telepon sekolah." },
  { header: "Tahun Bergabung", wajib: true, contoh: String(tahunSekarang), keterangan: "4 digit tahun sekolah bergabung ke sistem." },
  { header: "Status", wajib: false, contoh: "Aktif", keterangan: "Aktif atau Nonaktif. Kosong = Aktif." },
];

export function validasiSekolah(baris: BarisImpor[], existing: Sekolah[]) {
  const npsnTerpakai = new Set(existing.map((s) => s.npsn));
  return validasiBaris<SekolahImpor>(baris, (v, error) => {
    const npsn = v["NPSN"].replace(/\s/g, "");
    const jenis = cocokkanPilihan(v["Jenis Sekolah"], ["Negeri", "Swasta"] as const);
    const status = v["Status"] ? cocokkanPilihan(v["Status"], ["Aktif", "Nonaktif"] as const) : "Aktif";

    if (!v["Nama Sekolah"]) error.push("Nama Sekolah wajib diisi");
    if (!/^\d{8}$/.test(npsn)) error.push("NPSN harus 8 digit angka");
    else if (npsnTerpakai.has(npsn)) error.push(`NPSN ${npsn} sudah terdaftar`);
    if (!jenis) error.push("Jenis Sekolah harus Negeri atau Swasta");
    if (!v["Kepala Sekolah"]) error.push("Kepala Sekolah wajib diisi");
    if (!v["Lokasi"]) error.push("Lokasi wajib diisi");
    if (!emailPattern.test(v["Email"])) error.push("Format Email tidak valid");
    if (!v["Telepon"]) error.push("Telepon wajib diisi");
    if (!tahunValid(v["Tahun Bergabung"])) error.push("Tahun Bergabung harus 4 digit tahun");
    if (!status) error.push("Status harus Aktif atau Nonaktif");
    if (error.length > 0 || !jenis || !status) return undefined;

    // NPSN dari baris yang lolos dicatat agar duplikat di baris berikutnya ikut tertolak.
    npsnTerpakai.add(npsn);
    return {
      nama: v["Nama Sekolah"],
      npsn,
      jenisSekolah: jenis,
      kepalaSekolah: v["Kepala Sekolah"],
      lokasi: v["Lokasi"],
      email: v["Email"],
      telepon: v["Telepon"],
      tahunBergabung: Number(v["Tahun Bergabung"]),
      status,
    };
  });
}

// --------------------------------------------------------------------- Perguruan Tinggi

export type PerguruanTinggiImpor = Pick<
  PerguruanTinggi,
  "nama" | "singkatan" | "jenis" | "kota" | "provinsi" | "negara" | "website" | "status"
>;

export const kolomPerguruanTinggi: KolomImpor[] = [
  { header: "Nama Perguruan Tinggi", wajib: true, contoh: "Universitas Negeri Jakarta", keterangan: "Nama resmi perguruan tinggi, tidak boleh sama dengan yang sudah ada." },
  { header: "Singkatan", wajib: true, contoh: "UNJ", keterangan: "Singkatan atau akronim." },
  { header: "Jenis", wajib: true, contoh: "Negeri", keterangan: `Salah satu: ${jenisPTOptions.join(", ")}.` },
  { header: "Kota", wajib: true, contoh: "Jakarta Timur", keterangan: "Kota lokasi kampus utama." },
  { header: "Provinsi", wajib: true, contoh: "DKI Jakarta", keterangan: "Provinsi, atau negara bagian untuk luar negeri." },
  { header: "Negara", wajib: true, contoh: "Indonesia", keterangan: "Nama negara." },
  { header: "Website", wajib: true, contoh: "unj.ac.id", keterangan: "Alamat website resmi, boleh tanpa https://." },
  { header: "Status", wajib: false, contoh: "Aktif", keterangan: "Aktif atau Nonaktif. Kosong = Aktif." },
];

export function validasiPerguruanTinggi(baris: BarisImpor[], existing: PerguruanTinggi[]) {
  const namaTerpakai = new Set(existing.map((pt) => pt.nama.toLowerCase()));
  return validasiBaris<PerguruanTinggiImpor>(baris, (v, error) => {
    const nama = v["Nama Perguruan Tinggi"];
    const jenis = cocokkanPilihan<JenisPT>(v["Jenis"], jenisPTOptions);
    const status = v["Status"] ? cocokkanPilihan(v["Status"], ["Aktif", "Nonaktif"] as const) : "Aktif";

    if (!nama) error.push("Nama Perguruan Tinggi wajib diisi");
    else if (namaTerpakai.has(nama.toLowerCase())) error.push(`"${nama}" sudah terdaftar`);
    if (!v["Singkatan"]) error.push("Singkatan wajib diisi");
    if (!jenis) error.push(`Jenis harus salah satu dari: ${jenisPTOptions.join(", ")}`);
    if (!v["Kota"]) error.push("Kota wajib diisi");
    if (!v["Provinsi"]) error.push("Provinsi wajib diisi");
    if (!v["Negara"]) error.push("Negara wajib diisi");
    if (!v["Website"]) error.push("Website wajib diisi");
    if (!status) error.push("Status harus Aktif atau Nonaktif");
    if (error.length > 0 || !jenis || !status) return undefined;

    namaTerpakai.add(nama.toLowerCase());
    return {
      nama,
      singkatan: v["Singkatan"].toUpperCase(),
      jenis,
      kota: v["Kota"],
      provinsi: v["Provinsi"],
      negara: v["Negara"],
      website: v["Website"].replace(/^https?:\/\//, ""),
      status,
    };
  });
}

// ------------------------------------------------------------------------------- Alumni

export type AlumniImpor = Omit<
  Alumni,
  | "terakhirDikonfirmasi"
  | "validasi"
  | "pemeriksa"
  | "catatanValidasi"
  | "tampilDiJaringan"
  | "bersediaMentor"
  | "bagikanEmail"
  | "bagikanTelepon"
  | "bagikanMediaSosial"
>;

export function kolomAlumni(sekolahContoh: string): KolomImpor[] {
  return [
    { header: "Nama Lengkap", wajib: true, contoh: "Rina Amelia", keterangan: "Nama lengkap sesuai data sekolah." },
    { header: "NIK", wajib: true, contoh: "3273054506070021", teks: true, keterangan: "16 digit NIK sesuai KTP, unik untuk setiap alumni." },
    { header: "NISN", wajib: true, contoh: "0071234567", teks: true, keterangan: "10 digit NISN, unik untuk setiap alumni." },
    { header: "Sekolah", wajib: true, contoh: sekolahContoh, keterangan: "Harus sama persis dengan nama sekolah yang terdaftar di menu Sekolah." },
    { header: "Kelas", wajib: true, contoh: kelasOptions[0], keterangan: `Kelas terakhir, misalnya ${kelasOptions.slice(0, 3).join(", ")}.` },
    { header: "Tahun Lulus", wajib: true, contoh: String(tahunSekarang), keterangan: "4 digit tahun lulus." },
    { header: "Wali Kelas", wajib: true, contoh: "Ibu Ratna Sari", keterangan: "Nama wali kelas XII." },
    { header: "Telepon", wajib: true, contoh: "081234567890", teks: true, keterangan: "Nomor HP/WhatsApp aktif." },
    { header: "Email", wajib: true, contoh: "rina.amelia@gmail.com", keterangan: "Email aktif alumni." },
    { header: "LinkedIn", wajib: false, contoh: "rina-amelia", keterangan: "Username atau link profil LinkedIn." },
    { header: "Instagram", wajib: false, contoh: "rina.amelia", keterangan: "Username atau link profil Instagram." },
    { header: "TikTok", wajib: false, contoh: "", keterangan: "Username atau link profil TikTok." },
    { header: "Status Setelah Lulus", wajib: true, contoh: "Aktif Kuliah", keterangan: `Salah satu: ${statusSetelahLulusOptions.join(", ")}.` },
    { header: "Perguruan Tinggi", wajib: false, contoh: "Universitas Indonesia", keterangan: "Wajib untuk status Aktif Kuliah, Diterima, atau Daftar Ulang. Isi nama atau singkatan yang terdaftar di menu Perguruan Tinggi." },
    { header: "Program Studi", wajib: false, contoh: "S1 Manajemen", keterangan: "Program studi, untuk status kuliah." },
    { header: "Jabatan / Bidang Usaha", wajib: false, contoh: "", keterangan: "Wajib untuk status Bekerja (jabatan) atau Wirausaha (bidang usaha)." },
    { header: "Tempat Bekerja / Nama Usaha", wajib: false, contoh: "", keterangan: "Wajib untuk status Bekerja (tempat bekerja) atau Wirausaha (nama usaha)." },
  ];
}

export function validasiAlumni(
  baris: BarisImpor[],
  existing: Alumni[],
  sekolahOptions: string[],
  perguruanTinggi: PerguruanTinggi[],
) {
  const nikTerpakai = new Set(existing.map((a) => a.nik));
  const nisnTerpakai = new Set(existing.map((a) => a.nisn));

  return validasiBaris<AlumniImpor>(baris, (v, error) => {
    const nik = v["NIK"].replace(/\s/g, "");
    const nisn = v["NISN"].replace(/\s/g, "");
    const sekolah = cocokkanPilihan(v["Sekolah"], sekolahOptions);
    const status = cocokkanPilihan<StatusSetelahLulus>(v["Status Setelah Lulus"], statusSetelahLulusOptions);
    const ptIsian = v["Perguruan Tinggi"].toLowerCase();
    const pt = ptIsian
      ? perguruanTinggi.find((p) => p.nama.toLowerCase() === ptIsian || p.singkatan.toLowerCase() === ptIsian)
      : undefined;

    if (!v["Nama Lengkap"]) error.push("Nama Lengkap wajib diisi");
    if (!/^\d{16}$/.test(nik)) {
      error.push(
        /e\+/i.test(v["NIK"])
          ? "NIK terbaca sebagai angka ilmiah; format kolom NIK sebagai Teks lalu ketik ulang"
          : "NIK harus 16 digit angka",
      );
    } else if (nikTerpakai.has(nik)) error.push(`NIK ${nik} sudah terdaftar`);
    if (!/^\d{10}$/.test(nisn)) error.push("NISN harus 10 digit angka (format kolom sebagai Teks agar angka 0 di depan tidak hilang)");
    else if (nisnTerpakai.has(nisn)) error.push(`NISN ${nisn} sudah terdaftar`);
    if (!sekolah) error.push(`Sekolah "${v["Sekolah"]}" tidak terdaftar`);
    if (!v["Kelas"]) error.push("Kelas wajib diisi");
    if (!tahunValid(v["Tahun Lulus"])) error.push("Tahun Lulus harus 4 digit tahun");
    if (!v["Wali Kelas"]) error.push("Wali Kelas wajib diisi");
    if (!v["Telepon"]) error.push("Telepon wajib diisi");
    if (!emailPattern.test(v["Email"])) error.push("Format Email tidak valid");
    if (!status) error.push("Status Setelah Lulus tidak sesuai pilihan");

    if (status && isStatusKuliah(status)) {
      if (!ptIsian) error.push(`Perguruan Tinggi wajib diisi untuk status "${status}"`);
      else if (!pt) error.push(`Perguruan Tinggi "${v["Perguruan Tinggi"]}" tidak terdaftar`);
    }
    if (status && isStatusBekerja(status)) {
      const label = labelPekerjaan(status);
      if (!v["Jabatan / Bidang Usaha"]) error.push(`${label.jabatan} wajib diisi untuk status "${status}"`);
      if (!v["Tempat Bekerja / Nama Usaha"]) error.push(`${label.tempat} wajib diisi untuk status "${status}"`);
    }
    if (error.length > 0 || !sekolah || !status) return undefined;

    nikTerpakai.add(nik);
    nisnTerpakai.add(nisn);
    const kuliah = isStatusKuliah(status);
    const kerja = isStatusBekerja(status);
    return {
      nama: v["Nama Lengkap"],
      nik,
      nisn,
      sekolah,
      kelas: v["Kelas"],
      tahunLulus: Number(v["Tahun Lulus"]),
      waliKelas: v["Wali Kelas"],
      telepon: v["Telepon"].replace(/[^\d\s+-]/g, ""),
      email: v["Email"],
      linkedin: normalizeSocialHandle("linkedin", v["LinkedIn"]),
      instagram: normalizeSocialHandle("instagram", v["Instagram"]),
      tiktok: normalizeSocialHandle("tiktok", v["TikTok"]),
      statusSetelahLulus: status,
      perguruanTinggiId: kuliah && pt ? pt.id : "",
      programStudi: kuliah ? v["Program Studi"] : "",
      jabatan: kerja ? v["Jabatan / Bidang Usaha"] : "",
      tempatKerja: kerja ? v["Tempat Bekerja / Nama Usaha"] : "",
    };
  });
}
