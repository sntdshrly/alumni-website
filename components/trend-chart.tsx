"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { trendAlumni } from "@/data/dashboard";
import { linearRegression, nextTahunAjaran } from "@/lib/forecast";
import { Panel } from "@/components/panel";

// Jumlah periode ke depan yang diprediksi.
const FORECAST_PERIODS = 2;

type TrendRow = {
  year: string;
  jumlah?: number;
  persentase?: number;
  jumlahPrediksi?: number;
  persentasePrediksi?: number;
};

const modelJumlah = linearRegression(trendAlumni.map((d) => d.jumlah));
const modelPersentase = linearRegression(trendAlumni.map((d) => d.persentase));

const lastIndex = trendAlumni.length - 1;
const lastYear = trendAlumni[lastIndex].year;

const forecastRows: TrendRow[] = Array.from({ length: FORECAST_PERIODS }, (_, i) => {
  const x = lastIndex + 1 + i;
  return {
    year: nextTahunAjaran(lastYear, i + 1),
    jumlahPrediksi: Math.max(0, Math.round(modelJumlah.predict(x))),
    persentasePrediksi:
      Math.round(Math.min(100, Math.max(0, modelPersentase.predict(x))) * 10) / 10,
  };
});

const chartData: TrendRow[] = [
  ...trendAlumni.map((d, i) => ({
    ...d,
    // Titik terakhir data aktual ikut di garis prediksi agar garis putus-putus tersambung.
    persentasePrediksi: i === lastIndex ? d.persentase : undefined,
  })),
  ...forecastRows,
];

function TrendTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: TrendRow }[];
}) {
  const row = payload?.[0]?.payload;
  if (!active || !row) return null;
  const isForecast = row.jumlah === undefined;

  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-sm">
      <p className="font-semibold text-slate-900">
        {row.year}
        {isForecast && <span className="ml-1.5 font-normal text-slate-500">(prediksi)</span>}
      </p>
      <p className="mt-1 text-slate-600">
        Jumlah Alumni: {isForecast ? `±${row.jumlahPrediksi}` : row.jumlah}
      </p>
      <p className="text-slate-600">
        Persentase: {isForecast ? `±${row.persentasePrediksi}` : row.persentase}%
      </p>
    </div>
  );
}

export function TrendChart() {
  return (
    <Panel title="Tren Alumni Melanjutkan ke Perguruan Tinggi">
      <div className="flex h-full flex-col">
        <div className="min-h-[230px] w-full flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#eef0f3" />
              <ReferenceArea
                x1={forecastRows[0].year}
                x2={forecastRows[forecastRows.length - 1].year}
                fill="#e2e8f0"
                fillOpacity={0.9}
              />
              <XAxis
                dataKey="year"
                tick={{ fontSize: 11, fill: "#64748b" }}
                tickLine={false}
                axisLine={{ stroke: "#e5e7eb" }}
              />
              <YAxis tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} />
              <Tooltip content={<TrendTooltip />} />
              <Bar dataKey="jumlah" stackId="jumlah" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={28} />
              <Bar
                dataKey="jumlahPrediksi"
                stackId="jumlah"
                fill="#3b82f6"
                fillOpacity={0.3}
                stroke="#3b82f6"
                strokeDasharray="4 3"
                radius={[6, 6, 0, 0]}
                barSize={28}
              />
              <Line
                type="monotone"
                dataKey="persentase"
                stroke="#22c55e"
                strokeWidth={2}
                dot={{ r: 3, fill: "#22c55e" }}
              />
              <Line
                type="monotone"
                dataKey="persentasePrediksi"
                stroke="#22c55e"
                strokeWidth={2}
                strokeDasharray="5 4"
                dot={{ r: 3, fill: "#fff", stroke: "#22c55e" }}
                connectNulls
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-2 text-[11px] text-slate-500">
          Area abu-abu: prediksi {FORECAST_PERIODS} tahun ke depan dengan regresi linear
          (R² jumlah {Math.round(modelJumlah.r2 * 100)}%, persentase{" "}
          {Math.round(modelPersentase.r2 * 100)}%). Hasil prediksi dapat bias karena model hanya
          mengikuti tren data sebelumnya.
        </p>
      </div>
    </Panel>
  );
}
