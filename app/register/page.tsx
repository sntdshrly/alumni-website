import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/auth-card";
import { sekolahList } from "@/data/sekolah";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = {
  title: "Create Account • Alumni Tracking System",
};

export default function RegisterPage() {
  return (
    <AuthCard
      title="Create Account"
      subtitle="New accounts will be activated once approved by the School Admin"
    >
      <RegisterForm sekolahOptions={sekolahList.map((s) => s.nama)} />
    </AuthCard>
  );
}
