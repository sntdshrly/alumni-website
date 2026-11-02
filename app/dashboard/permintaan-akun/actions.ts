"use server";

import { and, eq } from "drizzle-orm";
import { refresh } from "next/cache";
import { db, schema } from "@/lib/db";
import { pengaturanBerbagiDefault } from "@/data/alumni";
import { akunAdmin, formatHariIni, isSuperAdmin, sesiBerakhir, type HasilAksi } from "@/lib/aksi-server";
import { emailTerpakai, pesanEmailGanda } from "@/lib/data";
import { validasiBiodata } from "@/lib/registrasi";
import type { SessionAccount } from "@/lib/session";

// Admin Sekolah hanya bisa memproses permintaan untuk sekolahnya sendiri.
async function permintaanDalamJangkauan(account: SessionAccount, id: string) {
  const [p] = await db
    .select()
    .from(schema.pendaftaranAkun)
    .where(and(eq(schema.pendaftaranAkun.id, id), eq(schema.pendaftaranAkun.status, "Menunggu")));
  if (!p) return null;
  if (!isSuperAdmin(account) && p.sekolah !== account.sekolahScope) return null;
  return p;
}

const tidakDitemukan = { error: "Permintaan tidak ditemukan atau sudah diproses." };

// Menyetujui permintaan: biodata pendaftar langsung menjadi data alumni baru yang sudah tervalidasi.
export async function setujuiPermintaan(id: string): Promise<HasilAksi> {
  const account = await akunAdmin();
  if (!account) return sesiBerakhir;
  const p = await permintaanDalamJangkauan(account, id);
  if (!p) return tidakDitemukan;
  if (!p.biodata || !p.sekolah || validasiBiodata(p.biodata)) {
    return { error: "Biodata permintaan ini belum lengkap. Tolak permintaan dan minta pendaftar mendaftar ulang." };
  }
  if (await emailTerpakai(p.email, { permintaanId: p.id })) {
    return { error: "Email pendaftar sudah dipakai akun lain." };
  }
  const [nikAda] = await db
    .select({ nik: schema.alumni.nik })
    .from(schema.alumni)
    .where(eq(schema.alumni.nik, p.biodata.nik));
  if (nikAda) return { error: "NIK pendaftar sudah terdaftar di data alumni." };

  try {
    await db.insert(schema.alumni).values({
      ...p.biodata,
      nama: p.nama,
      email: p.email,
      sekolah: p.sekolah,
      waliKelas: "",
      linkedin: "",
      instagram: "",
      tiktok: "",
      terakhirDikonfirmasi: formatHariIni(),
      validasi: "Valid",
      pemeriksa: account.name,
      catatanValidasi: "",
      ...pengaturanBerbagiDefault,
      passwordHash: p.passwordHash,
    });
  } catch (e) {
    const pesan = pesanEmailGanda(e);
    if (pesan) return { error: pesan };
    throw e;
  }
  await db.update(schema.pendaftaranAkun).set({ status: "Disetujui" }).where(eq(schema.pendaftaranAkun.id, id));
  refresh();
  return { success: `${p.nama} disetujui dan sekarang bisa masuk ke portal alumni.` };
}

export async function tolakPermintaan(id: string): Promise<HasilAksi> {
  const account = await akunAdmin();
  if (!account) return sesiBerakhir;
  const p = await permintaanDalamJangkauan(account, id);
  if (!p) return tidakDitemukan;
  await db.update(schema.pendaftaranAkun).set({ status: "Ditolak" }).where(eq(schema.pendaftaranAkun.id, id));
  refresh();
  return { success: `Permintaan ${p.nama} ditolak.` };
}
