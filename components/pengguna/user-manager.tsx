"use client";

import { useMemo, useState } from "react";
import {
  Users,
  UserCheck,
  UserX,
  Search,
  Filter,
  Plus,
  Pencil,
  Trash2,
  ArrowLeft,
  KeyRound,
  Power,
  CircleCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  SEMUA_SEKOLAH,
  deskripsiRole,
  roleLintasSekolah,
  rolePenggunaOptions,
  statusPenggunaOptions,
  type Pengguna,
  type RolePengguna,
  type StatusPengguna,
} from "@/data/pengguna";
import { Header } from "@/components/header";
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

type UserManagerProps = {
  pengguna: Pengguna[];
  sekolahOptions: string[];
  // Email akun yang sedang login; dikirim dari server agar data auth tidak masuk ke bundle klien.
  currentUserEmail: string;
};

type FormDraft = {
  nama: string;
  email: string;
  noHp: string;
  role: RolePengguna;
  sekolah: string;
  status: StatusPengguna;
};

type DialogMode = "view" | "edit" | "delete" | "reset";

const roleStyles: Record<RolePengguna, string> = {
  "Super Admin": "bg-violet-50 text-violet-700",
  "Admin Sekolah": "bg-blue-50 text-blue-700",
  "Karyawan TU": "bg-cyan-50 text-cyan-700",
  "Guru Wali Kelas": "bg-amber-50 text-amber-700",
  "Kepala Sekolah": "bg-emerald-50 text-emerald-700",
  Yayasan: "bg-slate-100 text-slate-600",
};

const statusStyles: Record<StatusPengguna, string> = {
  Aktif: "bg-emerald-50 text-emerald-700",
  Nonaktif: "bg-slate-100 text-slate-500",
};

const dateTimeFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Jakarta",
});

function formatTanggalWaktu(iso: string) {
  return iso ? dateTimeFormatter.format(new Date(iso)) : "-";
}

function formatLoginRelatif(iso: string, now: number) {
  if (!iso) return "Belum pernah";
  const minutes = Math.max(0, Math.floor((now - new Date(iso).getTime()) / 60_000));
  if (minutes < 1) return "Baru saja";
  if (minutes < 60) return `${minutes} menit lalu`;
  if (minutes < 24 * 60) return `${Math.floor(minutes / 60)} jam lalu`;
  return `${Math.floor(minutes / (24 * 60))} hari lalu`;
}

function initials(nama: string) {
  return nama
    .replace(/^(drs?|dr|ir|prof)\.\s*/i, "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function emptyDraft(defaultSekolah: string): FormDraft {
  return {
    nama: "",
    email: "",
    noHp: "",
    role: "Karyawan TU",
    sekolah: defaultSekolah,
    status: "Aktif",
  };
}

function draftFromPengguna(p: Pengguna): FormDraft {
  return {
    nama: p.nama,
    email: p.email,
    noHp: p.noHp,
    role: p.role,
    sekolah: p.sekolah,
    status: p.status,
  };
}

function fieldsFromDraft(draft: FormDraft) {
  return {
    nama: draft.nama.trim(),
    email: draft.email.trim().toLowerCase(),
    noHp: draft.noHp.trim(),
    role: draft.role,
    sekolah: roleLintasSekolah.includes(draft.role) ? SEMUA_SEKOLAH : draft.sekolah,
    status: draft.status,
  };
}

function nextPenggunaId(existing: Pengguna[]) {
  const max = existing.reduce(
    (acc, p) => Math.max(acc, Number(p.id.replace(/\D/g, "")) || 0),
    0,
  );
  return `USR-${String(max + 1).padStart(3, "0")}`;
}

// Mengembalikan pesan error pertama, atau string kosong jika draft valid.
function validateDraft(draft: FormDraft, existing: Pengguna[], ignoreId?: string) {
  if (draft.nama.trim().length === 0) return "Nama wajib diisi.";
  const email = draft.email.trim().toLowerCase();
  if (!emailPattern.test(email)) return "Format email tidak valid.";
  if (existing.some((p) => p.id !== ignoreId && p.email.toLowerCase() === email))
    return "Email sudah digunakan pengguna lain.";
  if (
    !roleLintasSekolah.includes(draft.role) &&
    (!draft.sekolah || draft.sekolah === SEMUA_SEKOLAH)
  )
    return "Pilih sekolah untuk pengguna ini.";
  return "";
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

function Pill({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        className,
      )}
    >
      {children}
    </span>
  );
}

