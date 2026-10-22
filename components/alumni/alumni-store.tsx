"use client";

import { createContext, useContext, useState } from "react";
import type { Alumni } from "@/data/alumni";

// State data alumni bersama untuk seluruh dashboard, supaya Data Alumni dan Verifikasi Data
// selalu menampilkan data yang sama. Masih di memori browser: hilang saat halaman di-refresh.
type AlumniStore = [Alumni[], React.Dispatch<React.SetStateAction<Alumni[]>>];

const AlumniContext = createContext<AlumniStore | null>(null);

export function AlumniProvider({
  initialAlumni,
  children,
}: {
  initialAlumni: Alumni[];
  children: React.ReactNode;
}) {
  const store = useState(initialAlumni);
  return <AlumniContext.Provider value={store}>{children}</AlumniContext.Provider>;
}

export function useAlumniStore() {
  const store = useContext(AlumniContext);
  if (!store) throw new Error("useAlumniStore harus dipakai di dalam AlumniProvider");
  return store;
}
