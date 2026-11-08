// Presentational components. No business rules here.
import type { ReactNode } from 'react';
import { CircleCheck, CircleX, SearchX, Users } from 'lucide-react';
import type { Equipment, Result, Room } from '../domain/room';
import { EQUIPMENT_LABELS } from '../data/rooms';

export function InfoRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg bg-white/5 p-3 ring-1 ring-white/10">
      <span className="mt-0.5 text-teal-300">{icon}</span>
      <div className="min-w-0">
        <div className="text-xs font-medium uppercase tracking-wide text-slate-300">{label}</div>
        <div className="break-words text-sm text-white">{value}</div>
      </div>
    </div>
  );
}

/** One reusable minutes input (replaces the two copy-pasted start/end blocks). */
export function MinuteInput({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-semibold text-slate-800">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type="number"
        inputMode="numeric"
        min={0}
        max={1440}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-base text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/40"
      />
    </div>
  );
}

export function ResultBanner({ result, roomLabel }: { result: Result; roomLabel: string }) {
  return (
    <div
      role="status"
      aria-label={roomLabel}
      aria-live="polite"
      className={`mt-1 flex items-start gap-3 rounded-xl p-4 ring-1 ${
        result.available ? 'bg-emerald-50 ring-emerald-200 text-emerald-900' : 'bg-rose-50 ring-rose-200 text-rose-900'
      }`}
    >
      {result.available ? (
        <CircleCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
      ) : (
        <CircleX className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
      )}
      <div>
        <div className="text-sm font-bold uppercase tracking-wide">{result.available ? 'Available' : 'Unavailable'}</div>
        <div className="mt-0.5 text-sm">{result.message}</div>
      </div>
    </div>
  );
}

export function RoomFilters({
  attendees,
  onAttendees,
  attendeesError,
  equipment,
  onToggle,
}: {
  attendees: string;
  onAttendees: (v: string) => void;
  attendeesError: boolean;
  equipment: readonly Equipment[];
  onToggle: (e: Equipment) => void;
}) {
  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="attendees" className="mb-1 block text-sm font-semibold text-slate-800">
          Attendees
        </label>
        <input
          id="attendees"
          type="number"
          inputMode="numeric"
          min={1}
          max={500}
          value={attendees}
          onChange={(e) => onAttendees(e.target.value)}
          aria-invalid={attendeesError}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-base text-slate-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/40"
        />
        {attendeesError && <p className="mt-1 text-xs text-rose-700">Enter a whole number of attendees from 1 to 500.</p>}
      </div>
      <fieldset>
        <legend className="mb-1 text-sm font-semibold text-slate-800">Required equipment</legend>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(EQUIPMENT_LABELS) as Equipment[]).map((item) => (
            <label key={item} className="flex cursor-pointer items-center gap-2 rounded-full border border-slate-300 bg-slate-50 px-3 py-1.5 text-sm text-slate-800">
              <input type="checkbox" checked={equipment.includes(item)} onChange={() => onToggle(item)} className="h-4 w-4" />
              {EQUIPMENT_LABELS[item]}
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}

export function RoomList({ rooms, selectedId, onSelect }: { rooms: readonly Room[]; selectedId: string | null; onSelect: (id: string) => void }) {
  if (rooms.length === 0) {
    return (
      <div data-testid="empty-state" className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-slate-700">
        <SearchX className="h-6 w-6 text-slate-400" />
        <p className="font-semibold">No rooms match your requirements</p>
        <p className="text-xs">Lower the number of attendees or remove some equipment.</p>
      </div>
    );
  }
  return (
    <div role="radiogroup" aria-label="Matching rooms" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {rooms.map((room) => {
        const selected = room.id === selectedId;
        return (
          <label
            key={room.id}
            className={`cursor-pointer rounded-xl border p-3 text-sm transition ${
              selected ? 'border-teal-600 bg-teal-50 ring-2 ring-teal-600/40' : 'border-slate-200 bg-white hover:border-teal-400'
            }`}
          >
            <input type="radio" name="room" value={room.id} checked={selected} onChange={() => onSelect(room.id)} className="sr-only" aria-label={`${room.id} ${room.name}`} />
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-slate-900">{room.id}</span>
              {room.blocked && <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-700">Blocked</span>}
            </div>
            <div className="text-slate-700">{room.name}</div>
            <div className="mt-1 flex items-center gap-1 text-xs text-slate-600">
              <Users className="h-3.5 w-3.5" /> {room.capacity} seats · {room.bookings.length} booking(s)
            </div>
            <div className="mt-1 text-xs text-slate-500">{room.equipment.map((e) => EQUIPMENT_LABELS[e]).join(', ')}</div>
          </label>
        );
      })}
    </div>
  );
}
