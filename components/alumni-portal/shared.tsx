"use client";

import { cn } from "@/lib/utils";
import { isStatusBekerja, isStatusKuliah, type Alumni } from "@/data/alumni";
import type { PerguruanTinggi } from "@/data/perguruan-tinggi";

export function initials(nama: string) {
  return nama
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}

// Ringkasan singkat perjalanan alumni, misalnya "S1 Manajemen • Universitas Indonesia".
export function ringkasanKegiatan(a: Alumni, ptById: Map<string, PerguruanTinggi>) {
  if (isStatusKuliah(a.statusSetelahLulus)) {
    return [a.programStudi, ptById.get(a.perguruanTinggiId)?.nama].filter(Boolean).join(" • ");
  }
  if (isStatusBekerja(a.statusSetelahLulus)) {
    return [a.jabatan, a.tempatKerja].filter(Boolean).join(" • ");
  }
  return "";
}

export function Avatar({ nama, className }: { nama: string; className?: string }) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-blue-50 font-semibold text-blue-600",
        className,
      )}
    >
      {initials(nama)}
    </div>
  );
}

export function Card({
  title,
  description,
  actions,
  children,
  className,
}: {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-xl border border-black/5 bg-white p-5 shadow-sm", className)}>
      {(title || actions) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title && <h2 className="text-sm font-semibold text-slate-900">{title}</h2>}
            {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

// Saklar on/off sederhana untuk pengaturan privasi.
export function Toggle({
  checked,
  onChange,
  label,
  description,
  disabled,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}) {
  return (
    <label
      className={cn(
        "flex items-start justify-between gap-4 py-2.5",
        disabled ? "opacity-50" : "cursor-pointer",
      )}
    >
      <span>
        <span className="block text-sm font-medium text-slate-800">{label}</span>
        {description && <span className="block text-xs text-slate-500">{description}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative mt-0.5 inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors",
          checked ? "bg-blue-600" : "bg-slate-300",
        )}
      >
        <span
          className={cn(
            "inline-block size-4 rounded-full bg-white shadow transition-transform",
            checked ? "translate-x-4.5" : "translate-x-0.5",
          )}
        />
      </button>
    </label>
  );
}
