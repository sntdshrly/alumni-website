import type { Metadata } from "next";
import { ShareJourney } from "@/components/alumni-portal/share-journey";
import { listPerguruanTinggi } from "@/lib/data";

export const metadata: Metadata = {
  title: "Share Your Journey",
};

export default async function CeritaPage() {
  const perguruanTinggiList = await listPerguruanTinggi();
  return <ShareJourney perguruanTinggi={perguruanTinggiList} />;
}
