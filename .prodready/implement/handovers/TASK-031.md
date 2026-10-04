# TASK-031 Handoff

## Task
- Title: US-020 — Generator korzysta z własnych wpisów
- Status: Done
- Completed at: 2026-10-04

## Acceptance Criteria Covered
- AC-1: zagadnienie "333" z własnym wpisem "333" → "mumia-mysz".
- AC-2: "48333" → słowo z listy GSP dla "48" i "mumia-mysz".
- AC-3: wpisy "333" i "3334", zagadnienie "3334" → słowo wpisu "3334".
- AC-4: bez własnych wpisów "333" → słowo dla "33" i dla "3".

## Canonical Tests
- `AC-1…AC-4` in `tests/integration/us-020-generate-custom.test.tsx`
- RED potwierdzony dla AC-1, AC-2, AC-3. **AC-4 przechodziło od razu**: opisuje zachowanie bez własnych wpisów, które się nie zmienia (strażnik regresji), więc nie ma czego „czerwienić" — świadomie bez sztucznego wzmacniania.
- Testy techniczne: pole `source` segmentów w API; zmiana słowa własnego wpisu jest od razu używana.

## Files Changed
- `src/modules/word-images/service.ts` (`loadPegWordMaps` rozdziela hasła wbudowane i własne), `src/lib/api-types.ts`
- `tests/integration/us-020-generate-custom.test.tsx`
- `.prodready/plan/backlog.md`, `.prodready/plan/test-plan.md`

## Commands Run
- `docker compose exec -T app npx vitest run` - PASS (198 testów)
- `docker compose exec -T app npx tsc --noEmit` - PASS
- `docker compose exec -T app npm run lint` - PASS

## Decisions
- Akcja "Generuj słowa" w NoteEditor bez zmian w interfejsie; zmiana tylko po stronie serwera.
- Własne wpisy są rozpoznawane po `defaultWord = NULL` (jedna tabela `peg_word`).

## Follow-ups or Blockers
- None. Sprint 6 zakończony.

## Next Recommended Task
- TASK-032: Format pliku i walidacja (moduł transfer) — Sprint 7.
