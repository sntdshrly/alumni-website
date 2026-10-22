import type { Metadata } from "next";
import { DashboardHeader } from "@/components/dashboard-header";
import { KpiCards } from "@/components/kpi-card";
import { StatusChart } from "@/components/status-chart";
import { TrendChart } from "@/components/trend-chart";
import { UniversityChart } from "@/components/university-chart";
import { StudyProgramTable } from "@/components/study-program-table";
import { AdmissionChart } from "@/components/admission-chart";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return (
    <>
      <DashboardHeader />

      <main className="flex-1 space-y-4 p-6">
        <KpiCards />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4 lg:items-stretch">
          <AdmissionChart />
          <div className="flex lg:col-span-2">
            <TrendChart />
          </div>
          <UniversityChart />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4 lg:items-stretch">
          <div className="flex lg:col-span-2">
            <StudyProgramTable />
          </div>
          <div className="flex lg:col-span-2">
            <StatusChart />
          </div>
        </div>

      </main>
    </>
  );
}
