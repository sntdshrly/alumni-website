import "server-only";

import { asc, eq, getTableColumns, inArray, ne, sql, type SQL } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import type { Alumni } from "@/data/alumni";
import type { AcaraAlumni } from "@/data/acara";
import type { CeritaAlumni } from "@/data/cerita";
import type { Pengguna } from "@/data/pengguna";
import type { PerguruanTinggi } from "@/data/perguruan-tinggi";
import type { Sekolah } from "@/data/sekolah";
import { gabungStatistik, type DashboardView } from "@/lib/dashboard-stats";
import type { SessionAccount } from "@/lib/session";
import type { BiodataPendaftaran } from "@/lib/registrasi";

// Semua query di sini menerima akun yang login dan hanya mengembalikan data sekolah yang boleh
// dilihat akun tersebut (sekolahScope null = semua sekolah). Hash password tidak pernah ikut.

function tanpaPasswordHash<T extends { passwordHash: unknown }>({ passwordHash, ...kolom }: T) {
  void passwordHash;
  return kolom;
}
const kolomAlumni = tanpaPasswordHash(getTableColumns(schema.alumni));
const kolomPengguna = tanpaPasswordHash(getTableColumns(schema.pengguna));

function filterSekolah<T extends { sekolah: string }>(account: SessionAccount, rows: T[]) {
  return account.sekolahScope === null ? rows : rows.filter((r) => r.sekolah === account.sekolahScope);
}

export async function listSekolah(account: SessionAccount): Promise<Sekolah[]> {
  const query = db.select().from(schema.sekolah).orderBy(asc(schema.sekolah.id));
  return account.sekolahScope === null
    ? query
    : query.where(eq(schema.sekolah.nama, account.sekolahScope));
}

export async function namaSekolah(account: SessionAccount) {
  return (await listSekolah(account)).map((s) => s.nama);
}

// Untuk halaman Register (belum login): hanya nama sekolah yang aktif.
export async function namaSekolahAktif() {
  const rows = await db
    .select({ nama: schema.sekolah.nama })
    .from(schema.sekolah)
    .where(eq(schema.sekolah.status, "Aktif"))
    .orderBy(asc(schema.sekolah.nama));
  return rows.map((r) => r.nama);
}

export async function listPerguruanTinggi(): Promise<PerguruanTinggi[]> {
  return db.select().from(schema.perguruanTinggi).orderBy(asc(schema.perguruanTinggi.kode));
}

export async function listAlumni(account: SessionAccount): Promise<Alumni[]> {
  const query = db.select(kolomAlumni).from(schema.alumni).orderBy(asc(schema.alumni.nama));
  return account.sekolahScope === null
    ? query
    : query.where(eq(schema.alumni.sekolah, account.sekolahScope));
}

export async function listPengguna(account: SessionAccount): Promise<Pengguna[]> {
  const rows = await db.select(kolomPengguna).from(schema.pengguna).orderBy(asc(schema.pengguna.id));
  return filterSekolah(account, rows);
}

export type AcaraDenganPeserta = AcaraAlumni & { pesertaNik: string[] };

export async function listAcara(account: SessionAccount): Promise<AcaraDenganPeserta[]> {
  const query = db.select().from(schema.acara).orderBy(asc(schema.acara.tanggal));
  const acara = account.sekolahScope === null
    ? await query
    : await query.where(eq(schema.acara.sekolah, account.sekolahScope));
  if (!acara.length) return [];
  const peserta = await db
    .select()
    .from(schema.acaraPeserta)
    .where(inArray(schema.acaraPeserta.acaraId, acara.map((a) => a.id)));
  return acara.map((a) => ({
    ...a,
    pesertaNik: peserta.filter((p) => p.acaraId === a.id).map((p) => p.nik),
  }));
}

export type PermintaanAkun = {
  id: string;
  nama: string;
  email: string;
  sekolah: string;
  sumber: "Formulir" | "Google";
  biodata: BiodataPendaftaran | null;
  dibuatPada: string;
};

// Permintaan yang masih menunggu, sesuai sekolah yang dipilih pendaftar.
export async function listPermintaanAkun(account: SessionAccount): Promise<PermintaanAkun[]> {
  const rows = await db
    .select({
      id: schema.pendaftaranAkun.id,
      nama: schema.pendaftaranAkun.nama,
      email: schema.pendaftaranAkun.email,
      sekolah: schema.pendaftaranAkun.sekolah,
      sumber: schema.pendaftaranAkun.sumber,
      biodata: schema.pendaftaranAkun.biodata,
      dibuatPada: schema.pendaftaranAkun.dibuatPada,
    })
    .from(schema.pendaftaranAkun)
    .where(eq(schema.pendaftaranAkun.status, "Menunggu"))
    .orderBy(asc(schema.pendaftaranAkun.dibuatPada));
  return filterSekolah(account, rows).map((r) => ({ ...r, dibuatPada: r.dibuatPada.toISOString() }));
}

export function totalPeserta(ev: AcaraDenganPeserta) {
  return ev.terdaftar + ev.pesertaNik.length;
}

export async function getDashboard(account: SessionAccount): Promise<DashboardView> {
  const query = db.select().from(schema.statistikSekolah);
  const rows = account.sekolahScope === null
    ? await query
    : await query.where(eq(schema.statistikSekolah.sekolah, account.sekolahScope));
  return gabungStatistik(rows.map((r) => r.data));
}

// ---- Portal alumni ----

// Acara yang dikirim ke alumni: tanpa daftar peserta, hanya jumlah dan status pendaftaran sendiri.
export type AcaraPortal = AcaraAlumni & { totalPeserta: number; sayaIkut: boolean };

