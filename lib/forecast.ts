// Regresi linear sederhana (ordinary least squares) dengan x = urutan periode (0, 1, 2, ...).
// Cocok untuk deret tahunan yang pendek; tidak menangkap pola musiman atau non-linear.
export function linearRegression(values: number[]) {
  const n = values.length;
  const meanX = (n - 1) / 2;
  const meanY = values.reduce((acc, y) => acc + y, 0) / n;

  let sxy = 0;
  let sxx = 0;
  values.forEach((y, x) => {
    sxy += (x - meanX) * (y - meanY);
    sxx += (x - meanX) ** 2;
  });

  const slope = sxx === 0 ? 0 : sxy / sxx;
  const intercept = meanY - slope * meanX;
  const predict = (x: number) => intercept + slope * x;

  // R² menunjukkan seberapa baik garis lurus menjelaskan data historis (1 = sempurna).
  const ssTot = values.reduce((acc, y) => acc + (y - meanY) ** 2, 0);
  const ssRes = values.reduce((acc, y, x) => acc + (y - predict(x)) ** 2, 0);
  const r2 = ssTot === 0 ? 1 : 1 - ssRes / ssTot;

  return { slope, intercept, r2, predict };
}

// "2024/2025" -> "2025/2026"
export function nextTahunAjaran(label: string, step = 1) {
  const [awal, akhir] = label.split("/").map(Number);
  return `${awal + step}/${akhir + step}`;
}
