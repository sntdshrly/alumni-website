"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, Check, Filter, Search, SearchCheck, Users, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  statusSetelahLulusOptions,
  statusValidasiOptions,
  isStatusBekerja,
  isStatusKuliah,
  labelPekerjaan,
  type Alumni,
  type StatusSetelahLulus,
  type StatusValidasi,
} from "@/data/alumni";
import type { PerguruanTinggi } from "@/data/perguruan-tinggi";
import { useAlumniStore } from "@/components/alumni/alumni-store";
import { Header } from "@/components/header";
import { DownloadReportButton } from "@/components/download-report-button";
import { ValidasiBadge, validasiDeskripsi, validasiKpi } from "@/components/validasi";
import { downloadCsv, reportFilename } from "@/lib/export-csv";
import { socialLabel } from "@/lib/kontak";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type VerificationManagerProps = {
  sekolahOptions: string[];
  perguruanTinggi: PerguruanTinggi[];
  // Nama admin yang sedang login, dicatat sebagai pemeriksa saat status diubah.
  currentAdmin: string;
};

// Urutan antrean: yang belum dicek tampil paling atas.
const urutanStatus: Record<StatusValidasi, number> = {
  Pending: 0,
  "On Review": 1,
  Rejected: 2,
  Valid: 3,
};

