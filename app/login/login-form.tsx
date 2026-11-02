"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  authButtonClassName,
  authInputClassName,
} from "@/components/auth/auth-card";
import { login, type LoginState } from "./actions";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84Z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A10.96 10.96 0 0 0 12 1a11 11 0 0 0-9.82 6.05l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z" />
    </svg>
  );
}

const initialState: LoginState = {};

export function LoginForm({
  googleAktif,
  pesanGoogle,
}: {
  googleAktif: boolean;
  pesanGoogle?: { teks: string; jenis: "info" | "error" };
}) {
  const [state, formAction, isPending] = useActionState(login, initialState);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="mt-6 flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <Label htmlFor="email" className="text-xs text-slate-500">
          Email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="superadmin@binus.ac.id"
          defaultValue="superadmin@binus.ac.id"
          required
          autoComplete="username"
          className={authInputClassName}
        />
      </div>

      <div className="flex flex-col gap-1">
        <Label htmlFor="password" className="text-xs text-slate-500">
          Password
        </Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••••••"
            required
            autoComplete="current-password"
            className={`${authInputClassName} pr-8`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute top-1/2 right-0 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
            aria-label={
              showPassword ? "Sembunyikan password" : "Tampilkan password"
            }
          >
            {showPassword ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <label className="flex cursor-pointer items-center gap-2 text-slate-900">
          <input
            type="checkbox"
            name="remember"
            className="size-4 accent-[#00A9E8]"
          />
          Remember me
        </label>
        <Link
          href="/forgot-password"
          className="font-medium text-[#0089c2] hover:underline"
        >
          Forget password?
        </Link>
      </div>

      {pesanGoogle && !state?.error && (
        <p
          className={
            pesanGoogle.jenis === "error"
              ? "rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-600"
              : "rounded-md bg-sky-50 px-3 py-2 text-sm text-sky-700"
          }
        >
          {pesanGoogle.teks}
        </p>
      )}

      {state?.error && (
        <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-600">
          {state.error}
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        className={authButtonClassName}
        disabled={isPending}
      >
        {isPending && <Loader2 className="animate-spin" />}
        LOGIN
      </Button>

      {googleAktif && (
        <>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="h-px flex-1 bg-slate-200" />
            or
            <span className="h-px flex-1 bg-slate-200" />
          </div>
          {/* Tautan biasa (bukan fetch) karena alurnya berpindah ke halaman Google. */}
          <a
            href="/api/auth/google"
            className="flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            <GoogleIcon />
            Sign in with Google
          </a>
        </>
      )}

      <p className="text-center text-sm text-slate-900">
        No account yet?{" "}
        <Link
          href="/register"
          className="font-medium text-[#0089c2] hover:underline"
        >
          Create account
        </Link>
      </p>
    </form>
  );
}
