"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Compass,
  GraduationCap,
  Info,
  RotateCcw,
} from "lucide-react";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { cn } from "@/lib/utils";
import { useAlumniStore } from "@/components/alumni/alumni-store";
import { usePortal } from "@/components/alumni-portal/portal-store";
import { Card } from "@/components/alumni-portal/shared";
import { NotificationBell } from "@/components/alumni-portal/notification-bell";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import type { PerguruanTinggi } from "@/data/perguruan-tinggi";
import {
  kelompokJurusan,
  pertanyaanMinat,
  riasecInfo,
  riasecOrder,
  skalaJawaban,
} from "@/data/riasec";
import {
  BOBOT_JURUSAN,
  BOBOT_MINAT,
  cariKelompokJurusan,
  kodeHolland,
  profilRata,
  rekomendasiKarier,
  skorRiasec,
} from "@/lib/career-finder";

const PER_HALAMAN = 6;
const JUMLAH_HALAMAN = Math.ceil(pertanyaanMinat.length / PER_HALAMAN);

type Tahap = "intro" | "tes" | "hasil";

const persen = (nilai: number) => Math.round(nilai * 100);

function ScoreBar({ label, nilai, warna }: { label: string; nilai: number; warna: string }) {
  return (
    <div>
      <div className="flex justify-between text-[11px] text-slate-500">
        <span>{label}</span>
        <span>{persen(nilai)}%</span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full" style={{ width: `${persen(nilai)}%`, background: warna }} />
      </div>
    </div>
  );
}

