import type { Metadata } from "next";
import { MyProfile } from "@/components/alumni-portal/my-profile";
import { perguruanTinggiList } from "@/data/perguruan-tinggi";

export const metadata: Metadata = {
  title: "Profil Saya",
};

export default function ProfilSayaPage() {
  return <MyProfile perguruanTinggi={perguruanTinggiList} />;
}
