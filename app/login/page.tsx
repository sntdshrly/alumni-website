import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Alumni Tracking System",
};

export default function LoginPage() {
  return (
    <AuthCard
      title="Login"
      subtitle="Please enter your login information or click create account to register"
    >
      <LoginForm />
    </AuthCard>
  );
}
