import type { Metadata } from "next";
import { requireAccount } from "@/lib/session";
import { AlumniManager } from "@/components/alumni/alumni-manager";
import { listPerguruanTinggi, namaSekolah } from "@/lib/data";

export const metadata: Metadata = {
  title: "Data Alumni",
};

export default async function DataAlumniPage() {
  const account = await requireAccount("admin");
  const [sekolahOptions, perguruanTinggi] = await Promise.all([namaSekolah(account), listPerguruanTinggi()]);
  return (
    <AlumniManager
      sekolahOptions={sekolahOptions}
      perguruanTinggi={perguruanTinggi}
      currentAdmin={account.name}
    />
  );
}
