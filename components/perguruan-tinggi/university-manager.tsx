"use client";

import { useMemo, useState } from "react";
import {
  Landmark,
  GraduationCap,
  Building2,
  Shield,
  Globe2,
  Search,
  Filter,
  Plus,
  Pencil,
  Trash2,
  ArrowLeft,
  FileSpreadsheet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  jenisPTLabel,
  jenisPTOptions,
  type JenisPT,
  type PerguruanTinggi,
  type StatusPT,
} from "@/data/perguruan-tinggi";
import { Header } from "@/components/header";
import { ImportDialog } from "@/components/import/import-dialog";
import {
  kolomPerguruanTinggi,
  validasiPerguruanTinggi,
  type PerguruanTinggiImpor,
} from "@/components/import/definisi-impor";
import { DownloadReportButton } from "@/components/download-report-button";
import { downloadCsv, reportFilename } from "@/lib/export-csv";
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

type UniversityManagerProps = {
  institutions: PerguruanTinggi[];
};

type JenisFilter = "semua" | JenisPT;

type SortOption = "default" | "alumni-desc" | "alumni-asc";

type FormDraft = {
  nama: string;
  singkatan: string;
  jenis: JenisPT;
  kota: string;
  provinsi: string;
  negara: string;
  website: string;
  status: StatusPT;
};

const monthNamesId = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

function formatToday() {
  const now = new Date();
  return `${String(now.getDate()).padStart(2, "0")} ${monthNamesId[now.getMonth()]} ${now.getFullYear()}`;
}

function formatLokasi(pt: PerguruanTinggi) {
  if (pt.negara === "Indonesia") return `${pt.kota}, ${pt.provinsi}`;
  return pt.kota === pt.negara ? pt.negara : `${pt.kota}, ${pt.negara}`;
}

function lokasiGroup(pt: PerguruanTinggi) {
  return pt.negara === "Indonesia" ? pt.provinsi : pt.negara;
}

function emptyDraft(): FormDraft {
  return {
    nama: "",
    singkatan: "",
    jenis: "Negeri",
    kota: "",
    provinsi: "",
    negara: "Indonesia",
    website: "",
    status: "Aktif",
  };
}

function draftFromInstitution(pt: PerguruanTinggi): FormDraft {
  return {
    nama: pt.nama,
    singkatan: pt.singkatan,
    jenis: pt.jenis,
    kota: pt.kota,
    provinsi: pt.provinsi,
    negara: pt.negara,
    website: pt.website,
    status: pt.status,
  };
}

function isDraftComplete(draft: FormDraft) {
  return (
    draft.nama.trim().length > 0 &&
    draft.singkatan.trim().length > 0 &&
    draft.kota.trim().length > 0 &&
    draft.provinsi.trim().length > 0 &&
    draft.negara.trim().length > 0 &&
    draft.website.trim().length > 0
  );
}

function fieldsFromDraft(draft: FormDraft) {
  return {
    nama: draft.nama.trim(),
    singkatan: draft.singkatan.trim().toUpperCase(),
    jenis: draft.jenis,
    kota: draft.kota.trim(),
    provinsi: draft.provinsi.trim(),
    negara: draft.negara.trim(),
    website: draft.website.trim().replace(/^https?:\/\//, ""),
    status: draft.status,
    terakhirDiperbarui: formatToday(),
  };
}

function slugify(text: string) {
  return text.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "pt";
}

function generateUniqueId(base: string, existing: PerguruanTinggi[]) {
  const slug = slugify(base);
  if (!existing.some((pt) => pt.id === slug)) return slug;
  let i = 2;
  while (existing.some((pt) => pt.id === `${slug}-${i}`)) i++;
  return `${slug}-${i}`;
}

function nextKode(existing: PerguruanTinggi[]) {
  const max = existing.reduce((acc, pt) => Math.max(acc, Number(pt.kode.replace(/\D/g, "")) || 0), 0);
  return `PT-${String(max + 1).padStart(4, "0")}`;
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
        <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", iconClassName)}>
          <Icon className="size-4.5" />
        </div>
        <p className="text-sm text-slate-500">{label}</p>
      </div>
      <p className="mt-2.5 text-2xl font-semibold text-slate-900">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{caption}</p>
    </div>
  );
}

