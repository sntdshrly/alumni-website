"use client";

import Link from "next/link";
import { useActionState } from "react";
import { CircleCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authButtonClassName, authInputClassName } from "@/components/auth/auth-card";
import { register, type FormState } from "@/app/login/actions";

const initialState: FormState = {};

export function RegisterForm({ sekolahOptions }: { sekolahOptions: string[] }) {
  const [state, formAction, isPending] = useActionState(register, initialState);

  if (state.success) {
    return (
      <div className="mt-6 flex flex-col gap-5">
        <div className="flex items-start gap-2 rounded-md bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700">
          <CircleCheck className="mt-0.5 size-4 shrink-0" />
          <p>{state.success}</p>
        </div>
        <Link href="/login" className="text-center text-sm font-medium text-[#0089c2] hover:underline">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="mt-5 flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <Label htmlFor="nama" className="text-xs text-slate-500">
          Full Name
        </Label>
        <Input
          id="nama"
          name="nama"
          placeholder="Name as in school records"
          required
          autoComplete="name"
          className={authInputClassName}
        />
      </div>

      <div className="flex flex-col gap-1">
        <Label htmlFor="email" className="text-xs text-slate-500">
          Email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="name@school.sch.id"
          required
          autoComplete="email"
          className={authInputClassName}
        />
      </div>

      <div className="flex flex-col gap-1">
        <Label htmlFor="sekolah" className="text-xs text-slate-500">
          School
        </Label>
        <select
          id="sekolah"
          name="sekolah"
          required
          defaultValue=""
          className={`${authInputClassName} w-full text-sm outline-none invalid:text-slate-400`}
        >
          <option value="" disabled>
            Select school
          </option>
          {sekolahOptions.map((nama) => (
            <option key={nama} value={nama} className="text-slate-900">
              {nama}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <Label htmlFor="password" className="text-xs text-slate-500">
            Password
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Min. 8 characters"
            required
            minLength={8}
            autoComplete="new-password"
            className={authInputClassName}
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="konfirmasi" className="text-xs text-slate-500">
            Confirm Password
          </Label>
          <Input
            id="konfirmasi"
            name="konfirmasi"
            type="password"
            placeholder="Repeat password"
            required
            autoComplete="new-password"
            className={authInputClassName}
          />
        </div>
      </div>

      {state.error && (
        <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-600">{state.error}</p>
      )}

      <Button type="submit" size="lg" className={`mt-1 ${authButtonClassName}`} disabled={isPending}>
        {isPending && <Loader2 className="animate-spin" />}
        REGISTER
      </Button>

      <p className="text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-[#0089c2] hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
