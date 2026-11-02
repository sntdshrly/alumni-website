import type { Metadata } from "next";
import { RequestManager } from "@/components/permintaan/request-manager";
import { roleLintasSekolah, rolePenggunaOptions } from "@/data/pengguna";
import { listPermintaanAkun, namaSekolah } from "@/lib/data";
import { requireAccount } from "@/lib/session";

export const metadata: Metadata = {
  title: "Permintaan Akun",
};

export default async function PermintaanAkunPage() {
  const account = await requireAccount("admin");
  const [permintaan, sekolahOptions] = await Promise.all([listPermintaanAkun(account), namaSekolah(account)]);
  const superAdmin = account.sekolahScope === null;
  return (
    <RequestManager
      permintaan={permintaan}
      sekolahOptions={sekolahOptions}
      roleOptions={superAdmin ? rolePenggunaOptions : rolePenggunaOptions.filter((r) => !roleLintasSekolah.includes(r))}
    />
  );
}
