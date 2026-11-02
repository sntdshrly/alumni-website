import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt) as (password: string, salt: string, keylen: number) => Promise<Buffer>;
const KEYLEN = 64;

// Format tersimpan: "scrypt$<salt hex>$<hash hex>".
export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = await scryptAsync(password, salt, KEYLEN);
  return `scrypt$${salt}$${hash.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string | null | undefined) {
  if (!stored) return false;
  const [algo, salt, hashHex] = stored.split("$");
  if (algo !== "scrypt" || !salt || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  const actual = await scryptAsync(password, salt, expected.length);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
