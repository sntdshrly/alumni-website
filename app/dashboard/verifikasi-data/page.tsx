import type { Metadata } from "next";
import { requireAccount } from "@/lib/session";
import { VerificationManager } from "@/components/verifikasi/verification-manager";
import { perguruanTinggiList } from "@/data/perguruan-tinggi";
import { sekolahList } from "@/data/sekolah";

export const metadata: Metadata = {
  title: "Verifikasi Data",
};

export default async function VerifikasiDataPage() {
  const account = await requireAccount("admin");
  return (
    <VerificationManager
      sekolahOptions={sekolahList.map((s) => s.nama)}
      perguruanTinggi={perguruanTinggiList}
      currentAdmin={account.name}
    />
  );
}
