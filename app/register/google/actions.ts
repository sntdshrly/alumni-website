"use server";

import { cookies } from "next/headers";
import type { FormState } from "@/app/login/actions";
import { GOOGLE_SIGNUP_COOKIE, verifySignup } from "@/lib/google-oauth";
import { bacaBiodata } from "@/lib/registrasi";
import { simpanPermintaan } from "@/lib/registrasi-server";

// Email selalu diambil dari token Google yang ditandatangani, bukan dari isian form.
export async function daftarDenganGoogle(_prev: FormState, formData: FormData): Promise<FormState> {
  const cookieStore = await cookies();
  const profil = await verifySignup(cookieStore.get(GOOGLE_SIGNUP_COOKIE)?.value);
  if (!profil) return { error: "Your Google sign-up session has expired. Please sign up with Google again." };

  const hasil = await simpanPermintaan({
    nama: String(formData.get("nama") ?? ""),
    email: profil.email,
    sekolah: String(formData.get("sekolah") ?? "").trim(),
    biodata: bacaBiodata(formData),
    passwordHash: null,
    sumber: "Google",
  });
  if (hasil.error) return hasil;

  cookieStore.delete(GOOGLE_SIGNUP_COOKIE);
  return {
    success:
      "Registration submitted. You can sign in with Google once the School Admin approves your account.",
  };
}
