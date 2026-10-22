"use client";

import { useMemo, useState } from "react";
import { HandHeart, PenLine, Search, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { kategoriCeritaOptions, type CeritaAlumni, type KategoriCerita } from "@/data/cerita";
import type { PerguruanTinggi } from "@/data/perguruan-tinggi";
import { useAlumniStore } from "@/components/alumni/alumni-store";
import { usePortal } from "@/components/alumni-portal/portal-store";
import { Avatar, ringkasanKegiatan } from "@/components/alumni-portal/shared";
import { Header } from "@/components/header";
import { NotificationBell } from "@/components/alumni-portal/notification-bell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Tab = "semua" | "saya";

const MIN_JUDUL = 10;
const MIN_ISI = 150;

const kategoriStyles: Record<KategoriCerita, string> = {
  "Masuk Perguruan Tinggi": "bg-blue-50 text-blue-700",
  "Pekerjaan Pertama": "bg-emerald-50 text-emerald-700",
  "Tips Seleksi & Wawancara": "bg-amber-50 text-amber-700",
  "Perkembangan Karier": "bg-violet-50 text-violet-700",
};

const tanggalFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Asia/Jakarta",
});

function formatTanggal(iso: string) {
  return tanggalFormatter.format(new Date(iso));
}

function nextCeritaId(list: CeritaAlumni[]) {
  const max = list.reduce((acc, c) => Math.max(acc, Number(c.id.replace(/\D/g, "")) || 0), 0);
  return `CRT-${String(max + 1).padStart(3, "0")}`;
}

function KategoriBadge({ kategori }: { kategori: KategoriCerita }) {
  return (
    <span className={cn("inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium", kategoriStyles[kategori])}>
      {kategori}
    </span>
  );
}

function ApresiasiButton({
  jumlah,
  sudah,
  milikSaya,
  onToggle,
}: {
  jumlah: number;
  sudah: boolean;
  milikSaya: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      disabled={milikSaya}
      title={milikSaya ? "Cerita milikmu sendiri" : sudah ? "Batalkan apresiasi" : "Beri apresiasi"}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className={cn(
        "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
        sudah
          ? "border-rose-200 bg-rose-50 text-rose-600"
          : "border-slate-200 text-slate-600 enabled:hover:bg-slate-50",
      )}
    >
      <HandHeart className={cn("size-3.5", sudah && "fill-rose-200")} />
      {jumlah + (sudah ? 1 : 0)}
    </button>
  );
}

