import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, findAccountById, homePathByRole, type Role } from "@/lib/auth";

const authPages = ["/login", "/register", "/forgot-password"];

// Area yang hanya boleh dibuka oleh role tertentu.
const protectedAreas: { prefix: string; role: Role }[] = [
  { prefix: "/dashboard", role: "admin" },
  { prefix: "/alumni", role: "alumni" },
];

export function proxy(request: NextRequest) {
  const account = findAccountById(request.cookies.get(SESSION_COOKIE)?.value);
  const { pathname } = request.nextUrl;

  const area = protectedAreas.find(
    ({ prefix }) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  if (area) {
    if (!account) return NextResponse.redirect(new URL("/login", request.url));
    // Login dengan role lain: arahkan ke halaman awal role-nya sendiri.
    if (account.role !== area.role) {
      return NextResponse.redirect(new URL(homePathByRole[account.role], request.url));
    }
  }

  if (authPages.includes(pathname) && account) {
    return NextResponse.redirect(new URL(homePathByRole[account.role], request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/alumni/:path*", "/login", "/register", "/forgot-password"],
};
