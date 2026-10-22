import type { Metadata } from "next";
import { UniversityManager } from "@/components/perguruan-tinggi/university-manager";
import { perguruanTinggiList } from "@/data/perguruan-tinggi";

export const metadata: Metadata = {
  title: "Perguruan Tinggi",
};

export default function PerguruanTinggiPage() {
  return <UniversityManager institutions={perguruanTinggiList} />;
}
