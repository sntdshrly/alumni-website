"use client";

import { useMemo, useState } from "react";
import { Check, GraduationCap, UserCog, UserPlus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { roleLintasSekolah, type RolePengguna } from "@/data/pengguna";
import type { PermintaanAkun } from "@/lib/data";
import { useAlumniStore } from "@/components/alumni/alumni-store";
import { AksiError, useAksi } from "@/components/aksi";
import { Header } from "@/components/header";
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
  setujuiSebagaiAlumni,
  setujuiSebagaiStaf,
  tolakPermintaan,
} from "@/app/dashboard/permintaan-akun/actions";

type Jenis = "alumni" | "staf";

const tanggalFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Jakarta",
});

export function RequestManager({
  permintaan: initialPermintaan,
  sekolahOptions,
  roleOptions,
}: {
  permintaan: PermintaanAkun[];
  sekolahOptions: string[];
  roleOptions: RolePengguna[];
}) {
  const [permintaan, setPermintaan] = useState(initialPermintaan);
  const [alumniList] = useAlumniStore();
  const { jalankan, error, tutupError, isPending } = useAksi();
  const [notice, setNotice] = useState("");

  const [dipilihId, setDipilihId] = useState<string | null>(null);
  const [mode, setMode] = useState<"setujui" | "tolak">("setujui");
  const [jenis, setJenis] = useState<Jenis>("alumni");
  const [nik, setNik] = useState("");
  const [role, setRole] = useState<RolePengguna>(roleOptions[0]);
  const [sekolah, setSekolah] = useState(sekolahOptions[0] ?? "");

  const dipilih = permintaan.find((p) => p.id === dipilihId) ?? null;

  // Alumni yang bisa dihubungkan: sesekolah dengan pilihan pendaftar bila ada.
  const kandidatAlumni = useMemo(
    () =>
      alumniList
        .filter((a) => !dipilih?.sekolah || a.sekolah === dipilih.sekolah)
        .sort((x, y) => x.nama.localeCompare(y.nama, "id")),
    [alumniList, dipilih],
  );

  function buka(p: PermintaanAkun, m: "setujui" | "tolak") {
    setDipilihId(p.id);
    setMode(m);
    setJenis("alumni");
    setNik("");
    setRole(roleOptions[0]);
    setSekolah(p.sekolah || sekolahOptions[0] || "");
    setNotice("");
  }

  function selesai(id: string, pesan?: string) {
    setPermintaan((prev) => prev.filter((p) => p.id !== id));
    setDipilihId(null);
    setNotice(pesan ?? "");
  }

  function konfirmasi() {
    if (!dipilih) return;
    const id = dipilih.id;
    if (mode === "tolak") {
      jalankan(() => tolakPermintaan(id), (h) => selesai(id, h.success));
    } else if (jenis === "alumni") {
      if (!nik) return;
      jalankan(() => setujuiSebagaiAlumni(id, nik), (h) => selesai(id, h.success));
    } else {
      jalankan(() => setujuiSebagaiStaf(id, { role, sekolah }), (h) => selesai(id, h.success));
    }
  }

  const lintasSekolah = roleLintasSekolah.includes(role);
  const bisaKonfirmasi = mode === "tolak" || (jenis === "alumni" ? !!nik : lintasSekolah || !!sekolah);

  return (
    <>
      <AksiError pesan={error} onClose={tutupError} />
      <Header title="Permintaan Akun" actions={<></>} />

      <main className="flex-1 p-6">
        <div className="flex flex-col gap-4">
          {notice && (
            <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{notice}</p>
          )}

          <div className="rounded-xl border border-black/5 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">Menunggu Persetujuan</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Pendaftaran dari halaman Register dan dari login Google. Setujui sebagai alumni
              (dihubungkan ke data alumni yang ada) atau sebagai staf.
            </p>

            <div className="mt-4 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {["Nama", "Sekolah", "Sumber", "Diajukan", ""].map((h) => (
                      <TableHead key={h} className="text-[11px] tracking-wider text-slate-400 uppercase">
                        {h}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {permintaan.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <p className="font-medium text-slate-900">{p.nama}</p>
                        <p className="text-xs text-slate-500">{p.email}</p>
                      </TableCell>
                      <TableCell className="text-slate-600">{p.sekolah || "–"}</TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[11px] font-medium",
                            p.sumber === "Google" ? "bg-sky-50 text-sky-700" : "bg-slate-100 text-slate-600",
                          )}
                        >
                          {p.sumber}
                        </span>
                      </TableCell>
                      <TableCell className="text-slate-600">{tanggalFormatter.format(new Date(p.dibuatPada))}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" className="gap-1" onClick={() => buka(p, "tolak")}>
                            <X className="size-3.5 text-rose-600" />
                            <span className="text-rose-600">Tolak</span>
                          </Button>
                          <Button
                            size="sm"
                            className="gap-1 bg-blue-600 hover:bg-blue-700"
                            onClick={() => buka(p, "setujui")}
                          >
                            <Check className="size-3.5" />
                            Setujui
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {permintaan.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="py-10 text-center text-sm text-slate-500">
                        <UserPlus className="mx-auto mb-2 size-6 text-slate-300" />
                        Tidak ada permintaan akun yang menunggu.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </main>

      <Dialog open={!!dipilih} onOpenChange={(open) => !open && !isPending && setDipilihId(null)}>
        <DialogContent className="sm:max-w-md">
          {dipilih && (
            <>
              <DialogHeader>
                <DialogTitle>{mode === "tolak" ? "Tolak Permintaan" : "Setujui Permintaan"}</DialogTitle>
                <p className="text-xs text-slate-500">
                  {dipilih.nama} &bull; {dipilih.email}
                </p>
              </DialogHeader>

              {mode === "tolak" ? (
                <p className="text-sm text-slate-600">
                  Permintaan ini akan ditolak dan pendaftar tetap tidak bisa masuk.
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-2">
                    {(
                      [
                        ["alumni", "Alumni", GraduationCap],
                        ["staf", "Staf", UserCog],
                      ] as const
                    ).map(([key, label, Icon]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setJenis(key)}
                        className={cn(
                          "flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-sm",
                          jenis === key
                            ? "border-blue-600 bg-blue-50 font-medium text-blue-700"
                            : "border-slate-200 text-slate-600 hover:bg-slate-50",
                        )}
                      >
                        <Icon className="size-4" />
                        {label}
                      </button>
                    ))}
                  </div>

                  {jenis === "alumni" ? (
                    <div className="flex flex-col gap-1.5">
                      <Label>Hubungkan ke data alumni</Label>
                      <Select value={nik} onValueChange={(v) => setNik(v as string)}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Pilih alumni">
                            {(value: string) => {
                              const a = alumniList.find((x) => x.nik === value);
                              return a ? `${a.nama} • ${a.tahunLulus}` : "Pilih alumni";
                            }}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {kandidatAlumni.map((a) => (
                            <SelectItem key={a.nik} value={a.nik}>
                              {a.nama} • Angkatan {a.tahunLulus} • {a.sekolah}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-slate-400">
                        Email data alumni akan diganti menjadi {dipilih.email}. Alumni belum ada di
                        daftar? Tambahkan dulu di menu Data Alumni.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-col gap-1.5">
                        <Label>Role</Label>
                        <Select value={role} onValueChange={(v) => setRole(v as RolePengguna)}>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {roleOptions.map((r) => (
                              <SelectItem key={r} value={r}>
                                {r}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {!lintasSekolah && (
                        <div className="flex flex-col gap-1.5">
                          <Label>Sekolah</Label>
                          <Select value={sekolah} onValueChange={(v) => setSekolah(v as string)}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Pilih sekolah" />
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
                      )}
                    </>
                  )}
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" disabled={isPending} onClick={() => setDipilihId(null)}>
                  Batal
                </Button>
                <Button
                  variant={mode === "tolak" ? "destructive" : "default"}
                  className={mode === "tolak" ? "" : "bg-blue-600 hover:bg-blue-700"}
                  disabled={!bisaKonfirmasi || isPending}
                  onClick={konfirmasi}
                >
                  {mode === "tolak" ? "Ya, Tolak" : "Setujui"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