function InstitutionFormFields({
  idPrefix,
  draft,
  onChange,
  isNamaDuplicate,
}: {
  idPrefix: string;
  draft: FormDraft;
  onChange: (draft: FormDraft) => void;
  isNamaDuplicate: boolean;
}) {
  return (
    <div className="flex flex-1 flex-col gap-3 overflow-y-auto">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${idPrefix}-nama`}>Nama Perguruan Tinggi</Label>
        <Input
          id={`${idPrefix}-nama`}
          value={draft.nama}
          onChange={(e) => onChange({ ...draft, nama: e.target.value })}
          placeholder="Contoh: Universitas Indonesia"
          aria-invalid={isNamaDuplicate}
        />
        {isNamaDuplicate && (
          <p className="text-xs text-rose-600">Perguruan tinggi dengan nama ini sudah terdaftar.</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${idPrefix}-singkatan`}>Singkatan</Label>
          <Input
            id={`${idPrefix}-singkatan`}
            value={draft.singkatan}
            onChange={(e) => onChange({ ...draft, singkatan: e.target.value })}
            placeholder="UI"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${idPrefix}-jenis`}>Jenis</Label>
          <Select value={draft.jenis} onValueChange={(v) => onChange({ ...draft, jenis: v as JenisPT })}>
            <SelectTrigger id={`${idPrefix}-jenis`} className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {jenisPTOptions.map((jenis) => (
                <SelectItem key={jenis} value={jenis}>
                  {jenis}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${idPrefix}-kota`}>Kota</Label>
          <Input
            id={`${idPrefix}-kota`}
            value={draft.kota}
            onChange={(e) => onChange({ ...draft, kota: e.target.value })}
            placeholder="Depok"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${idPrefix}-provinsi`}>Provinsi / Wilayah</Label>
          <Input
            id={`${idPrefix}-provinsi`}
            value={draft.provinsi}
            onChange={(e) => onChange({ ...draft, provinsi: e.target.value })}
            placeholder="Jawa Barat"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${idPrefix}-negara`}>Negara</Label>
        <Input
          id={`${idPrefix}-negara`}
          value={draft.negara}
          onChange={(e) => onChange({ ...draft, negara: e.target.value })}
          placeholder="Indonesia"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${idPrefix}-website`}>Website</Label>
        <Input
          id={`${idPrefix}-website`}
          value={draft.website}
          onChange={(e) => onChange({ ...draft, website: e.target.value })}
          placeholder="ui.ac.id"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${idPrefix}-status`}>Status</Label>
        <Select value={draft.status} onValueChange={(v) => onChange({ ...draft, status: v as StatusPT })}>
          <SelectTrigger id={`${idPrefix}-status`} className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Aktif">Aktif</SelectItem>
            <SelectItem value="Nonaktif">Nonaktif</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

