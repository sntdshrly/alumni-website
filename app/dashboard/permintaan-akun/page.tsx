import type { Metadata } from "next";
import { RequestManager } from "@/components/permintaan/request-manager";
import { listPermintaanAkun, listPerguruanTinggi } from "@/lib/data";
import { requireAccount } from "@/lib/session";

export const metadata: Metadata = {
  title: "Permintaan Akun",
};

export default async function PermintaanAkunPage() {
  const account = await requireAccount("admin");
  const [permintaan, perguruanTinggi] = await Promise.all([listPermintaanAkun(account), listPerguruanTinggi()]);
  return (
    <RequestManager
      permintaan={permintaan}
      namaPT={Object.fromEntries(perguruanTinggi.map((pt) => [pt.id, pt.nama]))}
    />
  );
}
