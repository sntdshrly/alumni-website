ALTER TABLE "pengguna" DROP CONSTRAINT "pengguna_email_unique";--> statement-breakpoint
ALTER TABLE "pendaftaran_akun" ADD COLUMN "biodata" jsonb;--> statement-breakpoint
CREATE UNIQUE INDEX "alumni_email_unik" ON "alumni" USING btree (lower("email"));--> statement-breakpoint
CREATE UNIQUE INDEX "pendaftaran_email_menunggu_unik" ON "pendaftaran_akun" USING btree (lower("email")) WHERE "pendaftaran_akun"."status" = 'Menunggu';--> statement-breakpoint
CREATE UNIQUE INDEX "pengguna_email_unik" ON "pengguna" USING btree (lower("email"));