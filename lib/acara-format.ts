// Konversi tanggal acara (ISO dengan zona WIB) ke/dari nilai input <input type="datetime-local">.

const partsFormatter = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
  timeZone: "Asia/Jakarta",
});

// "2026-11-14T09:00:00+07:00" → "2026-11-14T09:00" (dalam WIB).
export function isoToInputWib(iso: string) {
  const parts = Object.fromEntries(
    partsFormatter.formatToParts(new Date(iso)).map((p) => [p.type, p.value]),
  );
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

// "2026-11-14T09:00" (diisi dalam WIB) → "2026-11-14T09:00:00+07:00".
export function inputWibToIso(value: string) {
  return `${value}:00+07:00`;
}

export const tanggalAcaraFormatter = new Intl.DateTimeFormat("id-ID", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Jakarta",
});

export const tanggalAcaraSingkat = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Jakarta",
});
