CREATE TABLE "acara" (
	"id" text PRIMARY KEY NOT NULL,
	"sekolah" text NOT NULL,
	"judul" text NOT NULL,
	"jenis" text NOT NULL,
	"tanggal" text NOT NULL,
	"lokasi" text NOT NULL,
	"deskripsi" text NOT NULL,
	"kuota" integer NOT NULL,
	"terdaftar" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "acara_peserta" (
	"acara_id" text NOT NULL,
	"nik" text NOT NULL,
	CONSTRAINT "acara_peserta_acara_id_nik_pk" PRIMARY KEY("acara_id","nik")
);
--> statement-breakpoint
CREATE TABLE "alumni" (
	"nik" text PRIMARY KEY NOT NULL,
	"nama" text NOT NULL,
	"nisn" text NOT NULL,
	"sekolah" text NOT NULL,
	"kelas" text NOT NULL,
	"tahun_lulus" integer NOT NULL,
	"wali_kelas" text NOT NULL,
	"telepon" text NOT NULL,
	"email" text NOT NULL,
	"linkedin" text DEFAULT '' NOT NULL,
	"instagram" text DEFAULT '' NOT NULL,
	"tiktok" text DEFAULT '' NOT NULL,
	"status_setelah_lulus" text NOT NULL,
	"perguruan_tinggi_id" text DEFAULT '' NOT NULL,
	"program_studi" text DEFAULT '' NOT NULL,
	"jabatan" text DEFAULT '' NOT NULL,
	"tempat_kerja" text DEFAULT '' NOT NULL,
	"terakhir_dikonfirmasi" text NOT NULL,
	"validasi" text NOT NULL,
	"pemeriksa" text DEFAULT '' NOT NULL,
	"catatan_validasi" text DEFAULT '' NOT NULL,
	"tampil_di_jaringan" boolean DEFAULT false NOT NULL,
	"bersedia_mentor" boolean DEFAULT false NOT NULL,
	"bagikan_email" boolean DEFAULT false NOT NULL,
	"bagikan_telepon" boolean DEFAULT false NOT NULL,
	"bagikan_media_sosial" boolean DEFAULT false NOT NULL,
	"password_hash" text
);
--> statement-breakpoint
CREATE TABLE "cerita" (
	"id" text PRIMARY KEY NOT NULL,
	"penulis_nik" text NOT NULL,
	"kategori" text NOT NULL,
	"judul" text NOT NULL,
	"isi" text NOT NULL,
	"tanggal" text NOT NULL,
	"apresiasi" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cerita_apresiasi" (
	"cerita_id" text NOT NULL,
	"nik" text NOT NULL,
	CONSTRAINT "cerita_apresiasi_cerita_id_nik_pk" PRIMARY KEY("cerita_id","nik")
);
--> statement-breakpoint
CREATE TABLE "pendaftaran_akun" (
	"id" text PRIMARY KEY NOT NULL,
	"nama" text NOT NULL,
	"email" text NOT NULL,
	"sekolah" text NOT NULL,
	"password_hash" text NOT NULL,
	"status" text DEFAULT 'Menunggu' NOT NULL,
	"dibuat_pada" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pengguna" (
	"id" text PRIMARY KEY NOT NULL,
	"nama" text NOT NULL,
	"email" text NOT NULL,
	"no_hp" text NOT NULL,
	"role" text NOT NULL,
	"sekolah" text NOT NULL,
	"status" text NOT NULL,
	"terakhir_login" text DEFAULT '' NOT NULL,
	"dibuat_pada" text NOT NULL,
	"password_hash" text,
	CONSTRAINT "pengguna_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "perguruan_tinggi" (
	"id" text PRIMARY KEY NOT NULL,
	"kode" text NOT NULL,
	"nama" text NOT NULL,
	"singkatan" text NOT NULL,
	"jenis" text NOT NULL,
	"kota" text NOT NULL,
	"provinsi" text NOT NULL,
	"negara" text NOT NULL,
	"website" text NOT NULL,
	"alumni" integer DEFAULT 0 NOT NULL,
	"prodi" integer DEFAULT 0 NOT NULL,
	"bukti_terverifikasi" integer DEFAULT 0 NOT NULL,
	"status" text NOT NULL,
	"sumber_data" text NOT NULL,
	"terakhir_diperbarui" text NOT NULL,
	CONSTRAINT "perguruan_tinggi_kode_unique" UNIQUE("kode")
);
--> statement-breakpoint
CREATE TABLE "sekolah" (
	"id" text PRIMARY KEY NOT NULL,
	"nama" text NOT NULL,
	"kepala_sekolah" text NOT NULL,
	"lokasi" text NOT NULL,
	"alumni" integer DEFAULT 0 NOT NULL,
	"status" text NOT NULL,
	"perlu_pembaruan" boolean DEFAULT false NOT NULL,
	"npsn" text NOT NULL,
	"jenis_sekolah" text NOT NULL,
	"email" text NOT NULL,
	"telepon" text NOT NULL,
	"tahun_bergabung" integer NOT NULL,
	"terakhir_diperbarui" text NOT NULL,
	CONSTRAINT "sekolah_nama_unique" UNIQUE("nama"),
	CONSTRAINT "sekolah_npsn_unique" UNIQUE("npsn")
);
--> statement-breakpoint
CREATE TABLE "statistik_sekolah" (
	"sekolah" text PRIMARY KEY NOT NULL,
	"data" jsonb NOT NULL
);
--> statement-breakpoint
ALTER TABLE "acara_peserta" ADD CONSTRAINT "acara_peserta_acara_id_acara_id_fk" FOREIGN KEY ("acara_id") REFERENCES "public"."acara"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "acara_peserta" ADD CONSTRAINT "acara_peserta_nik_alumni_nik_fk" FOREIGN KEY ("nik") REFERENCES "public"."alumni"("nik") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "cerita" ADD CONSTRAINT "cerita_penulis_nik_alumni_nik_fk" FOREIGN KEY ("penulis_nik") REFERENCES "public"."alumni"("nik") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "cerita_apresiasi" ADD CONSTRAINT "cerita_apresiasi_cerita_id_cerita_id_fk" FOREIGN KEY ("cerita_id") REFERENCES "public"."cerita"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cerita_apresiasi" ADD CONSTRAINT "cerita_apresiasi_nik_alumni_nik_fk" FOREIGN KEY ("nik") REFERENCES "public"."alumni"("nik") ON DELETE cascade ON UPDATE cascade;