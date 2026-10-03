# TASK-002 Handoff

## Task
- Title: Schemat bazy i migracja
- Status: Done
- Completed at: 2026-10-03

## Acceptance Criteria Covered
- AC-1: po migracjach istnieją tabele board, zone, note, connection, peg_word, review_session i review_result.
- AC-2: drugie połączenie tej samej pary w odwrotnym kierunku jest odrzucane błędem unikalności.
- AC-3: drugie ogniwo łańcucha wychodzące z tej samej karteczki jest odrzucane błędem unikalności.

## Canonical Tests
- `AC-1: po wykonaniu migracji istnieją tabele board, zone, note, connection, peg_word, review_session i review_result` in `tests/integration/db-schema.test.ts`
- `AC-2: baza odrzuca drugie połączenie tej samej pary w odwrotnym kierunku błędem unikalności` in `tests/integration/db-schema.test.ts`
- `AC-3: baza odrzuca drugie ogniwo łańcucha wychodzące z tej samej karteczki błędem unikalności` in `tests/integration/db-schema.test.ts`
- RED potwierdzony: najpierw wszystkie trzy (`relation "board" does not exist`), potem — po migracji bez ręcznych indeksów — AC-2 i AC-3 (`promise resolved instead of rejecting`); GREEN po dopisaniu indeksów.

## Files Changed
- `prisma/schema.prisma` (modele i enum, nazwy tabel/kolumn/indeksów jak w `schema.sql`)
- `prisma/migrations/20261003000000_init/migration.sql`, `prisma/migrations/migration_lock.toml`
- `src/lib/db.ts` (singleton `prisma`)
- `tests/global-setup.ts`, `tests/setup.ts`, `tests/helpers/db.ts`, `tests/integration/db-schema.test.ts`
- `vitest.config.ts` (`globalSetup`)
- `.prodready/plan/backlog.md`, `.prodready/plan/test-plan.md`

## Commands Run
- `docker compose exec -T app npx vitest run` - PASS (5 testów)
- `docker compose exec -T app npm run lint` - PASS
- `docker compose exec -T app npx tsc --noEmit` - PASS
- `docker compose exec -T app npx prettier --check src tests prisma vitest.config.ts` - PASS
- `docker compose exec -T app npx prisma migrate deploy` - migracja zastosowana na bazie deweloperskiej
- `npx prisma migrate diff --from-url "$DATABASE_URL" --to-schema-datamodel prisma/schema.prisma` - pusta różnica (brak rozjazdu)

## Decisions
- SQL migracji wygenerowany przez `prisma migrate diff --from-empty --to-schema-datamodel`, na końcu pliku ręcznie dopisany blok: 3 indeksy unikalne tabeli `connection` oraz wszystkie ograniczenia CHECK ze `schema.sql` (Prisma ich nie wyraża).
- Baza testowa: `tests/global-setup.ts` tworzy bazę z `DATABASE_URL_TEST` (jeśli nie istnieje) i wykonuje na niej `prisma migrate deploy` przed każdym przebiegiem Vitest. `tests/setup.ts` podmienia `DATABASE_URL` na adres bazy testowej, więc `src/lib/db.ts` w testach nigdy nie łączy się z bazą deweloperską.
- `resetDb()` z `tests/helpers/db.ts` robi `TRUNCATE board CASCADE`; wołać w `beforeEach` testów integracyjnych. `peg_word` celowo pominięte — do rozstrzygnięcia przy seedzie w TASK-008.
- Naruszenie indeksów wyrażeniowych/częściowych Prisma zgłasza jako `P2002` — handlery API mogą mapować ten kod na 409.
- Klient eksportowany jako `prisma` z `@/lib/db`; pola modeli w camelCase (`boardId`, `sourceNoteId`, `imageWords`), `kind`: `"association" | "chain"`.

## Follow-ups or Blockers
- Po każdej zmianie `schema.prisma` uruchomić w kontenerze `npx prisma generate` (obraz generuje klienta tylko przy budowaniu).
- Zmiana już zastosowanej migracji wymaga usunięcia bazy testowej (`DROP DATABASE mnemoboard_test`) — kolejne zmiany schematu robić nowymi migracjami.
- Nowe migracje tworzyć przez `prisma migrate diff` (albo `migrate dev --create-only`) i sprawdzić, czy wygenerowany SQL nie usuwa ręcznych indeksów `connection_*_uniq`.
- Każdy przebieg Vitest (także same testy jednostkowe) wymaga teraz działającej bazy i `DATABASE_URL_TEST`.

## Next Recommended Task
- TASK-003: Fundament API (odblokowane). TASK-004 (prototyp planszy) też jest odblokowane i niezależne.
