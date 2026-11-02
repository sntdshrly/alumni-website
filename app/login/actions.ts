"use server";

import { randomUUID } from "node:crypto";
import { and, eq, isNotNull, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { homePathByRole } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";
import { createSession, deleteSession } from "@/lib/session";

export type LoginState = {
  error?: string;
};

export type FormState = {
  error?: string;
  success?: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function login(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const remember = formData.get("remember") === "on";
  // "Ingat saya" memperpanjang sesi dari 8 jam menjadi 30 hari.
  const maxAge = remember ? 60 * 60 * 24 * 30 : 60 * 60 * 8;
  const gagal = { error: "Email atau password salah. Silakan coba lagi." };

  // Akun staf lebih dulu, lalu akun portal alumni.
  const [staf] = await db
    .select()
    .from(schema.pengguna)
    .where(and(sql`lower(${schema.pengguna.email}) = ${email}`, isNotNull(schema.pengguna.passwordHash)));
  if (staf) {
    if (staf.status !== "Aktif" || !(await verifyPassword(password, staf.passwordHash))) return gagal;
    await db
      .update(schema.pengguna)
      .set({ terakhirLogin: new Date().toISOString() })
      .where(eq(schema.pengguna.id, staf.id));
    await createSession({ sub: staf.id, tipe: "pengguna", role: "admin" }, maxAge);
    redirect(homePathByRole.admin);
  }

  const [alumni] = await db
    .select({ nik: schema.alumni.nik, passwordHash: schema.alumni.passwordHash })
    .from(schema.alumni)
    .where(and(sql`lower(${schema.alumni.email}) = ${email}`, isNotNull(schema.alumni.passwordHash)));
  if (!alumni || !(await verifyPassword(password, alumni.passwordHash))) return gagal;

  await createSession({ sub: alumni.nik, tipe: "alumni", role: "alumni" }, maxAge);
  redirect(homePathByRole.alumni);
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}

// Pengiriman email belum tersedia – pesan konfirmasi saja.
export async function requestPasswordReset(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!emailPattern.test(email)) {
    return { error: "Masukkan alamat email yang valid." };
  }

  // Pesan sengaja sama untuk email terdaftar maupun tidak, agar tidak membocorkan akun yang ada.
  return {
    success: `Jika ${email} terdaftar, tautan untuk mengatur ulang password akan dikirim ke email tersebut.`,
  };
}

// Permintaan akun disimpan di tabel pendaftaran_akun dan menunggu persetujuan admin sekolah.
export async function register(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const nama = String(formData.get("nama") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const sekolah = String(formData.get("sekolah") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const konfirmasi = String(formData.get("konfirmasi") ?? "");

  if (!nama || !sekolah) {
    return { error: "Full name and school are required." };
  }
  if (!emailPattern.test(email)) {
    return { error: "Please enter a valid email address." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  if (password !== konfirmasi) {
    return { error: "Passwords do not match." };
  }

  const [sekolahAda] = await db
    .select({ nama: schema.sekolah.nama })
    .from(schema.sekolah)
    .where(eq(schema.sekolah.nama, sekolah));
  if (!sekolahAda) {
    return { error: "Please select a school from the list." };
  }

  const [stafAda, alumniAda, pendaftaranAda] = await Promise.all([
    db.select({ id: schema.pengguna.id }).from(schema.pengguna).where(sql`lower(${schema.pengguna.email}) = ${email}`),
    db
      .select({ nik: schema.alumni.nik })
      .from(schema.alumni)
      .where(and(sql`lower(${schema.alumni.email}) = ${email}`, isNotNull(schema.alumni.passwordHash))),
    db
      .select({ id: schema.pendaftaranAkun.id })
      .from(schema.pendaftaranAkun)
      .where(and(eq(schema.pendaftaranAkun.email, email), eq(schema.pendaftaranAkun.status, "Menunggu"))),
  ]);
  if (stafAda.length || alumniAda.length) {
    return { error: "This email is already registered. Please sign in or use Forgot Password." };
  }
  if (pendaftaranAda.length) {
    return { error: "A registration for this email is already waiting for approval." };
  }

  await db.insert(schema.pendaftaranAkun).values({
    id: randomUUID(),
    nama,
    email,
    sekolah,
    passwordHash: await hashPassword(password),
  });

  return {
    success:
      "Registration submitted. Your account will be activated once approved by the School Admin.",
  };
}
