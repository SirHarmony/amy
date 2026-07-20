const DATE_STORAGE_KEY = "amy.selectedDate";

export function saveSelectedDate(value: string) {
  if (typeof window === "undefined") return;
  const normalized = normalizeDateLabel(value);
  if (!normalized) return;
  sessionStorage.setItem(DATE_STORAGE_KEY, normalized);
}

export function readSelectedDate(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(DATE_STORAGE_KEY);
}

/** Prefer YYYY-MM-DD for the confirmation strip. */
export function normalizeDateLabel(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return trimmed;

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function pickDateFromSearchParams(params: URLSearchParams): string | null {
  const candidates = [
    params.get("event_start_time"),
    params.get("invitee_start_time"),
    params.get("date"),
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;
    const normalized = normalizeDateLabel(candidate);
    if (normalized) return normalized;
  }

  return null;
}
