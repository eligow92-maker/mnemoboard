# TASK-018 Handoff

## Task
- Title: US-012 — Zakres i kolejność powtórki
- Status: Done
- Completed at: 2026-10-04

## Acceptance Criteria Covered
- AC-1: łańcuch A→B→C pojawia się w powtórce w kolejności A, B, C.
- AC-2: karteczka bez słów-obrazów nie pojawia się w powtórce.
- AC-3: plansza bez słów-obrazów — powtórka się nie rozpoczyna, komunikat "Dodaj słowa-obrazy, aby rozpocząć powtórkę".
- AC-4: po "Odsłoń" obok słów-obrazów widać nazwę pokoju.

## Canonical Tests
- `AC-1: w powtórce planszy z łańcuchem A→B→C karteczki pojawiają się w kolejności A, B, C` in `tests/integration/us-012-review-scope.test.tsx`
- `AC-2: karteczka bez słów-obrazów nie pojawia się w powtórce` in `tests/integration/us-012-review-scope.test.tsx`
- `AC-3: dla planszy bez żadnych słów-obrazów powtórka się nie rozpoczyna i widać komunikat "Dodaj słowa-obrazy, aby rozpocząć powtórkę"` in `tests/integration/us-012-review-scope.test.tsx`
- `AC-4: po wybraniu "Odsłoń" dla karteczki z pokoju "Kuchnia" obok słów-obrazów widać nazwę pokoju "Kuchnia"` in `tests/integration/us-012-review-scope.test.tsx`
- RED potwierdzony dla wszystkich, potem GREEN.
- Test techniczny: 422 `NO_REVIEWABLE_NOTES` dla pustej planszy bez zakładania sesji.

## Files Changed
- `src/modules/review/service.ts`, `src/components/review/review-screen.tsx`
- `tests/integration/us-012-review-scope.test.tsx`
- `.prodready/plan/backlog.md`, `.prodready/plan/test-plan.md`

## Commands Run
- `docker compose exec -T app npx vitest run` - PASS (134 testy)
- `docker compose exec -T app npx tsc --noEmit` - PASS
- `docker compose exec -T app npm run lint` - PASS

## Decisions
- Słowa-obrazy złożone z samych spacji traktowane jak brak słów.
- Przy `NO_REVIEWABLE_NOTES` sesja nie jest zakładana; ekran pokazuje ReviewUnavailable z linkiem do planszy.
- Nazwa pokoju jest w odpowiedzi API od początku sesji, ale interfejs renderuje ją dopiero po "Odsłoń".

## Follow-ups or Blockers
- None

## Next Recommended Task
- TASK-019: US-013 — Statystyki zapamiętywania.
