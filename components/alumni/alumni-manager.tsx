"use client";

import { useMemo, useState } from "react";
import {
  Users,
  Search,
  Filter,
  Plus,
  Pencil,
  Trash2,
  ArrowLeft,
  Phone,
  ChevronDown,
  FileSpreadsheet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  kelasOptions,
  statusSetelahLulusOptions,
  statusValidasiOptions,
  isStatusBekerja,
  isStatusKuliah,
  labelPekerjaan,
  pengaturanBerbagiDefault,
  type Alumni,
  type StatusSetelahLulus,
  type StatusValidasi,
} from "@/data/alumni";
import type { PerguruanTinggi } from "@/data/perguruan-tinggi";
import { Header } from "@/components/header";
import { ImportDialog } from "@/components/import/import-dialog";
import { kolomAlumni, validasiAlumni, type AlumniImpor } from "@/components/import/definisi-impor";
import { useAlumniStore } from "@/components/alumni/alumni-store";
import { ValidasiBadge, validasiDeskripsi, validasiKpi } from "@/components/validasi";
import { DownloadReportButton } from "@/components/download-report-button";
import { downloadCsv, reportFilename } from "@/lib/export-csv";
import {
  normalizeSocialHandle,
  socialInputPrefix,
  socialLabel,
  socialUrl,
  namaPanggilan,
  pesanPembaruanData,
  whatsappUrl,
  type DataPembaruan,
  type SocialPlatform,
} from "@/lib/kontak";
import { InstagramIcon, LinkedInIcon, TikTokIcon, WhatsAppIcon } from "@/components/social-icons";
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
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type AlumniManagerProps = {
  sekolahOptions: string[];
  perguruanTinggi: PerguruanTinggi[];
  // Nama admin yang sedang login, dicatat sebagai pemeriksa saat status validasi diubah.
  currentAdmin: string;
};

type FormDraft = {
  nama: string;
  nik: string;
  nisn: string;
  sekolah: string;
  kelas: string;
  tahunLulus: string;
  waliKelas: string;
  telepon: string;
  email: string;
  linkedin: string;
  instagram: string;
  tiktok: string;
  statusSetelahLulus: StatusSetelahLulus;
  perguruanTinggiId: string;
  programStudi: string;
  jabatan: string;
  tempatKerja: string;
  validasi: StatusValidasi;
};

const NO_PT = "none";

// NIK (Nomor Induk Kependudukan) pada KTP selalu 16 digit.
const NIK_LENGTH = 16;

const statusLulusColor: Record<StatusSetelahLulus, string> = {
  "Aktif Kuliah": "text-emerald-600",
  Diterima: "text-emerald-600",
  "Daftar Ulang": "text-blue-600",
  Bekerja: "text-emerald-600",
  Wirausaha: "text-emerald-600",
  "Mencari Pekerjaan": "text-amber-600",
  "Gap Year": "text-amber-600",
  "Belum Diketahui": "text-slate-500",
  "Tidak Dapat Dihubungi": "text-rose-600",
};

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

function initials(nama: string) {
  return nama
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}

function emptyDraft(sekolah: string, tahunLulus: string): FormDraft {
  return {
    nama: "",
    nik: "",
    nisn: "",
    sekolah,
    kelas: kelasOptions[0],
    tahunLulus,
    waliKelas: "",
    telepon: "",
    email: "",
    linkedin: "",
    instagram: "",
    tiktok: "",
    statusSetelahLulus: "Belum Diketahui",
    perguruanTinggiId: NO_PT,
    programStudi: "",
    jabatan: "",
    tempatKerja: "",
    validasi: "Pending",
  };
}

function draftFromAlumni(alumni: Alumni): FormDraft {
  return {
    nama: alumni.nama,
    nik: alumni.nik,
    nisn: alumni.nisn,
    sekolah: alumni.sekolah,
    kelas: alumni.kelas,
    tahunLulus: String(alumni.tahunLulus),
    waliKelas: alumni.waliKelas,
    telepon: alumni.telepon,
    email: alumni.email,
    linkedin: alumni.linkedin,
    instagram: alumni.instagram,
    tiktok: alumni.tiktok,
    statusSetelahLulus: alumni.statusSetelahLulus,
    perguruanTinggiId: alumni.perguruanTinggiId || NO_PT,
    programStudi: alumni.programStudi,
    jabatan: alumni.jabatan,
    tempatKerja: alumni.tempatKerja,
    validasi: alumni.validasi,
  };
}