export function UniversityManager({ institutions: initialInstitutions }: UniversityManagerProps) {
  const [institutions, setInstitutions] = useState(initialInstitutions);
  const [jenisFilter, setJenisFilter] = useState<JenisFilter>("semua");
  const [lokasiFilter, setLokasiFilter] = useState("semua");
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mode, setMode] = useState<"view" | "edit" | "delete">("view");
  const [draft, setDraft] = useState<FormDraft | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [addDraft, setAddDraft] = useState<FormDraft>(emptyDraft());

  const totalInstitusi = institutions.length;
  const countJenis = (jenis: JenisPT) => institutions.filter((pt) => pt.jenis === jenis).length;
  const totalPTN = countJenis("Negeri");
  const totalPTS = countJenis("Swasta");
  const totalPTK = countJenis("Kedinasan");
  const luarNegeri = institutions.filter((pt) => pt.jenis === "Luar Negeri");
  const totalNegara = new Set(luarNegeri.map((pt) => pt.negara)).size;
  const persen = (n: number) =>
    totalInstitusi ? ((n / totalInstitusi) * 100).toFixed(1).replace(".", ",") : "0";

  const lokasiOptions = useMemo(
    () => Array.from(new Set(institutions.map(lokasiGroup))).sort((a, b) => a.localeCompare(b)),
    [institutions],
  );

  const filteredInstitutions = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = institutions.filter((pt) => {
      if (jenisFilter !== "semua" && pt.jenis !== jenisFilter) return false;
      if (lokasiFilter !== "semua" && lokasiGroup(pt) !== lokasiFilter) return false;
      return (
        !query ||
        pt.nama.toLowerCase().includes(query) ||
        pt.singkatan.toLowerCase().includes(query) ||
        pt.kode.toLowerCase().includes(query) ||
        formatLokasi(pt).toLowerCase().includes(query)
      );
    });
    if (sortBy === "alumni-desc") return [...filtered].sort((a, b) => b.alumni - a.alumni);
    if (sortBy === "alumni-asc") return [...filtered].sort((a, b) => a.alumni - b.alumni);
    return filtered;
  }, [institutions, jenisFilter, lokasiFilter, sortBy, search]);

  const selected = institutions.find((pt) => pt.id === selectedId) ?? null;

  function isDuplicateNama(nama: string, excludeId?: string) {
    const value = nama.trim().toLowerCase();
    return value.length > 0 && institutions.some((pt) => pt.nama.toLowerCase() === value && pt.id !== excludeId);
  }

  const isEditNamaDuplicate = !!draft && isDuplicateNama(draft.nama, selected?.id);
  const isEditComplete = !!draft && isDraftComplete(draft) && !isEditNamaDuplicate;
  const isAddNamaDuplicate = isDuplicateNama(addDraft.nama);
  const isAddComplete = isDraftComplete(addDraft) && !isAddNamaDuplicate;

  function openInstitution(id: string) {
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
    if (!selected) return;
    setDraft(draftFromInstitution(selected));
    setMode("edit");
  }

  function saveEdit() {
    if (!selected || !draft || !isEditComplete) return;
    const fields = fieldsFromDraft(draft);
    setInstitutions((prev) => prev.map((pt) => (pt.id === selected.id ? { ...pt, ...fields } : pt)));
    setMode("view");
  }

  function confirmDelete() {
    if (!selected) return;
    setInstitutions((prev) => prev.filter((pt) => pt.id !== selected.id));
    setSelectedId(null);
    setMode("view");
  }

  function openAddDialog() {
    setAddDraft(emptyDraft());
    setIsAddOpen(true);
  }

  function closeAddDialog(open: boolean) {
    setIsAddOpen(open);
    if (!open) setAddDraft(emptyDraft());
  }

  function importPerguruanTinggi(items: PerguruanTinggiImpor[]) {
    setInstitutions((prev) => {
      const next = [...prev];
      for (const item of items) {
        next.push({
          ...item,
          id: generateUniqueId(item.singkatan || item.nama, next),
          kode: nextKode(next),
          alumni: 0,
          prodi: 0,
          buktiTerverifikasi: 0,
          sumberData: "Import Excel",
          terakhirDiperbarui: formatToday(),
        });
      }
      return next;
    });
  }

  function submitAdd() {
    if (!isAddComplete) return;
    const fields = fieldsFromDraft(addDraft);
    const newInstitution: PerguruanTinggi = {
      ...fields,
      id: generateUniqueId(fields.singkatan || fields.nama, institutions),
      kode: nextKode(institutions),
      alumni: 0,
      prodi: 0,
      buktiTerverifikasi: 0,
      sumberData: "Input manual",
    };
    setInstitutions((prev) => [...prev, newInstitution]);
    setIsAddOpen(false);
    setAddDraft(emptyDraft());
  }

  const isFilterActive = lokasiFilter !== "semua" || sortBy !== "default";

  function downloadReport() {
    downloadCsv(
      reportFilename("perguruan-tinggi"),
      [
        "Kode", "Nama", "Singkatan", "Jenis", "Kota", "Provinsi", "Negara", "Website", "Status",
        "Alumni Tercatat", "Program Studi Digunakan", "Bukti Terverifikasi", "Sumber Data",
        "Terakhir Diperbarui",
      ],
      filteredInstitutions.map((pt) => [
        pt.kode, pt.nama, pt.singkatan, pt.jenis, pt.kota, pt.provinsi, pt.negara, pt.website, pt.status,
        pt.alumni, pt.prodi, pt.buktiTerverifikasi, pt.sumberData, pt.terakhirDiperbarui,
      ]),
    );
  }

  return (
    <>
      <Header
        title="Perguruan Tinggi"
        actions={
          <>
            <Select value={jenisFilter} onValueChange={(v) => setJenisFilter(v as JenisFilter)}>
              <SelectTrigger className="min-w-[170px]">
                <SelectValue>
                  {(value: JenisFilter) => (value === "semua" ? "Semua Jenis PT" : value)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semua">Semua Jenis PT</SelectItem>
                {jenisPTOptions.map((jenis) => (
                  <SelectItem key={jenis} value={jenis}>
                    {jenis}
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
              icon={Landmark}
              iconClassName="bg-blue-50 text-blue-600"
              label="Total Perguruan Tinggi"
              value={totalInstitusi}
              caption="Seluruh perguruan tinggi tujuan alumni"
            />
            <StatCard
              icon={GraduationCap}
              iconClassName="bg-emerald-50 text-emerald-600"
              label="PTN"
              value={totalPTN}
              caption={`Perguruan Tinggi Negeri • ${persen(totalPTN)}%`}
            />
            <StatCard
              icon={Building2}
              iconClassName="bg-amber-50 text-amber-600"
              label="PTS"
              value={totalPTS}
              caption={`Perguruan Tinggi Swasta • ${persen(totalPTS)}%`}
            />
            <StatCard
              icon={Shield}
              iconClassName="bg-rose-50 text-rose-600"
              label="PTK"
              value={totalPTK}
              caption={`Perguruan Tinggi Kedinasan • ${persen(totalPTK)}%`}
            />
            <StatCard
              icon={Globe2}
              iconClassName="bg-violet-50 text-violet-600"
              label="Luar Negeri"
              value={luarNegeri.length}
              caption={`Dari ${totalNegara} negara • ${persen(luarNegeri.length)}%`}
            />
          </div>

          <div className="flex w-full flex-col rounded-xl border border-black/5 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Daftar Perguruan Tinggi</h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Menampilkan {filteredInstitutions.length} perguruan tinggi tujuan alumni
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari nama, kode, atau lokasi"
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
                      <DropdownMenuLabel>Urutkan</DropdownMenuLabel>
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
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuLabel>Lokasi</DropdownMenuLabel>
                      <DropdownMenuRadioGroup
                        value={lokasiFilter}
                        onValueChange={(value) => setLokasiFilter(value as string)}
                      >
                        <DropdownMenuRadioItem value="semua" closeOnClick>
                          Semua Lokasi
                        </DropdownMenuRadioItem>
                        {lokasiOptions.map((lokasi) => (
                          <DropdownMenuRadioItem key={lokasi} value={lokasi} closeOnClick>
                            {lokasi}
                          </DropdownMenuRadioItem>
                        ))}
                      </DropdownMenuRadioGroup>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button variant="outline" className="gap-1.5" onClick={() => setIsImportOpen(true)}>
                  <FileSpreadsheet className="size-4" />
                  Import Excel
                </Button>
                <Button className="gap-1.5 bg-blue-600 hover:bg-blue-700" onClick={openAddDialog}>
                  <Plus className="size-4" />
                  Tambah Perguruan Tinggi
                </Button>
                <ImportDialog<PerguruanTinggiImpor>
                  open={isImportOpen}
                  onOpenChange={setIsImportOpen}
                  namaData="perguruan tinggi"
                  namaTemplate="template-import-perguruan-tinggi.xlsx"
                  kolom={kolomPerguruanTinggi}
                  validasi={(baris) => validasiPerguruanTinggi(baris, institutions)}
                  label={(pt) => `${pt.nama} (${pt.singkatan}) • ${pt.kota}, ${pt.negara}`}
                  onImport={importPerguruanTinggi}
                />
              </div>
            </div>

            <div className="mt-4 min-w-0 flex-1 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[11px] tracking-wider text-slate-400 uppercase">Perguruan Tinggi</TableHead>
                    <TableHead className="text-[11px] tracking-wider text-slate-400 uppercase">Kode</TableHead>
                    <TableHead className="text-[11px] tracking-wider text-slate-400 uppercase">Jenis</TableHead>
                    <TableHead className="text-[11px] tracking-wider text-slate-400 uppercase">Lokasi</TableHead>
                    <TableHead className="text-right text-[11px] tracking-wider text-slate-400 uppercase">Alumni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInstitutions.map((pt) => (
                    <TableRow key={pt.id} onClick={() => openInstitution(pt.id)} className="cursor-pointer">
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-sm font-semibold text-blue-600">
                            {pt.nama.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-slate-900">{pt.nama}</p>
                            <p className="truncate text-xs text-slate-500">{pt.singkatan}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600">{pt.kode}</TableCell>
                      <TableCell className="text-slate-600">{pt.jenis}</TableCell>
                      <TableCell className="text-slate-600">{formatLokasi(pt)}</TableCell>
                      <TableCell className="text-right font-medium text-slate-900">{pt.alumni}</TableCell>
                    </TableRow>
                  ))}
                  {filteredInstitutions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="py-10 text-center text-sm text-slate-500">
                        Tidak ada perguruan tinggi yang cocok dengan pencarian.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          <Dialog open={selected !== null} onOpenChange={closeDialog}>
            <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-md">
              {selected && mode === "view" && (
                <>
                  <DialogHeader>
                    <DialogTitle>Detail Perguruan Tinggi</DialogTitle>
                    <p className="text-xs text-slate-500">Informasi perguruan tinggi yang dipilih</p>
                  </DialogHeader>

                  <div className="flex flex-1 flex-col gap-4 overflow-y-auto">
                    <div className="rounded-lg bg-slate-50 p-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-sm font-semibold text-blue-600">
                          {selected.nama.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">{selected.nama}</p>
                          <p className="truncate text-xs text-slate-500">
                            Kode: {selected.kode} &bull; {selected.singkatan}
                          </p>
                        </div>
                      </div>
                      <span
                        className={cn(
                          "mt-2.5 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                          selected.status === "Aktif"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-500",
                        )}
                      >
                        {selected.status}
                      </span>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-slate-900">Informasi Dasar</p>
                      <dl className="mt-2 divide-y divide-slate-100 text-xs">
                        {[
                          ["Jenis", jenisPTLabel[selected.jenis]],
                          ["Kota", selected.kota],
                          ["Provinsi", selected.provinsi],
                          ["Negara", selected.negara],
                          ["Website", selected.website],
                          ["Alumni Tercatat", selected.alumni],
                          ["Program Studi Digunakan", selected.prodi],
                          ["Bukti Terverifikasi", selected.buktiTerverifikasi],
                          ["Sumber data", selected.sumberData],
                          ["Terakhir diperbarui", selected.terakhirDiperbarui],
                        ].map(([label, value]) => (
                          <div key={label} className="flex items-center justify-between gap-2 py-2">
                            <dt className="text-slate-500">{label}</dt>
                            <dd className="truncate font-medium text-slate-800">{value}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" className="gap-1.5" onClick={() => setMode("delete")}>
                      <Trash2 className="size-3.5 text-rose-600" />
                      <span className="text-rose-600">Hapus</span>
                    </Button>
                    <Button className="gap-1.5 bg-blue-600 hover:bg-blue-700" onClick={startEdit}>
                      <Pencil className="size-3.5" />
                      Edit Perguruan Tinggi
                    </Button>
                  </DialogFooter>
                </>
              )}

              {selected && mode === "edit" && draft && (
                <>
                  <DialogHeader>
                    <DialogTitle>Edit Perguruan Tinggi</DialogTitle>
                    <p className="text-xs text-slate-500">
                      {selected.nama} &bull; {selected.kode}
                    </p>
                  </DialogHeader>

                  <InstitutionFormFields
                    idPrefix="edit"
                    draft={draft}
                    onChange={setDraft}
                    isNamaDuplicate={isEditNamaDuplicate}
                  />

                  <DialogFooter>
                    <Button variant="outline" className="gap-1.5" onClick={() => setMode("view")}>
                      <ArrowLeft className="size-3.5" />
                      Batal
                    </Button>
                    <Button
                      className="bg-blue-600 hover:bg-blue-700"
                      disabled={!isEditComplete}
                      onClick={saveEdit}
                    >
                      Simpan Perubahan
                    </Button>
                  </DialogFooter>
                </>
              )}

              {selected && mode === "delete" && (
                <>
                  <DialogHeader>
                    <DialogTitle>Hapus Perguruan Tinggi</DialogTitle>
                  </DialogHeader>

                  <p className="text-sm text-slate-600">
                    Apakah Anda yakin ingin menghapus{" "}
                    <span className="font-semibold text-slate-900">{selected.nama}</span>? Tindakan ini akan
                    menghapus data perguruan tinggi ini dan tidak dapat dibatalkan.
                  </p>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setMode("view")}>
                      Batal
                    </Button>
                    <Button variant="destructive" onClick={confirmDelete}>
                      Ya, Hapus Perguruan Tinggi
                    </Button>
                  </DialogFooter>
                </>
              )}
            </DialogContent>
          </Dialog>

          <Dialog open={isAddOpen} onOpenChange={closeAddDialog}>
            <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Tambah Perguruan Tinggi Baru</DialogTitle>
                <p className="text-xs text-slate-500">Lengkapi data perguruan tinggi yang akan ditambahkan</p>
              </DialogHeader>

              <InstitutionFormFields
                idPrefix="add"
                draft={addDraft}
                onChange={setAddDraft}
                isNamaDuplicate={isAddNamaDuplicate}
              />

              <DialogFooter>
                <Button variant="outline" onClick={() => closeAddDialog(false)}>
                  Batal
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700" disabled={!isAddComplete} onClick={submitAdd}>
                  Simpan Perguruan Tinggi
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </>
  );
}
