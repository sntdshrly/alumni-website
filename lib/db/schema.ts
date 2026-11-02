import {
  boolean,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import type { StatusSetelahLulus, StatusValidasi } from "@/data/alumni";
import type { JenisAcara } from "@/data/acara";
import type { KategoriCerita } from "@/data/cerita";
import type { RolePengguna, StatusPengguna } from "@/data/pengguna";
import type { JenisPT, StatusPT } from "@/data/perguruan-tinggi";
import type { SekolahStatus } from "@/data/sekolah";
import type { StatistikSekolah } from "@/lib/dashboard-stats";
import type { BiodataPendaftaran } from "@/lib/registrasi";

// Nama kolom ditulis camelCase di sini dan disimpan snake_case di Postgres (lihat casing di lib/db).

export const sekolah = pgTable("sekolah", {
  id: text().primaryKey(),
  nama: text().notNull().unique(),
  kepalaSekolah: text().notNull(),
  lokasi: text().notNull(),
  alumni: integer().notNull().default(0),
  status: text().$type<SekolahStatus>().notNull(),
  perluPembaruan: boolean().notNull().default(false),
  npsn: text().notNull().unique(),
  jenisSekolah: text().notNull(),
  email: text().notNull(),
  telepon: text().notNull(),
  tahunBergabung: integer().notNull(),
  terakhirDiperbarui: text().notNull(),
});

export const perguruanTinggi = pgTable("perguruan_tinggi", {
  id: text().primaryKey(),
  kode: text().notNull().unique(),
  nama: text().notNull(),
  singkatan: text().notNull(),
  jenis: text().$type<JenisPT>().notNull(),
  kota: text().notNull(),
  provinsi: text().notNull(),
  negara: text().notNull(),
  website: text().notNull(),
  alumni: integer().notNull().default(0),
  prodi: integer().notNull().default(0),
  buktiTerverifikasi: integer().notNull().default(0),
  status: text().$type<StatusPT>().notNull(),
  sumberData: text().notNull(),
  terakhirDiperbarui: text().notNull(),
});

export const alumni = pgTable("alumni", {
  nik: text().primaryKey(),
  nama: text().notNull(),
  nisn: text().notNull(),
  sekolah: text().notNull(),
  kelas: text().notNull(),
  tahunLulus: integer().notNull(),
  waliKelas: text().notNull(),
  telepon: text().notNull(),
  email: text().notNull(),
  linkedin: text().notNull().default(""),
  instagram: text().notNull().default(""),
  tiktok: text().notNull().default(""),
  statusSetelahLulus: text().$type<StatusSetelahLulus>().notNull(),
  perguruanTinggiId: text().notNull().default(""),
  programStudi: text().notNull().default(""),
  jabatan: text().notNull().default(""),
  tempatKerja: text().notNull().default(""),
  terakhirDikonfirmasi: text().notNull(),
  validasi: text().$type<StatusValidasi>().notNull(),
  pemeriksa: text().notNull().default(""),
  catatanValidasi: text().notNull().default(""),
  tampilDiJaringan: boolean().notNull().default(false),
  bersediaMentor: boolean().notNull().default(false),
  bagikanEmail: boolean().notNull().default(false),
  bagikanTelepon: boolean().notNull().default(false),
  bagikanMediaSosial: boolean().notNull().default(false),
  // Diisi bila alumni sudah punya akun portal lewat password; kosong bila belum atau lewat Google.
  passwordHash: text(),
}, (t) => [
  // Email dipakai untuk login, jadi tidak boleh ganda (huruf besar/kecil dianggap sama).
  uniqueIndex("alumni_email_unik").on(sql`lower(${t.email})`),
]);

// Akun staf (Super Admin, Admin Sekolah, dll.). Hanya yang punya passwordHash yang bisa login.
export const pengguna = pgTable("pengguna", {
  id: text().primaryKey(),
  nama: text().notNull(),
  email: text().notNull(),
  noHp: text().notNull(),
  role: text().$type<RolePengguna>().notNull(),
  sekolah: text().notNull(),
  status: text().$type<StatusPengguna>().notNull(),
  terakhirLogin: text().notNull().default(""),
  dibuatPada: text().notNull(),
  passwordHash: text(),
}, (t) => [uniqueIndex("pengguna_email_unik").on(sql`lower(${t.email})`)]);

export const acara = pgTable("acara", {
  id: text().primaryKey(),
  sekolah: text().notNull(),
  judul: text().notNull(),
  jenis: text().$type<JenisAcara>().notNull(),
  tanggal: text().notNull(),
  lokasi: text().notNull(),
  deskripsi: text().notNull(),
  kuota: integer().notNull(),
  terdaftar: integer().notNull().default(0),
});

export const acaraPeserta = pgTable(
  "acara_peserta",
  {
    acaraId: text()
      .notNull()
      .references(() => acara.id, { onDelete: "cascade" }),
    nik: text()
      .notNull()
      .references(() => alumni.nik, { onDelete: "cascade", onUpdate: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.acaraId, t.nik] })],
);

export const cerita = pgTable("cerita", {
  id: text().primaryKey(),
  penulisNik: text()
    .notNull()
    .references(() => alumni.nik, { onDelete: "cascade", onUpdate: "cascade" }),
  kategori: text().$type<KategoriCerita>().notNull(),
  judul: text().notNull(),
  isi: text().notNull(),
  tanggal: text().notNull(),
  // Jumlah apresiasi awal (data lama); apresiasi baru dicatat per alumni di cerita_apresiasi.
  apresiasi: integer().notNull().default(0),
});

export const ceritaApresiasi = pgTable(
  "cerita_apresiasi",
  {
    ceritaId: text()
      .notNull()
      .references(() => cerita.id, { onDelete: "cascade" }),
    nik: text()
      .notNull()
      .references(() => alumni.nik, { onDelete: "cascade", onUpdate: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.ceritaId, t.nik] })],
);

// Ringkasan statistik dashboard per sekolah (rekap tahunan dari sekolah).
export const statistikSekolah = pgTable("statistik_sekolah", {
  sekolah: text().primaryKey(),
  data: jsonb().$type<StatistikSekolah>().notNull(),
});

// Permintaan akun dari halaman Register, menunggu persetujuan admin sekolah.
export const pendaftaranAkun = pgTable("pendaftaran_akun", {
  id: text().primaryKey(),
  nama: text().notNull(),
  email: text().notNull(),
  // Kosong bila mendaftar lewat Google (sekolah dipilih admin saat menyetujui).
  sekolah: text().notNull(),
  // Kosong untuk pendaftaran lewat Google, karena login memakai akun Google.
  passwordHash: text(),
  sumber: text().$type<"Formulir" | "Google">().notNull().default("Formulir"),
  status: text().$type<"Menunggu" | "Disetujui" | "Ditolak">().notNull().default("Menunggu"),
  // Biodata alumni dari pendaftar; menjadi data alumni saat permintaan disetujui.
  biodata: jsonb().$type<BiodataPendaftaran>(),
  dibuatPada: timestamp({ withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  // Satu email hanya boleh punya satu permintaan yang masih menunggu.
  uniqueIndex("pendaftaran_email_menunggu_unik")
    .on(sql`lower(${t.email})`)
    .where(sql`${t.status} = 'Menunggu'`),
]);
