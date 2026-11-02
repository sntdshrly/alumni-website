import "server-only";

import { randomUUID } from "node:crypto";
import { and, eq, sql } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { emailTerpakai, pesanEmailGanda } from "@/lib/data";
import { isStatusKuliah } from "@/data/alumni";
import { validasiBiodata, type BiodataPendaftaran } from "@/lib/registrasi";

type InputPermintaan = {
  nama: string;
  email: string;
  sekolah: string;
  biodata: BiodataPendaftaran;
  passwordHash: string | null;
  sumber: "Formulir" | "Google";
};

// Menyimpan permintaan akun baru setelah semua aturan dicek di server. Pesan dalam bahasa Inggris
// karena tampil di halaman Register.
export async function simpanPermintaan(input: InputPermintaan): Promise<{ error?: string }> {
  const email = input.email.trim().toLowerCase();
  if (!input.nama.trim()) return { error: "Full name is required." };

  const [sekolah] = await db
    .select({ nama: schema.sekolah.nama })
    .from(schema.sekolah)
    .where(and(eq(schema.sekolah.nama, input.sekolah), eq(schema.sekolah.status, "Aktif")));
  if (!sekolah) return { error: "Please select a school from the list." };

  const errorBiodata = validasiBiodata(input.biodata);
  if (errorBiodata) return { error: errorBiodata };
  if (isStatusKuliah(input.biodata.statusSetelahLulus)) {
    const [pt] = await db
      .select({ id: schema.perguruanTinggi.id })
      .from(schema.perguruanTinggi)
      .where(eq(schema.perguruanTinggi.id, input.biodata.perguruanTinggiId));
    if (!pt) return { error: "Please select a university from the list." };
  }

  // Permintaan lama tanpa biodata (dari versi sebelumnya) boleh diganti oleh pemilik email yang sama.
  const [lamaTanpaBiodata] = await db
    .select({ id: schema.pendaftaranAkun.id })
    .from(schema.pendaftaranAkun)
    .where(
      and(
        sql`lower(${schema.pendaftaranAkun.email}) = ${email}`,
        eq(schema.pendaftaranAkun.status, "Menunggu"),
        sql`${schema.pendaftaranAkun.biodata} is null`,
      ),
    );
  if (await emailTerpakai(email, { permintaanId: lamaTanpaBiodata?.id })) {
    return { error: "This email is already registered or waiting for approval." };
  }

  const [nikAlumni, nikMenunggu] = await Promise.all([
    db.select({ nik: schema.alumni.nik }).from(schema.alumni).where(eq(schema.alumni.nik, input.biodata.nik)),
    db
      .select({ id: schema.pendaftaranAkun.id })
      .from(schema.pendaftaranAkun)
      .where(
        and(
          eq(schema.pendaftaranAkun.status, "Menunggu"),
          sql`${schema.pendaftaranAkun.biodata}->>'nik' = ${input.biodata.nik}`,
        ),
      ),
  ]);
  if (nikAlumni.length || nikMenunggu.length) {
    return { error: "This NIK is already registered. Please contact your School Admin." };
  }

  if (lamaTanpaBiodata) {
    await db.delete(schema.pendaftaranAkun).where(eq(schema.pendaftaranAkun.id, lamaTanpaBiodata.id));
  }
  try {
    await db.insert(schema.pendaftaranAkun).values({
      id: randomUUID(),
      nama: input.nama.trim(),
      email,
      sekolah: input.sekolah,
      passwordHash: input.passwordHash,
      sumber: input.sumber,
      biodata: input.biodata,
    });
  } catch (e) {
    if (pesanEmailGanda(e)) return { error: "This email is already registered or waiting for approval." };
    throw e;
  }
  return {};
}
