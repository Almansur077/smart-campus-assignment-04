# Smart Campus Room Availability Checker — Assignment #04

Room catalog (5 fictional rooms) with capacity and equipment filters on top of the original availability rules (AC1–AC6).

## Setup, run, test
```bash
npm install        # install dependencies
npm run dev        # start dev server (Vite)
npm test           # run all 37 tests (Vitest, verbose)
npm run typecheck  # TypeScript check
npm run build      # production build
```

## Structure
- `src/data/rooms.ts` — fictional frozen catalog, demo clock (540 = 09:00)
- `src/domain/` — pure rules: `availability.ts` (AC1–AC5), `filter.ts` (F1, F2), `time.ts`, `room.ts` (types)
- `src/ui/` — `components.tsx` (presentation), `parse.ts` (form parsing)
- `src/App.tsx` — state and composition
- Tests: `tests/ui.regression.test.tsx` (U01–U13, unchanged since baseline), `tests/rooms.ui.test.tsx` (I01–I07), `src/**/*.test.ts`

## Versions
- Initial: `38413e0` (single-file prototype, 13/13 tests)
- Final code: `63d03ff` (37/37 tests)