// Versi publik profil alumni lain: NIK diganti id samaran, data internal sekolah dikosongkan,
// dan kontak hanya disertakan bila pemiliknya mengizinkan.
function profilPublik(a: Alumni, idSamaran: string): Alumni {
  return {
    ...a,
    nik: idSamaran,
    nisn: "",
    kelas: "",
    waliKelas: "",
    telepon: a.bagikanTelepon ? a.telepon : "",
    email: a.bagikanEmail ? a.email : "",
    linkedin: a.bagikanMediaSosial ? a.linkedin : "",
    instagram: a.bagikanMediaSosial ? a.instagram : "",
    tiktok: a.bagikanMediaSosial ? a.tiktok : "",
    terakhirDikonfirmasi: "",
    validasi: "Valid",
    pemeriksa: "",
    catatanValidasi: "",
  };
}

export type CeritaPortal = CeritaAlumni & { sayaApresiasi: boolean };

// Data untuk portal alumni disaring di server sebelum dikirim ke browser, sehingga alumni
// hanya menerima data alumni dari sekolahnya sendiri dan hanya informasi yang memang dibagikan.
export async function getPortalData(account: SessionAccount) {
  const sekolah = account.school;
  const sesekolah = await db
    .select(kolomAlumni)
    .from(schema.alumni)
    .where(eq(schema.alumni.sekolah, sekolah))
    .orderBy(asc(schema.alumni.nik));

  // Id samaran berurutan per sekolah; NIK asli tidak pernah dikirim untuk alumni lain.
  const idByNik = new Map(sesekolah.map((a, i) => [a.nik, `ALM-${String(i + 1).padStart(3, "0")}`]));

  const alumni = sesekolah
    .filter((a) => a.nik === account.alumniNik || a.tampilDiJaringan)
    .map((a) => (a.nik === account.alumniNik ? a : profilPublik(a, idByNik.get(a.nik)!)));

  const niks = [...idByNik.keys()];
  const ceritaRows = niks.length
    ? await db
        .select({
          ...getTableColumns(schema.cerita),
          jumlahApresiasi: sql<number>`(select count(*)::int from ${schema.ceritaApresiasi} ca where ca.cerita_id = ${schema.cerita.id})`,
          sayaApresiasi: sql<boolean>`exists(select 1 from ${schema.ceritaApresiasi} ca where ca.cerita_id = ${schema.cerita.id} and ca.nik = ${account.alumniNik ?? ""})`,
        })
        .from(schema.cerita)
        .where(inArray(schema.cerita.penulisNik, niks))
    : [];

  const cerita: CeritaPortal[] = ceritaRows.map(({ jumlahApresiasi, ...c }) => ({
    ...c,
    // Apresiasi alumni yang login dihitung terpisah di klien, jadi dikurangi di sini.
    apresiasi: c.apresiasi + jumlahApresiasi - (c.sayaApresiasi ? 1 : 0),
    penulisNik: c.penulisNik === account.alumniNik ? c.penulisNik : idByNik.get(c.penulisNik)!,
  }));

  return { sekolah, alumni, cerita };
}

export async function getAcaraPortal(account: SessionAccount): Promise<AcaraPortal[]> {
  const acara = await listAcara({ ...account, sekolahScope: account.school });
  return acara.map(({ pesertaNik, ...ev }) => ({
    ...ev,
    totalPeserta: ev.terdaftar + pesertaNik.length,
    sayaIkut: !!account.alumniNik && pesertaNik.includes(account.alumniNik),
  }));
}

// Email sudah dipakai staf, alumni, atau permintaan akun yang masih menunggu, selain pemilik
// yang dikecualikan. Satu email hanya boleh dimiliki satu akun di seluruh sistem.
export async function emailTerpakai(
  email: string,
  kecuali?: { nik?: string; penggunaId?: string; permintaanId?: string },
) {
  const e = email.trim().toLowerCase();
  const [staf, alumni, permintaan] = await Promise.all([
    db
      .select({ id: schema.pengguna.id })
      .from(schema.pengguna)
      .where(
        kecuali?.penggunaId
          ? sql`lower(${schema.pengguna.email}) = ${e} and ${ne(schema.pengguna.id, kecuali.penggunaId)}`
          : sql`lower(${schema.pengguna.email}) = ${e}`,
      ),
    db
      .select({ nik: schema.alumni.nik })
      .from(schema.alumni)
      .where(
        kecuali?.nik
          ? sql`lower(${schema.alumni.email}) = ${e} and ${ne(schema.alumni.nik, kecuali.nik)}`
          : sql`lower(${schema.alumni.email}) = ${e}`,
      ),
    db
      .select({ id: schema.pendaftaranAkun.id })
      .from(schema.pendaftaranAkun)
      .where(
        sql`lower(${schema.pendaftaranAkun.email}) = ${e} and ${schema.pendaftaranAkun.status} = 'Menunggu'` as SQL,
      ),
  ]);
  return (
    staf.length > 0 ||
    alumni.length > 0 ||
    permintaan.some((p) => p.id !== kecuali?.permintaanId)
  );
}

// Memetakan pelanggaran indeks unik email dari database ke pesan yang mudah dipahami.
export function pesanEmailGanda(e: unknown) {
  const pesan = String((e as { message?: string; cause?: { message?: string } })?.cause?.message ?? (e as Error)?.message ?? "");
  return /email(_menunggu)?_unik/.test(pesan) ? "Email sudah dipakai akun lain." : null;
}
