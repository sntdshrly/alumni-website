import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { createRemoteJWKSet, jwtVerify } from "jose";

// Login Google memakai OAuth 2.0 Authorization Code + PKCE. Kredensial dibuat di Google Cloud
// Console (OAuth client "Web application") dan disimpan sebagai env GOOGLE_CLIENT_ID/SECRET.

export const GOOGLE_STATE_COOKIE = "google_oauth";
export const CALLBACK_PATH = "/api/auth/google/callback";

const googleJwks = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));

export function googleAktif() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

const base64url = (buf: Buffer) => buf.toString("base64url");

export function buatPermintaanLogin(origin: string) {
  const state = base64url(randomBytes(24));
  const verifier = base64url(randomBytes(48));
  const challenge = base64url(createHash("sha256").update(verifier).digest());
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.search = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: origin + CALLBACK_PATH,
    response_type: "code",
    scope: "openid email profile",
    state,
    code_challenge: challenge,
    code_challenge_method: "S256",
    prompt: "select_account",
  }).toString();
  return { url: url.toString(), state, verifier };
}

export type ProfilGoogle = { email: string; nama: string };

// Menukar kode dari Google dengan id_token, lalu memverifikasi tanda tangan, penerbit, dan
// audiens token sebelum emailnya dipercaya.
export async function ambilProfilGoogle(origin: string, code: string, verifier: string): Promise<ProfilGoogle | null> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: origin + CALLBACK_PATH,
      grant_type: "authorization_code",
      code_verifier: verifier,
    }),
  });
  if (!res.ok) return null;
  const { id_token: idToken } = (await res.json()) as { id_token?: string };
  if (!idToken) return null;

  try {
    const { payload } = await jwtVerify(idToken, googleJwks, {
      issuer: ["https://accounts.google.com", "accounts.google.com"],
      audience: process.env.GOOGLE_CLIENT_ID!,
    });
    if (typeof payload.email !== "string" || payload.email_verified !== true) return null;
    return {
      email: payload.email.toLowerCase(),
      nama: typeof payload.name === "string" && payload.name ? payload.name : payload.email,
    };
  } catch {
    return null;
  }
}
