import type { Metadata } from "next";
import { requireAccount } from "@/lib/session";
import { AccountSettings } from "@/components/akun/account-settings";

export const metadata: Metadata = {
  title: "Pengaturan Akun",
};

export default async function AlumniAkunPage() {
  const account = await requireAccount("alumni");
  return (
    <AccountSettings
      nama={account.name}
      email={account.email}
      role={account.roleLabel}
      sekolah={account.school}
      roleNote="Role dan sekolah ditetapkan oleh admin sekolah. Data perjalanan setelah lulus diubah melalui menu Profil Saya."
    />
  );
}
