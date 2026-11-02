"use client";

import { Header } from "@/components/header";
import { unduhLaporanDashboard } from "@/lib/dashboard-report";
import type { DashboardView } from "@/lib/dashboard-stats";

// Header Dashboard dengan tombol "Unduh Laporan" yang membuat file Excel ringkasan dashboard.
export function DashboardHeader({ data, sekolahOptions }: { data: DashboardView; sekolahOptions: string[] }) {
  return (
    <Header
      title="Dashboard"
      sekolahOptions={sekolahOptions}
      onDownload={(filter) => void unduhLaporanDashboard(filter, data)}
    />
  );
}
