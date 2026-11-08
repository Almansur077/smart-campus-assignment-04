import { describe, expect, it } from 'vitest';
import { checkAvailability } from './availability';
import { ROOMS, DEMO_NOW } from '../data/rooms';
import type { Room } from './room';

const byId = (id: string) => ROOMS.find((r) => r.id === id) as Room;
const B204 = byId('B-204');
const C310 = byId('C-310');

describe('AC1-AC5 regression on the domain rule', () => {
  it('A01 AC1 start before now is rejected', () => {
    expect(checkAvailability(B204, DEMO_NOW, 500, 560).available).toBe(false);
  });
  it('A02 AC1 reversed interval is rejected', () => {
    expect(checkAvailability(B204, DEMO_NOW, 720, 700).message).toMatch(/reversed/);
  });
  it('A03 AC1 non-integer and out-of-day times are rejected', () => {
    expect(checkAvailability(B204, DEMO_NOW, 700.5, 720).available).toBe(false);
    expect(checkAvailability(B204, DEMO_NOW, 1400, 1441).available).toBe(false);
  });
  it('A04 AC2 boundary: exactly 120 min allowed, 121 rejected', () => {
    expect(checkAvailability(B204, DEMO_NOW, 720, 840).available).toBe(true);
    expect(checkAvailability(B204, DEMO_NOW, 720, 841).message).toBe(
      'Maximum booking length is 120 minutes; this request is 121 minutes.',
    );
  });
  it('A05 AC3 blocked room is rejected', () => {
    expect(checkAvailability({ ...B204, blocked: true }, DEMO_NOW, 700, 720).message).toBe(
      'Room B-204 is blocked (demo) and cannot be used.',
    );
  });
  it('A06 AC4 boundary: touching is allowed, overlapping by 1 minute is rejected', () => {
    expect(checkAvailability(B204, DEMO_NOW, 660, 720).available).toBe(true); // touches end 660
    expect(checkAvailability(B204, DEMO_NOW, 550, 600).available).toBe(true); // touches start 600
    expect(checkAvailability(B204, DEMO_NOW, 659, 720).available).toBe(false);
    expect(checkAvailability(B204, DEMO_NOW, 550, 601).available).toBe(false);
  });
  it('A07 AC5 checking does not mutate the frozen catalog and repeats the same answer', () => {
    const before = JSON.stringify(ROOMS);
    const a = checkAvailability(B204, DEMO_NOW, 630, 690);
    const b = checkAvailability(B204, DEMO_NOW, 630, 690);
    expect(a).toEqual(b);
    expect(JSON.stringify(ROOMS)).toBe(before);
    expect(Object.isFrozen(B204.bookings)).toBe(true);
  });
  it('A08 uses the chosen room bookings, not another room data', () => {
    expect(checkAvailability(B204, DEMO_NOW, 660, 720).available).toBe(true);
    expect(checkAvailability(C310, DEMO_NOW, 660, 720).message).toBe(
      'Overlaps an existing booking (660–720 min = 11:00–12:00).',
    );
  });
});
