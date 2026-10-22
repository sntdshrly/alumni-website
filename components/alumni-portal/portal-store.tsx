"use client";

import { createContext, useContext, useState } from "react";
import type { CeritaAlumni } from "@/data/cerita";
import type { SessionAccount } from "@/lib/session";

export type Notifikasi = {
  id: string;
  judul: string;
  pesan: string;
  // ISO timestamp kapan notifikasi dibuat.
  waktu: string;
  dibaca: boolean;
};

// State portal alumni yang dipakai bersama antarhalaman: akun yang login, cerita,
// apresiasi, dan notifikasi. Masih di memori browser: hilang saat di-refresh.
type PortalStore = {
  account: SessionAccount;
  ceritaList: CeritaAlumni[];
  setCeritaList: React.Dispatch<React.SetStateAction<CeritaAlumni[]>>;
  // Id cerita yang sudah diberi apresiasi oleh alumni yang login.
  apresiasiSaya: Set<string>;
  toggleApresiasi: (ceritaId: string) => void;
  notifikasi: Notifikasi[];
  tambahNotifikasi: (judul: string, pesan: string) => void;
  tandaiDibaca: (id: string) => void;
  tandaiSemuaDibaca: () => void;
};

const PortalContext = createContext<PortalStore | null>(null);

function toggleIn(set: Set<string>, id: string) {
  const next = new Set(set);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
}

export function PortalProvider({
  account,
  initialCerita,
  children,
}: {
  account: SessionAccount;
  initialCerita: CeritaAlumni[];
  children: React.ReactNode;
}) {
  const [ceritaList, setCeritaList] = useState(initialCerita);
  const [apresiasiSaya, setApresiasiSaya] = useState<Set<string>>(() => new Set());
  const [notifikasi, setNotifikasi] = useState<Notifikasi[]>([]);

  const store: PortalStore = {
    account,
    ceritaList,
    setCeritaList,
    apresiasiSaya,
    toggleApresiasi: (id) => setApresiasiSaya((prev) => toggleIn(prev, id)),
    notifikasi,
    tambahNotifikasi: (judul, pesan) =>
      setNotifikasi((prev) => [
        {
          id: `${Date.now()}-${prev.length}`,
          judul,
          pesan,
          waktu: new Date().toISOString(),
          dibaca: false,
        },
        ...prev,
      ]),
    tandaiDibaca: (id) =>
      setNotifikasi((prev) => prev.map((n) => (n.id === id ? { ...n, dibaca: true } : n))),
    tandaiSemuaDibaca: () =>
      setNotifikasi((prev) => (prev.some((n) => !n.dibaca) ? prev.map((n) => ({ ...n, dibaca: true })) : prev)),
  };

  return <PortalContext.Provider value={store}>{children}</PortalContext.Provider>;
}

export function usePortal() {
  const store = useContext(PortalContext);
  if (!store) throw new Error("usePortal harus dipakai di dalam PortalProvider");
  return store;
}
