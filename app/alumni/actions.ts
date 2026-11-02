"use server";

import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { refresh } from "next/cache";
import {
  isStatusBekerja,
  isStatusKuliah,
  statusPilihanAlumni,
  type Alumni,
} from "@/data/alumni";
import { kategoriCeritaOptions, type CeritaAlumni, type KategoriCerita } from "@/data/cerita";
import { formatHariIni, sesiBerakhir, type HasilAksi } from "@/lib/aksi-server";
import { emailTerpakai } from "@/lib/data";
import { db, schema } from "@/lib/db";
import { getCurrentAccount } from "@/lib/session";

async function nikSaya() {
  const account = await getCurrentAccount();
  return account?.role === "alumni" ? (account.alumniNik ?? null) : null;
}

export type ProfilSaya = Pick<
  Alumni,
  | "statusSetelahLulus"
  | "perguruanTinggiId"
  | "programStudi"
  | "jabatan"
  | "tempatKerja"
  | "telepon"
  | "email"
  | "linkedin"
  | "instagram"
  | "tiktok"
  | "tampilDiJaringan"
  | "bersediaMentor"
  | "bagikanEmail"
  | "bagikanTelepon"
  | "bagikanMediaSosial"
>;

// Field yang perubahannya perlu dicek ulang admin; pengaturan privasi tidak termasuk.
const fieldPerluVerifikasi: (keyof ProfilSaya)[] = [
  "statusSetelahLulus",
  "perguruanTinggiId",
  "programStudi",
  "jabatan",
  "tempatKerja",
  "telepon",
  "email",
  "linkedin",
  "instagram",
  "tiktok",
];

export async function simpanProfilSaya(
  input: ProfilSaya,
): Promise<HasilAksi & { perubahan?: Partial<Alumni> }> {
  const nik = await nikSaya();
  if (!nik) return sesiBerakhir;
  const [lama] = await db.select().from(schema.alumni).where(eq(schema.alumni.nik, nik));
  if (!lama) return { error: "Data alumni tidak ditemukan." };

  const kuliah = isStatusKuliah(input.statusSetelahLulus);
  const kerja = isStatusBekerja(input.statusSetelahLulus);
  // Hanya field milik profil ini yang diambil, supaya alumni tidak bisa mengubah data lain.
  const data: ProfilSaya = {
    statusSetelahLulus: input.statusSetelahLulus,
    perguruanTinggiId: kuliah ? input.perguruanTinggiId : "",
    programStudi: kuliah ? input.programStudi.trim() : "",
    jabatan: kerja ? input.jabatan.trim() : "",
    tempatKerja: kerja ? input.tempatKerja.trim() : "",
    telepon: input.telepon.trim(),
    email: input.email.trim().toLowerCase(),
    linkedin: input.linkedin.trim(),
    instagram: input.instagram.trim(),
    tiktok: input.tiktok.trim(),
    tampilDiJaringan: !!input.tampilDiJaringan,
    bersediaMentor: !!input.tampilDiJaringan && !!input.bersediaMentor,
    bagikanEmail: !!input.bagikanEmail,
    bagikanTelepon: !!input.bagikanTelepon,
    bagikanMediaSosial: !!input.bagikanMediaSosial,
  };

  if (!statusPilihanAlumni.includes(data.statusSetelahLulus)) return { error: "Pilih status kamu saat ini." };
  if (kuliah && (!data.perguruanTinggiId || !data.programStudi)) {
    return { error: "Isi perguruan tinggi dan program studi kamu." };
  }
  if (kerja && (!data.jabatan || !data.tempatKerja)) return { error: "Lengkapi data pekerjaan atau usaha kamu." };
  if (!data.telepon) return { error: "Nomor telepon wajib diisi." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return { error: "Format email tidak valid." };
  // Email juga dipakai untuk login, jadi tidak boleh sama dengan akun lain.
  if (data.email !== lama.email.toLowerCase() && (await emailTerpakai(data.email, { nik }))) {
    return { error: "Email sudah dipakai akun lain." };
  }

  const perluVerifikasi = fieldPerluVerifikasi.some((key) => lama[key] !== data[key]);
  const perubahan: Partial<Alumni> = {
    ...data,
    // Data yang berubah masuk antrean verifikasi admin lagi.
    ...(perluVerifikasi
      ? { validasi: "Pending" as const, pemeriksa: "", catatanValidasi: "", terakhirDikonfirmasi: formatHariIni() }
      : {}),
  };
  await db.update(schema.alumni).set(perubahan).where(eq(schema.alumni.nik, nik));
  refresh();
  return {
    success: perluVerifikasi
      ? "Profil tersimpan. Perubahan data akan dicek admin sekolah (status: Pending)."
      : "Pengaturan privasi tersimpan.",
    perubahan,
  };
}

export async function terbitkanCerita(input: {
  kategori: string;
  judul: string;
  isi: string;
}): Promise<HasilAksi & { cerita?: CeritaAlumni }> {
  const nik = await nikSaya();
  if (!nik) return sesiBerakhir;
  if (!kategoriCeritaOptions.includes(input.kategori as KategoriCerita)) return { error: "Pilih kategori cerita." };
  const judul = input.judul.trim();
  const isi = input.isi.trim();
  if (judul.length < 10 || isi.length < 150) return { error: "Judul atau isi cerita terlalu pendek." };
  const cerita: CeritaAlumni = {
    id: `CRT-${randomUUID().slice(0, 8)}`,
    penulisNik: nik,
    kategori: input.kategori as KategoriCerita,
    judul,
    isi,
    tanggal: new Date().toISOString(),
    apresiasi: 0,
  };
  await db.insert(schema.cerita).values(cerita);
  return { success: "Cerita berhasil diterbitkan.", cerita };
}

export async function hapusCerita(id: string): Promise<HasilAksi> {
  const nik = await nikSaya();
  if (!nik) return sesiBerakhir;
  // Alumni hanya boleh menghapus ceritanya sendiri.
  const terhapus = await db
    .delete(schema.cerita)
    .where(and(eq(schema.cerita.id, id), eq(schema.cerita.penulisNik, nik)))
    .returning({ id: schema.cerita.id });
  if (!terhapus.length) return { error: "Cerita tidak ditemukan." };
  return { success: "Cerita berhasil dihapus." };
}

export async function toggleApresiasi(ceritaId: string, beri: boolean): Promise<HasilAksi> {
  const account = await getCurrentAccount();
  const nik = account?.role === "alumni" ? account.alumniNik : undefined;
  if (!account || !nik) return sesiBerakhir;
  // Hanya cerita dari alumni sesekolah yang bisa diberi apresiasi.
  const [cerita] = await db
    .select({ sekolah: schema.alumni.sekolah })
    .from(schema.cerita)
    .innerJoin(schema.alumni, eq(schema.alumni.nik, schema.cerita.penulisNik))
    .where(eq(schema.cerita.id, ceritaId));
  if (!cerita || cerita.sekolah !== account.school) return { error: "Cerita tidak ditemukan." };
  if (beri) {
    await db.insert(schema.ceritaApresiasi).values({ ceritaId, nik }).onConflictDoNothing();
  } else {
    await db
      .delete(schema.ceritaApresiasi)
      .where(and(eq(schema.ceritaApresiasi.ceritaId, ceritaId), eq(schema.ceritaApresiasi.nik, nik)));
  }
  return {};
}
