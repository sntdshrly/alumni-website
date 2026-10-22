import type { Metadata } from "next";
import { EventManager, type AcaraAdmin } from "@/components/acara/event-manager";
import { alumniList } from "@/data/alumni";
import { sekolahList } from "@/data/sekolah";
import { listAcara, totalPeserta } from "@/lib/acara-store";
import { requireAccount } from "@/lib/session";

export const metadata: Metadata = {
  title: "Acara Alumni",
};

export default async function AcaraPage() {
  await requireAccount("admin");
  const namaByNik = new Map(alumniList.map((a) => [a.nik, a]));

  const acara: AcaraAdmin[] = listAcara().map(({ pesertaNik, ...ev }) => ({
    ...ev,
    totalPeserta: totalPeserta({ ...ev, pesertaNik }),
    pesertaPortal: pesertaNik.map((nik) => ({
      nik,
      nama: namaByNik.get(nik)?.nama ?? "Alumni",
      email: namaByNik.get(nik)?.email ?? "",
      tahunLulus: namaByNik.get(nik)?.tahunLulus ?? 0,
    })),
  }));

  return <EventManager acara={acara} sekolahOptions={sekolahList.map((s) => s.nama)} />;
}
