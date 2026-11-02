import type { Metadata } from "next";
import { requireAccount } from "@/lib/session";
import { VerificationManager } from "@/components/verifikasi/verification-manager";
import { listPerguruanTinggi, namaSekolah } from "@/lib/data";

export const metadata: Metadata = {
  title: "Verifikasi Data",
};

export default async function VerifikasiDataPage() {
  const account = await requireAccount("admin");
  const [sekolahOptions, perguruanTinggi] = await Promise.all([namaSekolah(account), listPerguruanTinggi()]);
  return (
    <VerificationManager
      sekolahOptions={sekolahOptions}
      perguruanTinggi={perguruanTinggi}
      currentAdmin={account.name}
    />
  );
}
