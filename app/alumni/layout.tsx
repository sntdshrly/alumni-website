import { Sidebar } from "@/components/sidebar";
import { AlumniProvider } from "@/components/alumni/alumni-store";
import { PortalProvider } from "@/components/alumni-portal/portal-store";
import { getPortalData } from "@/lib/portal-data";
import { requireAccount } from "@/lib/session";

export default async function AlumniLayout({ children }: { children: React.ReactNode }) {
  const account = await requireAccount("alumni");
  // Hanya data alumni sesekolah yang boleh dilihat yang dikirim ke browser.
  const { alumni, cerita } = getPortalData(account);

  return (
    <AlumniProvider initialAlumni={alumni}>
      <PortalProvider account={account} initialCerita={cerita}>
        <div className="flex min-h-screen flex-1">
          <Sidebar variant="alumni" />
          <div className="flex min-w-0 flex-1 flex-col">{children}</div>
        </div>
      </PortalProvider>
    </AlumniProvider>
  );
}
