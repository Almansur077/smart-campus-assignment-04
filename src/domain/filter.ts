// Pure room filtering (F1, F2, F4). Returns a new array; never mutates the catalog.
import type { Equipment, Room } from './room';

export type RoomCriteria = { attendees: number; equipment: readonly Equipment[] };

export function meetsCapacity(room: Room, attendees: number): boolean {
  return room.capacity >= attendees; // F1: exact capacity is enough
}

export function hasAllEquipment(room: Room, required: readonly Equipment[]): boolean {
  return required.every((item) => room.equipment.includes(item)); // F2: ALL items
}

export function filterRooms(rooms: readonly Room[], criteria: RoomCriteria): Room[] {
  return rooms.filter((r) => meetsCapacity(r, criteria.attendees) && hasAllEquipment(r, criteria.equipment));
}
