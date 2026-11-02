"use server";

import { randomInt } from "node:crypto";
import { eq, sql } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { roleLintasSekolah, SEMUA_SEKOLAH, type Pengguna, type RolePengguna, type StatusPengguna } from "@/data/pengguna";
import { akunAdmin, isSuperAdmin, sesiBerakhir, tidakBerhak, type HasilAksi } from "@/lib/aksi-server";
import { emailTerpakai } from "@/lib/data";
import { hashPassword } from "@/lib/password";
import { bolehAksesSekolah, type SessionAccount } from "@/lib/session";

export type DataPengguna = Pick<Pengguna, "nama" | "email" | "noHp" | "role" | "sekolah" | "status">;

// Admin Sekolah hanya boleh mengelola pengguna di sekolahnya, dan tidak boleh membuat role lintas sekolah.
function cekHakAkses(account: SessionAccount, data: Pick<Pengguna, "role" | "sekolah">): HasilAksi | null {
  if (isSuperAdmin(account)) return null;
  if (roleLintasSekolah.includes(data.role)) return tidakBerhak;
  if (!bolehAksesSekolah(account, data.sekolah)) return tidakBerhak;
  return null;
}

async function validasi(data: DataPengguna, kecualiId?: string): Promise<HasilAksi | null> {
  if (!data.nama.trim()) return { error: "Nama wajib diisi." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return { error: "Format email tidak valid." };
  if (await emailTerpakai(data.email, { penggunaId: kecualiId })) {
    return { error: "Email sudah digunakan akun lain." };
  }
  if (!roleLintasSekolah.includes(data.role)) {
    const [s] = await db.select({ nama: schema.sekolah.nama }).from(schema.sekolah).where(eq(schema.sekolah.nama, data.sekolah));
    if (!s) return { error: "Pilih sekolah untuk pengguna ini." };
  }
  return null;
}

function normalisasi(data: DataPengguna): DataPengguna {
  return {
    nama: data.nama.trim(),
    email: data.email.trim().toLowerCase(),
    noHp: data.noHp.trim(),
    role: data.role as RolePengguna,
    sekolah: roleLintasSekolah.includes(data.role) ? SEMUA_SEKOLAH : data.sekolah,
    status: data.status as StatusPengguna,
  };
}

async function penggunaDalamJangkauan(account: SessionAccount, id: string) {
  const [p] = await db.select().from(schema.pengguna).where(eq(schema.pengguna.id, id));
  if (!p || cekHakAkses(account, p)) return null;
  return p;
}

export async function ubahPengguna(id: string, input: DataPengguna): Promise<HasilAksi> {
  const account = await akunAdmin();
  if (!account) return sesiBerakhir;
  const lama = await penggunaDalamJangkauan(account, id);
  if (!lama) return tidakBerhak;
  const data = normalisasi(input);
  // Akun sendiri tidak boleh dinonaktifkan agar admin tidak terkunci dari sistem.
  if (id === account.id) data.status = "Aktif";
  const ditolak = cekHakAkses(account, data) ?? (await validasi(data, id));
  if (ditolak) return ditolak;
  await db.update(schema.pengguna).set(data).where(eq(schema.pengguna.id, id));
  return { success: "Perubahan data pengguna berhasil disimpan." };
}

export async function ubahStatusPengguna(id: string, status: StatusPengguna): Promise<HasilAksi> {
  const account = await akunAdmin();
  if (!account) return sesiBerakhir;
  if (id === account.id) return { error: "Anda tidak dapat menonaktifkan akun sendiri." };
  if (!(await penggunaDalamJangkauan(account, id))) return tidakBerhak;
  await db.update(schema.pengguna).set({ status }).where(eq(schema.pengguna.id, id));
  return { success: status === "Aktif" ? "Akun berhasil diaktifkan." : "Akun berhasil dinonaktifkan." };
}

export async function tambahPengguna(input: DataPengguna): Promise<HasilAksi & { pengguna?: Pengguna }> {
  const account = await akunAdmin();
  if (!account) return sesiBerakhir;
  const data = normalisasi(input);
  const ditolak = cekHakAkses(account, data) ?? (await validasi(data));
  if (ditolak) return ditolak;

  // Id dibuat di server dari seluruh data, karena Admin Sekolah hanya melihat sebagian pengguna.
  const [{ max }] = await db
    .select({ max: sql<number>`coalesce(max(substring(${schema.pengguna.id} from '[0-9]+')::int), 0)` })
    .from(schema.pengguna);
  const pengguna: Pengguna = {
    ...data,
    id: `USR-${String(Number(max) + 1).padStart(3, "0")}`,
    terakhirLogin: "",
    dibuatPada: new Date().toISOString(),
  };
  await db.insert(schema.pengguna).values(pengguna);
  return { success: "Pengguna baru berhasil ditambahkan.", pengguna };
}

export async function hapusPengguna(id: string): Promise<HasilAksi> {
  const account = await akunAdmin();
  if (!account) return sesiBerakhir;
  if (id === account.id) return { error: "Anda tidak dapat menghapus akun sendiri." };
  if (!(await penggunaDalamJangkauan(account, id))) return tidakBerhak;
  await db.delete(schema.pengguna).where(eq(schema.pengguna.id, id));
  return { success: "Pengguna berhasil dihapus." };
}

// Pengiriman email belum tersedia, jadi password sementara ditampilkan sekali kepada admin
// untuk diteruskan ke pengguna. Pengguna sebaiknya langsung menggantinya di Pengaturan Akun.
export async function aturPasswordSementara(id: string): Promise<HasilAksi & { password?: string }> {
  const account = await akunAdmin();
  if (!account) return sesiBerakhir;
  if (!(await penggunaDalamJangkauan(account, id))) return tidakBerhak;
  const huruf = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const password = Array.from({ length: 10 }, () => huruf[randomInt(huruf.length)]).join("");
  await db.update(schema.pengguna).set({ passwordHash: await hashPassword(password) }).where(eq(schema.pengguna.id, id));
  return { success: "Password sementara berhasil dibuat.", password };
}
