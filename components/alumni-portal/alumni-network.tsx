"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import {
  CalendarDays,
  HandHeart,
  Loader2,
  Mail,
  MapPin,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { isStatusBekerja, labelPekerjaan, type Alumni } from "@/data/alumni";
import type { JenisAcara } from "@/data/acara";
import type { AcaraPortal } from "@/lib/portal-data";
import { toggleIkutAcara } from "@/app/alumni/jaringan/actions";
import { NotificationBell } from "@/components/alumni-portal/notification-bell";
import { tanggalAcaraSingkat } from "@/lib/acara-format";
import type { PerguruanTinggi } from "@/data/perguruan-tinggi";
import { useAlumniStore } from "@/components/alumni/alumni-store";
import { usePortal } from "@/components/alumni-portal/portal-store";
import { Avatar, Card, ringkasanKegiatan } from "@/components/alumni-portal/shared";
import { Header } from "@/components/header";
import { InstagramIcon, LinkedInIcon, TikTokIcon, WhatsAppIcon } from "@/components/social-icons";
import { namaPanggilan, socialLabel, socialUrl, whatsappUrl, type SocialPlatform } from "@/lib/kontak";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Tab = "alumni" | "acara";

const SEMUA = "semua";

const jenisAcaraStyles: Record<JenisAcara, string> = {
  Reuni: "bg-violet-50 text-violet-700",
  Mentoring: "bg-emerald-50 text-emerald-700",
  "Seminar Karier": "bg-blue-50 text-blue-700",
  "Kegiatan Sosial": "bg-amber-50 text-amber-700",
};

const socialPlatforms: {
  platform: SocialPlatform;
  Icon: React.ComponentType<{ className?: string }>;
}[] = [
  { platform: "linkedin", Icon: LinkedInIcon },
  { platform: "instagram", Icon: InstagramIcon },
  { platform: "tiktok", Icon: TikTokIcon },
];

const tanggalFormatter = new Intl.DateTimeFormat("id-ID", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Jakarta",
});

const tanggalBlokFormatter = {
  hari: new Intl.DateTimeFormat("id-ID", { day: "2-digit", timeZone: "Asia/Jakarta" }),
  bulan: new Intl.DateTimeFormat("id-ID", { month: "short", timeZone: "Asia/Jakarta" }),
};

function pesanMentor(mentor: Alumni, saya: Alumni | undefined) {
  const perkenalan = saya
    ? `saya ${saya.nama}, alumni ${saya.sekolah} angkatan ${saya.tahunLulus}`
    : "saya alumni dari sekolah yang sama";
  return `Halo Kak ${namaPanggilan(mentor.nama)}, ${perkenalan}. Saya menemukan profil Kakak di Alumni Network dan ingin bertanya seputar pengalaman Kakak. Apakah Kakak bersedia meluangkan waktu? Terima kasih! 🙏`;
}

