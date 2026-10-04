# TASK-033 Handoff

## Task
- Title: US-021 — Eksport planszy
- Status: Done
- Completed at: 2026-10-04

## Acceptance Criteria Covered
- AC-1: "Eksportuj" na karcie planszy "Historia Polski" pobiera plik JSON z "historia-polski" w nazwie.
- AC-2: plik zawiera 3 karteczki (zagadnienie, słowa-obrazy, opowiadanie, emotki, kolor, położenie), 1 strefę i 2 połączenia.

## Canonical Tests
- `AC-1`, `AC-2` in `tests/integration/us-021-export.test.tsx`; RED potwierdzony, potem GREEN.
- Testy techniczne: nagłówek `Content-Disposition` z nazwą pliku; brak historii powtórek i identyfikatora planszy w pliku; 404 dla nieistniejącej planszy.

## Files Changed
- `src/modules/transfer/service.ts` (nowy), `src/app/api/boards/[boardId]/export/route.ts` (nowy), `src/lib/download.ts` (nowy)
- `src/components/boards/board-card.tsx`
- `tests/integration/us-021-export.test.tsx`, `tests/helpers/api-fetch.ts` (trasa eksportu)
- `.prodready/plan/backlog.md`, `.prodready/plan/test-plan.md`

## Commands Run
- `docker compose exec -T app npx vitest run` - PASS (212 testów)
- `docker compose exec -T app npx tsc --noEmit` - PASS
- `docker compose exec -T app npm run lint` - PASS
- `npx playwright test` - PASS (14/14)

## Decisions
- Pobieranie: `downloadFromApi` (fetch → blob → tymczasowy odnośnik z `download`), nazwa pliku z nagłówka `Content-Disposition`; będzie użyte też przez kopię (TASK-036).
- Test AC-1 stubuje `URL.createObjectURL` i `HTMLAnchorElement.click` (jsdom nie pobiera plików) i sprawdza nazwę oraz treść bloba.
- Karteczki, strefy i połączenia są sortowane po `createdAt, id`, więc eksport tej samej planszy jest powtarzalny.

## Follow-ups or Blockers
- None

## Next Recommended Task
- TASK-034: US-022 — Import planszy.
