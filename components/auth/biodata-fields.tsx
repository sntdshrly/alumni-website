"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authInputClassName } from "@/components/auth/auth-card";
import {
  isStatusBekerja,
  isStatusKuliah,
  kelasOptions,
  labelPekerjaan,
  statusPilihanAlumni,
  type StatusSetelahLulus,
} from "@/data/alumni";

// Label bahasa Inggris untuk halaman Register; nilai yang dikirim tetap status asli di database.
const statusLabel: Record<string, string> = {
  "Aktif Kuliah": "Currently studying",
  Diterima: "Accepted at a university",
  "Daftar Ulang": "Re-registering at a university",
  Bekerja: "Working",
  Wirausaha: "Entrepreneur",
  "Mencari Pekerjaan": "Looking for a job",
  "Gap Year": "Gap year",
};

const selectClassName = `${authInputClassName} w-full text-sm outline-none invalid:text-slate-400`;

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <Label htmlFor={id} className="text-xs text-slate-500">
        {label}
      </Label>
      {children}
    </div>
  );
}

// Isian biodata alumni untuk pendaftaran akun (Register biasa maupun lewat Google).
export function BiodataFields({ perguruanTinggi }: { perguruanTinggi: { id: string; nama: string }[] }) {
  const [status, setStatus] = useState<StatusSetelahLulus | "">("");
  const kuliah = status !== "" && isStatusKuliah(status);
  const kerja = status !== "" && isStatusBekerja(status);
  const label = status !== "" ? labelPekerjaan(status) : null;
  const tahunIni = new Date().getFullYear();

  return (
    <>
      <p className="pt-1 text-xs font-semibold tracking-wider text-slate-400 uppercase">Alumni Biodata</p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field id="nik" label="NIK (16 digits)">
          <Input id="nik" name="nik" inputMode="numeric" pattern="\d{16}" maxLength={16} required className={authInputClassName} />
        </Field>
        <Field id="nisn" label="NISN (10 digits)">
          <Input id="nisn" name="nisn" inputMode="numeric" pattern="\d{10}" maxLength={10} required className={authInputClassName} />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field id="kelas" label="Class">
          <select id="kelas" name="kelas" required defaultValue="" className={selectClassName}>
            <option value="" disabled>
              Select class
            </option>
            {kelasOptions.map((k) => (
              <option key={k} value={k} className="text-slate-900">
                {k}
              </option>
            ))}
          </select>
        </Field>
        <Field id="tahunLulus" label="Graduation Year">
          <Input
            id="tahunLulus"
            name="tahunLulus"
            type="number"
            min={1990}
            max={tahunIni + 1}
            defaultValue={tahunIni}
            required
            className={authInputClassName}
          />
        </Field>
      </div>

      <Field id="telepon" label="Phone Number">
        <Input id="telepon" name="telepon" type="tel" placeholder="08xx-xxxx-xxxx" required autoComplete="tel" className={authInputClassName} />
      </Field>

      <Field id="statusSetelahLulus" label="Current Status">
        <select
          id="statusSetelahLulus"
          name="statusSetelahLulus"
          required
          value={status}
          onChange={(e) => setStatus(e.target.value as StatusSetelahLulus)}
          className={selectClassName}
        >
          <option value="" disabled>
            Select status
          </option>
          {statusPilihanAlumni.map((s) => (
            <option key={s} value={s} className="text-slate-900">
              {statusLabel[s] ?? s}
            </option>
          ))}
        </select>
      </Field>

      {kuliah && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field id="perguruanTinggiId" label="University">
            <select id="perguruanTinggiId" name="perguruanTinggiId" required defaultValue="" className={selectClassName}>
              <option value="" disabled>
                Select university
              </option>
              {perguruanTinggi.map((pt) => (
                <option key={pt.id} value={pt.id} className="text-slate-900">
                  {pt.nama}
                </option>
              ))}
            </select>
          </Field>
          <Field id="programStudi" label="Study Program">
            <Input id="programStudi" name="programStudi" placeholder="e.g. S1 Teknik Informatika" required className={authInputClassName} />
          </Field>
        </div>
      )}

      {kerja && label && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field id="jabatan" label={status === "Wirausaha" ? "Business Field" : "Job Title"}>
            <Input id="jabatan" name="jabatan" required className={authInputClassName} />
          </Field>
          <Field id="tempatKerja" label={status === "Wirausaha" ? "Business Name" : "Company"}>
            <Input id="tempatKerja" name="tempatKerja" required className={authInputClassName} />
          </Field>
        </div>
      )}
    </>
  );
}
