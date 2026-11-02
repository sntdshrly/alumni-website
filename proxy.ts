import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, homePathByRole, type Role } from "@/lib/auth";
import { verifySession } from "@/lib/session-token";

const authPages = ["/login", "/register", "/forgot-password"];

// Area yang hanya boleh dibuka oleh role tertentu.
const protectedAreas: { prefix: string; role: Role }[] = [
  { prefix: "/dashboard", role: "admin" },
  { prefix: "/alumni", role: "alumni" },
];

// Pemeriksaan cepat berdasarkan token bertanda tangan. Status akun dan batas sekolah tetap
// diperiksa ulang ke database di setiap halaman dan server action (lib/session.ts).
export async function proxy(request: NextRequest) {
  const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);
  const { pathname } = request.nextUrl;

  const area = protectedAreas.find(
    ({ prefix }) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  if (area) {
    if (!session) return NextResponse.redirect(new URL("/login", request.url));
    // Login dengan role lain: arahkan ke halaman awal role-nya sendiri.
    if (session.role !== area.role) {
      return NextResponse.redirect(new URL(homePathByRole[session.role], request.url));
    }
  }

  if (authPages.includes(pathname) && session) {
    return NextResponse.redirect(new URL(homePathByRole[session.role], request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/alumni/:path*", "/login", "/register", "/forgot-password"],
};
