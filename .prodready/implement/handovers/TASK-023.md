# TASK-023 Handoff

## Task
- Title: Wydajność dużej planszy
- Status: Done
- Completed at: 2026-10-04

## Acceptance Criteria Covered
- AC-1: GET /api/boards/{id} dla planszy z 200 karteczkami, 20 strefami i 200 połączeniami odpowiada w < 500 ms.

## Canonical Tests
- `AC-1: GET /api/boards/{id} dla planszy z 200 karteczkami, 20 strefami i 200 połączeniami odpowiada w czasie krótszym niż 500 ms` in `tests/integration/performance.test.ts`
- RED — stan faktyczny: test przechodził od pierwszego uruchomienia, bo odczyt planszy od TASK-006 jest jednym zapytaniem Prisma z `include` (najgorsze z 5 pomiarów daleko poniżej limitu). Klasycznego RED nie było. Sam limit 500 ms nie wykrywa N+1 przy tej skali (po sztucznym dodaniu zapytania na każdą karteczkę AC-1 nadal przechodził), dlatego brak N+1 pilnuje osobny test techniczny.
- Testy techniczne:
  - liczba zapytań SQL dla dużej planszy ≤ 4 (klient Prisma z rejestracją zapytań podstawiony przez `vi.mock`); czułość potwierdzona mutacją — sztuczne N+1 daje 204 zapytania i test pada; mutacja wycofana.
  - `tests/e2e/performance.spec.ts`: plansza z 200 karteczkami po odświeżeniu pokazuje pierwszą karteczkę w < 2 s (cel z constraints.md), w DOM jest mniej niż 200 węzłów, a po "Fit View" — wszystkie 200.

## Files Changed
- `src/components/board/board-canvas.tsx` (`onlyRenderVisibleElements`)
- `tests/integration/performance.test.ts`, `tests/e2e/performance.spec.ts`
- `tests/helpers/react-flow.ts` (plansza w jsdom ma rozmiar 1024×768), `tests/integration/us-009-chain.test.tsx` (asercja niezależna od kolejności zapisu)
- `.prodready/plan/backlog.md`, `.prodready/plan/test-plan.md`

## Commands Run
- `docker compose exec -T app npx vitest run` - PASS (149 testów, trzy przebiegi z rzędu)
- `docker compose exec -T app npx vitest run --coverage` - 95% linii ogółem; `src/modules/*` 98–100%
- `npx playwright test` (z hosta) - PASS (13 testów)
- `docker compose exec -T app npx tsc --noEmit`, `npm run lint`, `npx prettier --check src tests` - PASS

## Decisions
- Pomiary czasu dotyczą środowiska dev (Next.js w trybie deweloperskim, baza w kontenerze na tym samym hoście) — nie są pomiarem docelowego serwera domowego.
- W testach jsdom karteczki muszą leżeć w oknie planszy 1024×768, inaczej React Flow ich nie wyrenderuje.

## Follow-ups or Blockers
- None

## Next Recommended Task
- Wszystkie zadania backlogu mają status Done. Następny krok: `prodready-gate implement`.
