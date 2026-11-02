"use server";

import { eq, sql } from "drizzle-orm";
import { refresh } from "next/cache";
import { db, schema } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";
import { getCurrentAccount, type SessionAccount } from "@/lib/session";

export type AccountActionResult = {
  error?: string;
  success?: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const sesiBerakhir = { error: "Sesi berakhir. Silakan masuk kembali." };

// Hash password akun yang sedang login, dari tabel sesuai jenis akunnya.
async function passwordHashSaatIni(account: SessionAccount) {
  if (account.role === "alumni") {
    const [a] = await db
      .select({ hash: schema.alumni.passwordHash })
      .from(schema.alumni)
      .where(eq(schema.alumni.nik, account.id));
    return a?.hash ?? null;
  }
  const [p] = await db
    .select({ hash: schema.pengguna.passwordHash })
    .from(schema.pengguna)
    .where(eq(schema.pengguna.id, account.id));
  return p?.hash ?? null;
}

export async function updateNama(nama: string): Promise<AccountActionResult> {
  const account = await getCurrentAccount();
  if (!account) return sesiBerakhir;
  const bersih = nama.trim();
  if (!bersih) return { error: "Nama wajib diisi." };
  if (account.role === "alumni") {
    await db.update(schema.alumni).set({ nama: bersih }).where(eq(schema.alumni.nik, account.id));
  } else {
    await db.update(schema.pengguna).set({ nama: bersih }).where(eq(schema.pengguna.id, account.id));
  }
  refresh();
  return { success: "Perubahan profil berhasil disimpan." };
}

export async function changePassword(input: {
  passwordLama: string;
  passwordBaru: string;
  konfirmasi: string;
}): Promise<AccountActionResult> {
  const account = await getCurrentAccount();
  if (!account) return sesiBerakhir;
  if (!(await verifyPassword(input.passwordLama, await passwordHashSaatIni(account)))) {
    return { error: "Password saat ini salah." };
  }
  if (input.passwordBaru.length < 8) {
    return { error: "Password baru minimal 8 karakter." };
  }
  if (input.passwordBaru === input.passwordLama) {
    return { error: "Password baru harus berbeda dari password saat ini." };
  }
  if (input.passwordBaru !== input.konfirmasi) {
    return { error: "Konfirmasi password tidak sama." };
  }

  const passwordHash = await hashPassword(input.passwordBaru);
  if (account.role === "alumni") {
    await db.update(schema.alumni).set({ passwordHash }).where(eq(schema.alumni.nik, account.id));
  } else {
    await db.update(schema.pengguna).set({ passwordHash }).where(eq(schema.pengguna.id, account.id));
  }
  return { success: "Password berhasil diubah." };
}

// Pengiriman email verifikasi belum tersedia, jadi email belum benar-benar diganti.
export async function requestEmailChange(input: {
  emailBaru: string;
  password: string;
}): Promise<AccountActionResult> {
  const account = await getCurrentAccount();
  if (!account) return sesiBerakhir;
  const email = input.emailBaru.trim().toLowerCase();
  if (!emailPattern.test(email)) {
    return { error: "Masukkan alamat email yang valid." };
  }
  if (email === account.email.toLowerCase()) {
    return { error: "Email baru sama dengan email saat ini." };
  }
  const [staf, alumni] = await Promise.all([
    db.select({ id: schema.pengguna.id }).from(schema.pengguna).where(sql`lower(${schema.pengguna.email}) = ${email}`),
    db.select({ nik: schema.alumni.nik }).from(schema.alumni).where(sql`lower(${schema.alumni.email}) = ${email}`),
  ]);
  if (staf.length || alumni.length) {
    return { error: "Email sudah dipakai akun lain." };
  }
  if (!(await verifyPassword(input.password, await passwordHashSaatIni(account)))) {
    return { error: "Password salah." };
  }
  return {
    success: `Tautan verifikasi telah dikirim ke ${email}. Email akan berubah setelah tautan dikonfirmasi.`,
  };
}

// Penghapusan akun menunggu konfirmasi lewat email, yang belum tersedia.
export async function requestAccountDeletion(): Promise<AccountActionResult> {
  const account = await getCurrentAccount();
  if (!account) return sesiBerakhir;
  return {
    success: `Email konfirmasi penghapusan akun telah dikirim ke ${account.email}.`,
  };
}
