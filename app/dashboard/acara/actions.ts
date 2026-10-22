"use server";

import { refresh, revalidatePath } from "next/cache";
import { jenisAcaraOptions, type JenisAcara } from "@/data/acara";
import { sekolahList } from "@/data/sekolah";
import {
  createAcara,
  deleteAcara,
  findAcara,
  totalPeserta,
  updateAcara,
  type AcaraInput,
} from "@/lib/acara-store";
import { inputWibToIso } from "@/lib/acara-format";
import { getCurrentAccount } from "@/lib/session";

export type AcaraFormValues = {
  judul: string;
  jenis: string;
  sekolah: string;
  // Nilai <input type="datetime-local">, diisi dalam WIB.
  tanggal: string;
  lokasi: string;
  deskripsi: string;
  kuota: number;
};

export type AcaraActionResult = { error?: string; success?: string };

async function pastikanAdmin() {
  const account = await getCurrentAccount();
  return account?.role === "admin";
}

function validasi(values: AcaraFormValues): { error: string } | { input: AcaraInput } {
  const judul = values.judul.trim();
  if (judul.length < 5) return { error: "Judul acara minimal 5 karakter." };
  if (!jenisAcaraOptions.includes(values.jenis as JenisAcara)) return { error: "Pilih jenis acara." };
  if (!sekolahList.some((s) => s.nama === values.sekolah)) return { error: "Pilih sekolah penyelenggara." };
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(values.tanggal)) return { error: "Isi tanggal dan jam acara." };
  if (!values.lokasi.trim()) return { error: "Lokasi acara wajib diisi." };
  if (!values.deskripsi.trim()) return { error: "Deskripsi acara wajib diisi." };
  if (!Number.isInteger(values.kuota) || values.kuota < 1) return { error: "Kuota minimal 1 peserta." };
  return {
    input: {
      judul,
      jenis: values.jenis as JenisAcara,
      sekolah: values.sekolah,
      tanggal: inputWibToIso(values.tanggal),
      lokasi: values.lokasi.trim(),
      deskripsi: values.deskripsi.trim(),
      kuota: values.kuota,
    },
  };
}

// Admin dan portal alumni sama-sama menampilkan acara, jadi keduanya disegarkan.
function segarkan() {
  revalidatePath("/dashboard/acara");
  revalidatePath("/alumni/jaringan");
  refresh();
}

export async function simpanAcara(id: string | null, values: AcaraFormValues): Promise<AcaraActionResult> {
  if (!(await pastikanAdmin())) return { error: "Hanya admin yang dapat mengelola acara." };
  const hasil = validasi(values);
  if ("error" in hasil) return hasil;

  if (id) {
    const lama = findAcara(id);
    if (!lama) return { error: "Acara tidak ditemukan." };
    if (hasil.input.kuota < totalPeserta(lama)) {
      return { error: `Kuota tidak boleh kurang dari jumlah peserta saat ini (${totalPeserta(lama)}).` };
    }
    updateAcara(id, hasil.input);
    segarkan();
    return { success: "Perubahan acara berhasil disimpan." };
  }

  createAcara(hasil.input);
  segarkan();
  return { success: "Acara baru berhasil ditambahkan." };
}

export async function hapusAcara(id: string): Promise<AcaraActionResult> {
  if (!(await pastikanAdmin())) return { error: "Hanya admin yang dapat mengelola acara." };
  if (!deleteAcara(id)) return { error: "Acara tidak ditemukan." };
  segarkan();
  return { success: "Acara berhasil dihapus." };
}
