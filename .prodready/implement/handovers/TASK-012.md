# TASK-012 Handoff

## Task
- Title: US-008 — Połączenia mapy myśli
- Status: Done
- Completed at: 2026-10-04

## Acceptance Criteria Covered
- AC-1: po połączeniu dwóch karteczek i odświeżeniu widoczna jest linia.
- AC-2: ponowne połączenie tej samej pary nie tworzy drugiego połączenia.
- AC-3: usunięcie połączenia usuwa linię, karteczki zostają.

## Canonical Tests
- `AC-1: po połączeniu dwóch karteczek i odświeżeniu strony między karteczkami widoczna jest linia` in `tests/integration/us-008-connections.test.tsx`
- `AC-2: ponowne połączenie dwóch już połączonych karteczek nie tworzy drugiego połączenia` in `tests/integration/us-008-connections.test.tsx`
- `AC-3: usunięcie połączenia usuwa linię, a obie karteczki pozostają na planszy` in `tests/integration/us-008-connections.test.tsx`
- RED potwierdzony (brak przycisku "Połącz karteczki", brak krawędzi, trasy 404), potem GREEN.
- Testy techniczne: kontrakt API połączeń, geometria końców linii (`tests/unit/edge-geometry.test.ts`).

## Files Changed
- `src/app/api/boards/[boardId]/connections/route.ts`, `src/app/api/connections/[connectionId]/route.ts`
- `src/modules/arrangement/{schema,connections}.ts`
- `src/components/board/{board-canvas,board-editor-screen,board-toolbar,note-node,connection-edge,connection-panel,edge-geometry,dimensions}.tsx/.ts`
- `tests/integration/us-008-connections.test.tsx`, `tests/unit/edge-geometry.test.ts`, `tests/helpers/{api-fetch,board}.ts`
- `.prodready/plan/backlog.md`, `.prodready/plan/test-plan.md`

## Commands Run
- `docker compose exec -T app npx vitest run` - PASS (84 testy)
- `docker compose exec -T app npx tsc --noEmit` - PASS
- `docker compose exec -T app npm run lint` - PASS

## Decisions
- Łączenie trybem z paska narzędzi zamiast przeciągania uchwytów (wygodniejsze na dotyku): "Połącz karteczki" → dotknięcie pierwszej karteczki (wyróżniona) → dotknięcie drugiej. Tryb trwa do "Zakończ".
- Stan edytora opisuje `EditorMode` (`idle` / `place-note` / `connect`) z `board-toolbar.tsx`.
- Linie: własna krawędź `ConnectionEdge` — prosta między brzegami karteczek (uchwyty React Flow ukryte w środku karteczki, niepodłączalne).
- Dotknięcie linii otwiera `ConnectionPanel` z "Usuń połączenie".
- Para już połączona (dowolny kierunek i rodzaj) → 409 `CONNECTION_EXISTS`, komunikat w Toast.

## Follow-ups or Blockers
- `kind=chain` jest przyjmowane przez API, ale reguły łańcucha (następnik, poprzednik, pętla) i przycisk trybu łańcucha powstaną w TASK-013.

## Next Recommended Task
- TASK-013: US-009 — Łańcuch skojarzeń.
