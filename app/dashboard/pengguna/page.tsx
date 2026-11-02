import type { Metadata } from "next";
import { requireAccount } from "@/lib/session";
import { UserManager } from "@/components/pengguna/user-manager";
import { roleLintasSekolah, rolePenggunaOptions } from "@/data/pengguna";
import { listPengguna, namaSekolah } from "@/lib/data";

export const metadata: Metadata = {
  title: "Daftar Pengguna",
};

export default async function PenggunaPage() {
  const account = await requireAccount("admin");
  const [pengguna, sekolahOptions] = await Promise.all([listPengguna(account), namaSekolah(account)]);
  const superAdmin = account.sekolahScope === null;
  return (
    <UserManager
      pengguna={pengguna}
      sekolahOptions={sekolahOptions}
      roleOptions={superAdmin ? rolePenggunaOptions : rolePenggunaOptions.filter((r) => !roleLintasSekolah.includes(r))}
      currentUserEmail={account.email}
    />
  );
}
