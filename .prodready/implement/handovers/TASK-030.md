# TASK-030 Handoff

## Task
- Title: US-019 — Zarządzanie własnymi wpisami GSP
- Status: Done
- Completed at: 2026-10-04

## Acceptance Criteria Covered
- AC-1: dodany wpis "333" ze słowem "mumia-mysz" widoczny jako "333 – mumia-mysz".
- AC-2: duplikat → "Wpis dla tej liczby już istnieje", wpis nie powstaje.
- AC-3: liczba "33" → "Własny wpis musi mieć od 3 do 15 cyfr".
- AC-4: zmiana słowa na "mamut" → "333 – mamut".
- AC-5: usunięty wpis znika z listy.

## Canonical Tests
- `AC-1…AC-5` in `tests/integration/us-019-custom-pegs.test.tsx`; RED potwierdzony (10/10), potem GREEN.
- AC-3 miało błędną asercję (hasło wbudowane "33" istnieje), poprawiona na "brak własnych wpisów" po pierwszym przebiegu GREEN — nie zmienia treści kryterium.
- Testy techniczne: własne wpisy poza tabelą 110 haseł; lista z `kind` i sortowaniem; 409 `PEG_BUILTIN` / `PEG_NO_DEFAULT`; limity 40/80 znaków; zła liczba → 400; limit 500 → 409 `PEG_LIMIT`.

## Files Changed
- `src/modules/word-images/{schema,service}.ts`, `src/app/api/peg-words/route.ts`, `src/app/api/peg-words/[number]/route.ts`, `src/lib/api-types.ts`
- `src/components/peg-words/{custom-peg-section,peg-words-screen,peg-word-row}.tsx`
- `tests/integration/us-019-custom-pegs.test.tsx`
- `.prodready/plan/backlog.md`, `.prodready/plan/test-plan.md`

## Commands Run
- `docker compose exec -T app npx vitest run` - PASS (192 testy)
- `docker compose exec -T app npx tsc --noEmit` - PASS
- `docker compose exec -T app npm run lint` - PASS
- `npx playwright test` - PASS (14/14)

## Decisions
- `peg_word` przechowuje hasła wbudowane i własne w jednej tabeli; rodzaj wynika z `defaultWord` (NULL = własny), API zwraca `kind`.
- Limit słowa: 40 znaków dla haseł wbudowanych (sprawdzane w serwisie), 80 dla własnych (schemat Zod).
- Lista: najpierw 110 wbudowanych, potem własne wg długości i wartości; własne są osobną sekcją "Własne wpisy" pod tabelą.
- Poprawka z TASK-027/028: wiersz GSP na 375 px — pole słowa dostało `basis-36` zamiast kurczyć się do 44 px obok plakietki "własne"; test mobilny `us-014` znów przechodzi.

## Follow-ups or Blockers
- Generator nie używa jeszcze własnych wpisów (TASK-031).

## Next Recommended Task
- TASK-031: US-020 — Generator korzysta z własnych wpisów.
