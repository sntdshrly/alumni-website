"use client";

import { useRef, useState } from "react";
import { CircleAlert, CircleCheck, Download, FileSpreadsheet, Loader2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { bacaFile, unduhTemplate, type BarisImpor, type KolomImpor } from "@/lib/excel-import";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type HasilValidasi<T> = { nomor: number; data?: T; error?: string };

type ImportDialogProps<T> = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Nama data dalam bentuk tunggal, misalnya "sekolah" atau "alumni".
  namaData: string;
  namaTemplate: string;
  kolom: KolomImpor[];
  catatan?: string[];
  // Memvalidasi seluruh baris sekaligus agar duplikat di dalam file juga terdeteksi.
  validasi: (baris: BarisImpor[]) => HasilValidasi<T>[];
  label: (item: T) => string;
  onImport: (items: T[]) => void;
};

type Tahap =
  | { jenis: "pilih" }
  | { jenis: "pratinjau"; namaFile: string; hasil: HasilValidasi<unknown>[] }
  | { jenis: "selesai"; jumlah: number };

const MAKS_UKURAN = 5 * 1024 * 1024;

export function ImportDialog<T>({
  open,
  onOpenChange,
  namaData,
  namaTemplate,
  kolom,
  catatan,
  validasi,
  label,
  onImport,
}: ImportDialogProps<T>) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [tahap, setTahap] = useState<Tahap>({ jenis: "pilih" });
  const [error, setError] = useState("");
  const [memproses, setMemproses] = useState(false);
  const [seret, setSeret] = useState(false);

  function tutup(next: boolean) {
    onOpenChange(next);
    if (!next) {
      setTahap({ jenis: "pilih" });
      setError("");
    }
  }

  async function prosesFile(file: File | undefined) {
    if (!file) return;
    if (!/\.(xlsx|xls|csv)$/i.test(file.name)) {
      setError("Gunakan file Excel (.xlsx, .xls) atau .csv.");
      return;
    }
    if (file.size > MAKS_UKURAN) {
      setError("Ukuran file maksimal 5 MB.");
      return;
    }
    setError("");
    setMemproses(true);
    try {
      const hasilBaca = await bacaFile(file, kolom);
      if ("error" in hasilBaca) {
        setError(hasilBaca.error);
        return;
      }
      setTahap({ jenis: "pratinjau", namaFile: file.name, hasil: validasi(hasilBaca.baris) });
    } finally {
      setMemproses(false);
    }
  }

  const hasil = tahap.jenis === "pratinjau" ? (tahap.hasil as HasilValidasi<T>[]) : [];
  const valid = hasil.filter((h): h is HasilValidasi<T> & { data: T } => h.data !== undefined);
  const gagal = hasil.filter((h) => h.error);

  function tambahkan() {
    if (valid.length === 0) return;
    onImport(valid.map((h) => h.data));
    setTahap({ jenis: "selesai", jumlah: valid.length });
  }

  return (
    <Dialog open={open} onOpenChange={tutup}>
      <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Import Data {namaData.charAt(0).toUpperCase() + namaData.slice(1)} dari Excel</DialogTitle>
          <p className="text-xs text-slate-500">
            Tambahkan banyak data {namaData} sekaligus menggunakan template Excel.
          </p>
        </DialogHeader>

        {tahap.jenis === "pilih" && (
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3 rounded-lg border border-slate-200 p-3.5">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-700">
                1
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-900">Unduh template</p>
                <p className="text-xs text-slate-500">
                  Berisi judul kolom, 1 baris contoh, dan sheet &ldquo;Petunjuk&rdquo; untuk setiap kolom.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => void unduhTemplate(namaTemplate, kolom, catatan)}
              >
                <Download className="size-3.5" />
                Template
              </Button>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-slate-200 p-3.5">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-700">
                2
              </span>
              <div>
                <p className="text-sm font-medium text-slate-900">Isi atau tempel data Anda</p>
                <p className="text-xs text-slate-500">
                  Salin daftar yang sudah ada ke sheet &ldquo;Data&rdquo; sesuai urutan kolom.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="mt-3.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-700">
                3
              </span>
              <label
                onDragOver={(e) => {
                  e.preventDefault();
                  setSeret(true);
                }}
                onDragLeave={() => setSeret(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setSeret(false);
                  void prosesFile(e.dataTransfer.files[0]);
                }}
                className={cn(
                  "flex flex-1 cursor-pointer flex-col items-center gap-1.5 rounded-lg border border-dashed px-4 py-7 text-center transition-colors",
                  seret ? "border-blue-400 bg-blue-50" : "border-slate-300 hover:border-blue-300 hover:bg-blue-50/50",
                )}
              >
                {memproses ? (
                  <Loader2 className="size-6 animate-spin text-blue-600" />
                ) : (
                  <Upload className="size-6 text-slate-400" />
                )}
                <span className="text-sm font-medium text-slate-700">
                  {memproses ? "Membaca file..." : "Klik atau seret file ke sini"}
                </span>
                <span className="text-xs text-slate-500">.xlsx, .xls, atau .csv &bull; maksimal 5 MB</span>
                <input
                  ref={inputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="sr-only"
                  disabled={memproses}
                  onChange={(e) => {
                    void prosesFile(e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
              </label>
            </div>

            {error && <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>}
          </div>
        )}

        {tahap.jenis === "pratinjau" && (
          <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
            <p className="flex items-center gap-1.5 text-xs text-slate-500">
              <FileSpreadsheet className="size-3.5" />
              {tahap.namaFile} &bull; {hasil.length} baris terbaca
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-emerald-50 p-3">
                <p className="text-2xl font-semibold text-emerald-700">{valid.length}</p>
                <p className="text-xs text-emerald-700">Siap ditambahkan</p>
              </div>
              <div className={cn("rounded-lg p-3", gagal.length ? "bg-rose-50" : "bg-slate-50")}>
                <p className={cn("text-2xl font-semibold", gagal.length ? "text-rose-700" : "text-slate-400")}>
                  {gagal.length}
                </p>
                <p className={cn("text-xs", gagal.length ? "text-rose-700" : "text-slate-500")}>
                  Bermasalah (akan dilewati)
                </p>
              </div>
            </div>

            {gagal.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-900">Perlu diperbaiki</p>
                <ul className="mt-1.5 max-h-48 divide-y divide-slate-100 overflow-y-auto rounded-lg border border-slate-200 text-xs">
                  {gagal.map((h) => (
                    <li key={h.nomor} className="flex gap-2 px-3 py-2">
                      <CircleAlert className="mt-px size-3.5 shrink-0 text-rose-500" />
                      <span>
                        <span className="font-medium text-slate-900">Baris {h.nomor}:</span>{" "}
                        <span className="text-slate-600">{h.error}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {valid.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-900">Data yang akan ditambahkan</p>
                <ul className="mt-1.5 max-h-40 divide-y divide-slate-100 overflow-y-auto rounded-lg border border-slate-200 text-xs">
                  {valid.map((h) => (
                    <li key={h.nomor} className="flex gap-2 px-3 py-2">
                      <CircleCheck className="mt-px size-3.5 shrink-0 text-emerald-500" />
                      <span className="text-slate-700">{label(h.data)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {tahap.jenis === "selesai" && (
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <CircleCheck className="size-10 text-emerald-500" />
            <p className="text-sm font-semibold text-slate-900">
              {tahap.jumlah} data {namaData} berhasil ditambahkan
            </p>
            <p className="text-xs text-slate-500">Data baru sudah muncul di daftar.</p>
          </div>
        )}

        <DialogFooter>
          {tahap.jenis === "pilih" && (
            <Button variant="outline" onClick={() => tutup(false)}>
              Batal
            </Button>
          )}
          {tahap.jenis === "pratinjau" && (
            <>
              <Button variant="outline" onClick={() => setTahap({ jenis: "pilih" })}>
                Pilih File Lain
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700" disabled={valid.length === 0} onClick={tambahkan}>
                Tambahkan {valid.length} Data
              </Button>
            </>
          )}
          {tahap.jenis === "selesai" && (
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => tutup(false)}>
              Selesai
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
