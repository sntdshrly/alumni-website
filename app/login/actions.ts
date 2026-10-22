"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  DUMMY_ACCOUNTS,
  SESSION_COOKIE,
  findAccountByCredentials,
  homePathByRole,
} from "@/lib/auth";

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
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const remember = formData.get("remember") === "on";

  const account = findAccountByCredentials(email, password);
  if (!account) {
    return { error: "Email atau password salah. Silakan coba lagi." };
  }

  const cookieStore = await cookies();
  // MVP: cookie hanya menyimpan id akun dummy. Saat memakai database, ganti dengan sesi
  // yang ditandatangani/terenkripsi agar tidak bisa dipalsukan.
  cookieStore.set(SESSION_COOKIE, account.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    // "Ingat saya" memperpanjang sesi dari 8 jam menjadi 30 hari.
    maxAge: remember ? 60 * 60 * 24 * 30 : 60 * 60 * 8,
  });

  redirect(homePathByRole[account.role]);
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect("/login");
}

// Dummy untuk MVP – belum benar-benar mengirim email.
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

// Dummy untuk MVP – pendaftaran belum disimpan ke database.
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
  if (DUMMY_ACCOUNTS.some((account) => account.email === email)) {
    return { error: "This email is already registered. Please sign in or use Forgot Password." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  if (password !== konfirmasi) {
    return { error: "Passwords do not match." };
  }

  return {
    success:
      "Registration submitted. Your account will be activated once approved by the School Admin.",
  };
}