function isPTRequired(draft: FormDraft) {
  return isStatusKuliah(draft.statusSetelahLulus);
}

function isDraftComplete(draft: FormDraft) {
  return (
    draft.nama.trim().length > 0 &&
    draft.nik.length === NIK_LENGTH &&
    draft.nisn.length === 10 &&
    draft.sekolah.length > 0 &&
    draft.kelas.length > 0 &&
    draft.tahunLulus.length === 4 &&
    draft.waliKelas.trim().length > 0 &&
    draft.telepon.trim().length > 0 &&
    emailPattern.test(draft.email) &&
    (!isPTRequired(draft) || draft.perguruanTinggiId !== NO_PT) &&
    (!isStatusBekerja(draft.statusSetelahLulus) ||
      (draft.jabatan.trim().length > 0 && draft.tempatKerja.trim().length > 0))
  );
}

function fieldsFromDraft(draft: FormDraft) {
  return {
    nama: draft.nama.trim(),
    nik: draft.nik,
    nisn: draft.nisn,
    sekolah: draft.sekolah,
    kelas: draft.kelas,
    tahunLulus: Number(draft.tahunLulus),
    waliKelas: draft.waliKelas.trim(),
    telepon: draft.telepon.trim(),
    email: draft.email.trim(),
    linkedin: draft.linkedin,
    instagram: draft.instagram,
    tiktok: draft.tiktok,
    statusSetelahLulus: draft.statusSetelahLulus,
    // Data kuliah/kerja hanya disimpan bila sesuai status, supaya tidak tertinggal data lama.
    perguruanTinggiId:
      isPTRequired(draft) && draft.perguruanTinggiId !== NO_PT ? draft.perguruanTinggiId : "",
    programStudi: isPTRequired(draft) ? draft.programStudi.trim() : "",
    jabatan: isStatusBekerja(draft.statusSetelahLulus) ? draft.jabatan.trim() : "",
    tempatKerja: isStatusBekerja(draft.statusSetelahLulus) ? draft.tempatKerja.trim() : "",
    validasi: draft.validasi,
    terakhirDikonfirmasi: formatToday(),
  };
}

const socialPlatforms: {
  platform: SocialPlatform;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
}[] = [
  { platform: "linkedin", label: "LinkedIn", Icon: LinkedInIcon },
  { platform: "instagram", label: "Instagram", Icon: InstagramIcon },
  { platform: "tiktok", label: "TikTok", Icon: TikTokIcon },
];

// Klik nomor telepon membuka pilihan: hubungi lewat WhatsApp atau panggilan biasa.
// Chat WhatsApp langsung terisi template pesan pembaruan data dengan nama panggilan alumni.
function PhoneMenu({ telepon, data }: { telepon: string; data: DataPembaruan }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex items-center gap-1 rounded font-medium text-emerald-700 hover:underline">
        <WhatsAppIcon className="size-3.5" />
        {telepon}
        <ChevronDown className="size-3" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuItem
          onClick={() =>
            window.open(
              whatsappUrl(telepon, pesanPembaruanData(data)),
              "_blank",
              "noopener,noreferrer",
            )
          }
        >
          <WhatsAppIcon className="size-4" />
          <div className="flex flex-col">
            <span>Kirim pesan via WhatsApp</span>
            <span className="text-xs text-muted-foreground">
              Template pembaruan data untuk {namaPanggilan(data.nama)}
            </span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            window.location.href = `tel:${telepon.replace(/[^\d+]/g, "")}`;
          }}
        >
          <Phone className="size-4" />
          Panggilan telepon biasa
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
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

