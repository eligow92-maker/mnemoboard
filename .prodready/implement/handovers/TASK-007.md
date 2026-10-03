# TASK-007 Handoff

## Task
- Title: US-004 — Przesuwanie, edycja i usuwanie karteczki
- Status: Done
- Completed at: 2026-10-04

## Acceptance Criteria Covered
- AC-1: przeciągnięta karteczka po odświeżeniu jest w nowym miejscu (E2E, prawdziwa przeglądarka).
- AC-2: zmiana zagadnienia z "1410" na "15.07.1410" jest widoczna na karteczce.
- AC-3: usunięcie karteczki usuwa ją i jej połączenia.

## Canonical Tests
- `AC-1: karteczka przeciągnięta w inne miejsce po odświeżeniu strony znajduje się w nowym miejscu` in `tests/e2e/us-004-edit-note.spec.ts`
- `AC-2: po zmianie zagadnienia z "1410" na "15.07.1410" karteczka pokazuje nowe zagadnienie` in `tests/integration/us-004-edit-note.test.tsx`
- `AC-3: usunięcie karteczki mającej połączenia usuwa z planszy karteczkę i wszystkie jej połączenia` in `tests/integration/us-004-edit-note.test.tsx`
- RED potwierdzony dla wszystkich (E2E: brak żądania PATCH; integracyjne: brak pola/przycisku), potem GREEN.
- Testy techniczne: zapis położenia po upuszczeniu (jsdom), kody 400/404 dla PATCH i DELETE.

## Files Changed
- `src/app/api/notes/[noteId]/route.ts`, `src/modules/notes/{schema,service}.ts`
- `src/components/board/{board-editor-screen,note-editor}.tsx`, `src/components/ui/toast.tsx`
- `tests/e2e/{helpers.ts,us-004-edit-note.spec.ts}`, `tests/integration/us-004-edit-note.test.tsx`, `tests/helpers/{api-fetch,react-flow}.ts`
- `.prodready/plan/backlog.md`, `.prodready/plan/test-plan.md`

## Commands Run
- `docker compose exec -T app npx vitest run` - PASS (32 testy)
- `npx playwright test tests/e2e/us-004-edit-note.spec.ts --project=desktop` (z hosta) - PASS
- `docker compose exec -T app npx tsc --noEmit` - PASS
- `docker compose exec -T app npm run lint` - PASS

## Decisions
- Kliknięcie karteczki otwiera NoteEditor w trybie edycji (przycisk "Usuń karteczkę" bez dodatkowego potwierdzenia — specyfikacja przewiduje ConfirmDialog tylko dla planszy i zastępowania słów).
- Przesunięcie: aktualizacja optymistyczna, `PATCH {x, y}`, przy błędzie Toast i ponowne wczytanie planszy.
- Testy E2E działają z hosta na środowisku dev i jego bazie; tworzą plansze o nazwie "E2E …" i usuwają je w `afterEach` przez `DELETE /api/boards/{id}`.
- W jsdom plansza musi mieć wymiary (`getBoundingClientRect` w `mockReactFlow`), inaczej autopan React Flow zmienia położenie po upuszczeniu.

## Follow-ups or Blockers
- `DELETE /api/boards/{id}` powstanie dopiero w TASK-020 — do tego czasu plansze "E2E …" trzeba usuwać z bazy dev ręcznie (`DELETE FROM board WHERE name LIKE 'E2E %'`); po tym zadaniu zostało to zrobione.
- Przeglądarka Playwright zainstalowana na hoście (`npx playwright install chromium`).

## Next Recommended Task
- TASK-008: Startowa lista GSP i seed.
