"use client";

import { useMemo, useState } from "react";
import {
  Building2,
  MapPin,
  Search,
  Filter,
  Plus,
  Pencil,
  Trash2,
  ArrowLeft,
  FileSpreadsheet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Sekolah } from "@/data/sekolah";
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
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LocationAutocomplete } from "@/components/sekolah/location-autocomplete";
import { Header } from "@/components/header";
import { ImportDialog } from "@/components/import/import-dialog";
import { kolomSekolah, validasiSekolah, type SekolahImpor } from "@/components/import/definisi-impor";
import { downloadCsv, reportFilename } from "@/lib/export-csv";

type SchoolManagerProps = {
  schools: Sekolah[];
};

type SortOption = "default" | "alumni-desc" | "alumni-asc";

type EditDraft = {
  npsn: string;
  jenisSekolah: "Negeri" | "Swasta";
  kepalaSekolah: string;
  lokasi: string;
  email: string;
  telepon: string;
  tahunBergabung: string;
};

type AddDraft = {
  nama: string;
  npsn: string;
  jenisSekolah: "Negeri" | "Swasta";
  kepalaSekolah: string;
  lokasi: string;
  email: string;
  telepon: string;
  tahunBergabung: string;
  status: "Aktif" | "Nonaktif";
};

function emptyAddDraft(): AddDraft {
  return {
    nama: "",
    npsn: "",
    jenisSekolah: "Negeri",
    kepalaSekolah: "",
    lokasi: "",
    email: "",
    telepon: "",
    tahunBergabung: String(new Date().getFullYear()),
    status: "Aktif",
  };
}

function slugify(text: string) {
  return (
    text
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "sekolah"
  );
}

function generateUniqueId(base: string, existing: Sekolah[]) {
  const slug = slugify(base);
  if (!existing.some((s) => s.id === slug)) return slug;
  let i = 2;
  while (existing.some((s) => s.id === `${slug}-${i}`)) i++;
  return `${slug}-${i}`;
}

const monthNamesId = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

