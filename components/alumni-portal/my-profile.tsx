"use client";

import { useMemo, useState } from "react";
import { CircleCheck, GraduationCap, Info } from "lucide-react";
import {
  isStatusBekerja,
  isStatusKuliah,
  labelPekerjaan,
  statusPilihanAlumni,
  type Alumni,
  type StatusSetelahLulus,
} from "@/data/alumni";
import type { PerguruanTinggi } from "@/data/perguruan-tinggi";
import { useAlumniStore } from "@/components/alumni/alumni-store";
import { usePortal } from "@/components/alumni-portal/portal-store";
import { Avatar, Card, Toggle, ringkasanKegiatan } from "@/components/alumni-portal/shared";
import { Header } from "@/components/header";
import { NotificationBell } from "@/components/alumni-portal/notification-bell";
import { ValidasiBadge, validasiDeskripsi } from "@/components/validasi";
import { InstagramIcon, LinkedInIcon, TikTokIcon } from "@/components/social-icons";
import { normalizeSocialHandle, socialInputPrefix, type SocialPlatform } from "@/lib/kontak";
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

type ProfileDraft = Pick<
  Alumni,
  | "statusSetelahLulus"
  | "perguruanTinggiId"
  | "programStudi"
  | "jabatan"
  | "tempatKerja"
  | "telepon"
  | "email"
  | "linkedin"
  | "instagram"
  | "tiktok"
  | "tampilDiJaringan"
  | "bersediaMentor"
  | "bagikanEmail"
  | "bagikanTelepon"
  | "bagikanMediaSosial"
>;

// Field yang perubahannya perlu dicek ulang admin; pengaturan privasi tidak termasuk.
const fieldPerluVerifikasi: (keyof ProfileDraft)[] = [
  "statusSetelahLulus",
  "perguruanTinggiId",
  "programStudi",
  "jabatan",
  "tempatKerja",
  "telepon",
  "email",
  "linkedin",
  "instagram",
  "tiktok",
];

const socialPlatforms: {
  platform: SocialPlatform;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
}[] = [
  { platform: "linkedin", label: "LinkedIn", Icon: LinkedInIcon },
  { platform: "instagram", label: "Instagram", Icon: InstagramIcon },
  { platform: "tiktok", label: "TikTok", Icon: TikTokIcon },
];

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const monthNamesId = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

function formatToday() {
  const now = new Date();
  return `${String(now.getDate()).padStart(2, "0")} ${monthNamesId[now.getMonth()]} ${now.getFullYear()}`;
}

function draftFromAlumni(a: Alumni): ProfileDraft {
  return {
    statusSetelahLulus: a.statusSetelahLulus,
    perguruanTinggiId: a.perguruanTinggiId,
    programStudi: a.programStudi,
    jabatan: a.jabatan,
    tempatKerja: a.tempatKerja,
    telepon: a.telepon,
    email: a.email,
    linkedin: a.linkedin,
    instagram: a.instagram,
    tiktok: a.tiktok,
    tampilDiJaringan: a.tampilDiJaringan,
    bersediaMentor: a.bersediaMentor,
    bagikanEmail: a.bagikanEmail,
    bagikanTelepon: a.bagikanTelepon,
    bagikanMediaSosial: a.bagikanMediaSosial,
  };
}

// Mengembalikan pesan error pertama, atau string kosong bila draft valid.
function validateDraft(d: ProfileDraft) {
  if (!statusPilihanAlumni.includes(d.statusSetelahLulus)) return "Pilih status kamu saat ini.";
  if (isStatusKuliah(d.statusSetelahLulus) && !d.perguruanTinggiId)
    return "Pilih perguruan tinggi kamu.";
  if (isStatusKuliah(d.statusSetelahLulus) && !d.programStudi.trim())
    return "Isi program studi kamu.";
  const label = labelPekerjaan(d.statusSetelahLulus);
  if (isStatusBekerja(d.statusSetelahLulus) && (!d.tempatKerja.trim() || !d.jabatan.trim()))
    return `Isi ${label.tempat.toLowerCase()} dan ${label.jabatan.toLowerCase()}.`;
  if (!d.telepon.trim()) return "Nomor telepon wajib diisi.";
  if (!emailPattern.test(d.email.trim())) return "Format email tidak valid.";
  return "";
}

