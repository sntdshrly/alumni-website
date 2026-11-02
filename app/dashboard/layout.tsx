import { Sidebar } from "@/components/sidebar";
import { AlumniProvider } from "@/components/alumni/alumni-store";
import { listAlumni } from "@/lib/data";
import { requireAccount } from "@/lib/session";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const account = await requireAccount("admin");
  // Hanya alumni dari sekolah yang boleh dilihat akun ini yang dikirim ke browser.
  const alumni = await listAlumni(account);

  return (
    <AlumniProvider initialAlumni={alumni}>
      <div className="flex min-h-screen flex-1">
        <Sidebar brand={account.sekolahScope ?? undefined} />
        <div className="flex min-w-0 flex-1 flex-col">{children}</div>
      </div>
    </AlumniProvider>
  );
}
