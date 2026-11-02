import { SignJWT, jwtVerify } from "jose";
import type { Role } from "@/lib/auth";

// Token sesi ditandatangani (HS256) dengan SESSION_SECRET, sehingga isi cookie tidak bisa
// dipalsukan. Dipakai bersama oleh proxy.ts dan lib/session.ts.

export type SessionPayload = {
  // Id pengguna staf, atau NIK untuk akun alumni.
  sub: string;
  tipe: "pengguna" | "alumni";
  role: Role;
};

function secretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET belum diatur.");
  return new TextEncoder().encode(secret);
}

export async function signSession(payload: SessionPayload, maxAgeSeconds: number) {
  return new SignJWT({ tipe: payload.tipe, role: payload.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${maxAgeSeconds}s`)
    .sign(secretKey());
}

export async function verifySession(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
    const { sub, tipe, role } = payload;
    if (typeof sub !== "string") return null;
    if (tipe !== "pengguna" && tipe !== "alumni") return null;
    if (role !== "admin" && role !== "alumni") return null;
    return { sub, tipe, role };
  } catch {
    return null;
  }
}
