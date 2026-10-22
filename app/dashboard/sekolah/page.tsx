import type { Metadata } from "next";
import { SchoolManager } from "@/components/sekolah/school-manager";
import { sekolahList } from "@/data/sekolah";

export const metadata: Metadata = {
  title: "Sekolah",
};

export default function SekolahPage() {
  return <SchoolManager schools={sekolahList} />;
}
