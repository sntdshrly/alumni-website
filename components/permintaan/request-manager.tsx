"use client";

import { useState } from "react";
import { Check, UserPlus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { isStatusBekerja, isStatusKuliah } from "@/data/alumni";
import type { PermintaanAkun } from "@/lib/data";
import { AksiError, useAksi } from "@/components/aksi";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
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
import { setujuiPermintaan, tolakPermintaan } from "@/app/dashboard/permintaan-akun/actions";

const tanggalFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Jakarta",
});

export function RequestManager({
  permintaan: initialPermintaan,
  namaPT,
}: {
  permintaan: PermintaanAkun[];
  // Nama perguruan tinggi berdasarkan id, untuk menampilkan biodata kuliah.
  namaPT: Record<string, string>;
}) {
  const [permintaan, setPermintaan] = useState(initialPermintaan);
  const { jalankan, error, tutupError, isPending } = useAksi();
  const [notice, setNotice] = useState("");
  const [dipilihId, setDipilihId] = useState<string | null>(null);
  const [mode, setMode] = useState<"setujui" | "tolak">("setujui");

  const dipilih = permintaan.find((p) => p.id === dipilihId) ?? null;
  const b = dipilih?.biodata ?? null;

  function buka(id: string, m: "setujui" | "tolak") {
    setDipilihId(id);
    setMode(m);
    setNotice("");
  }

  function konfirmasi() {
    if (!dipilih) return;
    const id = dipilih.id;
    jalankan(
      () => (mode === "tolak" ? tolakPermintaan(id) : setujuiPermintaan(id)),
      (h) => {
        setPermintaan((prev) => prev.filter((p) => p.id !== id));
        setDipilihId(null);
        setNotice(h.success ?? "");
      },
    );
  }

  const baris: [string, string][] = b
    ? [
        ["Sekolah", dipilih?.sekolah || "–"],
        ["NIK", b.nik],
        ["NISN", b.nisn],
        ["Kelas", b.kelas],
        ["Tahun Lulus", String(b.tahunLulus)],
        ["Telepon", b.telepon],
        ["Status", b.statusSetelahLulus],
        ...(isStatusKuliah(b.statusSetelahLulus)
          ? ([
              ["Perguruan Tinggi", namaPT[b.perguruanTinggiId] ?? b.perguruanTinggiId],
              ["Program Studi", b.programStudi],
            ] as [string, string][])
          : []),
        ...(isStatusBekerja(b.statusSetelahLulus)
          ? ([
              ["Jabatan / Bidang", b.jabatan],
              ["Tempat Kerja / Usaha", b.tempatKerja],
            ] as [string, string][])
          : []),
      ]
    : [];

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
              Pendaftaran alumni dari halaman Register dan dari Google. Periksa biodatanya, lalu
              setujui untuk langsung membuat data alumni dan akun portalnya.
            </p>

            <div className="mt-4 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {["Nama", "Sekolah", "Angkatan", "Sumber", "Diajukan", ""].map((h) => (
                      <TableHead key={h} className="text-[11px] tracking-wider text-slate-400 uppercase">
                        {h}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {permintaan.map((p) => (
                    <TableRow key={p.id} onClick={() => buka(p.id, "setujui")} className="cursor-pointer">
                      <TableCell>
                        <p className="font-medium text-slate-900">{p.nama}</p>
                        <p className="text-xs text-slate-500">{p.email}</p>
                      </TableCell>
                      <TableCell className="text-slate-600">{p.sekolah || "–"}</TableCell>
                      <TableCell className="text-slate-600">
                        {p.biodata ? p.biodata.tahunLulus : <span className="text-amber-600">Biodata kosong</span>}
                      </TableCell>
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
                        <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <Button variant="outline" size="sm" className="gap-1" onClick={() => buka(p.id, "tolak")}>
                            <X className="size-3.5 text-rose-600" />
                            <span className="text-rose-600">Tolak</span>
                          </Button>
                          <Button
                            size="sm"
                            className="gap-1 bg-blue-600 hover:bg-blue-700"
                            onClick={() => buka(p.id, "setujui")}
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
                      <TableCell colSpan={6} className="py-10 text-center text-sm text-slate-500">
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
              ) : b ? (
                <>
                  <dl className="divide-y divide-slate-100 rounded-lg bg-slate-50 px-3 text-xs">
                    {baris.map(([label, value]) => (
                      <div key={label} className="flex justify-between gap-4 py-2">
                        <dt className="shrink-0 text-slate-500">{label}</dt>
                        <dd className="text-right font-medium text-slate-800">{value || "–"}</dd>
                      </div>
                    ))}
                  </dl>
                  <p className="text-xs text-slate-500">
                    Data alumni baru akan dibuat dengan status validasi Valid atas nama Anda.
                  </p>
                </>
              ) : (
                <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-700">
                  Permintaan ini dibuat sebelum form biodata tersedia. Pendaftar cukup masuk dengan
                  Google sekali lagi untuk melengkapi biodata; permintaan ini akan otomatis diperbarui.
                </p>
              )}

              <DialogFooter>
                <Button variant="outline" disabled={isPending} onClick={() => setDipilihId(null)}>
                  Batal
                </Button>
                <Button
                  variant={mode === "tolak" ? "destructive" : "default"}
                  className={mode === "tolak" ? "" : "bg-blue-600 hover:bg-blue-700"}
                  disabled={isPending || (mode === "setujui" && !b)}
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
