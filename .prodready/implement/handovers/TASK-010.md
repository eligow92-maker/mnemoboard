# TASK-010 Handoff

## Task
- Title: US-006 — Generowanie słów-obrazów dla liczb
- Status: Done
- Completed at: 2026-10-04

## Acceptance Criteria Covered
- AC-1: "1410" → słowo dla "14" i słowo dla "10".
- AC-2: "15.07.1410" → słowa dla "15", "07", "14", "10".
- AC-3: "966" → słowo dla "96" i dla pojedynczej cyfry "6".
- AC-4: istniejące słowa-obrazy zostają bez zmian do potwierdzenia zastąpienia.

## Canonical Tests
- `AC-1: "Generuj słowa" dla zagadnienia "1410" daje kolejno słowo z listy GSP dla "14" i słowo dla "10"` in `tests/integration/us-006-generate.test.tsx`
- `AC-2: "Generuj słowa" dla zagadnienia "15.07.1410" daje kolejno słowa dla "15", "07", "14" i "10"` in `tests/integration/us-006-generate.test.tsx`
- `AC-3: "Generuj słowa" dla zagadnienia "966" daje słowo dla "96" i słowo dla pojedynczej cyfry "6"` in `tests/integration/us-006-generate.test.tsx`
- `AC-4: dla karteczki mającej już słowa-obrazy "Generuj słowa" zostawia je bez zmian do chwili potwierdzenia zastąpienia` in `tests/integration/us-006-generate.test.tsx`
- RED potwierdzony na zaślepkach (brak przycisku "Generuj słowa", trasa 404), potem GREEN.
- Testy techniczne: `tests/unit/word-images.test.ts` (podział cyfr, zera wiodące, separatory, długie ciągi, brak cyfr), rezygnacja z zastąpienia, kontrakt trasy.

## Files Changed
- `src/modules/word-images/{generator,service,schema}.ts`, `src/app/api/word-images/generate/route.ts`
- `src/components/board/{note-editor,board-editor-screen}.tsx`, `src/components/ui/confirm-dialog.tsx`, `src/lib/api-types.ts`
- `tests/integration/us-006-generate.test.tsx`, `tests/unit/word-images.test.ts`, `tests/helpers/api-fetch.ts`
- `.prodready/plan/backlog.md`, `.prodready/plan/test-plan.md`

## Commands Run
- `docker compose exec -T app npx vitest run` - PASS (66 testów)
- `docker compose exec -T app npx tsc --noEmit` - PASS
- `docker compose exec -T app npm run lint` - PASS

## Decisions
- Generator działa na bieżącej (także niezapisanej) treści pola "Zagadnienie" i wpisuje wynik do pola "Słowa-obrazy"; nic nie zapisuje w bazie.
- Gdy pole słów jest niepuste i wynik się różni, pojawia się ConfirmDialog "Zastąpić słowa-obrazy?" ("Zastąp" / "Anuluj").
- Serwis generatora uzupełnia brakujące hasła słowami startowymi, więc działa także na bazie bez seeda.

## Follow-ups or Blockers
- CELOWO NIEDOKOŃCZONE do TASK-011: edytor nie wysyła jeszcze pola `imageWords` przy zapisie karteczki, a odpowiedź `NO_DIGITS` pokazuje ogólny komunikat serwera. Oba elementy należą do zakresu TASK-011.

## Next Recommended Task
- TASK-011: US-005 — Ręczne słowa-obrazy (potem TASK-009).
