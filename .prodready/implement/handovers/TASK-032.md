# TASK-032 Handoff

## Task
- Title: Format pliku i walidacja (moduł transfer)
- Status: Done
- Completed at: 2026-10-04

## Acceptance Criteria Covered
- AC-1: serializacja planszy (3 karteczki, 1 strefa, 2 połączenia) i wczytanie pliku zwraca te same dane.
- AC-2: połączenie wskazujące karteczkę spoza pliku jest odrzucane.
- AC-3: ogniwa A→B, B→C, C→A są odrzucane.
- AC-4: nazwa pliku dla "Żółta Historia Polski" zawiera "zolta-historia-polski".

## Canonical Tests
- `AC-1…AC-4` in `tests/unit/transfer-format.test.ts`; RED potwierdzony (brak modułu), potem GREEN.
- Testy techniczne: zła wersja/format/rodzaj, powtórzona para, nieznana strefa, powtórzone id, nieznany kolor, 9 emotek, połączenie karteczki z samą sobą, nazwa zastępcza "plansza", kopia z historią i GSP, wynik powtórki dla karteczki spoza planszy.

## Files Changed
- `src/modules/transfer/schema.ts`, `src/modules/transfer/format.ts` (nowe)
- `tests/unit/transfer-format.test.ts`
- `.prodready/plan/backlog.md`, `.prodready/plan/test-plan.md`

## Commands Run
- `docker compose exec -T app npx vitest run` - PASS
- `docker compose exec -T app npx tsc --noEmit` - PASS
- `docker compose exec -T app npm run lint` - PASS

## Decisions
- Walidacja relacji (`checkBoardRelations`) używa `validateChainLink` z modułu `arrangement`, więc reguły łańcucha nie są powielone.
- Limity w schemacie: 2000 karteczek, 200 stref, 5000 połączeń, 500 plansz, 500 własnych wpisów GSP (+110 wbudowanych).
- Moduł nie zależy od Prisma ani Reacta; `BoardSource` jest typem strukturalnym, więc pasuje do wierszy bazy.
- `parseBoardExportFile` / `parseBackupFile` zwracają `{success, data|message}` zamiast rzucać wyjątek; tłumaczenie na komunikat dla użytkownika w warstwie API (TASK-034).
- Identyfikatory w pliku służą tylko do odtworzenia powiązań; przy imporcie dostają nowe (TASK-034).

## Follow-ups or Blockers
- None

## Next Recommended Task
- TASK-033: US-021 — Eksport planszy.
