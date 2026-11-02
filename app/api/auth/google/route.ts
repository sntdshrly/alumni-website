import { NextResponse, type NextRequest } from "next/server";
import { buatPermintaanLogin, GOOGLE_STATE_COOKIE, googleAktif } from "@/lib/google-oauth";

// Langkah 1: arahkan pengguna ke halaman pilih akun Google.
export function GET(request: NextRequest) {
  if (!googleAktif()) return NextResponse.redirect(new URL("/login?google=gagal", request.url));

  const { url, state, verifier } = buatPermintaanLogin(request.nextUrl.origin);
  const response = NextResponse.redirect(url);
  // state & PKCE verifier disimpan sementara untuk dicocokkan saat Google mengembalikan pengguna.
  response.cookies.set(GOOGLE_STATE_COOKIE, JSON.stringify({ state, verifier }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth/google",
    maxAge: 600,
  });
  return response;
}
