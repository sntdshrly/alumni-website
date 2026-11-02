import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/auth-card";
import { googleAktif } from "@/lib/google-oauth";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Alumni Tracking System",
};

// Pesan hasil login Google, dikirim lewat ?google=... dari /api/auth/google/callback.
const pesanGoogle: Record<string, { teks: string; jenis: "info" | "error" }> = {
  menunggu: {
    teks: "Your Google account is not registered yet. A registration request has been sent and is waiting for School Admin approval.",
    jenis: "info",
  },
  nonaktif: { teks: "This account is inactive. Please contact your School Admin.", jenis: "error" },
  gagal: { teks: "Google sign-in failed. Please try again.", jenis: "error" },
  batal: { teks: "Google sign-in was cancelled.", jenis: "info" },
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { google } = await searchParams;
  const pesan = typeof google === "string" ? pesanGoogle[google] : undefined;

  return (
    <AuthCard
      title="Login"
      subtitle="Please enter your login information or click create account to register"
    >
      <LoginForm googleAktif={googleAktif()} pesanGoogle={pesan} />
    </AuthCard>
  );
}
