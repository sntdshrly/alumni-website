"use client";

import Link from "next/link";
import { useActionState } from "react";
import { CircleCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authButtonClassName, authInputClassName } from "@/components/auth/auth-card";
import { BiodataFields } from "@/components/auth/biodata-fields";
import type { FormState } from "@/app/login/actions";
import { daftarDenganGoogle } from "./actions";

const initialState: FormState = {};

export function GoogleRegisterForm({
  nama,
  email,
  sekolahOptions,
  perguruanTinggi,
}: {
  nama: string;
  email: string;
  sekolahOptions: string[];
  perguruanTinggi: { id: string; nama: string }[];
}) {
  const [state, formAction, isPending] = useActionState(daftarDenganGoogle, initialState);

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
        <Input id="nama" name="nama" defaultValue={nama} required autoComplete="name" className={authInputClassName} />
      </div>

      <div className="flex flex-col gap-1">
        <Label htmlFor="email" className="text-xs text-slate-500">
          Email (from Google)
        </Label>
        <Input id="email" value={email} readOnly disabled className={`${authInputClassName} text-slate-500`} />
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
          {sekolahOptions.map((s) => (
            <option key={s} value={s} className="text-slate-900">
              {s}
            </option>
          ))}
        </select>
      </div>

      <BiodataFields perguruanTinggi={perguruanTinggi} />

      {state.error && <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-600">{state.error}</p>}

      <Button type="submit" size="lg" className={`mt-1 ${authButtonClassName}`} disabled={isPending}>
        {isPending && <Loader2 className="animate-spin" />}
        SUBMIT REGISTRATION
      </Button>

      <p className="text-center text-sm text-slate-500">
        Not your account?{" "}
        <Link href="/login" className="font-medium text-[#0089c2] hover:underline">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
