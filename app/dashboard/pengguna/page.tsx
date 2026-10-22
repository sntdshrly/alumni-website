import type { Metadata } from "next";
import { requireAccount } from "@/lib/session";
import { UserManager } from "@/components/pengguna/user-manager";
import { penggunaList } from "@/data/pengguna";
import { sekolahList } from "@/data/sekolah";

export const metadata: Metadata = {
  title: "Daftar Pengguna",
};

export default async function PenggunaPage() {
  const account = await requireAccount("admin");
  return (
    <UserManager
      pengguna={penggunaList}
      sekolahOptions={sekolahList.map((s) => s.nama)}
      currentUserEmail={account.email}
    />
  );
}
