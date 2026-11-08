// Fictional demo catalog and fixed demo clock. Deep-frozen: read-only (AC5).
import type { Equipment, Room } from '../domain/room';

export const DEMO_NOW = 540; // 09:00

export const EQUIPMENT_LABELS: Record<Equipment, string> = {
  projector: 'Projector',
  whiteboard: 'Whiteboard',
  microphone: 'Microphone',
  computers: 'Computers',
  video: 'Video conferencing',
};

function freezeRoom(room: Room): Room {
  return Object.freeze({
    ...room,
    equipment: Object.freeze([...room.equipment]),
    bookings: Object.freeze(room.bookings.map((b) => Object.freeze({ ...b }))),
  });
}

export const ROOMS: readonly Room[] = Object.freeze(
  [
    { id: 'B-204', name: 'Seminar Room', capacity: 30, equipment: ['projector', 'whiteboard'], blocked: false, bookings: [{ start: 600, end: 660 }] },
    { id: 'A-101', name: 'Lecture Hall', capacity: 120, equipment: ['projector', 'microphone', 'whiteboard'], blocked: false, bookings: [{ start: 720, end: 840 }] },
    { id: 'C-310', name: 'Computer Lab', capacity: 24, equipment: ['computers', 'projector'], blocked: false, bookings: [{ start: 660, end: 720 }] },
    { id: 'D-015', name: 'Meeting Room', capacity: 8, equipment: ['video', 'whiteboard'], blocked: false, bookings: [] },
    { id: 'E-120', name: 'Media Studio', capacity: 12, equipment: ['microphone', 'video', 'projector'], blocked: true, bookings: [{ start: 900, end: 960 }] },
  ].map((r) => freezeRoom(r as Room)),
);