// Data kuliah/kerja hanya disimpan bila sesuai status, supaya data lama tidak tertinggal.
function cleanDraft(d: ProfileDraft): ProfileDraft {
  const kuliah = isStatusKuliah(d.statusSetelahLulus);
  const kerja = isStatusBekerja(d.statusSetelahLulus);
  return {
    ...d,
    perguruanTinggiId: kuliah ? d.perguruanTinggiId : "",
    programStudi: kuliah ? d.programStudi.trim() : "",
    jabatan: kerja ? d.jabatan.trim() : "",
    tempatKerja: kerja ? d.tempatKerja.trim() : "",
    telepon: d.telepon.trim(),
    email: d.email.trim(),
    // Mentor harus tampil di jaringan agar bisa dihubungi.
    bersediaMentor: d.tampilDiJaringan && d.bersediaMentor,
  };
}

export function MyProfile({ perguruanTinggi }: { perguruanTinggi: PerguruanTinggi[] }) {
  const { account } = usePortal();
  const [alumniList, setAlumniList] = useAlumniStore();
  const me = alumniList.find((a) => a.nik === account.alumniNik);
  const [draft, setDraft] = useState<ProfileDraft | null>(() => (me ? draftFromAlumni(me) : null));
  const [notice, setNotice] = useState("");
  const [showErrors, setShowErrors] = useState(false);

  const ptById = useMemo(
    () => new Map(perguruanTinggi.map((pt) => [pt.id, pt])),
    [perguruanTinggi],
  );

  if (!me || !draft) {
    return (
      <>
        <Header title="Profil Saya" actions={<></>} />
        <main className="flex-1 p-6">
          <Card>
            <p className="text-sm text-slate-600">
              Akun kamu belum terhubung dengan data alumni. Hubungi admin sekolah.
            </p>
          </Card>
        </main>
      </>
    );
  }

  const error = validateDraft(draft);
  const original = draftFromAlumni(me);
  const isDirty = (Object.keys(original) as (keyof ProfileDraft)[]).some(
    (key) => original[key] !== draft[key],
  );
  const label = labelPekerjaan(draft.statusSetelahLulus);

  function update(patch: Partial<ProfileDraft>) {
    setDraft((prev) => (prev ? { ...prev, ...patch } : prev));
    setNotice("");
  }

  function handleCancel() {
    if (!me) return;
    setDraft(draftFromAlumni(me));
    setShowErrors(false);
    setNotice("");
  }

  function handleSave() {
    if (!me || !draft) return;
    if (error) {
      setShowErrors(true);
      return;
    }
    const cleaned = cleanDraft(draft);
    const perluVerifikasi = fieldPerluVerifikasi.some((key) => original[key] !== cleaned[key]);
    setAlumniList((prev) =>
      prev.map((a) =>
        a.nik === me.nik
          ? {
              ...a,
              ...cleaned,
              // Data yang berubah masuk antrean verifikasi admin lagi.
              ...(perluVerifikasi
                ? {
                    validasi: "Pending" as const,
                    pemeriksa: "",
                    catatanValidasi: "",
                    terakhirDikonfirmasi: formatToday(),
                  }
                : {}),
            }
          : a,
      ),
    );
    setDraft(cleaned);
    setShowErrors(false);
    setNotice(
      perluVerifikasi
        ? "Profil tersimpan. Perubahan data akan dicek admin sekolah (status: Pending)."
        : "Pengaturan privasi tersimpan.",
    );
  }

  const ringkasan = ringkasanKegiatan(me, ptById);

  return (
    <>
      <Header
        title="Profil Saya"
        actions={<NotificationBell />}
      />

      <main className="flex-1 p-6">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <div className="flex items-center gap-4">
                <Avatar nama={me.nama} className="size-14 text-lg" />
                <div className="min-w-0">
                  <p className="truncate text-lg font-semibold text-slate-900">{me.nama}</p>
                  <p className="flex items-center gap-1.5 text-sm text-slate-500">
                    <GraduationCap className="size-4" />
                    {me.sekolah} &bull; {me.kelas} &bull; Lulus {me.tahunLulus}
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-800">
                    {me.statusSetelahLulus}
                    {ringkasan && <span className="font-normal text-slate-500"> &bull; {ringkasan}</span>}
                  </p>
                </div>
              </div>
            </Card>

            <Card title="Status Verifikasi Profil">
              <div className="flex items-center gap-2">
                <ValidasiBadge validasi={me.validasi} />
                <span className="text-xs text-slate-500">{validasiDeskripsi[me.validasi]}</span>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                {me.pemeriksa ? `Dicek oleh ${me.pemeriksa}` : "Belum dicek admin"} &bull; Diperbarui{" "}
                {me.terakhirDikonfirmasi}
              </p>
              {me.validasi === "Rejected" && me.catatanValidasi && (
                <div className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">
                  <p className="font-semibold">Catatan admin</p>
                  <p className="mt-0.5">{me.catatanValidasi}</p>
                </div>
              )}
            </Card>
          </div>

          <Card
            title="Perjalanan Setelah Lulus"
            description="Status dan kegiatan kamu saat ini"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="profil-status">Status Saat Ini</Label>
                <Select
                  value={draft.statusSetelahLulus}
                  onValueChange={(v) => update({ statusSetelahLulus: v as StatusSetelahLulus })}
                >
                  <SelectTrigger id="profil-status" className="w-full">
                    <SelectValue>
                      {(value: StatusSetelahLulus) =>
                        statusPilihanAlumni.includes(value) ? value : "Pilih status"
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {statusPilihanAlumni.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="profil-tahun">Tahun Lulus</Label>
                <Input
                  id="profil-tahun"
                  value={String(me.tahunLulus)}
                  readOnly
                  className="bg-slate-50 text-slate-600"
                />
              </div>

              {isStatusKuliah(draft.statusSetelahLulus) && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="profil-pt">Universitas / Perguruan Tinggi</Label>
                    <Select
                      value={draft.perguruanTinggiId}
                      onValueChange={(v) => update({ perguruanTinggiId: v as string })}
                    >
                      <SelectTrigger id="profil-pt" className="w-full">
                        <SelectValue>
                          {(value: string) => ptById.get(value)?.nama ?? "Pilih perguruan tinggi"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {perguruanTinggi.map((pt) => (
                          <SelectItem key={pt.id} value={pt.id}>
                            {pt.nama}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="profil-prodi">Program Studi</Label>
                    <Input
                      id="profil-prodi"
                      value={draft.programStudi}
                      onChange={(e) => update({ programStudi: e.target.value })}
                      placeholder="Contoh: S1 Manajemen"
                    />
                  </div>
                </>
              )}

              {isStatusBekerja(draft.statusSetelahLulus) && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="profil-tempat">{label.tempat}</Label>
                    <Input
                      id="profil-tempat"
                      value={draft.tempatKerja}
                      onChange={(e) => update({ tempatKerja: e.target.value })}
                      placeholder={
                        draft.statusSetelahLulus === "Wirausaha"
                          ? "Contoh: Kopi Senja Bandung"
                          : "Contoh: PT Sinar Retail Indonesia"
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="profil-jabatan">{label.jabatan}</Label>
                    <Input
                      id="profil-jabatan"
                      value={draft.jabatan}
                      onChange={(e) => update({ jabatan: e.target.value })}
                      placeholder={
                        draft.statusSetelahLulus === "Wirausaha"
                          ? "Contoh: Kuliner"
                          : "Contoh: Staf Administrasi"
                      }
                    />
                  </div>
                </>
              )}
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card title="Kontak & Media Sosial" description="Dipakai sekolah untuk menghubungi kamu">
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="profil-telepon">Telepon / WhatsApp</Label>
                    <Input
                      id="profil-telepon"
                      inputMode="tel"
                      value={draft.telepon}
                      onChange={(e) => update({ telepon: e.target.value.replace(/[^\d\s+-]/g, "") })}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="profil-email">Email</Label>
                    <Input
                      id="profil-email"
                      type="email"
                      value={draft.email}
                      onChange={(e) => update({ email: e.target.value })}
                    />
                  </div>
                </div>
                {socialPlatforms.map(({ platform, label: nama, Icon }) => (
                  <div key={platform} className="flex items-center gap-2">
                    <Icon className="size-5 shrink-0" />
                    <div className="flex min-w-0 flex-1 items-center rounded-lg border border-input focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
                      <span className="pl-2.5 text-sm whitespace-nowrap text-slate-400">
                        {socialInputPrefix[platform]}
                      </span>
                      <input
                        aria-label={nama}
                        value={draft[platform]}
                        onChange={(e) =>
                          update({ [platform]: normalizeSocialHandle(platform, e.target.value) })
                        }
                        placeholder="username"
                        className="h-8 min-w-0 flex-1 bg-transparent pr-2.5 text-sm outline-none placeholder:text-muted-foreground"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card
              title="Privasi & Alumni Network"
              description="Atur informasi yang boleh dilihat sesama alumni"
            >
              <div className="divide-y divide-slate-100">
                <Toggle
                  label="Tampilkan profil saya di Alumni Network"
                  description="Nama, angkatan, dan kegiatan saat ini bisa dicari alumni lain"
                  checked={draft.tampilDiJaringan}
                  onChange={(v) => update({ tampilDiJaringan: v })}
                />
                <Toggle
                  label="Bagikan email"
                  checked={draft.bagikanEmail}
                  disabled={!draft.tampilDiJaringan}
                  onChange={(v) => update({ bagikanEmail: v })}
                />
                <Toggle
                  label="Bagikan nomor telepon / WhatsApp"
                  checked={draft.bagikanTelepon}
                  disabled={!draft.tampilDiJaringan}
                  onChange={(v) => update({ bagikanTelepon: v })}
                />
                <Toggle
                  label="Bagikan media sosial"
                  checked={draft.bagikanMediaSosial}
                  disabled={!draft.tampilDiJaringan}
                  onChange={(v) => update({ bagikanMediaSosial: v })}
                />
                <Toggle
                  label="Bersedia menjadi mentor"
                  description="Adik kelas dan alumni lain bisa menghubungi kamu untuk bertanya"
                  checked={draft.tampilDiJaringan && draft.bersediaMentor}
                  disabled={!draft.tampilDiJaringan}
                  onChange={(v) => update({ bersediaMentor: v })}
                />
              </div>
              <p className="mt-2 flex items-start gap-1.5 text-xs text-slate-400">
                <Info className="mt-px size-3.5 shrink-0" />
                Sekolah tetap dapat melihat seluruh data kamu untuk keperluan pendataan.
              </p>
            </Card>
          </div>

          {showErrors && error && (
            <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>
          )}
          {notice && (
            <div className="flex items-start gap-2 rounded-md bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700">
              <CircleCheck className="mt-0.5 size-4 shrink-0" />
              <p>{notice}</p>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button variant="outline" size="lg" disabled={!isDirty} onClick={handleCancel}>
              Batal
            </Button>
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700"
              disabled={!isDirty}
              onClick={handleSave}
            >
              Simpan Profil
            </Button>
          </div>
        </div>
      </main>
    </>
  );
}
