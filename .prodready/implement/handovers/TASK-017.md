# TASK-017 Handoff

## Task
- Title: US-011 — Przebieg powtórki
- Status: Done
- Completed at: 2026-10-04

## Acceptance Criteria Covered
- AC-1: po rozpoczęciu widać zagadnienie pierwszej karteczki, słowa-obrazy zakryte.
- AC-2: "Odsłoń" pokazuje słowa-obrazy i przyciski "Pamiętałem" / "Nie pamiętałem".
- AC-3: "Pamiętałem" zapisuje wynik z bieżącą datą i pokazuje następną karteczkę.
- AC-4: po ostatniej karteczce podsumowanie: zapamiętane, wszystkie, procent.

## Canonical Tests
- `AC-1: po rozpoczęciu powtórki widać zagadnienie pierwszej karteczki, a jej słowa-obrazy są zakryte` in `tests/integration/us-011-review.test.tsx`
- `AC-2: po wybraniu "Odsłoń" widać słowa-obrazy oraz przyciski "Pamiętałem" i "Nie pamiętałem"` in `tests/integration/us-011-review.test.tsx`
- `AC-3: wybranie "Pamiętałem" zapisuje wynik z bieżącą datą i pokazuje następną karteczkę` in `tests/integration/us-011-review.test.tsx`
- `AC-4: po ocenieniu ostatniej karteczki widać podsumowanie z liczbą zapamiętanych, liczbą wszystkich i wynikiem procentowym` in `tests/integration/us-011-review.test.tsx`
- RED potwierdzony na pustym ekranie i pustych trasach, potem GREEN.
- Testy techniczne: kontrakt API (RESULT_EXISTS, SESSION_FINISHED, 404, 400), `tests/unit/review-score.test.ts`, kaskada wyników po usunięciu karteczki.

## Files Changed
- `src/app/api/boards/[boardId]/review-sessions/route.ts`, `src/app/api/review-sessions/[sessionId]/{results,finish}/route.ts`
- `src/modules/review/{service,schema,score}.ts`, `src/lib/api-types.ts`
- `src/components/review/review-screen.tsx`, `src/app/boards/[id]/review/page.tsx`, `src/components/board/board-editor-screen.tsx` (link "Rozpocznij powtórkę")
- `tests/integration/us-011-review.test.tsx`, `tests/unit/review-score.test.ts`, `tests/helpers/api-fetch.ts`
- `.prodready/plan/backlog.md`, `.prodready/plan/test-plan.md`

## Commands Run
- `docker compose exec -T app npx vitest run` - PASS (129 testów)
- `docker compose exec -T app npx tsc --noEmit` - PASS
- `docker compose exec -T app npm run lint` - PASS

## Decisions
- Wejście na `/boards/{id}/review` od razu zakłada sesję (raz, także przy podwójnym efekcie w trybie dev). Nieukończone sesje zostają w bazie bez `finishedAt` i nie liczą się do statystyk.
- Po ostatniej ocenie klient sam wywołuje `finish` i pokazuje podsumowanie ("2 z 3", "67%").
- Wynik dla karteczki spoza planszy sesji → 404.

## Follow-ups or Blockers
- CELOWO NIEDOKOŃCZONE do TASK-018: sesja zawiera na razie wszystkie karteczki w kolejności utworzenia (bez pomijania karteczek bez słów-obrazów, bez kolejności łańcuchów, bez `NO_REVIEWABLE_NOTES` i bez nazwy pokoju).

## Next Recommended Task
- TASK-018: US-012 — Zakres i kolejność powtórki.
