"use client";

import { Bell, CalendarCheck } from "lucide-react";
import { usePortal } from "@/components/alumni-portal/portal-store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const waktuFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Jakarta",
});

// Lonceng notifikasi portal alumni; bulatan merah muncul selama ada notifikasi yang belum dibaca.
// Notifikasi baru dianggap dibaca setelah notifikasi itu sendiri diklik.
export function NotificationBell() {
  const { notifikasi, tandaiDibaca, tandaiSemuaDibaca } = usePortal();
  const belumDibaca = notifikasi.filter((n) => !n.dibaca).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={belumDibaca ? `${belumDibaca} notifikasi belum dibaca` : "Notifikasi"}
        className="relative flex size-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
      >
        <Bell className="size-5" />
        {belumDibaca > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white ring-2 ring-white">
            {belumDibaca > 9 ? "9+" : belumDibaca}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuGroup>
          <div className="flex items-center justify-between gap-2 pr-1">
            <DropdownMenuLabel className="text-sm font-semibold text-slate-900">Notifikasi</DropdownMenuLabel>
            {belumDibaca > 0 && (
              <button
                type="button"
                onClick={tandaiSemuaDibaca}
                className="text-xs font-medium text-blue-600 hover:underline"
              >
                Tandai semua dibaca
              </button>
            )}
          </div>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {notifikasi.length === 0 ? (
          <p className="px-2 py-6 text-center text-xs text-slate-500">Belum ada notifikasi.</p>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            {notifikasi.map((n) => (
              <DropdownMenuItem
                key={n.id}
                // Panel tetap terbuka agar perubahan status dibaca langsung terlihat.
                closeOnClick={false}
                onClick={() => tandaiDibaca(n.id)}
                className={cn(
                  "flex cursor-pointer items-start gap-2.5 rounded-md px-2 py-2.5",
                  !n.dibaca && "bg-blue-50/70",
                )}
              >
                <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <CalendarCheck className="size-3.5" />
                </span>
                <div className="min-w-0 flex-1 whitespace-normal">
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-900">
                    {n.judul}
                    {!n.dibaca && <span className="size-1.5 shrink-0 rounded-full bg-rose-600" />}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-600">{n.pesan}</p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    {waktuFormatter.format(new Date(n.waktu))}
                    {!n.dibaca && " • Klik untuk menandai dibaca"}
                  </p>
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
