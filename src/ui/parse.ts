// Form-text parsing used by the UI (one place instead of duplicated parseInt/NaN code).
export function validateRequired(start: string, end: string): string | null {
  if (start.trim() === '') return 'Start is required.';
  if (end.trim() === '') return 'End is required.';
  return null;
}

export function parseMinutes(text: string): number | null {
  const n = Number.parseInt(text, 10);
  return Number.isNaN(n) ? null : n;
}

/** Attendees must be a whole number from 1 to 500; otherwise null (invalid). */
export function parseAttendees(text: string): number | null {
  if (!/^\d+$/.test(text.trim())) return null;
  const n = Number(text.trim());
  return n >= 1 && n <= 500 ? n : null;
}
