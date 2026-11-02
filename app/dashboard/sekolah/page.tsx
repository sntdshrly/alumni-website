import type { Metadata } from "next";
import { SchoolManager } from "@/components/sekolah/school-manager";
import { SEMUA_SEKOLAH } from "@/data/pengguna";
import { listSekolah } from "@/lib/data";
import { requireAccount } from "@/lib/session";

export const metadata: Metadata = {
  title: "Sekolah",
};

export default async function SekolahPage() {
  const account = await requireAccount("admin");
  const schools = await listSekolah(account);
  const superAdmin = account.sekolahScope === null;
  return (
    <SchoolManager
      schools={schools}
      bisaKelola={superAdmin}
      sekolahOptions={superAdmin ? [SEMUA_SEKOLAH, ...schools.map((s) => s.nama)] : schools.map((s) => s.nama)}
    />
  );
}
