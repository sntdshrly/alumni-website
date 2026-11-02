import type { Metadata } from "next";
import { connection } from "next/server";
import { AuthCard } from "@/components/auth/auth-card";
import { namaSekolahAktif } from "@/lib/data";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = {
  title: "Create Account • Alumni Tracking System",
};

export default async function RegisterPage() {
  // Daftar sekolah diambil saat request agar sekolah baru langsung muncul (tidak di-prerender).
  await connection();
  return (
    <AuthCard
      title="Create Account"
      subtitle="New accounts will be activated once approved by the School Admin"
    >
      <RegisterForm sekolahOptions={await namaSekolahAktif()} />
    </AuthCard>
  );
}
