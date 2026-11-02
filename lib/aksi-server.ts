import "server-only";

import { getCurrentAccount, type SessionAccount } from "@/lib/session";

export type HasilAksi = { error?: string; success?: string };

export const sesiBerakhir = { error: "Sesi berakhir. Silakan masuk kembali." } as const;
export const tidakBerhak = { error: "Anda tidak memiliki akses untuk tindakan ini." } as const;

// Akun admin yang sedang login, atau null bila belum login / bukan admin.
export async function akunAdmin(): Promise<SessionAccount | null> {
  const account = await getCurrentAccount();
  return account?.role === "admin" ? account : null;
}

export const isSuperAdmin = (account: SessionAccount) => account.sekolahScope === null;

export function formatHariIni() {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(new Date());
}
