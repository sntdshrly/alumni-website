import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth";

// Menghapus cookie sesi lalu kembali ke halaman login. Dipakai saat token masih valid tetapi
// akunnya sudah tidak aktif, agar tidak terjadi redirect berulang antara /login dan dashboard.
export function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/login", request.url));
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
