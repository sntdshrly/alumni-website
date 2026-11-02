"use server";

import { and, eq, sql } from "drizzle-orm";
import { refresh } from "next/cache";
import { db, schema } from "@/lib/db";
import { roleLintasSekolah, SEMUA_SEKOLAH, type RolePengguna } from "@/data/pengguna";
import { akunAdmin, isSuperAdmin, sesiBerakhir, tidakBerhak, type HasilAksi } from "@/lib/aksi-server";
import { emailTerpakai } from "@/lib/data";
import { bolehAksesSekolah, type SessionAccount } from "@/lib/session";

// Permintaan dari Google belum punya sekolah, jadi hanya Super Admin yang bisa memprosesnya.
async function permintaanDalamJangkauan(account: SessionAccount, id: string) {
  const [p] = await db
    .select()
    .from(schema.pendaftaranAkun)
    .where(and(eq(schema.pendaftaranAkun.id, id), eq(schema.pendaftaranAkun.status, "Menunggu")));
  if (!p) return null;
  if (!isSuperAdmin(account) && p.sekolah !== account.sekolahScope) return null;
  return p;
}

async function tandai(id: string, status: "Disetujui" | "Ditolak") {
  await db.update(schema.pendaftaranAkun).set({ status }).where(eq(schema.pendaftaranAkun.id, id));
  refresh();
}

// Menghubungkan permintaan ke data alumni yang sudah ada: email alumni diganti dengan email
// pendaftar, dan password dari formulir Register (bila ada) dipakai untuk login.
export async function setujuiSebagaiAlumni(id: string, nik: string): Promise<HasilAksi> {
  const account = await akunAdmin();
  if (!account) return sesiBerakhir;
  const permintaan = await permintaanDalamJangkauan(account, id);
  if (!permintaan) return { error: "Permintaan tidak ditemukan atau sudah diproses." };

  const [alumni] = await db.select().from(schema.alumni).where(eq(schema.alumni.nik, nik));
  if (!alumni || !bolehAksesSekolah(account, alumni.sekolah)) return tidakBerhak;
  if (permintaan.sekolah && permintaan.sekolah !== alumni.sekolah) {
    return { error: `Pendaftar memilih ${permintaan.sekolah}, tetapi alumni ini dari ${alumni.sekolah}.` };
  }
  if (await emailTerpakai(permintaan.email, { nik })) {
    return { error: "Email pendaftar sudah dipakai akun lain." };
  }

  await db
    .update(schema.alumni)
    .set({ email: permintaan.email, passwordHash: permintaan.passwordHash ?? alumni.passwordHash })
    .where(eq(schema.alumni.nik, nik));
  await tandai(id, "Disetujui");
  return { success: `${permintaan.nama} sekarang bisa masuk sebagai alumni ${alumni.nama}.` };
}

export async function setujuiSebagaiStaf(
  id: string,
  input: { role: RolePengguna; sekolah: string },
): Promise<HasilAksi> {
  const account = await akunAdmin();
  if (!account) return sesiBerakhir;
  const permintaan = await permintaanDalamJangkauan(account, id);
  if (!permintaan) return { error: "Permintaan tidak ditemukan atau sudah diproses." };

  const lintasSekolah = roleLintasSekolah.includes(input.role);
  const sekolah = lintasSekolah ? SEMUA_SEKOLAH : input.sekolah;
  // Admin Sekolah tidak boleh membuat role lintas sekolah atau staf untuk sekolah lain.
  if (!isSuperAdmin(account) && (lintasSekolah || !bolehAksesSekolah(account, sekolah))) return tidakBerhak;
  if (!lintasSekolah) {
    const [s] = await db.select({ nama: schema.sekolah.nama }).from(schema.sekolah).where(eq(schema.sekolah.nama, sekolah));
    if (!s) return { error: "Pilih sekolah untuk staf ini." };
  }
  if (await emailTerpakai(permintaan.email)) return { error: "Email pendaftar sudah dipakai akun lain." };

  const [{ max }] = await db
    .select({ max: sql<number>`coalesce(max(substring(${schema.pengguna.id} from '[0-9]+')::int), 0)` })
    .from(schema.pengguna);
  await db.insert(schema.pengguna).values({
    id: `USR-${String(Number(max) + 1).padStart(3, "0")}`,
    nama: permintaan.nama,
    email: permintaan.email,
    noHp: "",
    role: input.role,
    sekolah,
    status: "Aktif",
    terakhirLogin: "",
    dibuatPada: new Date().toISOString(),
    passwordHash: permintaan.passwordHash,
  });
  await tandai(id, "Disetujui");
  return { success: `${permintaan.nama} sekarang bisa masuk sebagai ${input.role}.` };
}

export async function tolakPermintaan(id: string): Promise<HasilAksi> {
  const account = await akunAdmin();
  if (!account) return sesiBerakhir;
  const permintaan = await permintaanDalamJangkauan(account, id);
  if (!permintaan) return { error: "Permintaan tidak ditemukan atau sudah diproses." };
  await tandai(id, "Ditolak");
  return { success: `Permintaan ${permintaan.nama} ditolak.` };
}
