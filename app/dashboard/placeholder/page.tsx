import { Construction } from "lucide-react";
import { Header } from "@/components/header";

type PlaceholderPageProps = {
  searchParams: Promise<{ title?: string }>;
};

export default async function PlaceholderPage({ searchParams }: PlaceholderPageProps) {
  const { title } = await searchParams;
  const pageTitle = title ?? "Fitur";

  return (
    <>
      <Header title={pageTitle} />

      <main className="flex flex-1 items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-white px-10 py-14 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <Construction className="size-6" />
          </div>
          <h2 className="text-base font-semibold text-slate-800">Fitur belum tersedia</h2>
          <p className="max-w-sm text-sm text-slate-500">
            Modul &ldquo;{pageTitle}&rdquo; akan dibangun pada tahap pengembangan berikutnya
            setelah Login dan Dashboard selesai.
          </p>
        </div>
      </main>
    </>
  );
}
