import { describe, expect, it } from 'vitest';
import { filterRooms, hasAllEquipment, meetsCapacity } from './filter';
import { checkAvailability } from './availability';
import { DEMO_NOW, ROOMS } from '../data/rooms';
import type { Room } from './room';

const ids = (rooms: Room[]) => rooms.map((r) => r.id);
const byId = (id: string) => ROOMS.find((r) => r.id === id) as Room;

describe('Room catalog and filtering F1-F5', () => {
  it('C01 catalog has at least four fictional rooms with all required fields and unique ids', () => {
    expect(ROOMS.length).toBeGreaterThanOrEqual(4);
    expect(new Set(ROOMS.map((r) => r.id)).size).toBe(ROOMS.length);
    for (const r of ROOMS) {
      expect(r).toEqual(expect.objectContaining({ id: expect.any(String), name: expect.any(String), capacity: expect.any(Number), blocked: expect.any(Boolean) }));
      expect(Array.isArray(r.equipment)).toBe(true);
      expect(Array.isArray(r.bookings)).toBe(true);
    }
  });
  it('F1a exact capacity is enough (30 attendees -> B-204 with 30 seats is included)', () => {
    expect(meetsCapacity(byId('B-204'), 30)).toBe(true);
    expect(ids(filterRooms(ROOMS, { attendees: 30, equipment: [] }))).toEqual(['B-204', 'A-101']);
  });
  it('F1b insufficient capacity is excluded (31 attendees -> B-204 removed)', () => {
    expect(meetsCapacity(byId('B-204'), 31)).toBe(false);
    expect(ids(filterRooms(ROOMS, { attendees: 31, equipment: [] }))).toEqual(['A-101']);
  });
  it('F2a room must contain ALL selected equipment, not just one', () => {
    expect(ids(filterRooms(ROOMS, { attendees: 1, equipment: ['projector', 'microphone'] }))).toEqual(['A-101', 'E-120']);
    expect(hasAllEquipment(byId('B-204'), ['projector', 'microphone'])).toBe(false);
  });
  it('F2b no equipment selected keeps every room that fits', () => {
    expect(filterRooms(ROOMS, { attendees: 1, equipment: [] })).toHaveLength(ROOMS.length);
  });
  it('F3 blocked room can be listed but is never reported as available', () => {
    const studio = byId('E-120');
    expect(studio.blocked).toBe(true);
    for (const [s, e] of [[600, 660], [700, 720], [1000, 1060]]) {
      expect(checkAvailability(studio, DEMO_NOW, s, e).available).toBe(false);
    }
  });
  it('F4 impossible requirements give an empty list (no crash)', () => {
    expect(filterRooms(ROOMS, { attendees: 121, equipment: [] })).toEqual([]);
    expect(filterRooms(ROOMS, { attendees: 1, equipment: ['computers', 'microphone'] })).toEqual([]);
  });
  it('F-immutability filtering returns a new array and leaves the catalog unchanged', () => {
    const before = JSON.stringify(ROOMS);
    const out = filterRooms(ROOMS, { attendees: 10, equipment: ['projector'] });
    expect(out).not.toBe(ROOMS);
    expect(JSON.stringify(ROOMS)).toBe(before);
  });
});
