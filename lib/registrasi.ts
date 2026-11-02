import {
  isStatusBekerja,
  isStatusKuliah,
  statusPilihanAlumni,
  type Alumni,
  type StatusSetelahLulus,
} from "@/data/alumni";

// Biodata yang diisi pendaftar (lewat Register atau Google). Saat disetujui admin, biodata ini
// langsung menjadi data alumni baru.
export type BiodataPendaftaran = Pick<
  Alumni,
  | "nik"
  | "nisn"
  | "kelas"
  | "tahunLulus"
  | "telepon"
  | "statusSetelahLulus"
  | "perguruanTinggiId"
  | "programStudi"
  | "jabatan"
  | "tempatKerja"
>;

export function bacaBiodata(formData: FormData): BiodataPendaftaran {
  const teks = (key: string) => String(formData.get(key) ?? "").trim();
  const status = teks("statusSetelahLulus") as StatusSetelahLulus;
  const kuliah = isStatusKuliah(status);
  const kerja = isStatusBekerja(status);
  return {
    nik: teks("nik").replace(/\D/g, ""),
    nisn: teks("nisn").replace(/\D/g, ""),
    kelas: teks("kelas"),
    tahunLulus: Number(teks("tahunLulus")),
    telepon: teks("telepon"),
    statusSetelahLulus: status,
    perguruanTinggiId: kuliah ? teks("perguruanTinggiId") : "",
    programStudi: kuliah ? teks("programStudi") : "",
    jabatan: kerja ? teks("jabatan") : "",
    tempatKerja: kerja ? teks("tempatKerja") : "",
  };
}

// Mengembalikan pesan error pertama, atau string kosong bila biodata valid.
export function validasiBiodata(b: BiodataPendaftaran, tahunSekarang = new Date().getFullYear()) {
  if (!/^\d{16}$/.test(b.nik)) return "NIK must be 16 digits.";
  if (!/^\d{10}$/.test(b.nisn)) return "NISN must be 10 digits.";
  if (!b.kelas) return "Class is required.";
  if (!Number.isInteger(b.tahunLulus) || b.tahunLulus < 1990 || b.tahunLulus > tahunSekarang + 1) {
    return "Please enter a valid graduation year.";
  }
  if (!/^[0-9+\-\s]{8,}$/.test(b.telepon)) return "Please enter a valid phone number.";
  if (!statusPilihanAlumni.includes(b.statusSetelahLulus)) return "Please select your current status.";
  if (isStatusKuliah(b.statusSetelahLulus) && (!b.perguruanTinggiId || !b.programStudi)) {
    return "Please select your university and fill in your study program.";
  }
  if (isStatusBekerja(b.statusSetelahLulus) && (!b.jabatan || !b.tempatKerja)) {
    return "Please fill in your job or business details.";
  }
  return "";
}
