import { useState, type FormEvent } from 'react';
import { CalendarClock, Clock, DoorClosed, Info, ShieldAlert } from 'lucide-react';
import type { Equipment, Result, Room } from './domain/room';
import { checkAvailability } from './domain/availability';
import { filterRooms } from './domain/filter';
import { MAX_MINUTES, formatTime, rangeClock, rangeMinutes } from './domain/time';
import { DEMO_NOW, ROOMS } from './data/rooms';
import { parseAttendees, parseMinutes, validateRequired } from './ui/parse';
import { InfoRow, MinuteInput, ResultBanner, RoomFilters, RoomList } from './ui/components';

type Checked = { roomId: string; result: Result };

export default function App() {
  const [attendeesText, setAttendeesText] = useState('1');
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [selectedId, setSelectedId] = useState<string>('B-204');
  const [startText, setStartText] = useState('660');
  const [endText, setEndText] = useState('720');
  const [blocked, setBlocked] = useState(false);
  const [checked, setChecked] = useState<Checked | null>(null);

  const attendees = parseAttendees(attendeesText);
  const visible = attendees === null ? [] : filterRooms(ROOMS, { attendees, equipment });
  // If the selected room is filtered out, fall back to the first matching room.
  const room: Room | null = visible.find((r) => r.id === selectedId) ?? visible[0] ?? null;

  function run(target: Room): Checked {
    const missing = validateRequired(startText, endText);
    const result = missing
      ? { available: false, message: missing }
      : checkAvailability({ ...target, blocked: target.blocked || blocked }, DEMO_NOW, parseMinutes(startText), parseMinutes(endText));
    return { roomId: target.id, result };
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (room) setChecked(run(room));
  }

  // F5: switching rooms re-runs an existing check against the NEW room's own bookings.
  function selectRoom(id: string) {
    setSelectedId(id);
    const next = ROOMS.find((r) => r.id === id);
    if (checked && next) setChecked(run(next));
  }

  function toggleEquipment(item: Equipment) {
    setEquipment((prev) => (prev.includes(item) ? prev.filter((e) => e !== item) : [...prev, item]));
  }

  // A result is only shown for the room it was computed for (no stale result after filtering).
  const shown = checked && room && checked.roomId === room.id ? checked.result : null;
  const bookingList = room ? room.bookings.map((b) => `${rangeMinutes(b)} (${rangeClock(b)})`).join(', ') : '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1f44] via-[#0b2447] to-[#0a1f44] px-4 py-8 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-2xl">
        <header className="mb-6 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-teal-500/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-teal-300 ring-1 ring-teal-400/30">
            <DoorClosed className="h-4 w-4" />
            Smart Campus
          </div>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">Room Availability Checker</h1>
          <p className="mt-2 text-sm text-slate-300">Filter the room catalog, pick a room, check a time — no booking is created.</p>
        </header>

        <section aria-label="Find a room" className="mb-6 space-y-4 rounded-2xl bg-white p-5 text-slate-900 shadow-xl sm:p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-teal-700">1. Find a room</h2>
          <RoomFilters
            attendees={attendeesText}
            onAttendees={setAttendeesText}
            attendeesError={attendees === null}
            equipment={equipment}
            onToggle={toggleEquipment}
          />
          <p data-testid="match-count" className="text-xs text-slate-600">
            {visible.length} of {ROOMS.length} rooms match
          </p>
          <RoomList rooms={visible} selectedId={room?.id ?? null} onSelect={selectRoom} />
        </section>

        {room && (
          <section className="mb-6 rounded-2xl bg-[#0e2a57] p-5 ring-1 ring-white/10 shadow-xl">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-teal-300">Room info</h2>
            <div className="space-y-2">
              <InfoRow icon={<DoorClosed className="h-4 w-4" />} label="Room" value={`${room.id} · ${room.name} · ${room.capacity} seats`} />
              <InfoRow icon={<Clock className="h-4 w-4" />} label="Current demo time" value={`${DEMO_NOW} min = ${formatTime(DEMO_NOW)}`} />
              <InfoRow icon={<CalendarClock className="h-4 w-4" />} label="Existing bookings" value={bookingList || 'None'} />
            </div>
          </section>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-5 rounded-2xl bg-white p-5 text-slate-900 shadow-xl sm:p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-teal-700">2. Check a time {room ? `for ${room.id}` : ''}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <MinuteInput id="start" label="Start (minutes after midnight)" value={startText} onChange={setStartText} />
            <MinuteInput id="end" label="End (minutes after midnight)" value={endText} onChange={setEndText} />
          </div>

          <p className="rounded-lg bg-slate-100 p-3 text-xs text-slate-600">
            Reference: <strong>660</strong> = 11:00, <strong>720</strong> = 12:00, <strong>1440</strong> = 24:00. Maximum
            length is {MAX_MINUTES} minutes.
          </p>

          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm font-medium text-slate-800">
            <input
              type="checkbox"
              checked={blocked}
              onChange={(e) => setBlocked(e.target.checked)}
              className="h-4 w-4 rounded border-slate-400 text-teal-600 focus:ring-2 focus:ring-teal-600/50"
            />
            Room blocked (demo)
          </label>

          <button
            type="submit"
            disabled={!room}
            className="w-full rounded-lg bg-teal-600 px-4 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2 focus:ring-offset-white disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            Check availability
          </button>

          <p className="flex items-center justify-center gap-2 text-center text-xs text-slate-500">
            <Info className="h-3.5 w-3.5" />
            Availability check only. No booking is created.
          </p>

          {shown && room && <ResultBanner result={shown} roomLabel={`Checked room ${room.id}`} />}
        </form>

        <footer className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-slate-400">
          <ShieldAlert className="h-3.5 w-3.5" />
          Local demo data only. No login, backend, or external APIs.
        </footer>
      </div>
    </div>
  );
}
