import { and, eq, isNotNull, sql } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { homePathByRole } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import {
  ambilProfilGoogle,
  GOOGLE_SIGNUP_COOKIE,
  GOOGLE_STATE_COOKIE,
  signSignup,
  SIGNUP_MAX_AGE,
} from "@/lib/google-oauth";
import { createSession } from "@/lib/session";

const DELAPAN_JAM = 60 * 60 * 8;

// Langkah 2: Google mengembalikan pengguna ke sini. Email Google yang terverifikasi dicocokkan
// dengan akun staf lalu data alumni; email yang belum dikenal diarahkan ke form pendaftaran.
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const cookieStore = await cookies();
  const tersimpan = cookieStore.get(GOOGLE_STATE_COOKIE)?.value;
  cookieStore.delete({ name: GOOGLE_STATE_COOKIE, path: "/api/auth/google" });

  if (params.get("error")) redirect("/login?google=batal");

  let state = "";
  let verifier = "";
  try {
    ({ state, verifier } = JSON.parse(tersimpan ?? "{}"));
  } catch {
    // cookie rusak diperlakukan sama seperti tidak ada
  }
  const code = params.get("code");
  if (!code || !state || params.get("state") !== state) redirect("/login?google=gagal");

  const profil = await ambilProfilGoogle(request.nextUrl.origin, code, verifier);
  if (!profil) redirect("/login?google=gagal");

  const [staf] = await db
    .select({ id: schema.pengguna.id, status: schema.pengguna.status })
    .from(schema.pengguna)
    .where(sql`lower(${schema.pengguna.email}) = ${profil.email}`);
  if (staf) {
    if (staf.status !== "Aktif") redirect("/login?google=nonaktif");
    await db
      .update(schema.pengguna)
      .set({ terakhirLogin: new Date().toISOString() })
      .where(eq(schema.pengguna.id, staf.id));
    await createSession({ sub: staf.id, tipe: "pengguna", role: "admin" }, DELAPAN_JAM);
    redirect(homePathByRole.admin);
  }

  const [alumni] = await db
    .select({ nik: schema.alumni.nik })
    .from(schema.alumni)
    .where(sql`lower(${schema.alumni.email}) = ${profil.email}`)
    .limit(1);
  if (alumni) {
    await createSession({ sub: alumni.nik, tipe: "alumni", role: "alumni" }, DELAPAN_JAM);
    redirect(homePathByRole.alumni);
  }

  // Sudah mengirim pendaftaran lengkap: tinggal menunggu persetujuan admin.
  const [menunggu] = await db
    .select({ id: schema.pendaftaranAkun.id })
    .from(schema.pendaftaranAkun)
    .where(
      and(
        sql`lower(${schema.pendaftaranAkun.email}) = ${profil.email}`,
        eq(schema.pendaftaranAkun.status, "Menunggu"),
        isNotNull(schema.pendaftaranAkun.biodata),
      ),
    );
  if (menunggu) redirect("/login?google=menunggu");

  // Belum terdaftar: lanjut ke form pilih sekolah dan isi biodata.
  cookieStore.set(GOOGLE_SIGNUP_COOKIE, await signSignup(profil), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SIGNUP_MAX_AGE,
  });
  redirect("/register/google");
}
