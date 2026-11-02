"use client";

import { useState, useTransition } from "react";
import { CircleAlert, X } from "lucide-react";

export type HasilAksi = { error?: string; success?: string };

// Menjalankan server action lalu memanggil onSukses hanya bila server berhasil menyimpan,
// sehingga tampilan tidak pernah menunjukkan perubahan yang gagal tersimpan ke database.
export function useAksi() {
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function jalankan<T extends HasilAksi>(aksi: () => Promise<T>, onSukses?: (hasil: T) => void) {
    setError("");
    startTransition(async () => {
      try {
        const hasil = await aksi();
        if (hasil.error) setError(hasil.error);
        else onSukses?.(hasil);
      } catch {
        setError("Gagal terhubung ke server. Periksa koneksi lalu coba lagi.");
      }
    });
  }

  return { jalankan, error, tutupError: () => setError(""), isPending };
}

// Pesan error melayang di atas dialog, agar tetap terlihat saat dialog terbuka.
export function AksiError({ pesan, onClose }: { pesan: string; onClose: () => void }) {
  if (!pesan) return null;
  return (
    <div
      role="alert"
      className="fixed top-4 right-4 z-[100] flex max-w-sm items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700 shadow-lg"
    >
      <CircleAlert className="mt-0.5 size-4 shrink-0" />
      <p className="flex-1">{pesan}</p>
      <button type="button" onClick={onClose} aria-label="Tutup" className="text-rose-500 hover:text-rose-700">
        <X className="size-4" />
      </button>
    </div>
  );
}
