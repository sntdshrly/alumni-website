"use server";

import { and, count, eq, sql } from "drizzle-orm";
import { refresh, revalidatePath } from "next/cache";
import { jenisAcaraOptions, type JenisAcara } from "@/data/acara";
import { inputWibToIso } from "@/lib/acara-format";
import { akunAdmin, sesiBerakhir, tidakBerhak } from "@/lib/aksi-server";
import { db, schema } from "@/lib/db";
import { bolehAksesSekolah } from "@/lib/session";

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

type AcaraInput = Omit<typeof schema.acara.$inferInsert, "id" | "terdaftar">;

async function validasi(values: AcaraFormValues): Promise<{ error: string } | { input: AcaraInput }> {
  const judul = values.judul.trim();
  if (judul.length < 5) return { error: "Judul acara minimal 5 karakter." };
  if (!jenisAcaraOptions.includes(values.jenis as JenisAcara)) return { error: "Pilih jenis acara." };
  const [sekolah] = await db
    .select({ nama: schema.sekolah.nama })
    .from(schema.sekolah)
    .where(eq(schema.sekolah.nama, values.sekolah));
  if (!sekolah) return { error: "Pilih sekolah penyelenggara." };
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

async function jumlahPeserta(acaraId: string, terdaftar: number) {
  const [{ n }] = await db
    .select({ n: count() })
    .from(schema.acaraPeserta)
    .where(eq(schema.acaraPeserta.acaraId, acaraId));
  return terdaftar + n;
}

export async function simpanAcara(id: string | null, values: AcaraFormValues): Promise<AcaraActionResult> {
  const account = await akunAdmin();
  if (!account) return sesiBerakhir;
  const hasil = await validasi(values);
  if ("error" in hasil) return hasil;
  if (!bolehAksesSekolah(account, hasil.input.sekolah)) return tidakBerhak;

  if (id) {
    const [lama] = await db.select().from(schema.acara).where(eq(schema.acara.id, id));
    if (!lama || !bolehAksesSekolah(account, lama.sekolah)) return { error: "Acara tidak ditemukan." };
    const peserta = await jumlahPeserta(id, lama.terdaftar);
    if (hasil.input.kuota < peserta) {
      return { error: `Kuota tidak boleh kurang dari jumlah peserta saat ini (${peserta}).` };
    }
    await db.update(schema.acara).set(hasil.input).where(eq(schema.acara.id, id));
    segarkan();
    return { success: "Perubahan acara berhasil disimpan." };
  }

  const [{ max }] = await db
    .select({ max: sql<number>`coalesce(max(substring(${schema.acara.id} from '[0-9]+')::int), 0)` })
    .from(schema.acara);
  await db.insert(schema.acara).values({
    ...hasil.input,
    id: `ACR-${String(Number(max) + 1).padStart(3, "0")}`,
    terdaftar: 0,
  });
  segarkan();
  return { success: "Acara baru berhasil ditambahkan." };
}

export async function hapusAcara(id: string): Promise<AcaraActionResult> {
  const account = await akunAdmin();
  if (!account) return sesiBerakhir;
  const [lama] = await db.select({ sekolah: schema.acara.sekolah }).from(schema.acara).where(eq(schema.acara.id, id));
  if (!lama || !bolehAksesSekolah(account, lama.sekolah)) return { error: "Acara tidak ditemukan." };
  await db.delete(schema.acara).where(and(eq(schema.acara.id, id)));
  segarkan();
  return { success: "Acara berhasil dihapus." };
}