export function ShareJourney({ perguruanTinggi }: { perguruanTinggi: PerguruanTinggi[] }) {
  const { account, ceritaList, setCeritaList, apresiasiSaya, toggleApresiasi } = usePortal();
  const [alumniList] = useAlumniStore();
  const [tab, setTab] = useState<Tab>("semua");
  const [kategori, setKategori] = useState<"semua" | KategoriCerita>("semua");
  const [search, setSearch] = useState("");
  const [bacaId, setBacaId] = useState<string | null>(null);
  const [hapusId, setHapusId] = useState<string | null>(null);
  const [isTulisOpen, setIsTulisOpen] = useState(false);
  const [draftKategori, setDraftKategori] = useState<KategoriCerita>(kategoriCeritaOptions[0]);
  const [draftJudul, setDraftJudul] = useState("");
  const [draftIsi, setDraftIsi] = useState("");

  const ptById = useMemo(
    () => new Map(perguruanTinggi.map((pt) => [pt.id, pt])),
    [perguruanTinggi],
  );
  const alumniByNik = useMemo(() => new Map(alumniList.map((a) => [a.nik, a])), [alumniList]);

  const tampil = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ceritaList
      .filter((c) => {
        if (tab === "saya" && c.penulisNik !== account.alumniNik) return false;
        if (kategori !== "semua" && c.kategori !== kategori) return false;
        const penulis = alumniByNik.get(c.penulisNik)?.nama ?? "";
        return (
          !q ||
          c.judul.toLowerCase().includes(q) ||
          c.isi.toLowerCase().includes(q) ||
          penulis.toLowerCase().includes(q)
        );
      })
      .sort((x, y) => y.tanggal.localeCompare(x.tanggal));
  }, [ceritaList, tab, kategori, search, alumniByNik, account.alumniNik]);

  const dibaca = ceritaList.find((c) => c.id === bacaId) ?? null;
  const dihapus = ceritaList.find((c) => c.id === hapusId) ?? null;
  const jumlahCeritaSaya = ceritaList.filter((c) => c.penulisNik === account.alumniNik).length;

  const isDraftValid =
    draftJudul.trim().length >= MIN_JUDUL && draftIsi.trim().length >= MIN_ISI;

  function openTulis() {
    setDraftKategori(kategoriCeritaOptions[0]);
    setDraftJudul("");
    setDraftIsi("");
    setIsTulisOpen(true);
  }

  function terbitkan() {
    if (!isDraftValid || !account.alumniNik) return;
    const baru: CeritaAlumni = {
      id: nextCeritaId(ceritaList),
      penulisNik: account.alumniNik,
      kategori: draftKategori,
      judul: draftJudul.trim(),
      isi: draftIsi.trim(),
      tanggal: new Date().toISOString(),
      apresiasi: 0,
    };
    setCeritaList((prev) => [baru, ...prev]);
    setIsTulisOpen(false);
    setTab("saya");
  }

  function hapusCerita() {
    if (!dihapus) return;
    setCeritaList((prev) => prev.filter((c) => c.id !== dihapus.id));
    setHapusId(null);
    setBacaId(null);
  }

  return (
    <>
      <Header
        title="Share Your Journey"
        actions={
          <>
            <Button size="lg" className="gap-1.5 bg-blue-600 hover:bg-blue-700" onClick={openTulis}>
              <PenLine className="size-4" />
              Tulis Cerita
            </Button>
            <NotificationBell />
          </>
        }
      />

      <main className="flex-1 p-6">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex w-fit gap-1 rounded-lg bg-white/15 p-1 backdrop-blur-sm">
              {(
                [
                  ["semua", "Semua Cerita"],
                  ["saya", `Cerita Saya (${jumlahCeritaSaya})`],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTab(value)}
                  className={cn(
                    "rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors",
                    tab === value ? "bg-white text-slate-900 shadow-sm" : "text-white/80 hover:bg-white/10 hover:text-white",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari judul, isi, atau penulis"
                className="w-64 bg-white pl-8"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {(["semua", ...kategoriCeritaOptions] as const).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setKategori(k)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  kategori === k
                    ? "border-blue-200 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                )}
              >
                {k === "semua" ? "Semua Kategori" : k}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {tampil.map((c) => {
              const penulis = alumniByNik.get(c.penulisNik);
              return (
                <article
                  key={c.id}
                  onClick={() => setBacaId(c.id)}
                  className="flex cursor-pointer flex-col rounded-xl border border-black/5 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                >
                  <KategoriBadge kategori={c.kategori} />
                  <h3 className="mt-2 font-semibold text-slate-900">{c.judul}</h3>
                  <p className="mt-1.5 line-clamp-3 text-sm whitespace-pre-line text-slate-600">{c.isi}</p>
                  <div className="mt-4 flex items-center gap-2.5 border-t border-slate-100 pt-3">
                    <Avatar nama={penulis?.nama ?? "?"} className="size-8 text-xs" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-800">
                        {penulis?.nama ?? "Alumni"}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        Angkatan {penulis?.tahunLulus ?? "-"} &bull; {formatTanggal(c.tanggal)}
                      </p>
                    </div>
                    <ApresiasiButton
                      jumlah={c.apresiasi}
                      sudah={apresiasiSaya.has(c.id)}
                      milikSaya={c.penulisNik === account.alumniNik}
                      onToggle={() => toggleApresiasi(c.id)}
                    />
                  </div>
                </article>
              );
            })}
            {tampil.length === 0 && (
              <div className="col-span-full rounded-xl border border-dashed border-slate-300 bg-white py-12 text-center text-sm text-slate-500">
                {tab === "saya"
                  ? "Kamu belum menulis cerita. Yuk bagikan pengalamanmu!"
                  : "Belum ada cerita yang cocok dengan pencarian."}
              </div>
            )}
          </div>
        </div>
      </main>

      <Dialog open={dibaca !== null} onOpenChange={(open) => !open && setBacaId(null)}>
        <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-2xl">
          {dibaca && (
            <>
              <DialogHeader>
                <KategoriBadge kategori={dibaca.kategori} />
                <DialogTitle className="text-lg">{dibaca.judul}</DialogTitle>
              </DialogHeader>
              {(() => {
                const penulis = alumniByNik.get(dibaca.penulisNik);
                const ringkasan = penulis ? ringkasanKegiatan(penulis, ptById) : "";
                return (
                  <div className="flex items-center gap-2.5">
                    <Avatar nama={penulis?.nama ?? "?"} className="size-9 text-xs" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800">{penulis?.nama ?? "Alumni"}</p>
                      <p className="text-xs text-slate-500">
                        Angkatan {penulis?.tahunLulus ?? "-"}
                        {ringkasan && ` • ${ringkasan}`} &bull; {formatTanggal(dibaca.tanggal)}
                      </p>
                    </div>
                  </div>
                );
              })()}
              <div className="flex-1 overflow-y-auto text-sm leading-relaxed whitespace-pre-line text-slate-700">
                {dibaca.isi}
              </div>
              <DialogFooter className="items-center sm:justify-between">
                <ApresiasiButton
                      jumlah={dibaca.apresiasi}
                      sudah={apresiasiSaya.has(dibaca.id)}
                      milikSaya={dibaca.penulisNik === account.alumniNik}
                      onToggle={() => toggleApresiasi(dibaca.id)}
                    />
                {dibaca.penulisNik === account.alumniNik && (
                  <Button variant="outline" className="gap-1.5" onClick={() => setHapusId(dibaca.id)}>
                    <Trash2 className="size-3.5 text-rose-600" />
                    <span className="text-rose-600">Hapus Cerita</span>
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={dihapus !== null} onOpenChange={(open) => !open && setHapusId(null)}>
        <DialogContent className="sm:max-w-md">
          {dihapus && (
            <>
              <DialogHeader>
                <DialogTitle>Hapus Cerita</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-slate-600">
                Cerita &ldquo;<span className="font-semibold text-slate-900">{dihapus.judul}</span>&rdquo; akan
                dihapus beserta apresiasinya. Tindakan ini tidak dapat dibatalkan.
              </p>
              <DialogFooter>
                <Button variant="outline" onClick={() => setHapusId(null)}>
                  Batal
                </Button>
                <Button variant="destructive" onClick={hapusCerita}>
                  Ya, Hapus
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isTulisOpen} onOpenChange={setIsTulisOpen}>
        <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tulis Cerita Perjalananmu</DialogTitle>
            <p className="text-xs text-slate-500">
              Ceritamu akan tampil untuk sesama alumni dan bisa menginspirasi adik kelas.
            </p>
          </DialogHeader>

          <div className="flex flex-1 flex-col gap-3 overflow-y-auto">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cerita-kategori">Kategori</Label>
              <Select value={draftKategori} onValueChange={(v) => setDraftKategori(v as KategoriCerita)}>
                <SelectTrigger id="cerita-kategori" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {kategoriCeritaOptions.map((k) => (
                    <SelectItem key={k} value={k}>
                      {k}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cerita-judul">Judul</Label>
              <Input
                id="cerita-judul"
                value={draftJudul}
                onChange={(e) => setDraftJudul(e.target.value)}
                placeholder="Contoh: Perjalanan saya lolos SNBP ke UGM"
                maxLength={120}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cerita-isi">Cerita</Label>
              <textarea
                id="cerita-isi"
                value={draftIsi}
                onChange={(e) => setDraftIsi(e.target.value)}
                rows={10}
                placeholder="Ceritakan pengalaman, tantangan, dan tips yang bisa membantu adik kelas..."
                className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
              <p
                className={cn(
                  "text-xs",
                  draftIsi.trim().length >= MIN_ISI ? "text-emerald-600" : "text-slate-400",
                )}
              >
                {draftIsi.trim().length} karakter &bull; minimal {MIN_ISI} karakter
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTulisOpen(false)}>
              Batal
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700" disabled={!isDraftValid} onClick={terbitkan}>
              Terbitkan Cerita
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
