import "server-only";

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

function buatDb() {
  // DATABASE_URL diisi otomatis oleh integrasi Neon di Vercel; untuk lokal ada di .env.local.
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL belum diatur. Jalankan `vercel env pull .env.local`.");
  return drizzle({ client: neon(url), schema, casing: "snake_case" });
}

type Db = ReturnType<typeof buatDb>;
let instance: Db | undefined;

// Koneksi dibuat saat query pertama, bukan saat modul diimpor, agar `next build` tetap berjalan
// walau DATABASE_URL belum tersedia di lingkungan build.
export const db = new Proxy({} as Db, {
  get(_, prop) {
    instance ??= buatDb();
    return Reflect.get(instance, prop, instance);
  },
});

export { schema };
