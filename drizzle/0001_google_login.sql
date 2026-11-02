ALTER TABLE "pendaftaran_akun" ALTER COLUMN "password_hash" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "pendaftaran_akun" ADD COLUMN "sumber" text DEFAULT 'Formulir' NOT NULL;