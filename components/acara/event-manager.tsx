"use client";

import { useMemo, useState, useTransition } from "react";
import {
  ArrowLeft,
  CalendarDays,
  CalendarPlus,
  Copy,
  Loader2,
  Mail,
  MapPin,
  Send,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  jenisAcaraOptions,
  type AcaraAlumni,
  type JenisAcara,
} from "@/data/acara";
import {
  hapusAcara,
  simpanAcara,
  type AcaraFormValues,
} from "@/app/dashboard/acara/actions";
import {
  isoToInputWib,
  tanggalAcaraFormatter,
  tanggalAcaraSingkat,
} from "@/lib/acara-format";
import { downloadCsv, reportFilename } from "@/lib/export-csv";
import { Header } from "@/components/header";
import { DownloadReportButton } from "@/components/download-report-button";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type AcaraAdmin = AcaraAlumni & {
  totalPeserta: number;
  pesertaPortal: {
    nik: string;
    nama: string;
    tahunLulus: number;
    email: string;
  }[];
};

type DialogMode = "view" | "form" | "delete" | "broadcast";

// Pesan awal broadcast; admin bisa mengubahnya sebelum dikirim.
function templateBroadcast(ev: AcaraAdmin) {
  return {
    subjek: `Info Acara: ${ev.judul}`,
    pesan: `Dear alumni,

Terima kasih sudah mendaftar di acara "${ev.judul}". Berikut detail acaranya:

Tanggal : ${tanggalAcaraFormatter.format(new Date(ev.tanggal))} WIB
Lokasi  : ${ev.lokasi}

Mohon hadir 15 menit sebelum acara dimulai. Jika berhalangan, silakan batalkan pendaftaran melalui portal alumni agar kuota bisa dipakai alumni lain.

Sampai jumpa di acara!

Salam,
Admin ${ev.sekolah}`,
  };
}

// Batas aman panjang tautan mailto; di atas ini sebagian aplikasi email memotong penerima.
const MAILTO_MAX = 1900;

export const jenisAcaraStyles: Record<JenisAcara, string> = {
  Reuni: "bg-violet-50 text-violet-700",
  Mentoring: "bg-emerald-50 text-emerald-700",
  "Seminar Karier": "bg-blue-50 text-blue-700",
  "Kegiatan Sosial": "bg-amber-50 text-amber-700",
};

function JenisBadge({ jenis }: { jenis: JenisAcara }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium whitespace-nowrap",
        jenisAcaraStyles[jenis],
      )}
    >
      {jenis}
    </span>
  );
}

function StatCard({
  icon: Icon,
  iconClassName,
  label,
  value,
  caption,
}: {
  icon: React.ComponentType<{ className?: string }>;
  iconClassName: string;
  label: string;
  value: string | number;
  caption: string;
}) {
  return (
    <div className="rounded-xl border border-black/5 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2.5">
        <div
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg",
            iconClassName,
          )}
        >
          <Icon className="size-4.5" />
        </div>
        <p className="text-sm text-slate-500">{label}</p>
      </div>
      <p className="mt-2.5 text-2xl font-semibold text-slate-900">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{caption}</p>
    </div>
  );
}

function emptyForm(sekolah: string): AcaraFormValues {
  return {
    judul: "",
    jenis: "Reuni",
    sekolah,
    tanggal: "",
    lokasi: "",
    deskripsi: "",
    kuota: 50,
  };
}

function formFromAcara(ev: AcaraAdmin): AcaraFormValues {
  return {
    judul: ev.judul,
    jenis: ev.jenis,
    sekolah: ev.sekolah,
    tanggal: isoToInputWib(ev.tanggal),
    lokasi: ev.lokasi,
    deskripsi: ev.deskripsi,
    kuota: ev.kuota,
  };
}

