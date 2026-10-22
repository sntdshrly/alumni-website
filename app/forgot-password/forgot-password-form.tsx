"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ArrowLeft, CircleCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authButtonClassName, authInputClassName } from "@/components/auth/auth-card";
import { requestPasswordReset, type FormState } from "@/app/login/actions";

const initialState: FormState = {};

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState(requestPasswordReset, initialState);

  return (
    <form action={formAction} className="mt-6 flex flex-col gap-5">
      {state.success ? (
        <div className="flex items-start gap-2 rounded-md bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700">
          <CircleCheck className="mt-0.5 size-4 shrink-0" />
          <p>{state.success}</p>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-1">
            <Label htmlFor="email" className="text-xs text-slate-500">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="nama@sekolah.sch.id"
              required
              autoComplete="email"
              className={authInputClassName}
            />
          </div>

          {state.error && (
            <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-600">{state.error}</p>
          )}

          <Button type="submit" size="lg" className={authButtonClassName} disabled={isPending}>
            {isPending && <Loader2 className="animate-spin" />}
            KIRIM TAUTAN
          </Button>
        </>
      )}

      <Link
        href="/login"
        className="flex items-center justify-center gap-1.5 text-sm font-medium text-[#0089c2] hover:underline"
      >
        <ArrowLeft className="size-3.5" />
        Kembali ke halaman masuk
      </Link>
    </form>
  );
}
