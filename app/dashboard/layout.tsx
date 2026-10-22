import { Sidebar } from "@/components/sidebar";
import { AlumniProvider } from "@/components/alumni/alumni-store";
import { alumniList } from "@/data/alumni";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AlumniProvider initialAlumni={alumniList}>
      <div className="flex min-h-screen flex-1">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">{children}</div>
      </div>
    </AlumniProvider>
  );
}
