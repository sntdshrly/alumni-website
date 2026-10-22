"use server";

import { refresh, revalidatePath } from "next/cache";
import { findAcara, togglePendaftaran } from "@/lib/acara-store";
import { sekolahAlumni } from "@/lib/portal-data";
import { getCurrentAccount } from "@/lib/session";

export type DaftarAcaraResult =
  | { error: string }
  | { ikut: boolean; judul: string; tanggal: string };

// Mendaftar atau membatalkan pendaftaran acara untuk alumni yang sedang login.
export async function toggleIkutAcara(acaraId: string): Promise<DaftarAcaraResult> {
  const account = await getCurrentAccount();
  if (!account || account.role !== "alumni" || !account.alumniNik) {
    return { error: "Sesi berakhir. Silakan masuk kembali." };
  }
  // Alumni hanya boleh mendaftar acara sekolahnya sendiri.
  const acara = findAcara(acaraId);
  if (!acara || acara.sekolah !== sekolahAlumni(account)) {
    return { error: "Acara tidak ditemukan." };
  }

  const hasil = togglePendaftaran(acaraId, account.alumniNik);
  if ("error" in hasil) return { error: hasil.error };

  revalidatePath("/alumni/jaringan");
  revalidatePath("/dashboard/acara");
  refresh();
  return { ikut: hasil.ikut, judul: hasil.acara.judul, tanggal: hasil.acara.tanggal };
}
