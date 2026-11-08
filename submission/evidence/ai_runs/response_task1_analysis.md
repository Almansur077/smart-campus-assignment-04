<!-- session 605c3670-cc5e-4881-94ac-4a0e234ec910 | model claude-opus-5-5 | tools ['Task', 'CronCreate', 'CronDelete', 'CronList', 'DesignSync', 'EnterWorktree', 'ExitWorktree', 'Glob', 'Grep', 'ListAgents', 'NotebookEdit', 'PublishPlugin', 'PushNotification', 'Read', 'RemoteTrigger', 'ReportFindings', 'ScheduleWakeup', 'SendMessage', 'ShareOnboardingGuide', 'Skill', 'TaskStop', 'ToolSearch', 'WebSearch', 'Workflow'] -->
<!-- TOOL CALL: Read {"file_path": "/Users/almansurbajdildanov/Desktop/Assignment_04/smart-campus/src/App.tsx"} -->
<!-- result: success | turns 2 | 23715 ms -->

I read `src/App.tsx` and changed nothing.

## Maintainability risks

1. **Rule messages name a single room.** `checkAvailability` (`src/App.tsx:53`, `:63`) has "Room B-204" written into its messages, and so does the UI (`:136`, `:142`). With a catalog, every other room would get the wrong message.
2. **Two sources of truth for "blocked".** `DEMO_ROOM.blocked` (`:76`) sits alongside a separate `blocked` state (`:106`), and `:120` merges them with `{ ...room, blocked }`. The UI checkbox overrides the room data, which breaks F3 once rooms have their own blocked flag.
3. **The clock is stored per room.** `now` lives on `RoomState` (`:13`, `:75`), but it is the same for every room. A catalog would copy it into each room, and the copies could drift apart.
4. **Number parsing is too loose (affects AC1).** `handleSubmit` (`:116–119`) uses `parseInt`, so "660.5" becomes 660 and "660abc" becomes 660. Both then pass `isWholeMinute`. The integer check in `checkAvailability` only protects callers that skip this parsing.
5. **The result goes stale.** The result is only calculated on submit (`:107`, `:120`). Changing an input or the selected room leaves the old banner showing, so F5 isn't possible as written.
6. **Everything is in one file.** Types, rules, formatting, the fixture, validation and the UI share `src/App.tsx:12–243`. Nothing is exported, so the logic can only be tested through the UI. Constants are also repeated in the markup (`max={1440}` at `:164` and `:180`, the hardcoded reference text at `:189`).

## Improvement plan (small steps, in priority order)

0. **Add a safety net.** Keep U01–U13 green after every step. Export `checkAvailability` and add unit tests for AC1–AC5.
1. **Extract pure modules without changing behaviour.** Move `formatTime`, `isWholeMinute` and the constants to `domain/time.ts`, and `overlaps` and `checkAvailability` to `domain/availability.ts`. Pass in the room name and `now` as parameters instead of hardcoding them.
2. **Tighten parsing.** Accept input only if it matches `/^\d+$/`, then convert with `Number`.
3. **Add the room data.** Create `data/rooms.ts` with a `Room` type (`id, name, capacity, equipment[], blocked, bookings`) and at least 4 fictional rooms, including B-204 so the existing tests still pass. Make it `readonly` / frozen to protect AC5.
4. **Add filtering.** Write a pure `filterRooms(rooms, { attendees, equipment })` in `domain/filter.ts`: capacity must be at least the attendee count (F1), and the room must have every selected item (F2, using `every`).
5. **Give "blocked" one source.** Take it only from the room data (F3). Drop or repurpose the demo checkbox, but first check which U-tests rely on it.
6. **Split the UI.** Break it into `RoomSelector`, `RoomInfo`, `AvailabilityForm` and `ResultBanner`, keeping `role="status"` (AC6). Recalculate the result whenever the selected room changes (F5), and show a clear empty state when no rooms match the filter (F4).
