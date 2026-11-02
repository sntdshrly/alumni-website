import type { Metadata } from "next";
import { inArray } from "drizzle-orm";
import { EventManager, type AcaraAdmin } from "@/components/acara/event-manager";
import { db, schema } from "@/lib/db";
import { listAcara, namaSekolah, totalPeserta } from "@/lib/data";
import { requireAccount } from "@/lib/session";

export const metadata: Metadata = {
  title: "Acara Alumni",
};

export default async function AcaraPage() {
  const account = await requireAccount("admin");
  const [daftar, sekolahOptions] = await Promise.all([listAcara(account), namaSekolah(account)]);

  const semuaNik = [...new Set(daftar.flatMap((ev) => ev.pesertaNik))];
  const pesertaRows = semuaNik.length
    ? await db
        .select({
          nik: schema.alumni.nik,
          nama: schema.alumni.nama,
          email: schema.alumni.email,
          tahunLulus: schema.alumni.tahunLulus,
        })
        .from(schema.alumni)
        .where(inArray(schema.alumni.nik, semuaNik))
    : [];
  const alumniByNik = new Map(pesertaRows.map((a) => [a.nik, a]));

  const acara: AcaraAdmin[] = daftar.map((ev) => {
    const { pesertaNik, ...data } = ev;
    return {
      ...data,
      totalPeserta: totalPeserta(ev),
      pesertaPortal: pesertaNik.map((nik) => ({
        nik,
        nama: alumniByNik.get(nik)?.nama ?? "Alumni",
        email: alumniByNik.get(nik)?.email ?? "",
        tahunLulus: alumniByNik.get(nik)?.tahunLulus ?? 0,
      })),
    };
  });

  return <EventManager acara={acara} sekolahOptions={sekolahOptions} />;
}
