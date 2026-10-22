import type { Metadata } from "next";
import { requireAccount } from "@/lib/session";
import { AccountSettings } from "@/components/akun/account-settings";

export const metadata: Metadata = {
  title: "Pengaturan Akun",
};

export default async function AkunPage() {
  const account = await requireAccount("admin");
  // Hanya data profil yang dikirim ke klien; password tetap di server.
  return (
    <AccountSettings
      nama={account.name}
      email={account.email}
      role={account.roleLabel}
      sekolah={account.school}
    />
  );
}
