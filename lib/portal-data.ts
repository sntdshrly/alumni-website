import "server-only";

import { alumniList, type Alumni } from "@/data/alumni";
import type { AcaraAlumni } from "@/data/acara";
import { listAcara, totalPeserta } from "@/lib/acara-store";
import { ceritaList } from "@/data/cerita";
import type { SessionAccount } from "@/lib/session";

// Data untuk portal alumni disaring di server sebelum dikirim ke browser, sehingga alumni
// hanya menerima data alumni dari sekolahnya sendiri dan hanya informasi yang memang dibagikan.

// Acara yang dikirim ke alumni: tanpa daftar peserta, hanya jumlah dan status pendaftaran sendiri.
export type AcaraPortal = AcaraAlumni & { totalPeserta: number; sayaIkut: boolean };

export function sekolahAlumni(account: SessionAccount) {
  return alumniList.find((a) => a.nik === account.alumniNik)?.sekolah ?? account.school;
}

// Versi publik profil alumni lain: NIK diganti id samaran, data internal sekolah dikosongkan,
// dan kontak hanya disertakan bila pemiliknya mengizinkan.
function profilPublik(a: Alumni, idSamaran: string): Alumni {
  return {
    ...a,
    nik: idSamaran,
    nisn: "",
    kelas: "",
    waliKelas: "",
    telepon: a.bagikanTelepon ? a.telepon : "",
    email: a.bagikanEmail ? a.email : "",
    linkedin: a.bagikanMediaSosial ? a.linkedin : "",
    instagram: a.bagikanMediaSosial ? a.instagram : "",
    tiktok: a.bagikanMediaSosial ? a.tiktok : "",
    terakhirDikonfirmasi: "",
    validasi: "Valid",
    pemeriksa: "",
    catatanValidasi: "",
  };
}

export function getPortalData(account: SessionAccount) {
  const sekolah = sekolahAlumni(account);
  const sesekolah = alumniList.filter((a) => a.sekolah === sekolah);

  // Id samaran berurutan per sekolah; NIK asli tidak pernah dikirim untuk alumni lain.
  const idByNik = new Map(sesekolah.map((a, i) => [a.nik, `ALM-${String(i + 1).padStart(3, "0")}`]));

  const alumni = sesekolah
    .filter((a) => a.nik === account.alumniNik || a.tampilDiJaringan)
    .map((a) => (a.nik === account.alumniNik ? a : profilPublik(a, idByNik.get(a.nik)!)));

  const cerita = ceritaList
    .filter((c) => idByNik.has(c.penulisNik))
    .map((c) =>
      c.penulisNik === account.alumniNik ? c : { ...c, penulisNik: idByNik.get(c.penulisNik)! },
    );

  return { sekolah, alumni, cerita };
}

export function getAcaraPortal(account: SessionAccount): AcaraPortal[] {
  const sekolah = sekolahAlumni(account);
  return listAcara()
    .filter((ev) => ev.sekolah === sekolah)
    .map(({ pesertaNik, ...ev }) => ({
      ...ev,
      totalPeserta: totalPeserta({ ...ev, pesertaNik }),
      sayaIkut: !!account.alumniNik && pesertaNik.includes(account.alumniNik),
    }));
}
