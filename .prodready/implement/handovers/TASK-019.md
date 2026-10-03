# TASK-019 Handoff

## Task
- Title: US-013 — Statystyki zapamiętywania
- Status: Done
- Completed at: 2026-10-04

## Acceptance Criteria Covered
- AC-1: przy planszy widać wynik ostatniej powtórki "80%" z datą.
- AC-2: "Powtórki w ostatnich 7 dniach: 3" dla 3 ukończonych powtórek.
- AC-3: "Brak powtórek" przy planszy bez ukończonej powtórki.

## Canonical Tests
- `AC-1: przy planszy z ukończoną powtórką o wyniku 8 z 10 lista plansz pokazuje wynik ostatniej powtórki "80%" wraz z jej datą` in `tests/integration/us-013-stats.test.tsx`
- `AC-2: przy 3 ukończonych powtórkach z ostatnich 7 dni statystyki pokazują "Powtórki w ostatnich 7 dniach: 3"` in `tests/integration/us-013-stats.test.tsx`
- `AC-3: przy planszy bez żadnej ukończonej powtórki lista plansz pokazuje "Brak powtórek"` in `tests/integration/us-013-stats.test.tsx`
- RED potwierdzony, potem GREEN.
- Test techniczny: `lastReview` z zaokrąglonym procentem i `GET /api/stats`.

## Files Changed
- `src/app/api/stats/route.ts`, `src/modules/boards/service.ts`, `src/modules/review/service.ts`
- `src/lib/{format,api-types}.ts`, `src/components/boards/{board-card,board-list-screen}.tsx`
- `tests/integration/us-013-stats.test.tsx`, `tests/helpers/api-fetch.ts`
- `.prodready/plan/backlog.md`, `.prodready/plan/test-plan.md`

## Commands Run
- `docker compose exec -T app npx vitest run` - PASS (138 testów)
- `docker compose exec -T app npx tsc --noEmit` - PASS
- `docker compose exec -T app npm run lint` - PASS

## Decisions
- "Ostatnia powtórka" = najpóźniej ukończona sesja planszy mająca co najmniej jeden wynik; sesje nieukończone i starsze niż 7 dni nie liczą się do statystyk.
- Data w formacie `pl-PL` (`formatDate`, np. "4.10.2026"), w strefie czasowej urządzenia.
- Lista plansz liczy `lastReview` stałą liczbą zapytań (include z `take: 1`).

## Follow-ups or Blockers
- None

## Next Recommended Task
- TASK-020: US-002 — Zarządzanie planszami.
