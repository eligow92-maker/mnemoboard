# TASK-024 Handoff

## Task
- Title: Migracja schematu iteracji 2
- Status: Done
- Completed at: 2026-10-04

## Acceptance Criteria Covered
- AC-1: karteczka zapisana bez koloru, opowiadania i emotek ma kolor `yellow` oraz puste opowiadanie i emotki.
- AC-2: hasło "333" bez słowa startowego zapisuje się.
- AC-3: baza odrzuca hasło "33" bez słowa startowego ograniczeniem CHECK.

## Canonical Tests
- `AC-1: karteczka zapisana bez koloru, opowiadania i emotek ma kolor yellow oraz puste opowiadanie i emotki` in `tests/integration/db-schema-v2.test.ts`
- `AC-2: zapis hasła "333" bez słowa startowego się udaje` in `tests/integration/db-schema-v2.test.ts`
- `AC-3: baza odrzuca zapis hasła "33" bez słowa startowego błędem ograniczenia CHECK` in `tests/integration/db-schema-v2.test.ts`
- RED potwierdzony dla wszystkich trzech (3 failed), potem GREEN.

## Files Changed
- `prisma/schema.prisma`, `prisma/migrations/20261004000000_iteration2_note_fields_custom_pegs/migration.sql`
- `src/modules/word-images/service.ts` (reset własnego wpisu → 409 `PEG_NO_DEFAULT`), `src/lib/api-types.ts` (`defaultWord: string | null`)
- `tests/integration/db-schema-v2.test.ts`
- `.prodready/plan/backlog.md`, `.prodready/plan/test-plan.md`

## Commands Run
- `docker compose exec -T app npx vitest run` - PASS (152 testy)
- `docker compose exec -T app npx tsc --noEmit` - PASS
- `docker compose exec -T app npm run lint` - PASS
- `docker compose exec -T app npx prettier --check prisma src tests` - PASS

## Decisions
- Migracja init miała już `peg_word_number_check` (1–2 cyfry) i `peg_word_default_word_check` (niepuste słowo startowe); nowa migracja je usuwa i dodaje odpowiedniki dla 1–15 cyfr oraz reguły "brak słowa startowego ⇔ liczba ≥ 3 cyfr".
- Pierwsza próba migracji padła na zduplikowanej nazwie ograniczenia; oznaczona `migrate resolve --rolled-back` w bazie dev i testowej, po czym wykonana poprawiona wersja.
- Pliki w kontenerze zmieniane w miejscu (notatka o Docker Desktop); md5 migracji host/kontener zgodne.

## Follow-ups or Blockers
- Odpowiedź API hasła GSP nie ma jeszcze pola `kind` — dochodzi w TASK-030.

## Next Recommended Task
- TASK-025: US-015 — Opowiadanie na karteczce.
