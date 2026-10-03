# TASK-013 Handoff

## Task
- Title: US-009 — Łańcuch skojarzeń
- Status: Done
- Completed at: 2026-10-04

## Acceptance Criteria Covered
- AC-1: ogniwa A→B i B→C dają numery 1, 2, 3 na karteczkach.
- AC-2: drugie ogniwo wychodzące z A jest odrzucane z komunikatem "Karteczka ma już następnik w łańcuchu".
- AC-3: ogniwo C→A w łańcuchu A→B→C jest odrzucane z komunikatem "Łańcuch nie może tworzyć pętli".

## Canonical Tests
- `AC-1: po utworzeniu ogniw łańcucha A→B i B→C karteczki pokazują numery kolejności 1, 2 i 3` in `tests/integration/us-009-chain.test.tsx`
- `AC-2: ogniwo A→C dla karteczki A mającej już ogniwo A→B nie powstaje i pojawia się komunikat "Karteczka ma już następnik w łańcuchu"` in `tests/integration/us-009-chain.test.tsx`
- `AC-3: ogniwo C→A w łańcuchu A→B→C nie powstaje i pojawia się komunikat "Łańcuch nie może tworzyć pętli"` in `tests/integration/us-009-chain.test.tsx`
- RED potwierdzony na zaślepce modułu i braku przycisku "Połącz w łańcuch", potem GREEN.
- Testy techniczne: `tests/unit/chain.test.ts` (numeracja, wiele łańcuchów, następnik, poprzednik, pętla), kody 409 API, podział łańcucha po usunięciu środkowej karteczki.

## Files Changed
- `src/modules/arrangement/{chain,connections}.ts`, `src/modules/notes/service.ts`, `src/modules/boards/service.ts`
- `src/components/board/{board-editor-screen,board-toolbar,board-canvas,note-node}.tsx`
- `tests/integration/us-009-chain.test.tsx`, `tests/unit/chain.test.ts`, `tests/helpers/board.ts` (`clickNote`) i podmiana kliknięć karteczek w pozostałych testach
- `.prodready/plan/backlog.md`, `.prodready/plan/test-plan.md`

## Commands Run
- `docker compose exec -T app npx vitest run` - PASS (96 testów)
- `docker compose exec -T app npx tsc --noEmit` - PASS
- `docker compose exec -T app npm run lint` - PASS
- Zrzuty ekranu z Chromium (1100 px i 375 px) — linie, strzałki i numery sprawdzone wzrokowo.

## Decisions
- Kolejność sprawdzeń serwera: para już połączona (`CONNECTION_EXISTS`) → następnik → poprzednik → pętla.
- `chainPosition` wylicza serwer (`chainPositions`); klient po każdej zmianie połączeń i usunięciu karteczki wczytuje planszę ponownie (z ochroną przed spóźnioną odpowiedzią).
- Tryb "Połącz w łańcuch": po utworzeniu ogniwa wskazana karteczka staje się początkiem następnego, więc A, B, C tworzy A→B→C.
- W testach jsdom karteczki klika się przez `clickNote()` (samo zdarzenie click).

## Follow-ups or Blockers
- Na 375 px pasek narzędzi zawija się do dwóch wierszy — do uporządkowania w TASK-021, gdy dojdą przyciski pokoju i powtórki.

## Next Recommended Task
- TASK-014: Geometria stref.
