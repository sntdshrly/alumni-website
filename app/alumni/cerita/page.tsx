import type { Metadata } from "next";
import { ShareJourney } from "@/components/alumni-portal/share-journey";
import { perguruanTinggiList } from "@/data/perguruan-tinggi";

export const metadata: Metadata = {
  title: "Share Your Journey",
};

export default function CeritaPage() {
  return <ShareJourney perguruanTinggi={perguruanTinggiList} />;
}
