import "server-only";

import { acaraList, pendaftarPortalAwal, type AcaraAlumni } from "@/data/acara";

// Penyimpanan acara di memori server untuk MVP: perubahan dari admin langsung terlihat di portal
// alumni (lintas sesi/browser), tetapi kembali ke data awal saat server di-restart.
// Disimpan di globalThis agar tetap satu salinan walau modul dimuat ulang saat development.

export type AcaraTersimpan = AcaraAlumni & {
  // NIK alumni yang mendaftar lewat portal.
  pesertaNik: string[];
};

// Naikkan angka ini bila data awal di data/acara.ts diubah, agar server yang sedang berjalan
// memuat ulang data awal tanpa perlu di-restart.
const VERSI_DATA_AWAL = 2;

const globalStore = globalThis as unknown as {
  __acaraStore?: { versi: number; data: AcaraTersimpan[] };
};

function store() {
  if (globalStore.__acaraStore?.versi !== VERSI_DATA_AWAL) {
    globalStore.__acaraStore = {
      versi: VERSI_DATA_AWAL,
      data: acaraList.map((ev) => ({ ...ev, pesertaNik: [...(pendaftarPortalAwal[ev.id] ?? [])] })),
    };
  }
  return globalStore.__acaraStore.data;
}

export function totalPeserta(ev: AcaraTersimpan) {
  return ev.terdaftar + ev.pesertaNik.length;
}

export function listAcara() {
  return [...store()].sort((x, y) => x.tanggal.localeCompare(y.tanggal));
}

export function findAcara(id: string) {
  return store().find((ev) => ev.id === id);
}

function nextId() {
  const max = store().reduce((acc, ev) => Math.max(acc, Number(ev.id.replace(/\D/g, "")) || 0), 0);
  return `ACR-${String(max + 1).padStart(3, "0")}`;
}

export type AcaraInput = Omit<AcaraAlumni, "id" | "terdaftar">;

export function createAcara(input: AcaraInput) {
  const acara: AcaraTersimpan = { ...input, id: nextId(), terdaftar: 0, pesertaNik: [] };
  store().push(acara);
  return acara;
}

export function updateAcara(id: string, input: AcaraInput) {
  const acara = findAcara(id);
  if (!acara) return null;
  Object.assign(acara, input);
  return acara;
}

export function deleteAcara(id: string) {
  const list = store();
  const index = list.findIndex((ev) => ev.id === id);
  if (index === -1) return false;
  list.splice(index, 1);
  return true;
}

export type HasilPendaftaran = { error: string } | { ikut: boolean; acara: AcaraTersimpan };

// Mendaftar bila belum terdaftar, membatalkan bila sudah. Mengembalikan status terbaru.
export function togglePendaftaran(id: string, nik: string): HasilPendaftaran {
  const acara = findAcara(id);
  if (!acara) return { error: "Acara tidak ditemukan." };
  if (acara.pesertaNik.includes(nik)) {
    acara.pesertaNik = acara.pesertaNik.filter((p) => p !== nik);
    return { ikut: false, acara };
  }
  if (totalPeserta(acara) >= acara.kuota) return { error: "Kuota acara sudah penuh." };
  acara.pesertaNik = [...acara.pesertaNik, nik];
  return { ikut: true, acara };
}