export function AlumniNetwork({
  perguruanTinggi,
  acara,
}: {
  perguruanTinggi: PerguruanTinggi[];
  acara: AcaraPortal[];
}) {
  const { account, tambahNotifikasi } = usePortal();
  const [isPending, startTransition] = useTransition();
  const [prosesAcaraId, setProsesAcaraId] = useState<string | null>(null);
  const [acaraError, setAcaraError] = useState("");
  const [alumniList] = useAlumniStore();
  const [tab, setTab] = useState<Tab>("alumni");
  const [search, setSearch] = useState("");
  const [angkatan, setAngkatan] = useState(SEMUA);
  const [ptFilter, setPtFilter] = useState(SEMUA);
  const [jurusan, setJurusan] = useState("");
  const [bidang, setBidang] = useState("");
  const [hanyaMentor, setHanyaMentor] = useState(false);
  const [selectedNik, setSelectedNik] = useState<string | null>(null);

  const ptById = useMemo(
    () => new Map(perguruanTinggi.map((pt) => [pt.id, pt])),
    [perguruanTinggi],
  );
  const me = alumniList.find((a) => a.nik === account.alumniNik);

  // Hanya alumni yang mengizinkan profilnya tampil, dan bukan diri sendiri.
  const jaringan = useMemo(
    () => alumniList.filter((a) => a.tampilDiJaringan && a.nik !== account.alumniNik),
    [alumniList, account.alumniNik],
  );
  const angkatanOptions = useMemo(
    () => Array.from(new Set(jaringan.map((a) => a.tahunLulus))).sort((x, y) => y - x),
    [jaringan],
  );
  const ptOptions = useMemo(
    () =>
      perguruanTinggi.filter((pt) => jaringan.some((a) => a.perguruanTinggiId === pt.id)),
    [perguruanTinggi, jaringan],
  );

  const hasil = useMemo(() => {
    const q = search.trim().toLowerCase();
    const qJurusan = jurusan.trim().toLowerCase();
    const qBidang = bidang.trim().toLowerCase();
    return jaringan
      .filter((a) => {
        if (angkatan !== SEMUA && String(a.tahunLulus) !== angkatan) return false;
        if (ptFilter !== SEMUA && a.perguruanTinggiId !== ptFilter) return false;
        if (qJurusan && !a.programStudi.toLowerCase().includes(qJurusan)) return false;
        if (
          qBidang &&
          !(isStatusBekerja(a.statusSetelahLulus) &&
            `${a.jabatan} ${a.tempatKerja}`.toLowerCase().includes(qBidang))
        )
          return false;
        if (hanyaMentor && !a.bersediaMentor) return false;
        return !q || a.nama.toLowerCase().includes(q);
      })
      .sort((x, y) => Number(y.bersediaMentor) - Number(x.bersediaMentor) || x.nama.localeCompare(y.nama, "id"));
  }, [jaringan, search, angkatan, ptFilter, jurusan, bidang, hanyaMentor]);

  const selected = jaringan.find((a) => a.nik === selectedNik) ?? null;
  const isFilterActive =
    search || angkatan !== SEMUA || ptFilter !== SEMUA || jurusan || bidang || hanyaMentor;

  // Pendaftaran disimpan di server agar terlihat oleh admin; notifikasi muncul setelah berhasil.
  function daftarAcara(acaraId: string) {
    setProsesAcaraId(acaraId);
    setAcaraError("");
    startTransition(async () => {
      const hasil = await toggleIkutAcara(acaraId);
      if ("error" in hasil) {
        setAcaraError(hasil.error);
        return;
      }
      const waktu = tanggalAcaraSingkat.format(new Date(hasil.tanggal));
      if (hasil.ikut) {
        tambahNotifikasi("Pendaftaran berhasil", `Kamu terdaftar di "${hasil.judul}" (${waktu} WIB).`);
      } else {
        tambahNotifikasi("Pendaftaran dibatalkan", `Kamu batal ikut "${hasil.judul}".`);
      }
    });
  }

  function resetFilter() {
    setSearch("");
    setAngkatan(SEMUA);
    setPtFilter(SEMUA);
    setJurusan("");
    setBidang("");
    setHanyaMentor(false);
  }

  return (
    <>
      <Header
        title="Alumni Network"
        actions={<NotificationBell />}
      />

      <main className="flex-1 p-6">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
          <div className="flex w-fit gap-1 rounded-lg bg-white/15 p-1 backdrop-blur-sm">
            {(
              [
                ["alumni", "Cari Alumni", Users],
                ["acara", "Acara Alumni", CalendarDays],
              ] as const
            ).map(([value, label, Icon]) => (
              <button
                key={value}
                type="button"
                onClick={() => setTab(value)}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors",
                  tab === value
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-white/80 hover:bg-white/10 hover:text-white",
                )}
              >
                <Icon className="size-4" />
                {label}
              </button>
            ))}
          </div>

          {tab === "alumni" && (
            <>
              {me && !me.tampilDiJaringan && (
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  <p>Profil kamu belum tampil di Alumni Network, jadi alumni lain belum bisa menemukanmu.</p>
                  <Link href="/alumni" className="font-semibold hover:underline">
                    Atur di Profil Saya
                  </Link>
                </div>
              )}

              <Card>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5">
                  <div className="relative lg:col-span-1">
                    <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-slate-400" />
                    <Input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Cari nama"
                      className="pl-8"
                    />
                  </div>
                  <Select value={angkatan} onValueChange={(v) => setAngkatan(v as string)}>
                    <SelectTrigger className="w-full">
                      <SelectValue>
                        {(value: string) => (value === SEMUA ? "Semua Angkatan" : `Angkatan ${value}`)}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={SEMUA}>Semua Angkatan</SelectItem>
                      {angkatanOptions.map((tahun) => (
                        <SelectItem key={tahun} value={String(tahun)}>
                          Angkatan {tahun}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={ptFilter} onValueChange={(v) => setPtFilter(v as string)}>
                    <SelectTrigger className="w-full">
                      <SelectValue>
                        {(value: string) =>
                          value === SEMUA ? "Semua Universitas" : (ptById.get(value)?.nama ?? value)
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={SEMUA}>Semua Universitas</SelectItem>
                      {ptOptions.map((pt) => (
                        <SelectItem key={pt.id} value={pt.id}>
                          {pt.nama}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    value={jurusan}
                    onChange={(e) => setJurusan(e.target.value)}
                    placeholder="Jurusan, mis. Teknik"
                  />
                  <Input
                    value={bidang}
                    onChange={(e) => setBidang(e.target.value)}
                    placeholder="Bidang pekerjaan / usaha"
                  />
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setHanyaMentor((v) => !v)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                      hanyaMentor
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50",
                    )}
                  >
                    <HandHeart className="size-3.5" />
                    Hanya yang bersedia jadi mentor
                  </button>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span>{hasil.length} alumni ditemukan</span>
                    {isFilterActive && (
                      <button type="button" onClick={resetFilter} className="font-medium text-blue-600 hover:underline">
                        Reset filter
                      </button>
                    )}
                  </div>
                </div>
              </Card>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {hasil.map((a) => {
                  const ringkasan = ringkasanKegiatan(a, ptById);
                  return (
                    <button
                      key={a.nik}
                      type="button"
                      onClick={() => setSelectedNik(a.nik)}
                      className="flex flex-col gap-3 rounded-xl border border-black/5 bg-white p-4 text-left shadow-sm transition-shadow hover:shadow-md"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar nama={a.nama} className="size-11 text-sm" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold text-slate-900">{a.nama}</p>
                          <p className="truncate text-xs text-slate-500">
                            Angkatan {a.tahunLulus} &bull; {a.sekolah}
                          </p>
                        </div>
                        {a.bersediaMentor && (
                          <span className="flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                            <Sparkles className="size-3" />
                            Mentor
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{a.statusSetelahLulus}</p>
                        <p className="truncate text-xs text-slate-500">{ringkasan || "–"}</p>
                      </div>
                    </button>
                  );
                })}
                {hasil.length === 0 && (
                  <div className="col-span-full rounded-xl border border-dashed border-slate-300 bg-white py-12 text-center text-sm text-slate-500">
                    Belum ada alumni yang cocok dengan pencarian.
                  </div>
                )}
              </div>
            </>
          )}

          {tab === "acara" && acaraError && (
            <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-600">{acaraError}</p>
          )}

          {tab === "acara" && acara.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white py-12 text-center text-sm text-slate-500">
              Belum ada acara alumni yang dijadwalkan sekolah.
            </div>
          )}

          {tab === "acara" && (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {acara.map((ev) => {
                const ikut = ev.sayaIkut;
                const terdaftar = ev.totalPeserta;
                const penuh = terdaftar >= ev.kuota;
                const sedangProses = isPending && prosesAcaraId === ev.id;
                const persen = Math.min(100, Math.round((terdaftar / ev.kuota) * 100));
                return (
                  <Card key={ev.id}>
                    <div className="flex gap-4">
                      <div className="flex w-14 shrink-0 flex-col items-center justify-center rounded-lg bg-blue-50 py-2 text-blue-700">
                        <span className="text-xl leading-none font-bold">
                          {tanggalBlokFormatter.hari.format(new Date(ev.tanggal))}
                        </span>
                        <span className="text-xs uppercase">
                          {tanggalBlokFormatter.bulan.format(new Date(ev.tanggal))}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <span
                          className={cn(
                            "inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium",
                            jenisAcaraStyles[ev.jenis],
                          )}
                        >
                          {ev.jenis}
                        </span>
                        <h3 className="mt-1.5 font-semibold text-slate-900">{ev.judul}</h3>
                        <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                          <CalendarDays className="size-3.5 shrink-0" />
                          {tanggalFormatter.format(new Date(ev.tanggal))} WIB
                        </p>
                        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                          <MapPin className="size-3.5 shrink-0" />
                          {ev.lokasi}
                        </p>
                        <p className="mt-2 text-sm text-slate-600">{ev.deskripsi}</p>

                        <div className="mt-3">
                          <div className="flex justify-between text-xs text-slate-500">
                            <span>
                              {terdaftar} / {ev.kuota} peserta
                            </span>
                            <span>{persen}%</span>
                          </div>
                          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className={cn("h-full rounded-full", penuh ? "bg-rose-500" : "bg-blue-500")}
                              style={{ width: `${persen}%` }}
                            />
                          </div>
                        </div>

                        <div className="mt-3 flex items-center gap-2">
                          <Button
                            size="sm"
                            variant={ikut ? "outline" : "default"}
                            className={cn(!ikut && "bg-blue-600 hover:bg-blue-700")}
                            disabled={(penuh && !ikut) || isPending}
                            onClick={() => daftarAcara(ev.id)}
                          >
                            {sedangProses && <Loader2 className="animate-spin" />}
                            {ikut ? "Batal Ikut" : penuh ? "Kuota Penuh" : "Ikut Acara"}
                          </Button>
                          {ikut && (
                            <span className="text-xs font-medium text-emerald-600">
                              Kamu terdaftar di acara ini
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Dialog open={selected !== null} onOpenChange={(open) => !open && setSelectedNik(null)}>
        <DialogContent className="sm:max-w-md">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>Profil Alumni</DialogTitle>
              </DialogHeader>
              <div className="flex items-center gap-3">
                <Avatar nama={selected.nama} className="size-12 text-base" />
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900">{selected.nama}</p>
                  <p className="truncate text-xs text-slate-500">
                    {selected.sekolah} &bull; Angkatan {selected.tahunLulus}
                  </p>
                </div>
                {selected.bersediaMentor && (
                  <span className="ml-auto flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                    <Sparkles className="size-3" />
                    Mentor
                  </span>
                )}
              </div>

              <dl className="divide-y divide-slate-100 text-sm">
                <div className="flex justify-between gap-3 py-2">
                  <dt className="text-slate-500">Status</dt>
                  <dd className="text-right font-medium text-slate-800">{selected.statusSetelahLulus}</dd>
                </div>
                {selected.perguruanTinggiId && (
                  <div className="flex justify-between gap-3 py-2">
                    <dt className="text-slate-500">Universitas</dt>
                    <dd className="text-right font-medium text-slate-800">
                      {ptById.get(selected.perguruanTinggiId)?.nama}
                    </dd>
                  </div>
                )}
                {selected.programStudi && (
                  <div className="flex justify-between gap-3 py-2">
                    <dt className="text-slate-500">Program studi</dt>
                    <dd className="text-right font-medium text-slate-800">{selected.programStudi}</dd>
                  </div>
                )}
                {isStatusBekerja(selected.statusSetelahLulus) && (
                  <>
                    <div className="flex justify-between gap-3 py-2">
                      <dt className="text-slate-500">{labelPekerjaan(selected.statusSetelahLulus).tempat}</dt>
                      <dd className="text-right font-medium text-slate-800">{selected.tempatKerja || "-"}</dd>
                    </div>
                    <div className="flex justify-between gap-3 py-2">
                      <dt className="text-slate-500">{labelPekerjaan(selected.statusSetelahLulus).jabatan}</dt>
                      <dd className="text-right font-medium text-slate-800">{selected.jabatan || "-"}</dd>
                    </div>
                  </>
                )}
                {selected.bagikanEmail && (
                  <div className="flex justify-between gap-3 py-2">
                    <dt className="text-slate-500">Email</dt>
                    <dd className="truncate text-right font-medium text-slate-800">{selected.email}</dd>
                  </div>
                )}
              </dl>

              {selected.bagikanMediaSosial &&
                socialPlatforms.some(({ platform }) => selected[platform]) && (
                  <div className="flex flex-wrap gap-2">
                    {socialPlatforms
                      .filter(({ platform }) => selected[platform])
                      .map(({ platform, Icon }) => (
                        <a
                          key={platform}
                          href={socialUrl(platform, selected[platform])}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 rounded-full border border-slate-200 px-2.5 py-1 text-xs text-slate-700 hover:bg-slate-50"
                        >
                          <Icon className="size-3.5" />
                          {socialLabel(platform, selected[platform])}
                        </a>
                      ))}
                  </div>
                )}

              {!selected.bagikanEmail && !selected.bagikanTelepon && !selected.bagikanMediaSosial && (
                <p className="text-xs text-slate-400">Alumni ini belum membagikan kontaknya.</p>
              )}

              {selected.bersediaMentor && (
                <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-3">
                  {selected.bagikanTelepon && (
                    <a
                      href={whatsappUrl(selected.telepon, pesanMentor(selected, me))}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(buttonVariants(), "gap-1.5 bg-emerald-600 hover:bg-emerald-700")}
                    >
                      <WhatsAppIcon className="size-4" />
                      Hubungi Mentor via WhatsApp
                    </a>
                  )}
                  {selected.bagikanEmail && (
                    <a
                      href={`mailto:${selected.email}?subject=${encodeURIComponent("Mentoring Alumni")}&body=${encodeURIComponent(pesanMentor(selected, me))}`}
                      className={cn(buttonVariants({ variant: "outline" }), "gap-1.5")}
                    >
                      <Mail className="size-4" />
                      Kirim Email
                    </a>
                  )}
                  {!selected.bagikanTelepon && !selected.bagikanEmail && (
                    <p className="text-xs text-slate-500">
                      Mentor ini belum membagikan kontak. Coba hubungi lewat media sosialnya atau
                      melalui admin sekolah.
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

