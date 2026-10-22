"use client";

import { Header } from "@/components/header";
import { unduhLaporanDashboard } from "@/lib/dashboard-report";

// Header Dashboard dengan tombol "Unduh Laporan" yang membuat file Excel ringkasan dashboard.
export function DashboardHeader() {
  return <Header title="Dashboard" onDownload={(filter) => void unduhLaporanDashboard(filter)} />;
}