function initials(nama: string) {
  return nama
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
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

export function VerificationManager({
  sekolahOptions,
  perguruanTinggi,
  currentAdmin,
}: VerificationManagerProps) {
  const [alumniList, setAlumniList] = useAlumniStore();
  const [sekolahFilter, setSekolahFilter] = useState("semua");
  const [validasiFilter, setValidasiFilter] = useState<"semua" | StatusValidasi>("semua");
  const [statusFilter, setStatusFilter] = useState<"semua" | StatusSetelahLulus>("semua");
  const [search, setSearch] = useState("");
  const [selectedNik, setSelectedNik] = useState<string | null>(null);
  const [isRejecting, setIsRejecting] = useState(false);
  const [catatan, setCatatan] = useState("");

  const ptById = useMemo(
    () => new Map(perguruanTinggi.map((pt) => [pt.id, pt])),
    [perguruanTinggi],
  );

  const sekolahAlumni = alumniList.filter(
    (a) => sekolahFilter === "semua" || a.sekolah === sekolahFilter,
  );
  const countValidasi = (validasi: StatusValidasi) =>
    sekolahAlumni.filter((a) => a.validasi === validasi).length;
  const persen = (n: number) =>
    sekolahAlumni.length
      ? ((n / sekolahAlumni.length) * 100).toFixed(1).replace(".", ",")
      : "0";

  const filteredAlumni = useMemo(() => {
    const query = search.trim().toLowerCase();
    return alumniList
      .filter((a) => {
        if (sekolahFilter !== "semua" && a.sekolah !== sekolahFilter) return false;
        if (validasiFilter !== "semua" && a.validasi !== validasiFilter) return false;
        if (statusFilter !== "semua" && a.statusSetelahLulus !== statusFilter) return false;
        return (
          !query ||
          a.nama.toLowerCase().includes(query) ||
          a.nik.includes(query) ||
          a.pemeriksa.toLowerCase().includes(query)
        );
      })
      .sort(
        (x, y) =>
          urutanStatus[x.validasi] - urutanStatus[y.validasi] ||
          x.nama.localeCompare(y.nama, "id"),
      );
  }, [alumniList, sekolahFilter, validasiFilter, statusFilter, search]);

  const selected = alumniList.find((a) => a.nik === selectedNik) ?? null;

  function institusi(a: Alumni) {
    return ptById.get(a.perguruanTinggiId)?.nama ?? "";
  }

  // Ringkasan kegiatan alumni: kampus & prodi untuk yang kuliah, jabatan & tempat untuk yang bekerja.
  function ringkasanKegiatan(a: Alumni) {
    const bagian = isStatusBekerja(a.statusSetelahLulus)
      ? [a.jabatan, a.tempatKerja]
      : [institusi(a), a.programStudi];
    return bagian.filter(Boolean).join(" • ");
  }

  function closeDialog(open: boolean) {
    if (!open) {
      setSelectedNik(null);
      setIsRejecting(false);
      setCatatan("");
    }
  }

  // Perubahan status langsung tersimpan ke data alumni bersama, atas nama admin yang login.
  function applyStatus(validasi: StatusValidasi, note = "") {
    if (!selected) return;
    setAlumniList((prev) =>
      prev.map((a) =>
        a.nik === selected.nik
          ? { ...a, validasi, pemeriksa: currentAdmin, catatanValidasi: note.trim() }
          : a,
      ),
    );
    setIsRejecting(false);
    setCatatan("");
  }

  const isFilterActive = validasiFilter !== "semua" || statusFilter !== "semua";

  function downloadReport() {
    downloadCsv(
      reportFilename("verifikasi-data"),
      [
        "NIK", "Nama Alumni", "Sekolah", "Status Setelah Lulus", "Perguruan Tinggi",
        "Program Studi", "Jabatan / Bidang Usaha", "Tempat Bekerja / Nama Usaha", "Terakhir Dikonfirmasi", "Validasi", "Admin Pemeriksa", "Catatan",
      ],
      filteredAlumni.map((a) => [
        a.nik, a.nama, a.sekolah, a.statusSetelahLulus, institusi(a), a.programStudi,
        a.jabatan, a.tempatKerja,
        a.terakhirDikonfirmasi, a.validasi, a.pemeriksa, a.catatanValidasi,
      ]),
    );
  }

  return (
    <>
      <Header
        title="Verifikasi Data"
        actions={
          <>
            <Select value={sekolahFilter} onValueChange={(v) => setSekolahFilter(v as string)}>
              <SelectTrigger className="min-w-[170px]">
                <SelectValue>
                  {(value: string) => (value === "semua" ? "Semua Sekolah" : value)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semua">Semua Sekolah</SelectItem>
                {sekolahOptions.map((sekolah) => (
                  <SelectItem key={sekolah} value={sekolah}>
                    {sekolah}
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <StatCard
              icon={Users}
              iconClassName="bg-blue-50 text-blue-600"
              label="Total Alumni"
              value={sekolahAlumni.length}
              caption="Data alumni yang perlu diverifikasi"
            />
            {validasiKpi.map(({ validasi, icon, iconClassName }) => {
              const total = countValidasi(validasi);
              return (
                <StatCard
                  key={validasi}
                  icon={icon}
                  iconClassName={iconClassName}
                  label={validasi}
                  value={total}
                  caption={`${validasiDeskripsi[validasi]} • ${persen(total)}%`}
                />
              );
            })}
          </div>

          <div className="flex w-full flex-col rounded-xl border border-black/5 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Antrean Verifikasi</h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Menampilkan {filteredAlumni.length} alumni, yang belum dicek tampil paling atas
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari alumni, NIK, atau admin"
                    className="w-60 pl-8"
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "gap-1.5",
                      isFilterActive && "border-blue-200 bg-blue-50 text-blue-700",
                    )}
                  >
                    <Filter className="size-3.5" />
                    Filter
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="max-h-80 w-56">
                    <DropdownMenuGroup>
                      <DropdownMenuLabel>Validasi</DropdownMenuLabel>
                      <DropdownMenuRadioGroup
                        value={validasiFilter}
                        onValueChange={(value) =>
                          setValidasiFilter(value as "semua" | StatusValidasi)
                        }
                      >
                        <DropdownMenuRadioItem value="semua" closeOnClick>
                          Semua Validasi
                        </DropdownMenuRadioItem>
                        {statusValidasiOptions.map((status) => (
                          <DropdownMenuRadioItem key={status} value={status} closeOnClick>
                            {status}
                          </DropdownMenuRadioItem>
                        ))}
                      </DropdownMenuRadioGroup>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuLabel>Status Setelah Lulus</DropdownMenuLabel>
                      <DropdownMenuRadioGroup
                        value={statusFilter}
                        onValueChange={(value) =>
                          setStatusFilter(value as "semua" | StatusSetelahLulus)
                        }
                      >
                        <DropdownMenuRadioItem value="semua" closeOnClick>
                          Semua Status
                        </DropdownMenuRadioItem>
                        {statusSetelahLulusOptions.map((status) => (
                          <DropdownMenuRadioItem key={status} value={status} closeOnClick>
                            {status}
                          </DropdownMenuRadioItem>
                        ))}
                      </DropdownMenuRadioGroup>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="mt-4 min-w-0 flex-1 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {[
                      "Nama Alumni",
                      "Data yang Diinput",
                      "Admin Pemeriksa",
                      "Terakhir Diperbaharui",
                      "Status",
                    ].map((h) => (
                      <TableHead
                        key={h}
                        className="text-[11px] tracking-wider text-slate-400 uppercase"
                      >
                        {h}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAlumni.map((a) => {
                    return (
                      <TableRow
                        key={a.nik}
                        onClick={() => setSelectedNik(a.nik)}
                        className="cursor-pointer"
                      >
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-xs font-semibold text-blue-600">
                              {initials(a.nama)}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-medium text-slate-900">{a.nama}</p>
                              <p className="truncate text-xs text-slate-500">NIK {a.nik}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="truncate font-medium text-slate-800">
                            {a.statusSetelahLulus}
                          </p>
                          <p className="truncate text-xs text-slate-500">
                            {ringkasanKegiatan(a) || "-"}
                          </p>
                        </TableCell>
                        <TableCell>
                          {a.pemeriksa ? (
                            <span className="text-slate-700">{a.pemeriksa}</span>
                          ) : (
                            <span className="text-xs text-slate-400 italic">Belum dicek</span>
                          )}
                        </TableCell>
                        <TableCell className="text-slate-600">{a.terakhirDikonfirmasi}</TableCell>
                        <TableCell>
                          <ValidasiBadge validasi={a.validasi} />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filteredAlumni.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="py-10 text-center text-sm text-slate-500">
                        Tidak ada alumni yang cocok dengan pencarian.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          <Dialog open={selected !== null} onOpenChange={closeDialog}>
            <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-md">
              {selected && !isRejecting && (
                <>
                  <DialogHeader>
                    <DialogTitle>Verifikasi Data Alumni</DialogTitle>
                    <p className="text-xs text-slate-500">
                      {selected.nama} &bull; NIK {selected.nik}
                    </p>
                  </DialogHeader>

                  <div className="flex flex-1 flex-col gap-4 overflow-y-auto">
                    <div className="rounded-lg bg-slate-50 p-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-xs font-semibold text-blue-600">
                          {initials(selected.nama)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {selected.nama}
                          </p>
                          <p className="truncate text-xs text-slate-500">
                            {selected.sekolah} &bull; {selected.kelas} &bull; Lulus{" "}
                            {selected.tahunLulus}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2.5 flex items-center gap-2">
                        <ValidasiBadge validasi={selected.validasi} />
                        <span className="text-xs text-slate-500">
                          {selected.pemeriksa
                            ? `Dicek oleh ${selected.pemeriksa}`
                            : "Belum dicek admin"}
                        </span>
                      </div>
                    </div>

                    {selected.validasi === "Rejected" && selected.catatanValidasi && (
                      <div className="rounded-lg bg-rose-50 px-3.5 py-2.5 text-xs text-rose-700">
                        <p className="font-semibold">Alasan ditolak</p>
                        <p className="mt-0.5">{selected.catatanValidasi}</p>
                      </div>
                    )}

                    <div>
                      <p className="text-xs font-semibold text-slate-900">
                        Data yang Diinput Alumni
                      </p>
                      <dl className="mt-2 divide-y divide-slate-100 text-xs">
                        {[
                          ["Status setelah lulus", selected.statusSetelahLulus],
                          ...(isStatusKuliah(selected.statusSetelahLulus)
                            ? [
                                ["Perguruan tinggi", institusi(selected) || "-"],
                                ["Program studi", selected.programStudi || "-"],
                              ]
                            : []),
                          ...(isStatusBekerja(selected.statusSetelahLulus)
                            ? [
                                [
                                  labelPekerjaan(selected.statusSetelahLulus).tempat,
                                  selected.tempatKerja || "-",
                                ],
                                [
                                  labelPekerjaan(selected.statusSetelahLulus).jabatan,
                                  selected.jabatan || "-",
                                ],
                              ]
                            : []),
                          ["Email", selected.email || "-"],
                          ["Telepon", selected.telepon || "-"],
                          [
                            "LinkedIn",
                            selected.linkedin ? socialLabel("linkedin", selected.linkedin) : "-",
                          ],
                          [
                            "Instagram",
                            selected.instagram ? socialLabel("instagram", selected.instagram) : "-",
                          ],
                          ["TikTok", selected.tiktok ? socialLabel("tiktok", selected.tiktok) : "-"],
                          ["Terakhir dikonfirmasi", selected.terakhirDikonfirmasi],
                        ].map(([label, value]) => (
                          <div
                            key={label}
                            className="flex items-center justify-between gap-2 py-2"
                          >
                            <dt className="shrink-0 text-slate-500">{label}</dt>
                            <dd className="truncate font-medium text-slate-800">{value}</dd>
                          </div>
                        ))}
                      </dl>
                      <p className="mt-1 text-xs text-slate-400">
                        Data yang salah diperbaiki melalui menu{" "}
                        <Link href="/dashboard/data-alumni" className="text-blue-600 hover:underline">
                          Data Alumni
                        </Link>
                        .
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-slate-900">Tindakan Verifikasi</p>
                      <div className="mt-2 grid grid-cols-3 gap-2">
                        <Button
                          variant="outline"
                          className="gap-1.5 text-rose-600 hover:text-rose-700"
                          disabled={selected.validasi === "Rejected"}
                          onClick={() => {
                            setCatatan("");
                            setIsRejecting(true);
                          }}
                        >
                          <X className="size-3.5" />
                          Rejected
                        </Button>
                        <Button
                          variant="outline"
                          className="gap-1.5 text-blue-600 hover:text-blue-700"
                          disabled={selected.validasi === "On Review"}
                          onClick={() => applyStatus("On Review")}
                        >
                          <SearchCheck className="size-3.5" />
                          On Review
                        </Button>
                        <Button
                          className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"
                          disabled={selected.validasi === "Valid"}
                          onClick={() => applyStatus("Valid")}
                        >
                          <Check className="size-3.5" />
                          Valid
                        </Button>
                      </div>
                      <p className="mt-1.5 text-xs text-slate-400">
                        Perubahan status dicatat atas nama {currentAdmin} dan langsung terlihat di
                        Data Alumni.
                      </p>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => closeDialog(false)}>
                      Tutup
                    </Button>
                  </DialogFooter>
                </>
              )}

              {selected && isRejecting && (
                <>
                  <DialogHeader>
                    <DialogTitle>Tandai Rejected</DialogTitle>
                    <p className="text-xs text-slate-500">
                      {selected.nama} &bull; NIK {selected.nik}
                    </p>
                  </DialogHeader>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="catatan-validasi">Alasan data tidak sesuai</Label>
                    <textarea
                      id="catatan-validasi"
                      value={catatan}
                      onChange={(e) => setCatatan(e.target.value)}
                      rows={4}
                      placeholder="Jelaskan bagian data yang tidak sesuai"
                      className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    />
                    <p className="text-xs text-slate-400">
                      Alasan wajib diisi agar jelas data mana yang perlu diperbaiki.
                    </p>
                  </div>

                  <DialogFooter>
                    <Button
                      variant="outline"
                      className="gap-1.5"
                      onClick={() => setIsRejecting(false)}
                    >
                      <ArrowLeft className="size-3.5" />
                      Batal
                    </Button>
                    <Button
                      variant="destructive"
                      disabled={catatan.trim().length === 0}
                      onClick={() => applyStatus("Rejected", catatan)}
                    >
                      Ya, Tandai Rejected
                    </Button>
                  </DialogFooter>
                </>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </>
  );
}
