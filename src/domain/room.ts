// Room catalog types. Pure data shapes, no logic.
export type Equipment = 'projector' | 'whiteboard' | 'microphone' | 'computers' | 'video';
export type Booking = { readonly start: number; readonly end: number };
export type Room = {
  readonly id: string;
  readonly name: string;
  readonly capacity: number;
  readonly equipment: readonly Equipment[];
  readonly blocked: boolean;
  readonly bookings: readonly Booking[];
};
export type Result = { available: boolean; message: string };
