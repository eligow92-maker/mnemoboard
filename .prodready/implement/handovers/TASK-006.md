# TASK-006 Handoff

## Task
- Title: US-003 — Przyklejenie karteczki do planszy
- Status: Done
- Completed at: 2026-10-04

## Acceptance Criteria Covered
- AC-1: karteczka dodana w wybranym miejscu jest widoczna w tym miejscu z podanym zagadnieniem.
- AC-2: puste zagadnienie nie tworzy karteczki, komunikat "Wpisz zagadnienie".
- AC-3: po odświeżeniu karteczka ma to samo zagadnienie i położenie.

## Canonical Tests
- `AC-1: karteczka dodana z zagadnieniem "1410 – bitwa pod Grunwaldem" w wybranym miejscu jest widoczna w tym miejscu z tym zagadnieniem` in `tests/integration/us-003-add-note.test.tsx`
- `AC-2: zatwierdzenie pustego zagadnienia nie tworzy karteczki i pokazuje komunikat "Wpisz zagadnienie"` in `tests/integration/us-003-add-note.test.tsx`
- `AC-3: po odświeżeniu strony dodana karteczka ma to samo zagadnienie i to samo położenie` in `tests/integration/us-003-add-note.test.tsx`
- RED potwierdzony na pustym ekranie i pustych trasach, potem GREEN.
- Testy techniczne: nazwa planszy / plansza nieistniejąca, 404 i 400 dla GET, walidacja POST karteczki.

## Files Changed
- `src/app/api/boards/[boardId]/route.ts`, `src/app/api/boards/[boardId]/notes/route.ts`, `src/app/boards/[id]/page.tsx`
- `src/modules/notes/{schema,service}.ts`, `src/modules/boards/service.ts` (`requireBoard`, `getBoardDetail`)
- `src/lib/api.ts` (`uuidParam`, `notFound`), `src/lib/api-types.ts`
- `src/components/board/{board-editor-screen,board-canvas,board-toolbar,note-editor}.tsx`
- `tests/helpers/{board,api-fetch}.ts`, `tests/integration/us-003-add-note.test.tsx`
- `.prodready/plan/backlog.md`, `.prodready/plan/test-plan.md`

## Commands Run
- `docker compose exec -T app npx vitest run` - PASS (28 testów)
- `docker compose exec -T app npx tsc --noEmit` - PASS
- `docker compose exec -T app npm run lint` - PASS
- `curl` na działającym dev: `/` 200, `/boards/{id}` 200, `/api/boards/abc` 400

## Decisions
- "Wybrane miejsce": przycisk "Dodaj karteczkę" włącza tryb wskazywania ("Wskaż miejsce na planszy"), kliknięcie/tapnięcie tła otwiera NoteEditor; wskazany punkt jest środkiem karteczki (180×96).
- `BoardCanvas` opakowany w `ReactFlowProvider`; `onPaneClick` zwraca położenie w układzie planszy.
- `chainPosition` i `zoneId` zwracane na razie jako `null` (TASK-013, TASK-015). Karteczki w API mają typ `NoteView` (`toNoteView`).
- `uuidParam(params, name)` zwraca 400 dla identyfikatora w złym formacie; `notFound(msg)` buduje 404.

## Follow-ups or Blockers
- `onNoteMove` w edytorze jest jeszcze pusty — zapis położenia w TASK-007.

## Next Recommended Task
- TASK-007: US-004 — Przesuwanie, edycja i usuwanie karteczki (wymaga przeglądarki Playwright dla AC-1).
