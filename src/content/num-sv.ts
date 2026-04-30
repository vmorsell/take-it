// Avanza renders prices in Swedish locale: comma decimal, NBSP thousands
// separator. parseSv strips both and returns a normal number; formatSv
// turns one back. We intentionally avoid Intl.NumberFormat for parsing —
// it can't reverse-format reliably across locales.
const NBSP = " ";
const NARROW_NBSP = " ";

export function parseSv(input: string | null | undefined): number | null {
  if (input == null) return null;
  const cleaned = input
    .replace(/\s|[  ]/g, "")
    .replace(",", ".");
  if (cleaned === "") return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

export function formatSv(value: number, decimals: number): string {
  if (!Number.isFinite(value)) return "";
  return value.toFixed(decimals).replace(".", ",");
}

export function decimalsOfSv(input: string | null | undefined): number | null {
  if (input == null) return null;
  const cleaned = input.replace(/\s|[  ]/g, "");
  const idx = cleaned.indexOf(",");
  if (idx === -1) return 0;
  return cleaned.length - idx - 1;
}

// Re-exported only so the constants are available if a caller wants to
// build a regex against the same whitespace family.
export const SV_WHITESPACE = [" ", NBSP, NARROW_NBSP];
