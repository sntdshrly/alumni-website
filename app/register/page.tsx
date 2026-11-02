import type { Metadata } from "next";
import { connection } from "next/server";
import { AuthCard } from "@/components/auth/auth-card";
import { listPerguruanTinggi, namaSekolahAktif } from "@/lib/data";
import { googleAktif } from "@/lib/google-oauth";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = {
  title: "Create Account • Alumni Tracking System",
};

export default async function RegisterPage() {
  // Daftar sekolah diambil saat request agar sekolah baru langsung muncul (tidak di-prerender).
  await connection();
  const [sekolahOptions, perguruanTinggi] = await Promise.all([namaSekolahAktif(), listPerguruanTinggi()]);
  return (
    <AuthCard
      title="Create Account"
      subtitle="New accounts will be activated once approved by the School Admin"
    >
      <RegisterForm
        sekolahOptions={sekolahOptions}
        perguruanTinggi={perguruanTinggi.filter((pt) => pt.status === "Aktif").map(({ id, nama }) => ({ id, nama }))}
        googleAktif={googleAktif()}
      />
    </AuthCard>
  );
}
