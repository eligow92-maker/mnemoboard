# TASK-009 Handoff

## Task
- Title: US-007 — Edytowalna lista słów GSP
- Status: Done
- Completed at: 2026-10-04

## Acceptance Criteria Covered
- AC-1: lista GSP pokazuje niepuste słowo dla każdego z 110 haseł.
- AC-2: po zmianie słowa dla "14" na "tur" generator dla "14" zwraca "tur".
- AC-3: puste słowo jest odrzucane, hasło zachowuje poprzednie słowo.
- AC-4: "Przywróć domyślne" przywraca słowo startowe.

## Canonical Tests
- `AC-1: lista GSP świeżo zainstalowanej aplikacji pokazuje niepuste słowo dla każdego z 110 haseł (0–9 oraz 00–99)` in `tests/integration/us-007-peg-words.test.tsx`
- `AC-2: po zmianie słowa dla "14" na "tur" generowanie dla zagadnienia "14" zwraca "tur"` in `tests/integration/us-007-peg-words.test.tsx`
- `AC-3: zapis pustego słowa dla hasła jest odrzucony i hasło zachowuje poprzednie słowo` in `tests/integration/us-007-peg-words.test.tsx`
- `AC-4: akcja "Przywróć domyślne" dla hasła ze zmienionym słowem przywraca słowo startowe` in `tests/integration/us-007-peg-words.test.tsx`
- RED potwierdzony na pustym ekranie i pustych trasach, potem GREEN.
- Test techniczny: kontrakt API (kolejność, walidacja 1–40 znaków, 404 dla nieistniejącego hasła).

## Files Changed
- `src/app/api/peg-words/route.ts`, `src/app/api/peg-words/[number]/route.ts`, `src/app/api/peg-words/[number]/reset/route.ts`
- `src/modules/word-images/{service,schema}.ts`, `src/lib/api-types.ts`
- `src/components/peg-words/{peg-words-screen,peg-word-row}.tsx`, `src/app/peg-words/page.tsx`
- `tests/integration/us-007-peg-words.test.tsx`, `tests/helpers/api-fetch.ts`
- `.prodready/plan/backlog.md`, `.prodready/plan/test-plan.md`

## Commands Run
- `docker compose exec -T app npx vitest run` - PASS (75 testów)
- `docker compose exec -T app npx tsc --noEmit` - PASS
- `docker compose exec -T app npm run lint` - PASS
- `curl /peg-words` 200, `curl /api/peg-words` zwraca 110 haseł (dev)

## Decisions
- Wiersz ma zawsze widoczne pole; "Zapisz"/"Anuluj" pojawiają się po zmianie, znacznik "własne" i "Przywróć domyślne" tylko dla zmienionych haseł.
- Hasło spoza wzorca `^[0-9]{1,2}$` lub nieistniejące → 404.
- Własne słowo nie jest sprawdzane pod kątem zgodności z kodowaniem GSP (użytkownik decyduje).

## Follow-ups or Blockers
- None

## Next Recommended Task
- TASK-012: US-008 — Połączenia mapy myśli.
