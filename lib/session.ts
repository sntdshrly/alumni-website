import "server-only";

import { cache } from "react";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, type Role } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { signSession, verifySession, type SessionPayload } from "@/lib/session-token";
import { roleLintasSekolah, SEMUA_SEKOLAH } from "@/data/pengguna";

// Akun yang sedang login, tanpa password – aman dikirim ke komponen klien.
export type SessionAccount = {
  id: string;
  email: string;
  name: string;
  role: Role;
  roleLabel: string;
  // Nama sekolah untuk ditampilkan; "Semua Sekolah" bagi akun lintas sekolah.
  school: string;
  // Sekolah yang datanya boleh dilihat dan diubah; null berarti semua sekolah (Super Admin).
  sekolahScope: string | null;
  alumniNik?: string;
};

export async function createSession(payload: SessionPayload, maxAgeSeconds: number) {
  const token = await signSession(payload, maxAgeSeconds);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: maxAgeSeconds,
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

// Dibaca ulang dari database setiap request agar akun yang dinonaktifkan langsung kehilangan akses.
// cache() memastikan satu request hanya melakukan satu query walau dipanggil berkali-kali.
export const getCurrentAccount = cache(async (): Promise<SessionAccount | null> => {
  const cookieStore = await cookies();
  const session = await verifySession(cookieStore.get(SESSION_COOKIE)?.value);
  if (!session) return null;

  if (session.tipe === "pengguna") {
    const [p] = await db.select().from(schema.pengguna).where(eq(schema.pengguna.id, session.sub));
    // Akun bisa masuk lewat password atau Google, jadi cukup dicek masih aktif.
    if (!p || p.status !== "Aktif") return null;
    const lintasSekolah = roleLintasSekolah.includes(p.role);
    return {
      id: p.id,
      email: p.email,
      name: p.nama,
      role: "admin",
      roleLabel: p.role,
      school: lintasSekolah ? SEMUA_SEKOLAH : p.sekolah,
      sekolahScope: lintasSekolah ? null : p.sekolah,
    };
  }

  const [a] = await db.select().from(schema.alumni).where(eq(schema.alumni.nik, session.sub));
  if (!a) return null;
  return {
    id: a.nik,
    email: a.email,
    name: a.nama,
    role: "alumni",
    roleLabel: "Alumni",
    school: a.sekolah,
    sekolahScope: a.sekolah,
    alumniNik: a.nik,
  };
});

// Dipakai di layout/halaman yang khusus untuk satu role.
export async function requireAccount(role: Role): Promise<SessionAccount> {
  const account = await getCurrentAccount();
  // Token valid tapi akun tidak lagi aktif: hapus cookie lewat route handler (komponen server
  // tidak boleh mengubah cookie) agar proxy tidak terus mengarahkan kembali ke dashboard.
  if (!account) redirect("/api/logout");
  if (account.role !== role) redirect("/login");
  return account;
}

// true bila akun boleh melihat/mengubah data milik sekolah tersebut.
export function bolehAksesSekolah(account: SessionAccount, sekolah: string) {
  return account.sekolahScope === null || account.sekolahScope === sekolah;
}
