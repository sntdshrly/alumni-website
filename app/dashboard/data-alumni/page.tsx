import type { Metadata } from "next";
import { requireAccount } from "@/lib/session";
import { AlumniManager } from "@/components/alumni/alumni-manager";
import { perguruanTinggiList } from "@/data/perguruan-tinggi";
import { sekolahList } from "@/data/sekolah";

export const metadata: Metadata = {
  title: "Data Alumni",
};

export default async function DataAlumniPage() {
  const account = await requireAccount("admin");
  return (
    <AlumniManager
      sekolahOptions={sekolahList.map((s) => s.nama)}
      perguruanTinggi={perguruanTinggiList}
      currentAdmin={account.name}
    />
  );
}
