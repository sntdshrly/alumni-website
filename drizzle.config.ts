import { existsSync } from "node:fs";
import { defineConfig } from "drizzle-kit";

// drizzle-kit tidak membaca .env.local sendiri; file ini dibuat oleh `vercel env pull .env.local`.
if (existsSync(".env.local")) process.loadEnvFile(".env.local");

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  casing: "snake_case",
  dbCredentials: { url: process.env.DATABASE_URL! },
});
