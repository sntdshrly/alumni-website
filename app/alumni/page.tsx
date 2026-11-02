import type { Metadata } from "next";
import { MyProfile } from "@/components/alumni-portal/my-profile";
import { listPerguruanTinggi } from "@/lib/data";

export const metadata: Metadata = {
  title: "Profil Saya",
};

export default async function ProfilSayaPage() {
  const perguruanTinggiList = await listPerguruanTinggi();
  return <MyProfile perguruanTinggi={perguruanTinggiList} />;
}
