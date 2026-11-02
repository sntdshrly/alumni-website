import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/auth-card";
import { listPerguruanTinggi, namaSekolahAktif } from "@/lib/data";
import { GOOGLE_SIGNUP_COOKIE, verifySignup } from "@/lib/google-oauth";
import { GoogleRegisterForm } from "./google-register-form";

export const metadata: Metadata = {
  title: "Complete Registration • Alumni Tracking System",
};

// Dibuka setelah login Google dengan email yang belum terdaftar (lihat /api/auth/google/callback).
export default async function GoogleRegisterPage() {
  const profil = await verifySignup((await cookies()).get(GOOGLE_SIGNUP_COOKIE)?.value);
  if (!profil) redirect("/login?google=kedaluwarsa");

  const [sekolahOptions, perguruanTinggi] = await Promise.all([namaSekolahAktif(), listPerguruanTinggi()]);
  return (
    <AuthCard
      title="Complete Registration"
      subtitle="Select your school and fill in your alumni biodata. Your account will be active once approved by the School Admin."
    >
      <GoogleRegisterForm
        nama={profil.nama}
        email={profil.email}
        sekolahOptions={sekolahOptions}
        perguruanTinggi={perguruanTinggi.filter((pt) => pt.status === "Aktif").map(({ id, nama }) => ({ id, nama }))}
      />
    </AuthCard>
  );
}
