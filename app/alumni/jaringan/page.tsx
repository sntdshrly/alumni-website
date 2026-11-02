import type { Metadata } from "next";
import { AlumniNetwork } from "@/components/alumni-portal/alumni-network";
import { getAcaraPortal, listPerguruanTinggi } from "@/lib/data";
import { requireAccount } from "@/lib/session";

export const metadata: Metadata = {
  title: "Alumni Network",
};

export default async function JaringanPage() {
  const account = await requireAccount("alumni");
  const [acara, perguruanTinggi] = await Promise.all([getAcaraPortal(account), listPerguruanTinggi()]);
  return <AlumniNetwork perguruanTinggi={perguruanTinggi} acara={acara} />;
}
