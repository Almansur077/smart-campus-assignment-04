// Time constants and formatting shared by rules and UI (single source of truth).
import type { Booking } from './room';

export const MAX_MINUTES = 120;
export const DAY_MINUTES = 1440;

export function formatTime(minutes: number): string {
  if (minutes === DAY_MINUTES) return '24:00';
  const m = ((minutes % DAY_MINUTES) + DAY_MINUTES) % DAY_MINUTES;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

/** "600–660" */
export function rangeMinutes(b: Booking): string {
  return `${b.start}–${b.end}`;
}

/** "10:00–11:00" */
export function rangeClock(b: Booking): string {
  return `${formatTime(b.start)}–${formatTime(b.end)}`;
}
