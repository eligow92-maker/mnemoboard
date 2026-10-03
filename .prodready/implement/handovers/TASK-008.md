# TASK-008 Handoff

## Task
- Title: Startowa lista GSP i seed
- Status: Done
- Completed at: 2026-10-04

## Acceptance Criteria Covered
- AC-1: seed na pustej tabeli zapisuje 110 haseł z niepustym słowem.
- AC-2: spółgłoski każdego słowa startowego dekodują się do liczby hasła.
- AC-3: ponowny seed zachowuje słowo "tur" ustawione dla hasła "14".

## Canonical Tests
- `AC-1: seed uruchomiony na pustej tabeli peg_word zapisuje 110 haseł z niepustym słowem` in `tests/integration/peg-seed.test.ts`
- `AC-2: spółgłoski każdego słowa startowej listy GSP dekodują się do liczby hasła` in `tests/unit/peg-seed.test.ts`
- `AC-3: ponowne uruchomienie seeda zachowuje słowo "tur" ustawione dla hasła "14"` in `tests/integration/peg-seed.test.ts`
- RED potwierdzony na zaślepkach. AC-2 w pierwszej wersji przechodziło na pustej liście — test uszczelniono (wymaga 110 haseł) i dopiero wtedy potwierdzono RED.
- Testy techniczne: skład listy haseł, brak powtórzonych słów, przykłady dekodowania, uzupełnianie braków przez seed.

## Files Changed
- `src/modules/word-images/{encoding,default-peg-words,seed}.ts`, `prisma/seed.ts`, `package.json` (`prisma.seed`)
- `compose.override.yaml`, `Dockerfile` (etap dev: seed przy starcie)
- `tests/unit/peg-seed.test.ts`, `tests/integration/peg-seed.test.ts`
- `.prodready/plan/backlog.md`, `.prodready/plan/test-plan.md`

## Commands Run
- `docker compose exec -T app npx vitest run` - PASS (48 testów)
- `docker compose exec -T app npx tsc --noEmit` - PASS
- `docker compose exec -T app npm run lint` - PASS
- `docker compose exec -T app npx prisma db seed` (dwukrotnie) - PASS, 110 haseł w bazie dev

## Decisions
- Kodowanie GSP (specyfikacja go nie podawała — decyzja autora, zgodna z przykładami "tor"=14, "dos"=10): 0 s/z, 1 t/d, 2 n, 3 m, 4 r, 5 l, 6 j, 7 k/g, 8 f/w, 9 p/b. Samogłoski i wszystkie pozostałe litery (h, ł, c, ż, ń, ś…) są pomijane.
- Treść 110 słów startowych jest propozycją autora implementacji; wymaga przejrzenia przez użytkownika (część słów jest mało obrazowa: "tuz", "naja", "jaz", "wiew", "nawa"). Każde można zmienić w liście GSP (TASK-009).
- Seed nie nadpisuje słowa użytkownika; gdy zmieni się słowo startowe, a hasło nie było zmieniane, aktualizuje oba pola.
- Tabeli `peg_word` nie czyści `resetDb()`; testy generatora same wywołują `seedPegWords(prisma)`.

## Follow-ups or Blockers
- Etap produkcyjny obrazu (`Dockerfile` linia `CMD … node server.js`) nie uruchamia seeda — do rozwiązania w fazie Build (seed wymaga `tsx` albo skompilowanego skryptu).

## Next Recommended Task
- TASK-010: US-006 — Generowanie słów-obrazów (TASK-009 jest zablokowane przez TASK-010).
