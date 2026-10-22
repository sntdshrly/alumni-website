import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/auth-card";
import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata: Metadata = {
  title: "Lupa Password • Alumni Tracking System",
};

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Lupa Password"
      subtitle="Masukkan email akun Anda, kami akan mengirim tautan untuk mengatur ulang password"
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
