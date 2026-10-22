import type { Metadata } from "next";
import { CareerFinder } from "@/components/alumni-portal/career-finder";
import { perguruanTinggiList } from "@/data/perguruan-tinggi";

export const metadata: Metadata = {
  title: "Career Finder",
};

export default function CareerFinderPage() {
  return <CareerFinder perguruanTinggi={perguruanTinggiList} />;
}
