// Pure booking rule (AC1-AC5) for ONE chosen room. No React, no I/O, never mutates inputs.
import type { Booking, Result, Room } from './room';
import { DAY_MINUTES, MAX_MINUTES, formatTime, rangeClock, rangeMinutes } from './time';

function isWholeMinute(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && Number.isInteger(value);
}

export function overlaps(start: number, end: number, booking: Booking): boolean {
  return start < booking.end && end > booking.start; // half-open [start, end)
}

export function checkAvailability(room: Room, now: number, start: number | null, end: number | null): Result {
  if (!isWholeMinute(start) || !isWholeMinute(end)) {
    return { available: false, message: 'Start and end must be whole-number minutes (integers).' };
  }
  if (start < 0 || end > DAY_MINUTES) {
    return { available: false, message: 'Times must be within the same day: 0 to 1440 minutes.' };
  }
  if (start >= end) {
    return start === end
      ? { available: false, message: 'Start and end must be different times.' }
      : { available: false, message: 'Start must be earlier than end (reversed times are not allowed).' };
  }
  if (start <= now) {
    return { available: false, message: `Start must be later than the current time (${now} min = ${formatTime(now)}).` };
  }
  const duration = end - start;
  if (duration > MAX_MINUTES) {
    return {
      available: false,
      message: `Maximum booking length is ${MAX_MINUTES} minutes; this request is ${duration} minutes.`,
    };
  }
  if (room.blocked) {
    return { available: false, message: `Room ${room.id} is blocked (demo) and cannot be used.` };
  }
  const clash = room.bookings.find((b) => overlaps(start, end, b));
  if (clash) {
    return {
      available: false,
      message: `Overlaps an existing booking (${rangeMinutes(clash)} min = ${rangeClock(clash)}).`,
    };
  }
  return { available: true, message: `Room ${room.id} is available for this time.` };
}
