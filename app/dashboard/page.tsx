import type { Metadata } from "next";
import { DashboardHeader } from "@/components/dashboard-header";
import { KpiCards } from "@/components/kpi-card";
import { StatusChart } from "@/components/status-chart";
import { TrendChart } from "@/components/trend-chart";
import { UniversityChart } from "@/components/university-chart";
import { StudyProgramTable } from "@/components/study-program-table";
import { AdmissionChart } from "@/components/admission-chart";
import { SEMUA_SEKOLAH } from "@/data/pengguna";
import { getDashboard, namaSekolah } from "@/lib/data";
import { requireAccount } from "@/lib/session";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const account = await requireAccount("admin");
  const [data, sekolah] = await Promise.all([getDashboard(account), namaSekolah(account)]);
  // Super Admin melihat gabungan semua sekolah; Admin Sekolah hanya sekolahnya sendiri.
  const sekolahOptions = account.sekolahScope === null ? [SEMUA_SEKOLAH, ...sekolah] : sekolah;

  return (
    <>
      <DashboardHeader data={data} sekolahOptions={sekolahOptions} />

      <main className="flex-1 space-y-4 p-6">
        <KpiCards data={data} />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4 lg:items-stretch">
          <AdmissionChart data={data.jalur} />
          <div className="flex lg:col-span-2">
            <TrendChart tren={data.tren} />
          </div>
          <UniversityChart data={data.universitas} />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4 lg:items-stretch">
          <div className="flex lg:col-span-2">
            <StudyProgramTable data={data.prodi} />
          </div>
          <div className="flex lg:col-span-2">
            <StatusChart data={data.status} total={data.totalAlumni} />
          </div>
        </div>

      </main>
    </>
  );
}
