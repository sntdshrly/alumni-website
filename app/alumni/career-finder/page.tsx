import type { Metadata } from "next";
import { CareerFinder } from "@/components/alumni-portal/career-finder";
import { listPerguruanTinggi } from "@/lib/data";

export const metadata: Metadata = {
  title: "Career Finder",
};

export default async function CareerFinderPage() {
  const perguruanTinggiList = await listPerguruanTinggi();
  return <CareerFinder perguruanTinggi={perguruanTinggiList} />;
}
