"use server";

import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import type { PerguruanTinggi } from "@/data/perguruan-tinggi";
import { akunAdmin, isSuperAdmin, sesiBerakhir, tidakBerhak, type HasilAksi } from "@/lib/aksi-server";

// Data perguruan tinggi dipakai bersama semua sekolah, jadi hanya Super Admin yang boleh mengubahnya.
async function pastikanSuperAdmin(): Promise<HasilAksi | null> {
  const account = await akunAdmin();
  if (!account) return sesiBerakhir;
  if (!isSuperAdmin(account)) return tidakBerhak;
  return null;
}

const gagalSimpan = (e: unknown): HasilAksi =>
  String((e as { message?: string })?.message ?? "").includes("kode")
    ? { error: "Kode perguruan tinggi sudah dipakai. Muat ulang halaman lalu coba lagi." }
    : { error: "Gagal menyimpan data perguruan tinggi." };

export async function ubahPerguruanTinggi(data: PerguruanTinggi): Promise<HasilAksi> {
  const ditolak = await pastikanSuperAdmin();
  if (ditolak) return ditolak;
  const { id, ...perubahan } = data;
  try {
    await db.update(schema.perguruanTinggi).set(perubahan).where(eq(schema.perguruanTinggi.id, id));
  } catch (e) {
    return gagalSimpan(e);
  }
  return { success: "Data perguruan tinggi berhasil disimpan." };
}

export async function tambahPerguruanTinggi(data: PerguruanTinggi[]): Promise<HasilAksi> {
  const ditolak = await pastikanSuperAdmin();
  if (ditolak) return ditolak;
  if (!data.length) return { success: "Tidak ada data untuk ditambahkan." };
  try {
    await db.insert(schema.perguruanTinggi).values(data);
  } catch (e) {
    return gagalSimpan(e);
  }
  return { success: `${data.length} perguruan tinggi berhasil ditambahkan.` };
}

export async function hapusPerguruanTinggi(id: string): Promise<HasilAksi> {
  const ditolak = await pastikanSuperAdmin();
  if (ditolak) return ditolak;
  const [dipakai] = await db
    .select({ nik: schema.alumni.nik })
    .from(schema.alumni)
    .where(eq(schema.alumni.perguruanTinggiId, id))
    .limit(1);
  if (dipakai) return { error: "Perguruan tinggi masih tercatat di data alumni, jadi tidak dapat dihapus." };
  await db.delete(schema.perguruanTinggi).where(eq(schema.perguruanTinggi.id, id));
  return { success: "Perguruan tinggi berhasil dihapus." };
}
