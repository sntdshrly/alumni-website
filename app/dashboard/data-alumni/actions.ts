"use server";

import { eq, inArray } from "drizzle-orm";
import { refresh } from "next/cache";
import { db, schema } from "@/lib/db";
import type { Alumni } from "@/data/alumni";
import { akunAdmin, sesiBerakhir, tidakBerhak, type HasilAksi } from "@/lib/aksi-server";
import { bolehAksesSekolah } from "@/lib/session";

function pesanGagal(e: unknown): HasilAksi {
  const pesan = String((e as { message?: string })?.message ?? "");
  if (pesan.includes("duplicate") || pesan.includes("unique")) {
    return { error: "NIK sudah terdaftar pada alumni lain." };
  }
  return { error: "Gagal menyimpan data alumni." };
}

async function sekolahTerdaftar(nama: string) {
  const [s] = await db.select({ nama: schema.sekolah.nama }).from(schema.sekolah).where(eq(schema.sekolah.nama, nama));
  return !!s;
}

// nikLama dipakai sebagai kunci karena NIK sendiri boleh dikoreksi admin.
export async function simpanAlumni(nikLama: string, data: Alumni): Promise<HasilAksi> {
  const account = await akunAdmin();
  if (!account) return sesiBerakhir;
  const [lama] = await db
    .select({ sekolah: schema.alumni.sekolah })
    .from(schema.alumni)
    .where(eq(schema.alumni.nik, nikLama));
  if (!lama) return { error: "Data alumni tidak ditemukan." };
  // Admin Sekolah tidak boleh mengubah alumni sekolah lain, maupun memindahkannya ke sekolah lain.
  if (!bolehAksesSekolah(account, lama.sekolah) || !bolehAksesSekolah(account, data.sekolah)) {
    return tidakBerhak;
  }
  if (!(await sekolahTerdaftar(data.sekolah))) return { error: "Sekolah tidak terdaftar." };
  try {
    await db.update(schema.alumni).set(data).where(eq(schema.alumni.nik, nikLama));
  } catch (e) {
    return pesanGagal(e);
  }
  refresh();
  return { success: "Data alumni berhasil disimpan." };
}

export async function tambahAlumni(data: Alumni[]): Promise<HasilAksi> {
  const account = await akunAdmin();
  if (!account) return sesiBerakhir;
  if (!data.length) return { success: "Tidak ada data untuk ditambahkan." };
  if (data.some((a) => !bolehAksesSekolah(account, a.sekolah))) {
    return { error: "Anda hanya dapat menambahkan alumni untuk sekolah Anda sendiri." };
  }
  const namaSekolah = [...new Set(data.map((a) => a.sekolah))];
  const terdaftar = await db
    .select({ nama: schema.sekolah.nama })
    .from(schema.sekolah)
    .where(inArray(schema.sekolah.nama, namaSekolah));
  if (terdaftar.length !== namaSekolah.length) return { error: "Ada sekolah yang tidak terdaftar." };
  try {
    // Alumni baru belum punya akun portal, jadi passwordHash dibiarkan kosong.
    await db.insert(schema.alumni).values(data.map((a) => ({ ...a, passwordHash: null })));
  } catch (e) {
    return pesanGagal(e);
  }
  refresh();
  return { success: `${data.length} alumni berhasil ditambahkan.` };
}

export async function hapusAlumni(nik: string): Promise<HasilAksi> {
  const account = await akunAdmin();
  if (!account) return sesiBerakhir;
  const [lama] = await db.select({ sekolah: schema.alumni.sekolah }).from(schema.alumni).where(eq(schema.alumni.nik, nik));
  if (!lama) return { error: "Data alumni tidak ditemukan." };
  if (!bolehAksesSekolah(account, lama.sekolah)) return tidakBerhak;
  await db.delete(schema.alumni).where(eq(schema.alumni.nik, nik));
  refresh();
  return { success: "Data alumni berhasil dihapus." };
}

// Dipakai menu Verifikasi Data: hanya mengubah status validasi, pemeriksa, dan catatan.
export async function verifikasiAlumni(
  nik: string,
  hasil: Pick<Alumni, "validasi" | "pemeriksa" | "catatanValidasi">,
): Promise<HasilAksi> {
  const account = await akunAdmin();
  if (!account) return sesiBerakhir;
  const [lama] = await db.select({ sekolah: schema.alumni.sekolah }).from(schema.alumni).where(eq(schema.alumni.nik, nik));
  if (!lama) return { error: "Data alumni tidak ditemukan." };
  if (!bolehAksesSekolah(account, lama.sekolah)) return tidakBerhak;
  await db
    .update(schema.alumni)
    .set({ validasi: hasil.validasi, pemeriksa: hasil.pemeriksa, catatanValidasi: hasil.catatanValidasi })
    .where(eq(schema.alumni.nik, nik));
  refresh();
  return { success: "Status verifikasi berhasil disimpan." };
}