function AlumniFormFields({
  idPrefix,
  draft,
  onChange,
  sekolahOptions,
  perguruanTinggi,
  isNisnDuplicate,
  isNikDuplicate,
}: {
  idPrefix: string;
  draft: FormDraft;
  onChange: (draft: FormDraft) => void;
  sekolahOptions: string[];
  perguruanTinggi: PerguruanTinggi[];
  isNisnDuplicate: boolean;
  isNikDuplicate: boolean;
}) {
  const isEmailValid =
    draft.email.length === 0 || emailPattern.test(draft.email);
  const ptName = (id: string) =>
    id === NO_PT
      ? "Pilih perguruan tinggi"
      : (perguruanTinggi.find((pt) => pt.id === id)?.nama ?? id);

  return (
    <div className="flex flex-1 flex-col gap-3 overflow-y-auto">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${idPrefix}-nama`}>Nama Lengkap</Label>
        <Input
          id={`${idPrefix}-nama`}
          value={draft.nama}
          onChange={(e) => onChange({ ...draft, nama: e.target.value })}
          placeholder="Contoh: Alya Putri"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${idPrefix}-nik`}>NIK</Label>
        <Input
          id={`${idPrefix}-nik`}
          inputMode="numeric"
          value={draft.nik}
          onChange={(e) =>
            onChange({
              ...draft,
              nik: e.target.value.replace(/\D/g, "").slice(0, NIK_LENGTH),
            })
          }
          placeholder="16 digit sesuai KTP"
          aria-invalid={isNikDuplicate}
        />
        {isNikDuplicate && (
          <p className="text-xs text-rose-600">NIK ini sudah terdaftar.</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${idPrefix}-nisn`}>NISN</Label>
        <Input
          id={`${idPrefix}-nisn`}
          inputMode="numeric"
          value={draft.nisn}
          onChange={(e) =>
            onChange({
              ...draft,
              nisn: e.target.value.replace(/\D/g, "").slice(0, 10),
            })
          }
          placeholder="10 digit, contoh: 0054123487"
          aria-invalid={isNisnDuplicate}
        />
        {isNisnDuplicate && (
          <p className="text-xs text-rose-600">NISN ini sudah terdaftar.</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${idPrefix}-sekolah`}>Sekolah</Label>
          <Select
            value={draft.sekolah}
            onValueChange={(v) => onChange({ ...draft, sekolah: v as string })}
          >
            <SelectTrigger id={`${idPrefix}-sekolah`} className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sekolahOptions.map((sekolah) => (
                <SelectItem key={sekolah} value={sekolah}>
                  {sekolah}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${idPrefix}-kelas`}>Kelas</Label>
          <Select
            value={draft.kelas}
            onValueChange={(v) => onChange({ ...draft, kelas: v as string })}
          >
            <SelectTrigger id={`${idPrefix}-kelas`} className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {kelasOptions.map((kelas) => (
                <SelectItem key={kelas} value={kelas}>
                  {kelas}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${idPrefix}-tahun-lulus`}>Tahun Lulus</Label>
          <Input
            id={`${idPrefix}-tahun-lulus`}
            inputMode="numeric"
            value={draft.tahunLulus}
            onChange={(e) =>
              onChange({
                ...draft,
                tahunLulus: e.target.value.replace(/\D/g, "").slice(0, 4),
              })
            }
            placeholder="2025"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${idPrefix}-wali-kelas`}>Wali Kelas</Label>
          <Input
            id={`${idPrefix}-wali-kelas`}
            value={draft.waliKelas}
            onChange={(e) => onChange({ ...draft, waliKelas: e.target.value })}
            placeholder="Ibu Ratna Sari"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${idPrefix}-telepon`}>Telepon</Label>
          <Input
            id={`${idPrefix}-telepon`}
            inputMode="tel"
            value={draft.telepon}
            onChange={(e) =>
              onChange({
                ...draft,
                telepon: e.target.value.replace(/[^\d\s-]/g, ""),
              })
            }
            placeholder="081234567890"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${idPrefix}-email`}>Email</Label>
          <Input
            id={`${idPrefix}-email`}
            type="email"
            value={draft.email}
            onChange={(e) => onChange({ ...draft, email: e.target.value })}
            placeholder="nama@gmail.com"
            aria-invalid={!isEmailValid}
          />
        </div>
      </div>
      {!isEmailValid && (
        <p className="-mt-2 text-xs text-rose-600">
          Masukkan alamat email yang valid.
        </p>
      )}

      <div className="flex flex-col gap-1.5">
        <p className="text-sm font-medium text-slate-900">
          Media Sosial <span className="font-normal text-slate-400">(opsional)</span>
        </p>
        {socialPlatforms.map(({ platform, label, Icon }) => (
          <div key={platform} className="flex items-center gap-2">
            <Icon className="size-5 shrink-0" />
            <div className="flex min-w-0 flex-1 items-center rounded-lg border border-input focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
              <span className="pl-2.5 text-sm whitespace-nowrap text-slate-400">
                {socialInputPrefix[platform]}
              </span>
              <input
                id={`${idPrefix}-${platform}`}
                aria-label={label}
                value={draft[platform]}
                onChange={(e) =>
                  onChange({ ...draft, [platform]: normalizeSocialHandle(platform, e.target.value) })
                }
                placeholder="username"
                className="h-8 min-w-0 flex-1 bg-transparent pr-2.5 text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
          </div>
        ))}
        <p className="text-xs text-slate-400">Bisa diisi username atau tempel link profil.</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${idPrefix}-status-lulus`}>Status Setelah Lulus</Label>
        <Select
          value={draft.statusSetelahLulus}
          onValueChange={(v) =>
            onChange({ ...draft, statusSetelahLulus: v as StatusSetelahLulus })
          }
        >
          <SelectTrigger id={`${idPrefix}-status-lulus`} className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusSetelahLulusOptions.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isPTRequired(draft) && (
        <>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${idPrefix}-pt`}>Perguruan Tinggi</Label>
            <Select
              value={draft.perguruanTinggiId}
              onValueChange={(v) =>
                onChange({ ...draft, perguruanTinggiId: v as string })
              }
            >
              <SelectTrigger
                id={`${idPrefix}-pt`}
                className="w-full"
                aria-invalid={
                  isPTRequired(draft) && draft.perguruanTinggiId === NO_PT
                }
              >
                <SelectValue>{(value: string) => ptName(value)}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {perguruanTinggi.map((pt) => (
                  <SelectItem key={pt.id} value={pt.id}>
                    {pt.nama}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isPTRequired(draft) && draft.perguruanTinggiId === NO_PT && (
              <p className="text-xs text-rose-600">
                Pilih perguruan tinggi untuk status &ldquo;
                {draft.statusSetelahLulus}&rdquo;.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${idPrefix}-prodi`}>Program Studi</Label>
            <Input
              id={`${idPrefix}-prodi`}
              value={draft.programStudi}
              onChange={(e) => onChange({ ...draft, programStudi: e.target.value })}
              placeholder="S1 Manajemen"
            />
          </div>
        </>
      )}

      {isStatusBekerja(draft.statusSetelahLulus) && (
        <>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${idPrefix}-tempat-kerja`}>
              {labelPekerjaan(draft.statusSetelahLulus).tempat}
            </Label>
            <Input
              id={`${idPrefix}-tempat-kerja`}
              value={draft.tempatKerja}
              onChange={(e) => onChange({ ...draft, tempatKerja: e.target.value })}
              placeholder="Contoh: PT Sinar Retail Indonesia"
              aria-invalid={draft.tempatKerja.trim().length === 0}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${idPrefix}-jabatan`}>
              {labelPekerjaan(draft.statusSetelahLulus).jabatan}
            </Label>
            <Input
              id={`${idPrefix}-jabatan`}
              value={draft.jabatan}
              onChange={(e) => onChange({ ...draft, jabatan: e.target.value })}
              placeholder="Contoh: Staf Administrasi"
              aria-invalid={draft.jabatan.trim().length === 0}
            />
          </div>
          {(draft.tempatKerja.trim().length === 0 || draft.jabatan.trim().length === 0) && (
            <p className="-mt-1 text-xs text-rose-600">
              Isi {labelPekerjaan(draft.statusSetelahLulus).tempat.toLowerCase()} dan{" "}
              {labelPekerjaan(draft.statusSetelahLulus).jabatan.toLowerCase()} untuk status
              &ldquo;{draft.statusSetelahLulus}&rdquo;.
            </p>
          )}
        </>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${idPrefix}-validasi`}>Validasi</Label>
        <Select
          value={draft.validasi}
          onValueChange={(v) =>
            onChange({ ...draft, validasi: v as StatusValidasi })
          }
        >
          <SelectTrigger id={`${idPrefix}-validasi`} className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusValidasiOptions.map((validasi) => (
              <SelectItem key={validasi} value={validasi}>
                {validasi} &ndash; {validasiDeskripsi[validasi]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-slate-400">
          {validasiDeskripsi[draft.validasi]}
        </p>
      </div>
    </div>
  );
}

export function AlumniManager({
  sekolahOptions,
  perguruanTinggi,
  currentAdmin,
}: AlumniManagerProps) {
  const [alumniList, setAlumniList] = useAlumniStore();
  const angkatanOptions = useMemo(
    () =>
      Array.from(new Set(alumniList.map((a) => a.tahunLulus))).sort(
        (a, b) => b - a,
      ),
    [alumniList],
  );
  const [angkatan, setAngkatan] = useState<string>(
    String(angkatanOptions[0] ?? "semua"),
  );
  const [validasiFilter, setValidasiFilter] = useState<
    "semua" | StatusValidasi
  >("semua");
  const [statusFilter, setStatusFilter] = useState<
    "semua" | StatusSetelahLulus
  >("semua");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mode, setMode] = useState<"view" | "edit" | "delete">("view");
  const [draft, setDraft] = useState<FormDraft | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [addDraft, setAddDraft] = useState<FormDraft>(() =>
    emptyDraft(sekolahOptions[0] ?? "", String(new Date().getFullYear())),
  );

  const ptById = useMemo(
    () => new Map(perguruanTinggi.map((pt) => [pt.id, pt])),
    [perguruanTinggi],
  );

  const angkatanAlumni = alumniList.filter(
    (a) => angkatan === "semua" || String(a.tahunLulus) === angkatan,
  );
  const totalAlumni = angkatanAlumni.length;
  const countValidasi = (validasi: StatusValidasi) =>
    angkatanAlumni.filter((a) => a.validasi === validasi).length;
  const persen = (n: number) =>
    totalAlumni ? ((n / totalAlumni) * 100).toFixed(1).replace(".", ",") : "0";

  const filteredAlumni = useMemo(() => {
    const query = search.trim().toLowerCase();
    return alumniList.filter((a) => {
      if (angkatan !== "semua" && String(a.tahunLulus) !== angkatan)
        return false;
      if (validasiFilter !== "semua" && a.validasi !== validasiFilter)
        return false;
      if (statusFilter !== "semua" && a.statusSetelahLulus !== statusFilter)
        return false;
      return (
        !query ||
        a.nama.toLowerCase().includes(query) ||
        a.nisn.includes(query) ||
        a.nik.includes(query)
      );
    });
  }, [alumniList, angkatan, validasiFilter, statusFilter, search]);

  const selected = alumniList.find((a) => a.nik === selectedId) ?? null;

  function statusTerakhir(a: Alumni) {
    if (isStatusBekerja(a.statusSetelahLulus) && a.tempatKerja) {
      return `${a.statusSetelahLulus} • ${a.tempatKerja}`;
    }
    const pt = ptById.get(a.perguruanTinggiId);
    return pt
      ? `${a.statusSetelahLulus} • ${pt.singkatan}`
      : a.statusSetelahLulus;
  }

  function isDuplicateNisn(nisn: string, excludeNik?: string) {
    return (
      nisn.length > 0 &&
      alumniList.some((a) => a.nisn === nisn && a.nik !== excludeNik)
    );
  }

  function isDuplicateNik(nik: string, excludeNik?: string) {
    return (
      nik.length > 0 &&
      alumniList.some((a) => a.nik === nik && a.nik !== excludeNik)
    );
  }

  const isEditNisnDuplicate =
    !!draft && isDuplicateNisn(draft.nisn, selected?.nik);
  const isEditNikDuplicate =
    !!draft && isDuplicateNik(draft.nik, selected?.nik);
  const isEditComplete =
    !!draft &&
    isDraftComplete(draft) &&
    !isEditNisnDuplicate &&
    !isEditNikDuplicate;
  const isAddNisnDuplicate = isDuplicateNisn(addDraft.nisn);
  const isAddNikDuplicate = isDuplicateNik(addDraft.nik);
  const isAddComplete =
    isDraftComplete(addDraft) && !isAddNisnDuplicate && !isAddNikDuplicate;

  function openAlumni(id: string) {
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
    setDraft(draftFromAlumni(selected));
    setMode("edit");
  }

  function saveEdit() {
    if (!selected || !draft || !isEditComplete) return;
    const fields = fieldsFromDraft(draft);
    // Status validasi yang diubah manual juga dicatat atas nama admin yang sedang login.
    const validasiChanged = fields.validasi !== selected.validasi;
    const pemeriksaFields = validasiChanged
      ? {
          pemeriksa: fields.validasi === "Pending" ? "" : currentAdmin,
          catatanValidasi: "",
        }
      : {};
    setAlumniList((prev) =>
      prev.map((a) =>
        a.nik === selected.nik ? { ...a, ...fields, ...pemeriksaFields } : a,
      ),
    );
    // NIK adalah kunci data, jadi ikuti nilai barunya bila NIK dikoreksi.
    setSelectedId(fields.nik);
    setMode("view");
  }

  function confirmDelete() {
    if (!selected) return;
    setAlumniList((prev) => prev.filter((a) => a.nik !== selected.nik));
    setSelectedId(null);
    setMode("view");
  }

  function freshAddDraft() {
    const tahun =
      angkatan === "semua" ? String(new Date().getFullYear()) : angkatan;
    return emptyDraft(sekolahOptions[0] ?? "", tahun);
  }

  function openAddDialog() {
    setAddDraft(freshAddDraft());
    setIsAddOpen(true);
  }

  function closeAddDialog(open: boolean) {
    setIsAddOpen(open);
    if (!open) setAddDraft(freshAddDraft());
  }

  // Alumni hasil impor masuk antrean verifikasi (Pending) dengan privasi bawaan tertutup.
  function importAlumni(items: AlumniImpor[]) {
    setAlumniList((prev) => [
      ...prev,
      ...items.map((item) => ({
        ...item,
        terakhirDikonfirmasi: formatToday(),
        validasi: "Pending" as const,
        pemeriksa: "",
        catatanValidasi: "",
        ...pengaturanBerbagiDefault,
      })),
    ]);
  }

  function submitAdd() {
    if (!isAddComplete) return;
    const fields = fieldsFromDraft(addDraft);
    const newAlumni: Alumni = {
      ...fields,
      pemeriksa: "",
      catatanValidasi: "",
      ...pengaturanBerbagiDefault,
    };
    setAlumniList((prev) => [...prev, newAlumni]);
    setIsAddOpen(false);
  }

  const isFilterActive = validasiFilter !== "semua" || statusFilter !== "semua";

  function downloadReport() {
    downloadCsv(
      reportFilename(
        angkatan === "semua" ? "data-alumni" : `data-alumni-${angkatan}`,
      ),
      [
        "NIK",
        "Nama",
        "NISN",
        "Sekolah",
        "Kelas",
        "Tahun Lulus",
        "Wali Kelas",
        "Telepon",
        "Email",
        "LinkedIn",
        "Instagram",
        "TikTok",
        "Status Setelah Lulus",
        "Perguruan Tinggi",
        "Program Studi",
        "Jabatan / Bidang Usaha",
        "Tempat Bekerja / Nama Usaha",
        "Validasi",
        "Terakhir Dikonfirmasi",
      ],
      filteredAlumni.map((a) => [
        a.nik,
        a.nama,
        a.nisn,
        a.sekolah,
        a.kelas,
        a.tahunLulus,
        a.waliKelas,
        a.telepon,
        a.email,
        a.linkedin && socialUrl("linkedin", a.linkedin),
        a.instagram && socialUrl("instagram", a.instagram),
        a.tiktok && socialUrl("tiktok", a.tiktok),
        a.statusSetelahLulus,
        ptById.get(a.perguruanTinggiId)?.nama ?? "",
        a.programStudi,
        a.jabatan,
        a.tempatKerja,
        a.validasi,
        a.terakhirDikonfirmasi,
      ]),
    );
  }
  const selectedPT = selected
    ? ptById.get(selected.perguruanTinggiId)
    : undefined;

  return (
    <>
      <Header
        title="Data Alumni"
        actions={
          <>
            <Select
              value={angkatan}
              onValueChange={(v) => setAngkatan(v as string)}
            >
              <SelectTrigger className="min-w-[150px]">
                <SelectValue>
                  {(value: string) =>
                    value === "semua" ? "Semua Angkatan" : `Angkatan ${value}`
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semua">Semua Angkatan</SelectItem>
                {angkatanOptions.map((tahun) => (
                  <SelectItem key={tahun} value={String(tahun)}>
                    Angkatan {tahun}
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
              value={totalAlumni}
              caption={
                angkatan === "semua"
                  ? "Seluruh alumni semua angkatan"
                  : `Seluruh alumni angkatan ${angkatan}`
              }
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
                <h2 className="text-sm font-semibold text-slate-900">
                  Daftar Alumni
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Menampilkan {filteredAlumni.length} alumni
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari nama, NIK, atau NISN"
                    className="w-60 pl-8"
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "gap-1.5",
                      isFilterActive &&
                        "border-blue-200 bg-blue-50 text-blue-700",
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
                        {statusValidasiOptions.map((validasi) => (
                          <DropdownMenuRadioItem
                            key={validasi}
                            value={validasi}
                            closeOnClick
                          >
                            {validasi}
                          </DropdownMenuRadioItem>
                        ))}
                      </DropdownMenuRadioGroup>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuLabel>
                        Status Setelah Lulus
                      </DropdownMenuLabel>
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
                          <DropdownMenuRadioItem
                            key={status}
                            value={status}
                            closeOnClick
                          >
                            {status}
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
                <Button
                  className="gap-1.5 bg-blue-600 hover:bg-blue-700"
                  onClick={openAddDialog}
                >
                  <Plus className="size-4" />
                  Tambah Alumni
                </Button>
                <ImportDialog<AlumniImpor>
                  open={isImportOpen}
                  onOpenChange={setIsImportOpen}
                  namaData="alumni"
                  namaTemplate="template-import-alumni.xlsx"
                  kolom={kolomAlumni(sekolahOptions[0] ?? "SMA Negeri 1")}
                  catatan={[
                    "Kolom NIK, NISN, dan Telepon sudah diformat sebagai Teks. Jika menempel data dari file lain, gunakan Paste > Values agar format Teks tidak hilang.",
                    "Data hasil import masuk dengan status validasi Pending dan perlu dicek di menu Verifikasi Data.",
                  ]}
                  validasi={(baris) => validasiAlumni(baris, alumniList, sekolahOptions, perguruanTinggi)}
                  label={(a) => `${a.nama} • NIK ${a.nik} • ${a.sekolah} ${a.tahunLulus}`}
                  onImport={importAlumni}
                />
              </div>
            </div>

            <div className="mt-4 min-w-0 flex-1 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[11px] tracking-wider text-slate-400 uppercase">
                      Alumni
                    </TableHead>
                    <TableHead className="text-[11px] tracking-wider text-slate-400 uppercase">
                      Kelas
                    </TableHead>
                    <TableHead className="text-[11px] tracking-wider text-slate-400 uppercase">
                      Status Terakhir
                    </TableHead>
                    <TableHead className="text-[11px] tracking-wider text-slate-400 uppercase">
                      Konfirmasi
                    </TableHead>
                    <TableHead className="text-[11px] tracking-wider text-slate-400 uppercase">
                      Validasi
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAlumni.map((a) => (
                    <TableRow
                      key={a.nik}
                      onClick={() => openAlumni(a.nik)}
                      className="cursor-pointer"
                    >
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-xs font-semibold text-blue-600">
                            {initials(a.nama)}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-slate-900">
                              {a.nama}
                            </p>
                            <p className="truncate text-xs text-slate-500">
                              NIK {a.nik}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {a.kelas}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {statusTerakhir(a)}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {a.terakhirDikonfirmasi}
                      </TableCell>
                      <TableCell>
                        <ValidasiBadge validasi={a.validasi} />
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredAlumni.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="py-10 text-center text-sm text-slate-500"
                      >
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
              {selected && mode === "view" && (
                <>
                  <DialogHeader>
                    <DialogTitle>Detail Alumni</DialogTitle>
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
                            {selected.sekolah} &bull; {selected.kelas}
                          </p>
                        </div>
                      </div>
                      <ValidasiBadge
                        validasi={selected.validasi}
                        className="mt-2.5"
                      />
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-slate-900">
                        Data Sekolah dan Kontak
                      </p>
                      <dl className="mt-2 divide-y divide-slate-100 text-xs">
                        {[
                          ["NIK", selected.nik],
                          ["NISN", selected.nisn],
                          ["Tahun lulus", selected.tahunLulus],
                          ["Wali kelas", selected.waliKelas],
                          ["Telepon", <PhoneMenu
                              key="tel"
                              telepon={selected.telepon}
                              data={{ ...selected, institusi: selectedPT?.nama ?? "" }}
                            />],
                          ["Email", selected.email],
                          [
                            "Terakhir dikonfirmasi",
                            selected.terakhirDikonfirmasi,
                          ],
                          ["Admin pemeriksa", selected.pemeriksa || "Belum dicek"],
                        ].map(([label, value]) => (
                          <div
                            key={String(label)}
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

                    <div>
                      <p className="text-xs font-semibold text-slate-900">Media Sosial</p>
                      <div className="mt-2 flex flex-col gap-1.5">
                        {socialPlatforms.map(({ platform, label, Icon }) => {
                          const handle = selected[platform];
                          return (
                            <div key={platform} className="flex items-center gap-2 text-xs">
                              <Icon className="size-4 shrink-0" />
                              <span className="w-16 shrink-0 text-slate-500">{label}</span>
                              {handle ? (
                                <a
                                  href={socialUrl(platform, handle)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="truncate font-medium text-blue-600 hover:underline"
                                >
                                  {socialLabel(platform, handle)}
                                </a>
                              ) : (
                                <span className="text-slate-400 italic">Belum diisi</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="rounded-lg border border-slate-200 p-3.5">
                      <p className="text-xs text-slate-500">
                        Status Setelah Lulus
                      </p>
                      <p
                        className={cn(
                          "mt-1 text-base font-semibold",
                          statusLulusColor[selected.statusSetelahLulus],
                        )}
                      >
                        {selected.statusSetelahLulus}
                      </p>
                      {(selectedPT || selected.programStudi) && (
                        <p className="mt-0.5 text-xs font-medium text-slate-700">
                          {[selectedPT?.nama, selected.programStudi]
                            .filter(Boolean)
                            .join(" • ")}
                        </p>
                      )}
                      {(selected.jabatan || selected.tempatKerja) && (
                        <p className="mt-0.5 text-xs font-medium text-slate-700">
                          {[selected.jabatan, selected.tempatKerja]
                            .filter(Boolean)
                            .join(" di ")}
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
                      className="gap-1.5 bg-blue-600 hover:bg-blue-700"
                      onClick={startEdit}
                    >
                      <Pencil className="size-3.5" />
                      Edit Alumni
                    </Button>
                  </DialogFooter>
                </>
              )}

              {selected && mode === "edit" && draft && (
                <>
                  <DialogHeader>
                    <DialogTitle>Edit Alumni</DialogTitle>
                    <p className="text-xs text-slate-500">
                      {selected.nama} &bull; NIK {selected.nik}
                    </p>
                  </DialogHeader>

                  <AlumniFormFields
                    idPrefix="edit"
                    draft={draft}
                    onChange={setDraft}
                    sekolahOptions={sekolahOptions}
                    perguruanTinggi={perguruanTinggi}
                    isNisnDuplicate={isEditNisnDuplicate}
                    isNikDuplicate={isEditNikDuplicate}
                  />

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
                    <DialogTitle>Hapus Alumni</DialogTitle>
                  </DialogHeader>

                  <p className="text-sm text-slate-600">
                    Apakah Anda yakin ingin menghapus data{" "}
                    <span className="font-semibold text-slate-900">
                      {selected.nama}
                    </span>{" "}
                    (NIK {selected.nik})? Tindakan ini tidak dapat dibatalkan.
                  </p>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setMode("view")}>
                      Batal
                    </Button>
                    <Button variant="destructive" onClick={confirmDelete}>
                      Ya, Hapus Alumni
                    </Button>
                  </DialogFooter>
                </>
              )}
            </DialogContent>
          </Dialog>

          <Dialog open={isAddOpen} onOpenChange={closeAddDialog}>
            <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Tambah Alumni Baru</DialogTitle>
                <p className="text-xs text-slate-500">
                  Lengkapi data alumni yang akan ditambahkan
                </p>
              </DialogHeader>

              <AlumniFormFields
                idPrefix="add"
                draft={addDraft}
                onChange={setAddDraft}
                sekolahOptions={sekolahOptions}
                perguruanTinggi={perguruanTinggi}
                isNisnDuplicate={isAddNisnDuplicate}
                isNikDuplicate={isAddNikDuplicate}
              />

              <DialogFooter>
                <Button variant="outline" onClick={() => closeAddDialog(false)}>
                  Batal
                </Button>
                <Button
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={!isAddComplete}
                  onClick={submitAdd}
                >
                  Simpan Alumni
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </>
  );
}