export function CareerFinder({ perguruanTinggi }: { perguruanTinggi: PerguruanTinggi[] }) {
  const { account } = usePortal();
  const [alumniList] = useAlumniStore();
  const saya = alumniList.find((a) => a.nik === account.alumniNik);
  const programStudi = saya?.programStudi ?? "";
  const namaPT = perguruanTinggi.find((pt) => pt.id === saya?.perguruanTinggiId)?.nama;
  // Jurusan selalu mengikuti data profil alumni dan tidak bisa diganti dari halaman ini.
  const jurusan = cariKelompokJurusan(programStudi);

  const [tahap, setTahap] = useState<Tahap>("intro");
  const [halaman, setHalaman] = useState(0);
  const [jawaban, setJawaban] = useState<Record<number, number>>({});
  const pertanyaanHalaman = pertanyaanMinat.slice(halaman * PER_HALAMAN, (halaman + 1) * PER_HALAMAN);
  const terjawab = Object.keys(jawaban).length;
  const halamanLengkap = pertanyaanHalaman.every((p) => jawaban[p.id] !== undefined);

  const hasil = useMemo(() => {
    if (tahap !== "hasil") return null;
    const skor = skorRiasec(jawaban);
    return {
      skor,
      kode: kodeHolland(skor),
      rata: profilRata(skor),
      rekomendasi: rekomendasiKarier(skor, jurusan),
    };
  }, [tahap, jawaban, jurusan]);

  function pindahHalaman(ke: number) {
    setHalaman(ke);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function lanjut() {
    if (halaman < JUMLAH_HALAMAN - 1) pindahHalaman(halaman + 1);
    else {
      setTahap("hasil");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function ulangi() {
    setJawaban({});
    setHalaman(0);
    setTahap("intro");
  }

  return (
    <>
      <Header title="Career Finder" actions={<NotificationBell />} />

      <main className="flex-1 p-6">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
          {tahap === "intro" && (
            <>
              <Card>
                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <Compass className="size-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-slate-900">Temukan karier yang cocok untukmu</h2>
                    <p className="mt-1 text-sm text-slate-600">
                      Jawab {pertanyaanMinat.length} pertanyaan tentang aktivitas yang kamu sukai. Tidak ada
                      jawaban benar atau salah. Cukup pilih seberapa suka kamu melakukan aktivitas tersebut.
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      Tes mengacu pada model minat Holland RIASEC yang juga dipakai O*NET Interest Profiler.
                      Hasil rekomendasi diprediksi menggunakan model machine learning nearest-neighbor yang
                      mencocokkan profil minat dan jurusanmu dengan profil karier, sehingga dapat menghasilkan
                      bias. Jadikan hasilnya sebagai bahan pertimbangan, bukan keputusan akhir. Waktu
                      pengerjaan sekitar 5 menit.
                    </p>
                  </div>
                </div>
              </Card>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {riasecOrder.map((t) => (
                  <div key={t} className="rounded-xl border border-black/5 bg-white p-3 shadow-sm">
                    <div className="flex items-center gap-2">
                      <span
                        className="flex size-7 items-center justify-center rounded-md text-sm font-bold text-white"
                        style={{ background: riasecInfo[t].warna }}
                      >
                        {t}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-slate-900">{riasecInfo[t].nama}</p>
                        <p className="text-[11px] text-slate-500">{riasecInfo[t].julukan}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Card
                title="Profil Kuliah"
                description="Jurusan dipakai untuk menyesuaikan rekomendasi dengan jalur studimu."
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2.5">
                    <GraduationCap className="size-5 shrink-0 text-slate-400" />
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        {programStudi || "Program studi belum diisi"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {namaPT ?? "Lengkapi di menu Profil Saya."}
                      </p>
                    </div>
                  </div>
                  {jurusan && (
                    <span className="self-start rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 sm:self-auto">
                      {jurusan.nama}
                    </span>
                  )}
                </div>
                {!jurusan && (
                  <p className="mt-3 text-xs text-amber-700">
                    {programStudi
                      ? `Program studi "${programStudi}" belum dikenali, jadi rekomendasi hanya berdasarkan minat.`
                      : "Rekomendasi hanya berdasarkan minat karena program studi belum diisi."}
                  </p>
                )}
              </Card>

              <div className="flex justify-end">
                <Button
                  size="lg"
                  className="gap-1.5 bg-blue-600 hover:bg-blue-700"
                  onClick={() => setTahap("tes")}
                >
                  Mulai Tes
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </>
          )}

          {tahap === "tes" && (
            <>
              <div className="rounded-xl border border-black/5 bg-white p-4 shadow-sm">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>
                    Bagian {halaman + 1} dari {JUMLAH_HALAMAN}
                  </span>
                  <span>
                    {terjawab} / {pertanyaanMinat.length} terjawab
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-blue-600 transition-[width]"
                    style={{ width: `${(terjawab / pertanyaanMinat.length) * 100}%` }}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {pertanyaanHalaman.map((p) => (
                  <div key={p.id} className="rounded-xl border border-black/5 bg-white p-4 shadow-sm">
                    <p className="text-sm font-medium text-slate-900">
                      <span className="mr-1.5 text-slate-400">{p.id}.</span>
                      {p.teks}
                    </p>
                    <div className="mt-3 grid grid-cols-5 gap-1.5" role="radiogroup" aria-label={p.teks}>
                      {skalaJawaban.map((s) => {
                        const dipilih = jawaban[p.id] === s.nilai;
                        return (
                          <button
                            key={s.nilai}
                            type="button"
                            role="radio"
                            aria-checked={dipilih}
                            onClick={() => setJawaban((prev) => ({ ...prev, [p.id]: s.nilai }))}
                            className={cn(
                              "flex flex-col items-center gap-1 rounded-lg border px-1 py-2 text-center transition-colors",
                              dipilih
                                ? "border-blue-600 bg-blue-50 text-blue-700"
                                : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50",
                            )}
                          >
                            <span className="text-sm font-semibold">{s.nilai}</span>
                            <span className="hidden text-[11px] leading-tight sm:block">{s.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-center text-[11px] text-slate-400 sm:hidden">
                1 = Sangat Tidak Suka • 3 = Ragu-ragu • 5 = Sangat Suka
              </p>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  size="lg"
                  className="gap-1.5"
                  onClick={() => (halaman === 0 ? setTahap("intro") : pindahHalaman(halaman - 1))}
                >
                  <ArrowLeft className="size-4" />
                  Kembali
                </Button>
                <Button
                  size="lg"
                  className="gap-1.5 bg-blue-600 hover:bg-blue-700"
                  disabled={!halamanLengkap}
                  onClick={lanjut}
                >
                  {halaman < JUMLAH_HALAMAN - 1 ? "Lanjut" : "Lihat Hasil"}
                  {halaman < JUMLAH_HALAMAN - 1 && <ArrowRight className="size-4" />}
                </Button>
              </div>
            </>
          )}

          {tahap === "hasil" && hasil && (
            <>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
                <Card title="Kode Holland Kamu" className="lg:col-span-2">
                  <div className="flex gap-2">
                    {hasil.kode.map((t) => (
                      <span
                        key={t}
                        className="flex size-12 items-center justify-center rounded-lg text-xl font-bold text-white"
                        style={{ background: riasecInfo[t].warna }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 flex flex-col gap-3">
                    {hasil.kode.map((t) => (
                      <div key={t}>
                        <p className="text-sm font-semibold text-slate-900">
                          {riasecInfo[t].nama}
                          <span className="font-normal text-slate-500">, {persen(hasil.skor[t])}%</span>
                        </p>
                        <p className="text-xs text-slate-600">{riasecInfo[t].deskripsi}</p>
                      </div>
                    ))}
                  </div>
                  {hasil.rata && (
                    <p className="mt-4 flex gap-1.5 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700">
                      <Info className="mt-0.5 size-3.5 shrink-0" />
                      Skor minatmu cukup merata di semua tipe, jadi rekomendasi kurang tajam. Coba ulangi
                      tes dan gunakan pilihan jawaban yang lebih beragam.
                    </p>
                  )}
                </Card>

                <Card title="Profil Minat RIASEC" className="lg:col-span-3">
                  <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart
                        data={riasecOrder.map((t) => ({
                          tipe: `${riasecInfo[t].nama} (${t})`,
                          skor: persen(hasil.skor[t]),
                        }))}
                        outerRadius="72%"
                      >
                        <PolarGrid stroke="#e2e8f0" />
                        <PolarAngleAxis dataKey="tipe" tick={{ fontSize: 11, fill: "#64748b" }} />
                        <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                        <Tooltip
                          contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid #e5e7eb" }}
                          formatter={(value) => [`${value}%`, "Skor"]}
                        />
                        <Radar dataKey="skor" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.3} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>

              <Card
                title="Rekomendasi Karier"
                description={
                  jurusan
                    ? `Gabungan ${persen(BOBOT_MINAT)}% kecocokan minat dan ${persen(BOBOT_JURUSAN)}% kecocokan dengan jurusan ${jurusan.nama}.`
                    : "Berdasarkan kecocokan minat saja karena jurusan belum dipilih."
                }
              >
                <div className="flex flex-col divide-y divide-slate-100">
                  {hasil.rekomendasi.map((r, i) => (
                    <div key={r.karier.id} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row">
                      <div className="flex flex-1 items-start gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-sm font-semibold text-slate-500">
                          {i + 1}
                        </div>
                        <div className="min-w-0">
                          <p className="flex flex-wrap items-center gap-1.5 text-sm font-semibold text-slate-900">
                            <BriefcaseBusiness className="size-4 text-slate-400" />
                            {r.karier.nama}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-600">{r.karier.deskripsi}</p>
                          <p className="mt-1 text-[11px] text-slate-400">
                            Kode minat: {kodeHolland(r.karier.profil).join("")}, Jurusan umum:{" "}
                            {r.karier.jurusan
                              .map((id) => kelompokJurusan.find((k) => k.id === id)?.nama)
                              .filter(Boolean)
                              .join(", ")}
                          </p>
                        </div>
                      </div>
                      <div className="flex w-full shrink-0 flex-col gap-1.5 sm:w-48">
                        <p className="text-right text-lg font-semibold text-blue-600">
                          {persen(r.skor)}%<span className="ml-1 text-xs font-normal text-slate-500">cocok</span>
                        </p>
                        <ScoreBar label="Minat" nilai={r.skorMinat} warna="#3b82f6" />
                        {r.skorJurusan !== null && (
                          <ScoreBar label="Jurusan" nilai={r.skorJurusan} warna="#22c55e" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[11px] text-slate-400">
                  Hasil ini adalah gambaran minat, bukan penilaian kemampuan. Diskusikan dengan guru BK atau
                  mentor alumni sebelum mengambil keputusan karier.
                </p>
                <Button variant="outline" size="lg" className="shrink-0 gap-1.5" onClick={ulangi}>
                  <RotateCcw className="size-4" />
                  Ulangi Tes
                </Button>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}