function formatToday() {
  const now = new Date();
  return `${String(now.getDate()).padStart(2, "0")} ${monthNamesId[now.getMonth()]} ${now.getFullYear()}`;
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// NPSN (Nomor Pokok Sekolah Nasional) selalu 8 digit dan unik per sekolah.
const NPSN_LENGTH = 8;

function isNpsnValid(npsn: string) {
  return npsn.length === NPSN_LENGTH;
}

function isNpsnTaken(npsn: string, schools: Sekolah[], ignoreId?: string) {
  return npsn.length > 0 && schools.some((s) => s.id !== ignoreId && s.npsn === npsn);
}

function draftFromSchool(school: Sekolah): EditDraft {
  return {
    npsn: school.npsn,
    jenisSekolah: school.jenisSekolah === "Negeri" ? "Negeri" : "Swasta",
    kepalaSekolah: school.kepalaSekolah,
    lokasi: school.lokasi,
    email: school.email,
    telepon: school.telepon,
    tahunBergabung: String(school.tahunBergabung),
  };
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

export function SchoolManager({ schools: initialSchools }: SchoolManagerProps) {
  const [schools, setSchools] = useState(initialSchools);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mode, setMode] = useState<"view" | "edit" | "delete">("view");
  const [draft, setDraft] = useState<EditDraft | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [addDraft, setAddDraft] = useState<AddDraft>(emptyAddDraft());

  const totalSekolah = schools.length;
  const totalLokasi = new Set(schools.map((s) => s.lokasi)).size;

  const filteredSchools = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = schools.filter(
      (s) =>
        !query ||
        s.nama.toLowerCase().includes(query) ||
        s.npsn.includes(query) ||
        s.lokasi.toLowerCase().includes(query),
    );
    if (sortBy === "alumni-desc")
      return [...filtered].sort((a, b) => b.alumni - a.alumni);
    if (sortBy === "alumni-asc")
      return [...filtered].sort((a, b) => a.alumni - b.alumni);
    return filtered;
  }, [schools, search, sortBy]);

  const selectedSchool = schools.find((s) => s.id === selectedId) ?? null;

  function openSchool(id: string) {
    setSelectedId(id);
    setMode("view");
  }

  function closeDialog(open: boolean) {
    if (!open) {
      setSelectedId(null);
      setMode("view");
      setDraft(null);
    }
  }

  function startEdit() {
    if (!selectedSchool) return;
    setDraft(draftFromSchool(selectedSchool));
    setMode("edit");
  }

  function saveEdit() {
    if (!selectedSchool || !draft) return;
    setSchools((prev) =>
      prev.map((s) =>
        s.id === selectedSchool.id
          ? {
              ...s,
              npsn: draft.npsn,
              jenisSekolah: draft.jenisSekolah,
              kepalaSekolah: draft.kepalaSekolah,
              lokasi: draft.lokasi,
              email: draft.email,
              telepon: draft.telepon,
              tahunBergabung: Number(draft.tahunBergabung),
              terakhirDiperbarui: formatToday(),
            }
          : s,
      ),
    );
    setMode("view");
  }

  function confirmDelete() {
    if (!selectedSchool) return;
    setSchools((prev) => prev.filter((s) => s.id !== selectedSchool.id));
    setSelectedId(null);
    setMode("view");
  }

  function openAddDialog() {
    setAddDraft(emptyAddDraft());
    setIsAddOpen(true);
  }

  function closeAddDialog(open: boolean) {
    setIsAddOpen(open);
    if (!open) setAddDraft(emptyAddDraft());
  }

  function importSekolah(items: SekolahImpor[]) {
    setSchools((prev) => {
      const next = [...prev];
      for (const item of items) {
        next.push({
          ...item,
          id: generateUniqueId(item.npsn, next),
          alumni: 0,
          perluPembaruan: false,
          terakhirDiperbarui: formatToday(),
        });
      }
      return next;
    });
  }

  function submitAdd() {
    if (!isAddComplete) return;
    const newSchool: Sekolah = {
      id: generateUniqueId(addDraft.npsn, schools),
      nama: addDraft.nama.trim(),
      kepalaSekolah: addDraft.kepalaSekolah.trim(),
      lokasi: addDraft.lokasi.trim(),
      alumni: 0,
      status: addDraft.status,
      perluPembaruan: false,
      npsn: addDraft.npsn,
      jenisSekolah: addDraft.jenisSekolah,
      email: addDraft.email.trim(),
      telepon: addDraft.telepon.trim(),
      tahunBergabung: Number(addDraft.tahunBergabung),
      terakhirDiperbarui: formatToday(),
    };
    setSchools((prev) => [...prev, newSchool]);
    setIsAddOpen(false);
    setAddDraft(emptyAddDraft());
  }

  const isEmailValid = !draft || emailPattern.test(draft.email);
  const isEditNpsnDuplicate =
    !!draft && isNpsnTaken(draft.npsn, schools, selectedSchool?.id);
  const isDraftComplete =
    !!draft &&
    isNpsnValid(draft.npsn) &&
    !isEditNpsnDuplicate &&
    draft.kepalaSekolah.trim().length > 0 &&
    draft.lokasi.trim().length > 0 &&
    draft.telepon.trim().length > 0 &&
    draft.tahunBergabung.trim().length === 4 &&
    emailPattern.test(draft.email);

  const isAddEmailValid =
    addDraft.email.length === 0 || emailPattern.test(addDraft.email);
  const isAddNpsnDuplicate = isNpsnTaken(addDraft.npsn, schools);
  const isAddComplete =
    addDraft.nama.trim().length > 0 &&
    isNpsnValid(addDraft.npsn) &&
    !isAddNpsnDuplicate &&
    addDraft.kepalaSekolah.trim().length > 0 &&
    addDraft.lokasi.trim().length > 0 &&
    addDraft.telepon.trim().length > 0 &&
    addDraft.tahunBergabung.trim().length === 4 &&
    emailPattern.test(addDraft.email);

  function downloadReport() {
    downloadCsv(
      reportFilename("sekolah"),
      [
        "Nama Sekolah",
        "NPSN",
        "Jenis Sekolah",
        "Kepala Sekolah",
        "Lokasi",
        "Email",
        "Telepon",
        "Tahun Bergabung",
        "Alumni",
        "Status",
        "Terakhir Diperbarui",
      ],
      filteredSchools.map((s) => [
        s.nama,
        s.npsn,
        s.jenisSekolah,
        s.kepalaSekolah,
        s.lokasi,
        s.email,
        s.telepon,
        s.tahunBergabung,
        s.alumni,
        s.status,
        s.terakhirDiperbarui,
      ]),
    );
  }

  return (
    <>
      <Header title="Sekolah" onDownload={downloadReport} />

      <main className="flex-1 p-6">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <StatCard
              icon={Building2}
              iconClassName="bg-blue-50 text-blue-600"
              label="Total Sekolah"
              value={totalSekolah}
              caption="Total seluruh sekolah"
            />
            <StatCard
              icon={MapPin}
              iconClassName="bg-cyan-50 text-cyan-600"
              label="Total Lokasi"
              value={totalLokasi}
              caption="Kota/kabupaten tempat sekolah beroperasi"
            />
          </div>

          <div className="flex w-full flex-col rounded-xl border border-black/5 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Daftar Sekolah
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Menampilkan {filteredSchools.length} sekolah yang dapat
                  dikelola
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari nama, NPSN, atau lokasi"
                    className="w-60 pl-8"
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "gap-1.5",
                    )}
                  >
                    <Filter className="size-3.5" />
                    Filter
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuRadioGroup
                      value={sortBy}
                      onValueChange={(value) => setSortBy(value as SortOption)}
                    >
                      <DropdownMenuRadioItem value="default" closeOnClick>
                        Urutan Default
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="alumni-desc" closeOnClick>
                        Jumlah Alumni Terbanyak
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="alumni-asc" closeOnClick>
                        Jumlah Alumni Tersedikit
                      </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button variant="outline" className="gap-1.5" onClick={() => setIsImportOpen(true)}>
                  <FileSpreadsheet className="size-4" />
                  Import Excel
                </Button>
                <Button
                  className="gap-1.5 bg-blue-600 hover:bg-blue-700"
                  onClick={openAddDialog}
                >
                  <Plus className="size-4" />
                  Tambah Sekolah
                </Button>
                <ImportDialog<SekolahImpor>
                  open={isImportOpen}
                  onOpenChange={setIsImportOpen}
                  namaData="sekolah"
                  namaTemplate="template-import-sekolah.xlsx"
                  kolom={kolomSekolah}
                  validasi={(baris) => validasiSekolah(baris, schools)}
                  label={(s) => `${s.nama} • NPSN ${s.npsn} • ${s.lokasi}`}
                  onImport={importSekolah}
                />
              </div>
            </div>

            <div className="mt-4 min-w-0 flex-1 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[11px] tracking-wider text-slate-400 uppercase">
                      Sekolah
                    </TableHead>
                    <TableHead className="text-[11px] tracking-wider text-slate-400 uppercase">
                      NPSN
                    </TableHead>
                    <TableHead className="text-[11px] tracking-wider text-slate-400 uppercase">
                      Kepala Sekolah
                    </TableHead>
                    <TableHead className="text-[11px] tracking-wider text-slate-400 uppercase">
                      Lokasi
                    </TableHead>
                    <TableHead className="text-right text-[11px] tracking-wider text-slate-400 uppercase">
                      Alumni
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSchools.map((school) => (
                    <TableRow
                      key={school.id}
                      onClick={() => openSchool(school.id)}
                      className="cursor-pointer"
                    >
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-sm font-semibold text-blue-600">
                            {school.nama.charAt(0)}
                          </div>
                          <p className="min-w-0 truncate font-medium text-slate-900">
                            {school.nama}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {school.npsn}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {school.kepalaSekolah}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {school.lokasi}
                      </TableCell>
                      <TableCell className="text-right font-medium text-slate-900">
                        {school.alumni}
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredSchools.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="py-10 text-center text-sm text-slate-500"
                      >
                        Tidak ada sekolah yang cocok dengan pencarian.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          <Dialog open={selectedSchool !== null} onOpenChange={closeDialog}>
            <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-md">
              {selectedSchool && mode === "view" && (
                <>
                  <DialogHeader>
                    <DialogTitle>Detail Sekolah</DialogTitle>
                    <p className="text-xs text-slate-500">
                      Informasi sekolah yang dipilih
                    </p>
                  </DialogHeader>

                  <div className="flex flex-1 flex-col gap-4 overflow-y-auto">
                    <div className="rounded-lg bg-slate-50 p-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-sm font-semibold text-blue-600">
                          {selectedSchool.nama.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {selectedSchool.nama}
                          </p>
                          <p className="truncate text-xs text-slate-500">
                            NPSN: {selectedSchool.npsn}
                          </p>
                        </div>
                      </div>
                      <span
                        className={cn(
                          "mt-2.5 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                          selectedSchool.status === "Aktif"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-500",
                        )}
                      >
                        {selectedSchool.status}
                      </span>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-slate-900">
                        Informasi Dasar
                      </p>
                      <dl className="mt-2 divide-y divide-slate-100 text-xs">
                        {[
                          ["Jenis Sekolah", selectedSchool.jenisSekolah],
                          ["Kepala Sekolah", selectedSchool.kepalaSekolah],
                          ["Lokasi", selectedSchool.lokasi],
                          ["Email", selectedSchool.email],
                          ["Telepon", selectedSchool.telepon],
                          ["Tahun Bergabung", selectedSchool.tahunBergabung],
                          [
                            "Terakhir diperbarui",
                            selectedSchool.terakhirDiperbarui,
                          ],
                        ].map(([label, value]) => (
                          <div
                            key={label}
                            className="flex items-center justify-between gap-2 py-2"
                          >
                            <dt className="text-slate-500">{label}</dt>
                            <dd className="truncate font-medium text-slate-800">
                              {value}
                            </dd>
                          </div>
                        ))}
                      </dl>
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
                      className="gap-1.5 bg-blue-600 hover:bg-blue-700"
                      onClick={startEdit}
                    >
                      <Pencil className="size-3.5" />
                      Edit Sekolah
                    </Button>
                  </DialogFooter>
                </>
              )}

              {selectedSchool && mode === "edit" && draft && (
                <>
                  <DialogHeader>
                    <DialogTitle>Edit Sekolah</DialogTitle>
                    <p className="text-xs text-slate-500">
                      {selectedSchool.nama} &bull; NPSN {selectedSchool.npsn}
                    </p>
                  </DialogHeader>

                  <div className="flex flex-1 flex-col gap-3 overflow-y-auto">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="npsn">NPSN</Label>
                      <Input
                        id="npsn"
                        inputMode="numeric"
                        value={draft.npsn}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            npsn: e.target.value.replace(/\D/g, ""),
                          })
                        }
                        placeholder="Contoh: 20123456"
                        maxLength={NPSN_LENGTH}
                        aria-invalid={isEditNpsnDuplicate}
                      />
                      {isEditNpsnDuplicate && (
                        <p className="text-xs text-rose-600">
                          NPSN ini sudah terdaftar.
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="jenis-sekolah">Jenis Sekolah</Label>
                      <Select
                        value={draft.jenisSekolah}
                        onValueChange={(v) =>
                          setDraft({
                            ...draft,
                            jenisSekolah: v as EditDraft["jenisSekolah"],
                          })
                        }
                      >
                        <SelectTrigger id="jenis-sekolah">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Negeri">Negeri</SelectItem>
                          <SelectItem value="Swasta">Swasta</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="kepala-sekolah">Kepala Sekolah</Label>
                      <Input
                        id="kepala-sekolah"
                        value={draft.kepalaSekolah}
                        onChange={(e) =>
                          setDraft({ ...draft, kepalaSekolah: e.target.value })
                        }
                        placeholder="Nama kepala sekolah"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="lokasi">Lokasi</Label>
                      <LocationAutocomplete
                        id="lokasi"
                        value={draft.lokasi}
                        onChange={(v) => setDraft({ ...draft, lokasi: v })}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={draft.email}
                        onChange={(e) =>
                          setDraft({ ...draft, email: e.target.value })
                        }
                        placeholder="admin@sekolah.sch.id"
                        aria-invalid={!isEmailValid}
                      />
                      {!isEmailValid && (
                        <p className="text-xs text-rose-600">
                          Masukkan alamat email yang valid.
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="telepon">Telepon</Label>
                      <Input
                        id="telepon"
                        inputMode="tel"
                        value={draft.telepon}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            telepon: e.target.value.replace(/[^\d\s-]/g, ""),
                          })
                        }
                        placeholder="021-555-0148"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="tahun-bergabung">Tahun Bergabung</Label>
                      <Input
                        id="tahun-bergabung"
                        inputMode="numeric"
                        value={draft.tahunBergabung}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            tahunBergabung: e.target.value
                              .replace(/\D/g, "")
                              .slice(0, 4),
                          })
                        }
                        placeholder="2019"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Label>Terakhir Diperbarui</Label>
                      <Input
                        value={selectedSchool.terakhirDiperbarui}
                        disabled
                      />
                      <p className="text-xs text-slate-400">
                        Terisi otomatis saat data disimpan.
                      </p>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      variant="outline"
                      className="gap-1.5"
                      onClick={() => setMode("view")}
                    >
                      <ArrowLeft className="size-3.5" />
                      Batal
                    </Button>
                    <Button
                      className="bg-blue-600 hover:bg-blue-700"
                      disabled={!isDraftComplete}
                      onClick={saveEdit}
                    >
                      Simpan Perubahan
                    </Button>
                  </DialogFooter>
                </>
              )}

              {selectedSchool && mode === "delete" && (
                <>
                  <DialogHeader>
                    <DialogTitle>Hapus Sekolah</DialogTitle>
                  </DialogHeader>

                  <p className="text-sm text-slate-600">
                    Apakah Anda yakin ingin menghapus{" "}
                    <span className="font-semibold text-slate-900">
                      {selectedSchool.nama}
                    </span>
                    ? Tindakan ini akan menghapus seluruh data sekolah ini dan
                    tidak dapat dibatalkan.
                  </p>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setMode("view")}>
                      Batal
                    </Button>
                    <Button variant="destructive" onClick={confirmDelete}>
                      Ya, Hapus Sekolah
                    </Button>
                  </DialogFooter>
                </>
              )}
            </DialogContent>
          </Dialog>

          <Dialog open={isAddOpen} onOpenChange={closeAddDialog}>
            <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Tambah Sekolah Baru</DialogTitle>
                <p className="text-xs text-slate-500">
                  Lengkapi data sekolah yang akan ditambahkan
                </p>
              </DialogHeader>

              <div className="flex flex-1 flex-col gap-3 overflow-y-auto">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="add-nama">Nama Sekolah</Label>
                  <Input
                    id="add-nama"
                    value={addDraft.nama}
                    onChange={(e) =>
                      setAddDraft({ ...addDraft, nama: e.target.value })
                    }
                    placeholder="Contoh: SMA Negeri 9"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="add-npsn">NPSN</Label>
                  <Input
                    id="add-npsn"
                    inputMode="numeric"
                    value={addDraft.npsn}
                    onChange={(e) =>
                      setAddDraft({
                        ...addDraft,
                        npsn: e.target.value.replace(/\D/g, ""),
                      })
                    }
                    placeholder="Contoh: 20123456"
                    maxLength={NPSN_LENGTH}
                    aria-invalid={isAddNpsnDuplicate}
                  />
                  {isAddNpsnDuplicate && (
                    <p className="text-xs text-rose-600">
                      NPSN ini sudah terdaftar.
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="add-jenis-sekolah">Jenis Sekolah</Label>
                  <Select
                    value={addDraft.jenisSekolah}
                    onValueChange={(v) =>
                      setAddDraft({
                        ...addDraft,
                        jenisSekolah: v as AddDraft["jenisSekolah"],
                      })
                    }
                  >
                    <SelectTrigger id="add-jenis-sekolah">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Negeri">Negeri</SelectItem>
                      <SelectItem value="Swasta">Swasta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="add-status">Status</Label>
                  <Select
                    value={addDraft.status}
                    onValueChange={(v) =>
                      setAddDraft({
                        ...addDraft,
                        status: v as AddDraft["status"],
                      })
                    }
                  >
                    <SelectTrigger id="add-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Aktif">Aktif</SelectItem>
                      <SelectItem value="Nonaktif">Nonaktif</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="add-kepala-sekolah">Kepala Sekolah</Label>
                  <Input
                    id="add-kepala-sekolah"
                    value={addDraft.kepalaSekolah}
                    onChange={(e) =>
                      setAddDraft({
                        ...addDraft,
                        kepalaSekolah: e.target.value,
                      })
                    }
                    placeholder="Nama kepala sekolah"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="add-lokasi">Lokasi</Label>
                  <LocationAutocomplete
                    id="add-lokasi"
                    value={addDraft.lokasi}
                    onChange={(v) => setAddDraft({ ...addDraft, lokasi: v })}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="add-email">Email</Label>
                  <Input
                    id="add-email"
                    type="email"
                    value={addDraft.email}
                    onChange={(e) =>
                      setAddDraft({ ...addDraft, email: e.target.value })
                    }
                    placeholder="admin@sekolah.sch.id"
                    aria-invalid={!isAddEmailValid}
                  />
                  {!isAddEmailValid && (
                    <p className="text-xs text-rose-600">
                      Masukkan alamat email yang valid.
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="add-telepon">Telepon</Label>
                  <Input
                    id="add-telepon"
                    inputMode="tel"
                    value={addDraft.telepon}
                    onChange={(e) =>
                      setAddDraft({
                        ...addDraft,
                        telepon: e.target.value.replace(/[^\d\s-]/g, ""),
                      })
                    }
                    placeholder="021-555-0148"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="add-tahun-bergabung">Tahun Bergabung</Label>
                  <Input
                    id="add-tahun-bergabung"
                    inputMode="numeric"
                    value={addDraft.tahunBergabung}
                    onChange={(e) =>
                      setAddDraft({
                        ...addDraft,
                        tahunBergabung: e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 4),
                      })
                    }
                    placeholder={String(new Date().getFullYear())}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => closeAddDialog(false)}>
                  Batal
                </Button>
                <Button
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={!isAddComplete}
                  onClick={submitAdd}
                >
                  Simpan Sekolah
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </>
  );
}
