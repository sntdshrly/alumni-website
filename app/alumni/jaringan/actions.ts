"use server";

import { and, count, eq } from "drizzle-orm";
import { refresh, revalidatePath } from "next/cache";
import { db, schema } from "@/lib/db";
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
  const nik = account.alumniNik;
  // Alumni hanya boleh mendaftar acara sekolahnya sendiri.
  const [acara] = await db.select().from(schema.acara).where(eq(schema.acara.id, acaraId));
  if (!acara || acara.sekolah !== account.school) {
    return { error: "Acara tidak ditemukan." };
  }

  const syarat = and(eq(schema.acaraPeserta.acaraId, acaraId), eq(schema.acaraPeserta.nik, nik));
  const [sudahIkut] = await db.select().from(schema.acaraPeserta).where(syarat);

  let ikut: boolean;
  if (sudahIkut) {
    await db.delete(schema.acaraPeserta).where(syarat);
    ikut = false;
  } else {
    const [{ n }] = await db
      .select({ n: count() })
      .from(schema.acaraPeserta)
      .where(eq(schema.acaraPeserta.acaraId, acaraId));
    if (acara.terdaftar + n >= acara.kuota) return { error: "Kuota acara sudah penuh." };
    await db.insert(schema.acaraPeserta).values({ acaraId, nik }).onConflictDoNothing();
    ikut = true;
  }

  revalidatePath("/alumni/jaringan");
  revalidatePath("/dashboard/acara");
  refresh();
  return { ikut, judul: acara.judul, tanggal: acara.tanggal };
}
