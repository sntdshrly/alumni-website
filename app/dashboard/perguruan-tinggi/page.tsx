import type { Metadata } from "next";
import { UniversityManager } from "@/components/perguruan-tinggi/university-manager";
import { listPerguruanTinggi } from "@/lib/data";
import { requireAccount } from "@/lib/session";

export const metadata: Metadata = {
  title: "Perguruan Tinggi",
};

export default async function PerguruanTinggiPage() {
  const account = await requireAccount("admin");
  return (
    <UniversityManager
      institutions={await listPerguruanTinggi()}
      bisaKelola={account.sekolahScope === null}
    />
  );
}
