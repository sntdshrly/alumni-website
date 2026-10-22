"use client";

import { CircleCheck, CircleX, Clock, SearchCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StatusValidasi } from "@/data/alumni";

// Tampilan status validasi yang dipakai bersama oleh Data Alumni dan Verifikasi Data.

export const validasiStyles: Record<StatusValidasi, string> = {
  Valid: "bg-emerald-50 text-emerald-700",
  Pending: "bg-amber-50 text-amber-700",
  "On Review": "bg-blue-50 text-blue-700",
  Rejected: "bg-rose-50 text-rose-700",
};

export const validasiKpi: {
  validasi: StatusValidasi;
  icon: React.ComponentType<{ className?: string }>;
  iconClassName: string;
}[] = [
  {
    validasi: "Valid",
    icon: CircleCheck,
    iconClassName: "bg-emerald-50 text-emerald-600",
  },
  {
    validasi: "Pending",
    icon: Clock,
    iconClassName: "bg-amber-50 text-amber-600",
  },
  {
    validasi: "On Review",
    icon: SearchCheck,
    iconClassName: "bg-blue-50 text-blue-600",
  },
  {
    validasi: "Rejected",
    icon: CircleX,
    iconClassName: "bg-rose-50 text-rose-600",
  },
];

export const validasiDeskripsi: Record<StatusValidasi, string> = {
  Valid: "Data sudah benar",
  Pending: "Masih dalam antrian untuk direview",
  "On Review": "Sedang dicek oleh admin",
  Rejected: "Data tidak sesuai",
};

export function ValidasiBadge({
  validasi,
  className,
}: {
  validasi: StatusValidasi;
  className?: string;
}) {
  return (
    <span
      title={validasiDeskripsi[validasi]}
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        validasiStyles[validasi],
        className,
      )}
    >
      {validasi}
    </span>
  );
}