function PenggunaFormFields({
  idPrefix,
  draft,
  onChange,
  sekolahOptions,
}: {
  idPrefix: string;
  draft: FormDraft;
  onChange: (draft: FormDraft) => void;
  sekolahOptions: string[];
}) {
  const isLintasSekolah = roleLintasSekolah.includes(draft.role);

  return (
    <div className="flex flex-1 flex-col gap-3 overflow-y-auto">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${idPrefix}-nama`}>Nama Lengkap</Label>
        <Input
          id={`${idPrefix}-nama`}
          value={draft.nama}
          onChange={(e) => onChange({ ...draft, nama: e.target.value })}
          placeholder="Nama pengguna"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${idPrefix}-email`}>Email</Label>
        <Input
          id={`${idPrefix}-email`}
          type="email"
          value={draft.email}
          onChange={(e) => onChange({ ...draft, email: e.target.value })}
          placeholder="nama@sekolah.sch.id"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${idPrefix}-hp`}>No. HP</Label>
        <Input
          id={`${idPrefix}-hp`}
          value={draft.noHp}
          onChange={(e) => onChange({ ...draft, noHp: e.target.value })}
          placeholder="0812-xxxx-xxxx"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${idPrefix}-role`}>Role</Label>
        <Select
          value={draft.role}
          onValueChange={(v) => onChange({ ...draft, role: v as RolePengguna })}
        >
          <SelectTrigger id={`${idPrefix}-role`} className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {rolePenggunaOptions.map((role) => (
              <SelectItem key={role} value={role}>
                {role}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-slate-400">{deskripsiRole[draft.role]}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${idPrefix}-sekolah`}>Sekolah</Label>
          <Select
            value={isLintasSekolah ? SEMUA_SEKOLAH : draft.sekolah}
            onValueChange={(v) => onChange({ ...draft, sekolah: v as string })}
            disabled={isLintasSekolah}
          >
            <SelectTrigger id={`${idPrefix}-sekolah`} className="w-full">
              <SelectValue>
                {(value: string) =>
                  !value || (!isLintasSekolah && value === SEMUA_SEKOLAH)
                    ? "Pilih sekolah"
                    : value
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {isLintasSekolah && (
                <SelectItem value={SEMUA_SEKOLAH}>{SEMUA_SEKOLAH}</SelectItem>
              )}
              {sekolahOptions.map((sekolah) => (
                <SelectItem key={sekolah} value={sekolah}>
                  {sekolah}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${idPrefix}-status`}>Status</Label>
          <Select
            value={draft.status}
            onValueChange={(v) => onChange({ ...draft, status: v as StatusPengguna })}
          >
            <SelectTrigger id={`${idPrefix}-status`} className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusPenggunaOptions.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

export function UserManager({
  pengguna: initialPengguna,
  sekolahOptions,
  currentUserEmail,
}: UserManagerProps) {
  const [penggunaList, setPenggunaList] = useState(initialPengguna);
  const [now] = useState(() => Date.now());
  const [sekolahFilter, setSekolahFilter] = useState("semua");
  const [roleFilter, setRoleFilter] = useState<"semua" | RolePengguna>("semua");
  const [statusFilter, setStatusFilter] = useState<"semua" | StatusPengguna>("semua");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mode, setMode] = useState<DialogMode>("view");
  const [draft, setDraft] = useState<FormDraft | null>(null);
  const [notice, setNotice] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addDraft, setAddDraft] = useState<FormDraft>(() =>
    emptyDraft(sekolahOptions[0] ?? ""),
  );
  const [showAddErrors, setShowAddErrors] = useState(false);

  const scopedPengguna = penggunaList.filter(
    (p) =>
      sekolahFilter === "semua" ||
      p.sekolah === sekolahFilter ||
      p.sekolah === SEMUA_SEKOLAH,
  );
  const totalAktif = scopedPengguna.filter((p) => p.status === "Aktif").length;
  const totalNonaktif = scopedPengguna.length - totalAktif;

  const filteredPengguna = useMemo(() => {
    const query = search.trim().toLowerCase();
    return penggunaList
      .filter((p) => {
        if (
          sekolahFilter !== "semua" &&
          p.sekolah !== sekolahFilter &&
          p.sekolah !== SEMUA_SEKOLAH
        )
          return false;
        if (roleFilter !== "semua" && p.role !== roleFilter) return false;
        if (statusFilter !== "semua" && p.status !== statusFilter) return false;
        return (
          !query ||
          p.nama.toLowerCase().includes(query) ||
          p.email.toLowerCase().includes(query) ||
          p.id.toLowerCase().includes(query)
        );
      })
      .sort((x, y) => x.nama.localeCompare(y.nama, "id"));
  }, [penggunaList, sekolahFilter, roleFilter, statusFilter, search]);

  const selected = penggunaList.find((p) => p.id === selectedId) ?? null;
  // Akun yang sedang login tidak boleh menonaktifkan atau menghapus dirinya sendiri.
  const isSelf = selected?.email === currentUserEmail;

  const editError = draft ? validateDraft(draft, penggunaList, selectedId ?? undefined) : "";
  const addError = validateDraft(addDraft, penggunaList);

  function openPengguna(id: string) {
    setSelectedId(id);
    setMode("view");
    setNotice("");
  }

  function closeDialog(open: boolean) {
    if (!open) {
      setSelectedId(null);
      setMode("view");
      setDraft(null);
      setNotice("");
    }
  }

  function startEdit() {
    if (!selected) return;
    setDraft(draftFromPengguna(selected));
    setNotice("");
    setMode("edit");
  }

  function saveEdit() {
    if (!selected || !draft || editError) return;
    const fields = fieldsFromDraft(isSelf ? { ...draft, status: "Aktif" } : draft);
    setPenggunaList((prev) =>
      prev.map((p) => (p.id === selected.id ? { ...p, ...fields } : p)),
    );
    setNotice("Perubahan data pengguna berhasil disimpan.");
    setMode("view");
  }

  function toggleStatus() {
    if (!selected || isSelf) return;
    const status: StatusPengguna = selected.status === "Aktif" ? "Nonaktif" : "Aktif";
    setPenggunaList((prev) =>
      prev.map((p) => (p.id === selected.id ? { ...p, status } : p)),
    );
    setNotice(status === "Aktif" ? "Akun berhasil diaktifkan." : "Akun berhasil dinonaktifkan.");
  }

  function confirmReset() {
    if (!selected) return;
    setNotice(`Tautan atur ulang password telah dikirim ke ${selected.email}.`);
    setMode("view");
  }

  function confirmDelete() {
    if (!selected || isSelf) return;
    setPenggunaList((prev) => prev.filter((p) => p.id !== selected.id));
    setSelectedId(null);
    setMode("view");
  }

  function openAddDialog() {
    setAddDraft(emptyDraft(sekolahOptions[0] ?? ""));
    setShowAddErrors(false);
    setIsAddOpen(true);
  }

  function closeAddDialog(open: boolean) {
    setIsAddOpen(open);
    if (!open) setShowAddErrors(false);
  }

  function submitAdd() {
    if (addError) {
      setShowAddErrors(true);
      return;
    }
    const newPengguna: Pengguna = {
      ...fieldsFromDraft(addDraft),
      id: nextPenggunaId(penggunaList),
      terakhirLogin: "",
      dibuatPada: new Date().toISOString(),
    };
    setPenggunaList((prev) => [...prev, newPengguna]);
    setIsAddOpen(false);
  }

  const isFilterActive = roleFilter !== "semua" || statusFilter !== "semua";

  function downloadReport() {
    downloadCsv(
      reportFilename("pengguna"),
      ["ID", "Nama", "Email", "No. HP", "Role", "Sekolah", "Status", "Terakhir Login", "Dibuat Pada"],
      filteredPengguna.map((p) => [
        p.id, p.nama, p.email, p.noHp, p.role, p.sekolah, p.status,
        formatTanggalWaktu(p.terakhirLogin), formatTanggalWaktu(p.dibuatPada),
      ]),
    );
  }

  return (
    <>
      <Header
        title="Daftar Pengguna"
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard
              icon={Users}
              iconClassName="bg-blue-50 text-blue-600"
              label="Total Pengguna"
              value={scopedPengguna.length}
              caption="Akun terdaftar pada sistem"
            />
            <StatCard
              icon={UserCheck}
              iconClassName="bg-emerald-50 text-emerald-600"
              label="Aktif"
              value={totalAktif}
              caption="Dapat masuk ke sistem"
            />
            <StatCard
              icon={UserX}
              iconClassName="bg-slate-100 text-slate-500"
              label="Nonaktif"
              value={totalNonaktif}
              caption="Akses masuk dinonaktifkan"
            />
          </div>

          <div className="flex w-full flex-col rounded-xl border border-black/5 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Daftar Pengguna</h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Menampilkan {filteredPengguna.length} pengguna
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari nama atau email"
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
                      <DropdownMenuLabel>Role</DropdownMenuLabel>
                      <DropdownMenuRadioGroup
                        value={roleFilter}
                        onValueChange={(value) => setRoleFilter(value as "semua" | RolePengguna)}
                      >
                        <DropdownMenuRadioItem value="semua" closeOnClick>
                          Semua Role
                        </DropdownMenuRadioItem>
                        {rolePenggunaOptions.map((role) => (
                          <DropdownMenuRadioItem key={role} value={role} closeOnClick>
                            {role}
                          </DropdownMenuRadioItem>
                        ))}
                      </DropdownMenuRadioGroup>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuLabel>Status</DropdownMenuLabel>
                      <DropdownMenuRadioGroup
                        value={statusFilter}
                        onValueChange={(value) =>
                          setStatusFilter(value as "semua" | StatusPengguna)
                        }
                      >
                        <DropdownMenuRadioItem value="semua" closeOnClick>
                          Semua Status
                        </DropdownMenuRadioItem>
                        {statusPenggunaOptions.map((status) => (
                          <DropdownMenuRadioItem key={status} value={status} closeOnClick>
                            {status}
                          </DropdownMenuRadioItem>
                        ))}
                      </DropdownMenuRadioGroup>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button className="gap-1.5 bg-blue-600 hover:bg-blue-700" onClick={openAddDialog}>
                  <Plus className="size-4" />
                  Tambah Pengguna
                </Button>
              </div>
            </div>

            <div className="mt-4 min-w-0 flex-1 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {["Pengguna", "Role", "Sekolah", "Terakhir Login", "Status"].map((h) => (
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
                  {filteredPengguna.map((p) => (
                    <TableRow
                      key={p.id}
                      onClick={() => openPengguna(p.id)}
                      className="cursor-pointer"
                    >
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-600">
                            {initials(p.nama)}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-slate-900">{p.nama}</p>
                            <p className="truncate text-xs text-slate-500">{p.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Pill className={roleStyles[p.role]}>{p.role}</Pill>
                      </TableCell>
                      <TableCell className="text-slate-600">{p.sekolah}</TableCell>
                      <TableCell className="text-slate-600" suppressHydrationWarning>
                        {formatLoginRelatif(p.terakhirLogin, now)}
                      </TableCell>
                      <TableCell>
                        <Pill className={statusStyles[p.status]}>{p.status}</Pill>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredPengguna.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="py-10 text-center text-sm text-slate-500">
                        Tidak ada pengguna yang cocok dengan pencarian.
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
                    <DialogTitle>Detail Pengguna</DialogTitle>
                    <p className="text-xs text-slate-500">{selected.id}</p>
                  </DialogHeader>

                  <div className="flex flex-1 flex-col gap-4 overflow-y-auto">
                    <div className="rounded-lg bg-slate-50 p-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-600">
                          {initials(selected.nama)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {selected.nama}
                            {isSelf && (
                              <span className="ml-1.5 text-xs font-normal text-slate-500">
                                (Anda)
                              </span>
                            )}
                          </p>
                          <p className="truncate text-xs text-slate-500">{selected.email}</p>
                        </div>
                      </div>
                      <div className="mt-2.5 flex gap-1.5">
                        <Pill className={roleStyles[selected.role]}>{selected.role}</Pill>
                        <Pill className={statusStyles[selected.status]}>{selected.status}</Pill>
                      </div>
                    </div>

                    {notice && (
                      <div className="flex items-start gap-2 rounded-lg bg-emerald-50 px-3.5 py-2.5 text-xs text-emerald-700">
                        <CircleCheck className="mt-px size-3.5 shrink-0" />
                        <p>{notice}</p>
                      </div>
                    )}

                    <dl className="divide-y divide-slate-100 text-xs">
                      {[
                        ["No. HP", selected.noHp || "-"],
                        ["Sekolah", selected.sekolah],
                        ["Hak akses", deskripsiRole[selected.role]],
                        ["Terakhir login", formatTanggalWaktu(selected.terakhirLogin)],
                        ["Dibuat pada", formatTanggalWaktu(selected.dibuatPada)],
                      ].map(([label, value]) => (
                        <div key={label} className="flex items-center justify-between gap-4 py-2">
                          <dt className="shrink-0 text-slate-500">{label}</dt>
                          <dd className="truncate text-right font-medium text-slate-800">
                            {value}
                          </dd>
                        </div>
                      ))}
                    </dl>

                    <div>
                      <p className="text-xs font-semibold text-slate-900">Tindakan Akun</p>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          className="gap-1.5"
                          onClick={() => setMode("reset")}
                        >
                          <KeyRound className="size-3.5" />
                          Reset Password
                        </Button>
                        <Button
                          variant="outline"
                          className={cn(
                            "gap-1.5",
                            selected.status === "Aktif"
                              ? "text-amber-600 hover:text-amber-700"
                              : "text-emerald-600 hover:text-emerald-700",
                          )}
                          disabled={isSelf}
                          onClick={toggleStatus}
                        >
                          <Power className="size-3.5" />
                          {selected.status === "Aktif" ? "Nonaktifkan" : "Aktifkan"}
                        </Button>
                      </div>
                      {isSelf && (
                        <p className="mt-1.5 text-xs text-slate-400">
                          Anda tidak dapat menonaktifkan atau menghapus akun sendiri.
                        </p>
                      )}
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      variant="outline"
                      className="gap-1.5"
                      disabled={isSelf}
                      onClick={() => setMode("delete")}
                    >
                      <Trash2 className="size-3.5 text-rose-600" />
                      <span className="text-rose-600">Hapus</span>
                    </Button>
                    <Button className="gap-1.5 bg-blue-600 hover:bg-blue-700" onClick={startEdit}>
                      <Pencil className="size-3.5" />
                      Edit Pengguna
                    </Button>
                  </DialogFooter>
                </>
              )}

              {selected && mode === "edit" && draft && (
                <>
                  <DialogHeader>
                    <DialogTitle>Edit Pengguna</DialogTitle>
                    <p className="text-xs text-slate-500">
                      {selected.id} &bull; {selected.nama}
                    </p>
                  </DialogHeader>

                  <PenggunaFormFields
                    idPrefix="edit"
                    draft={isSelf ? { ...draft, status: "Aktif" } : draft}
                    onChange={setDraft}
                    sekolahOptions={sekolahOptions}
                  />
                  {editError && <p className="text-xs text-rose-600">{editError}</p>}

                  <DialogFooter>
                    <Button variant="outline" className="gap-1.5" onClick={() => setMode("view")}>
                      <ArrowLeft className="size-3.5" />
                      Batal
                    </Button>
                    <Button
                      className="bg-blue-600 hover:bg-blue-700"
                      disabled={!!editError}
                      onClick={saveEdit}
                    >
                      Simpan Perubahan
                    </Button>
                  </DialogFooter>
                </>
              )}

              {selected && mode === "reset" && (
                <>
                  <DialogHeader>
                    <DialogTitle>Reset Password</DialogTitle>
                  </DialogHeader>
                  <p className="text-sm text-slate-600">
                    Tautan untuk mengatur ulang password akan dikirim ke{" "}
                    <span className="font-semibold text-slate-900">{selected.email}</span>.
                    Password lama tetap berlaku sampai pengguna membuat password baru.
                  </p>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setMode("view")}>
                      Batal
                    </Button>
                    <Button className="bg-blue-600 hover:bg-blue-700" onClick={confirmReset}>
                      Kirim Tautan Reset
                    </Button>
                  </DialogFooter>
                </>
              )}

              {selected && mode === "delete" && (
                <>
                  <DialogHeader>
                    <DialogTitle>Hapus Pengguna</DialogTitle>
                  </DialogHeader>
                  <p className="text-sm text-slate-600">
                    Apakah Anda yakin ingin menghapus akun{" "}
                    <span className="font-semibold text-slate-900">{selected.nama}</span>?
                    Pengguna tidak akan bisa masuk lagi. Pertimbangkan untuk menonaktifkan akun
                    saja.
                  </p>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setMode("view")}>
                      Batal
                    </Button>
                    <Button variant="destructive" onClick={confirmDelete}>
                      Ya, Hapus Pengguna
                    </Button>
                  </DialogFooter>
                </>
              )}
            </DialogContent>
          </Dialog>

          <Dialog open={isAddOpen} onOpenChange={closeAddDialog}>
            <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Tambah Pengguna Baru</DialogTitle>
                <p className="text-xs text-slate-500">
                  Password sementara akan dikirim ke email pengguna
                </p>
              </DialogHeader>

              <PenggunaFormFields
                idPrefix="add"
                draft={addDraft}
                onChange={setAddDraft}
                sekolahOptions={sekolahOptions}
              />
              {showAddErrors && addError && (
                <p className="text-xs text-rose-600">{addError}</p>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => closeAddDialog(false)}>
                  Batal
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700" onClick={submitAdd}>
                  Simpan Pengguna
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </>
  );
}
