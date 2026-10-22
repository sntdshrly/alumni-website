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

const initialState: LoginState = {};

export function LoginForm() {
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
