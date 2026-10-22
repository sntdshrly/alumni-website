import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { findAccountById, SESSION_COOKIE, type Role } from "@/lib/auth";

// Akun yang sedang login, tanpa password – aman dikirim ke komponen klien.
export type SessionAccount = {
  id: string;
  email: string;
  name: string;
  role: Role;
  roleLabel: string;
  school: string;
  alumniNik?: string;
};

export async function getCurrentAccount(): Promise<SessionAccount | null> {
  const cookieStore = await cookies();
  const account = findAccountById(cookieStore.get(SESSION_COOKIE)?.value);
  if (!account) return null;
  // Salin field satu per satu agar password tidak pernah ikut terkirim.
  return {
    id: account.id,
    email: account.email,
    name: account.name,
    role: account.role,
    roleLabel: account.roleLabel,
    school: account.school,
    alumniNik: account.alumniNik,
  };
}

// Dipakai di layout/halaman yang khusus untuk satu role.
export async function requireAccount(role: Role): Promise<SessionAccount> {
  const account = await getCurrentAccount();
  if (!account || account.role !== role) redirect("/login");
  return account;
}
