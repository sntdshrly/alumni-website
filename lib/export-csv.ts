type CsvValue = string | number | null | undefined;

// Excel berlokal Indonesia memakai ";" sebagai pemisah kolom, jadi CSV dibuat dengan ";".
const SEPARATOR = ";";

function escapeCsv(value: CsvValue) {
  const text = String(value ?? "");
  return /[";\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function downloadCsv(filename: string, headers: string[], rows: CsvValue[][]) {
  const content = [headers, ...rows].map((row) => row.map(escapeCsv).join(SEPARATOR)).join("\r\n");
  // BOM agar karakter non-ASCII terbaca benar saat dibuka di Excel.
  const blob = new Blob(["﻿" + content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function reportFilename(name: string) {
  const now = new Date();
  const stamp = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
  return `laporan-${name}-${stamp}.csv`;
}
