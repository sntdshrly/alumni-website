import type { Metadata } from "next";
import { AlumniNetwork } from "@/components/alumni-portal/alumni-network";
import { perguruanTinggiList } from "@/data/perguruan-tinggi";
import { getAcaraPortal } from "@/lib/portal-data";
import { requireAccount } from "@/lib/session";

export const metadata: Metadata = {
  title: "Alumni Network",
};

export default async function JaringanPage() {
  const account = await requireAccount("alumni");
  const acara = getAcaraPortal(account);
  return <AlumniNetwork perguruanTinggi={perguruanTinggiList} acara={acara} />;
}
