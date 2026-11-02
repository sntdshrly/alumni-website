"use server";

import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import type { Sekolah } from "@/data/sekolah";
import { akunAdmin, isSuperAdmin, sesiBerakhir, tidakBerhak, type HasilAksi } from "@/lib/aksi-server";
import { bolehAksesSekolah } from "@/lib/session";

function pesanDuplikat(e: unknown): HasilAksi {
  const pesan = String((e as { message?: string })?.message ?? "");
  if (pesan.includes("npsn")) return { error: "NPSN sudah dipakai sekolah lain." };
  if (pesan.includes("nama")) return { error: "Nama sekolah sudah terdaftar." };
  return { error: "Gagal menyimpan data sekolah." };
}

// Admin Sekolah hanya boleh mengubah profil sekolahnya sendiri; nama, status, dan jumlah alumni
// tetap mengikuti data yang tersimpan.
export async function ubahSekolah(data: Sekolah): Promise<HasilAksi> {
  const account = await akunAdmin();
  if (!account) return sesiBerakhir;
  const [lama] = await db.select().from(schema.sekolah).where(eq(schema.sekolah.id, data.id));
  if (!lama || !bolehAksesSekolah(account, lama.nama)) return tidakBerhak;

  const superAdmin = isSuperAdmin(account);
  const perubahan = {
    kepalaSekolah: data.kepalaSekolah,
    lokasi: data.lokasi,
    npsn: data.npsn,
    jenisSekolah: data.jenisSekolah,
    email: data.email,
    telepon: data.telepon,
    tahunBergabung: data.tahunBergabung,
    terakhirDiperbarui: data.terakhirDiperbarui,
    status: superAdmin ? data.status : lama.status,
    perluPembaruan: superAdmin ? data.perluPembaruan : lama.perluPembaruan,
  };
  try {
    await db.update(schema.sekolah).set(perubahan).where(eq(schema.sekolah.id, data.id));
  } catch (e) {
    return pesanDuplikat(e);
  }
  return { success: "Data sekolah berhasil disimpan." };
}

export async function tambahSekolah(data: Sekolah): Promise<HasilAksi> {
  const account = await akunAdmin();
  if (!account) return sesiBerakhir;
  if (!isSuperAdmin(account)) return tidakBerhak;
  try {
    await db.insert(schema.sekolah).values({ ...data, alumni: 0 });
  } catch (e) {
    return pesanDuplikat(e);
  }
  return { success: "Sekolah baru berhasil ditambahkan." };
}

export async function imporSekolah(data: Sekolah[]): Promise<HasilAksi> {
  const account = await akunAdmin();
  if (!account) return sesiBerakhir;
  if (!isSuperAdmin(account)) return tidakBerhak;
  if (!data.length) return { success: "Tidak ada data untuk diimpor." };
  try {
    await db.insert(schema.sekolah).values(data.map((s) => ({ ...s, alumni: 0 })));
  } catch (e) {
    return pesanDuplikat(e);
  }
  return { success: `${data.length} sekolah berhasil diimpor.` };
}

export async function hapusSekolah(id: string): Promise<HasilAksi> {
  const account = await akunAdmin();
  if (!account) return sesiBerakhir;
  if (!isSuperAdmin(account)) return tidakBerhak;
  const [lama] = await db.select().from(schema.sekolah).where(eq(schema.sekolah.id, id));
  if (!lama) return { error: "Sekolah tidak ditemukan." };
  const [alumniAda] = await db
    .select({ nik: schema.alumni.nik })
    .from(schema.alumni)
    .where(eq(schema.alumni.sekolah, lama.nama))
    .limit(1);
  if (alumniAda) return { error: "Sekolah masih memiliki data alumni, jadi tidak dapat dihapus." };
  await db.delete(schema.sekolah).where(eq(schema.sekolah.id, id));
  return { success: "Sekolah berhasil dihapus." };
}