export function EventManager({
  acara,
  sekolahOptions,
}: {
  acara: AcaraAdmin[];
  sekolahOptions: string[];
}) {
  const [now] = useState(() => Date.now());
  const [sekolahFilter, setSekolahFilter] = useState("semua");
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<DialogMode>("view");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<AcaraFormValues>(() =>
    emptyForm(sekolahOptions[0] ?? ""),
  );
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [subjek, setSubjek] = useState("");
  const [pesan, setPesan] = useState("");
  const [tersalin, setTersalin] = useState(false);
  const [isPending, startTransition] = useTransition();

  const tampil = useMemo(() => {
    const q = search.trim().toLowerCase();
    return acara.filter(
      (ev) =>
        (sekolahFilter === "semua" || ev.sekolah === sekolahFilter) &&
        (!q ||
          ev.judul.toLowerCase().includes(q) ||
          ev.lokasi.toLowerCase().includes(q)),
    );
  }, [acara, sekolahFilter, search]);

  const akanDatang = tampil.filter(
    (ev) => new Date(ev.tanggal).getTime() >= now,
  ).length;
  const totalPendaftar = tampil.reduce(
    (acc, ev) => acc + ev.pesertaPortal.length,
    0,
  );
  const selected = acara.find((ev) => ev.id === selectedId) ?? null;

  function openDetail(id: string) {
    setSelectedId(id);
    setMode("view");
    setError("");
    setIsOpen(true);
  }

  function openTambah() {
    setSelectedId(null);
    setForm(
      emptyForm(
        sekolahFilter === "semua" ? (sekolahOptions[0] ?? "") : sekolahFilter,
      ),
    );
    setMode("form");
    setError("");
    setIsOpen(true);
  }

  function openEdit() {
    if (!selected) return;
    setForm(formFromAcara(selected));
    setMode("form");
    setError("");
  }

  function openBroadcast() {
    if (!selected) return;
    const t = templateBroadcast(selected);
    setSubjek(t.subjek);
    setPesan(t.pesan);
    setTersalin(false);
    setMode("broadcast");
  }

  const emailPeserta = selected
    ? Array.from(
        new Set(selected.pesertaPortal.map((p) => p.email).filter(Boolean)),
      )
    : [];
  const bcc = emailPeserta.join(",");
  const mailtoUrl = `mailto:?bcc=${encodeURIComponent(bcc)}&subject=${encodeURIComponent(subjek)}&body=${encodeURIComponent(pesan)}`;
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&bcc=${encodeURIComponent(bcc)}&su=${encodeURIComponent(subjek)}&body=${encodeURIComponent(pesan)}`;

  async function salinEmail() {
    try {
      await navigator.clipboard.writeText(emailPeserta.join(", "));
      setTersalin(true);
    } catch {
      setTersalin(false);
    }
  }

  function submitForm() {
    startTransition(async () => {
      const result = await simpanAcara(selectedId, form);
      if (result.error) {
        setError(result.error);
        return;
      }
      setNotice(result.success ?? "");
      setIsOpen(false);
    });
  }

  function downloadReport() {
    downloadCsv(
      reportFilename("acara"),
      [
        "Judul Acara",
        "Jenis",
        "Sekolah",
        "Tanggal (WIB)",
        "Lokasi",
        "Kuota",
        "Total Peserta",
        "Pendaftar via Portal",
        "Status",
      ],
      tampil.map((ev) => [
        ev.judul,
        ev.jenis,
        ev.sekolah,
        tanggalAcaraFormatter.format(new Date(ev.tanggal)),
        ev.lokasi,
        ev.kuota,
        ev.totalPeserta,
        ev.pesertaPortal.length,
        new Date(ev.tanggal).getTime() < now ? "Sudah lewat" : "Akan datang",
      ]),
    );
  }

  function confirmHapus() {
    if (!selected) return;
    startTransition(async () => {
      const result = await hapusAcara(selected.id);
      if (result.error) {
        setError(result.error);
        return;
      }
      setNotice(result.success ?? "");
      setIsOpen(false);
      setSelectedId(null);
    });
  }

  return (
    <>
      <Header
        title="Acara Alumni"
        actions={
          <>
            <Select
              value={sekolahFilter}
              onValueChange={(v) => setSekolahFilter(v as string)}
            >
              <SelectTrigger className="min-w-[170px]">
                <SelectValue>
                  {(value: string) =>
                    value === "semua" ? "Semua Sekolah" : value
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semua">Semua Sekolah</SelectItem>
                {sekolahOptions.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <DownloadReportButton onClick={downloadReport} />
          </>
        }
      />

      <main className="flex-1 p-6">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard
              icon={CalendarDays}
              iconClassName="bg-blue-50 text-blue-600"
              label="Total Acara"
              value={tampil.length}
              caption="Acara yang dipublikasikan ke alumni"
            />
            <StatCard
              icon={CalendarPlus}
              iconClassName="bg-emerald-50 text-emerald-600"
              label="Akan Datang"
              value={akanDatang}
              caption="Acara yang belum berlangsung"
            />
            <StatCard
              icon={Users}
              iconClassName="bg-violet-50 text-violet-600"
              label="Pendaftar via Portal"
              value={totalPendaftar}
              caption="Alumni yang mendaftar lewat portal"
            />
          </div>

          {notice && (
            <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {notice}
            </p>
          )}

          <div className="flex w-full flex-col rounded-xl border border-black/5 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Daftar Acara
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Menampilkan {tampil.length} acara, diurutkan berdasarkan
                  tanggal
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari judul atau lokasi"
                    className="w-60 pl-8"
                  />
                </div>
                <Button
                  className="gap-1.5 bg-blue-600 hover:bg-blue-700"
                  onClick={openTambah}
                >
                  <Plus className="size-4" />
                  Tambah Acara
                </Button>
              </div>
            </div>

            <div className="mt-4 min-w-0 flex-1 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {["Acara", "Sekolah", "Tanggal", "Lokasi", "Peserta"].map(
                      (h) => (
                        <TableHead
                          key={h}
                          className="text-[11px] tracking-wider text-slate-400 uppercase"
                        >
                          {h}
                        </TableHead>
                      ),
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tampil.map((ev) => {
                    const lewat = new Date(ev.tanggal).getTime() < now;
                    const persen = Math.min(
                      100,
                      Math.round((ev.totalPeserta / ev.kuota) * 100),
                    );
                    return (
                      <TableRow
                        key={ev.id}
                        onClick={() => openDetail(ev.id)}
                        className="cursor-pointer"
                      >
                        <TableCell className="max-w-[280px]">
                          <p className="truncate font-medium text-slate-900">
                            {ev.judul}
                          </p>
                          <div className="mt-0.5 flex items-center gap-1.5">
                            <JenisBadge jenis={ev.jenis} />
                            {lewat && (
                              <span className="text-[11px] text-slate-400">
                                Sudah lewat
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {ev.sekolah}
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {tanggalAcaraSingkat.format(new Date(ev.tanggal))}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate text-slate-600">
                          {ev.lokasi}
                        </TableCell>
                        <TableCell className="min-w-[140px]">
                          <p className="text-xs text-slate-600">
                            {ev.totalPeserta} / {ev.kuota}
                          </p>
                          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className={cn(
                                "h-full rounded-full",
                                persen >= 100 ? "bg-rose-500" : "bg-blue-500",
                              )}
                              style={{ width: `${persen}%` }}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {tampil.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="py-10 text-center text-sm text-slate-500"
                      >
                        Belum ada acara. Klik &ldquo;Tambah Acara&rdquo; untuk
                        membuat kegiatan alumni.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </main>

      <Dialog
        open={isOpen}
        onOpenChange={(open) => !isPending && setIsOpen(open)}
      >
        <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-lg">
          {mode === "view" && selected && (
            <>
              <DialogHeader>
                <JenisBadge jenis={selected.jenis} />
                <DialogTitle>{selected.judul}</DialogTitle>
              </DialogHeader>
              <div className="flex flex-1 flex-col gap-3 overflow-y-auto text-sm">
                <p className="flex items-center gap-1.5 text-slate-600">
                  <CalendarDays className="size-4 shrink-0" />
                  {tanggalAcaraFormatter.format(new Date(selected.tanggal))} WIB
                </p>
                <p className="flex items-center gap-1.5 text-slate-600">
                  <MapPin className="size-4 shrink-0" />
                  {selected.lokasi} &bull; {selected.sekolah}
                </p>
                <p className="whitespace-pre-line text-slate-700">
                  {selected.deskripsi}
                </p>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs font-semibold text-slate-900">
                    Peserta: {selected.totalPeserta} / {selected.kuota}
                  </p>
                  {selected.terdaftar > 0 && (
                    <p className="text-xs text-slate-500">
                      {selected.terdaftar} peserta terdaftar di luar portal
                    </p>
                  )}
                  <p className="mt-2 text-xs font-medium text-slate-700">
                    Mendaftar lewat portal ({selected.pesertaPortal.length})
                  </p>
                  {selected.pesertaPortal.length > 0 ? (
                    <ul className="mt-1 divide-y divide-slate-200 text-xs">
                      {selected.pesertaPortal.map((p) => (
                        <li key={p.nik} className="flex justify-between py-1.5">
                          <span className="text-slate-800">{p.nama}</span>
                          <span className="text-slate-500">
                            Angkatan {p.tahunLulus}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-1 text-xs text-slate-400">
                      Belum ada pendaftar lewat portal.
                    </p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  className="gap-1.5"
                  onClick={() => setMode("delete")}
                >
                  <Trash2 className="size-3.5 text-rose-600" />
                  <span className="text-rose-600">Hapus</span>
                </Button>
                <Button
                  variant="outline"
                  className="gap-1.5"
                  disabled={selected.pesertaPortal.length === 0}
                  title={
                    selected.pesertaPortal.length === 0
                      ? "Belum ada pendaftar lewat portal"
                      : undefined
                  }
                  onClick={openBroadcast}
                >
                  <Mail className="size-3.5" />
                  Broadcast Email
                </Button>
                <Button
                  className="gap-1.5 bg-blue-600 hover:bg-blue-700"
                  onClick={openEdit}
                >
                  <Pencil className="size-3.5" />
                  Edit Acara
                </Button>
              </DialogFooter>
            </>
          )}

          {mode === "broadcast" && selected && (
            <>
              <DialogHeader>
                <DialogTitle>Broadcast Email ke Peserta</DialogTitle>
                <p className="text-xs text-slate-500">{selected.judul}</p>
              </DialogHeader>
              <div className="flex flex-1 flex-col gap-3 overflow-y-auto">
                <div className="rounded-lg bg-slate-50 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-slate-900">
                      Penerima (BCC): {emailPeserta.length} alumni
                    </p>
                    <button
                      type="button"
                      onClick={salinEmail}
                      className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
                    >
                      <Copy className="size-3" />
                      {tersalin ? "Tersalin!" : "Salin daftar email"}
                    </button>
                  </div>
                  <p className="mt-1 text-xs break-all text-slate-600">
                    {emailPeserta.join(", ")}
                  </p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="broadcast-subjek">Subjek</Label>
                  <Input
                    id="broadcast-subjek"
                    value={subjek}
                    onChange={(e) => setSubjek(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="broadcast-pesan">Pesan</Label>
                  <textarea
                    id="broadcast-pesan"
                    value={pesan}
                    onChange={(e) => setPesan(e.target.value)}
                    rows={11}
                    className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  />
                </div>
                <p className="text-xs text-slate-400">
                  Email dibuka di Gmail atau aplikasi email Anda dengan semua
                  peserta di BCC, jadi peserta tidak saling melihat alamat
                  email. Periksa lalu klik Kirim di sana.
                </p>
                {mailtoUrl.length > MAILTO_MAX && (
                  <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700">
                    Pesan dan daftar penerima cukup panjang, sebagian aplikasi
                    email bisa memotongnya. Gunakan tombol Gmail, atau salin
                    daftar email lalu tempel ke kolom BCC secara manual.
                  </p>
                )}
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  className="gap-1.5"
                  onClick={() => setMode("view")}
                >
                  <ArrowLeft className="size-3.5" />
                  Kembali
                </Button>
                <a
                  href={mailtoUrl}
                  aria-disabled={!subjek.trim() || !pesan.trim()}
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "gap-1.5",
                    (!subjek.trim() || !pesan.trim()) &&
                      "pointer-events-none opacity-50",
                  )}
                >
                  <Mail className="size-3.5" />
                  Aplikasi Email
                </a>
                <a
                  href={gmailUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-disabled={!subjek.trim() || !pesan.trim()}
                  className={cn(
                    buttonVariants(),
                    "gap-1.5 bg-blue-600 hover:bg-blue-700",
                    (!subjek.trim() || !pesan.trim()) &&
                      "pointer-events-none opacity-50",
                  )}
                >
                  <Send className="size-3.5" />
                  Buka di Gmail
                </a>
              </DialogFooter>
            </>
          )}

          {mode === "form" && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {selectedId ? "Edit Acara" : "Tambah Acara Baru"}
                </DialogTitle>
                <p className="text-xs text-slate-500">
                  Acara akan langsung tampil di portal alumni sekolah
                  penyelenggara.
                </p>
              </DialogHeader>
              <div className="flex flex-1 flex-col gap-3 overflow-y-auto">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="acara-judul">Judul Acara</Label>
                  <Input
                    id="acara-judul"
                    value={form.judul}
                    onChange={(e) =>
                      setForm({ ...form, judul: e.target.value })
                    }
                    placeholder="Contoh: Reuni Akbar Angkatan 2025"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="acara-jenis">Jenis</Label>
                    <Select
                      value={form.jenis}
                      onValueChange={(v) =>
                        setForm({ ...form, jenis: v as string })
                      }
                    >
                      <SelectTrigger id="acara-jenis" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {jenisAcaraOptions.map((j) => (
                          <SelectItem key={j} value={j}>
                            {j}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="acara-sekolah">Sekolah</Label>
                    <Select
                      value={form.sekolah}
                      onValueChange={(v) =>
                        setForm({ ...form, sekolah: v as string })
                      }
                    >
                      <SelectTrigger id="acara-sekolah" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {sekolahOptions.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="acara-tanggal">Tanggal & Jam (WIB)</Label>
                    <Input
                      id="acara-tanggal"
                      type="datetime-local"
                      value={form.tanggal}
                      onChange={(e) =>
                        setForm({ ...form, tanggal: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="acara-kuota">Kuota Peserta</Label>
                    <Input
                      id="acara-kuota"
                      type="number"
                      min={1}
                      value={Number.isNaN(form.kuota) ? "" : form.kuota}
                      onChange={(e) =>
                        setForm({ ...form, kuota: e.target.valueAsNumber })
                      }
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="acara-lokasi">Lokasi</Label>
                  <Input
                    id="acara-lokasi"
                    value={form.lokasi}
                    onChange={(e) =>
                      setForm({ ...form, lokasi: e.target.value })
                    }
                    placeholder="Contoh: Aula SMA Negeri 1 atau Online (Zoom)"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="acara-deskripsi">Deskripsi</Label>
                  <textarea
                    id="acara-deskripsi"
                    value={form.deskripsi}
                    onChange={(e) =>
                      setForm({ ...form, deskripsi: e.target.value })
                    }
                    rows={4}
                    placeholder="Jelaskan susunan acara, siapa yang diundang, dan hal yang perlu disiapkan."
                    className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  />
                </div>
                {error && (
                  <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-600">
                    {error}
                  </p>
                )}
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  className="gap-1.5"
                  disabled={isPending}
                  onClick={() =>
                    selectedId ? setMode("view") : setIsOpen(false)
                  }
                >
                  {selectedId && <ArrowLeft className="size-3.5" />}
                  Batal
                </Button>
                <Button
                  className="gap-1.5 bg-blue-600 hover:bg-blue-700"
                  disabled={isPending}
                  onClick={submitForm}
                >
                  {isPending && <Loader2 className="animate-spin" />}
                  {selectedId ? "Simpan Perubahan" : "Tambah Acara"}
                </Button>
              </DialogFooter>
            </>
          )}

          {mode === "delete" && selected && (
            <>
              <DialogHeader>
                <DialogTitle>Hapus Acara</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-slate-600">
                Acara{" "}
                <span className="font-semibold text-slate-900">
                  {selected.judul}
                </span>{" "}
                akan dihapus dari portal alumni
                {selected.pesertaPortal.length > 0 &&
                  `, termasuk ${selected.pesertaPortal.length} pendaftaran alumni`}
                . Tindakan ini tidak dapat dibatalkan.
              </p>
              {error && (
                <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-600">
                  {error}
                </p>
              )}
              <DialogFooter>
                <Button
                  variant="outline"
                  disabled={isPending}
                  onClick={() => setMode("view")}
                >
                  Batal
                </Button>
                <Button
                  variant="destructive"
                  className="gap-1.5"
                  disabled={isPending}
                  onClick={confirmHapus}
                >
                  {isPending && <Loader2 className="animate-spin" />}
                  Ya, Hapus Acara
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
