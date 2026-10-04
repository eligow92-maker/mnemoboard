# TASK-029 Handoff

## Task
- Title: Dopasowanie własnych wpisów w generatorze
- Status: Done
- Completed at: 2026-10-04

## Acceptance Criteria Covered
- AC-1: własny wpis "333", ciąg "48333" → "48", "333".
- AC-2: własne wpisy "333" i "3334", ciąg "3334" → jeden segment "3334".
- AC-3: własny wpis "333", ciąg "3331333" → "333", "1", "333".

## Canonical Tests
- `AC-1…AC-3` in `tests/unit/custom-pegs.test.ts`; RED potwierdzony (6 z 8 testów nieprzechodzących, w tym wszystkie trzy AC), potem GREEN.
- Testy techniczne: separator przerywa dopasowanie ("33-3"), fragment przed wpisem "4333" → "4","333", bez własnych wpisów bez zmian, wpis 15-cyfrowy, `source` segmentu.

## Files Changed
- `src/modules/word-images/generator.ts`
- `tests/unit/custom-pegs.test.ts`, `tests/unit/word-images.test.ts`, `tests/integration/us-006-generate.test.tsx` (oczekiwania zaktualizowane o `source: "builtin"`)
- `.prodready/plan/backlog.md`, `.prodready/plan/test-plan.md`

## Commands Run
- `docker compose exec -T app npx vitest run` - PASS
- `docker compose exec -T app npx tsc --noEmit` - PASS
- `docker compose exec -T app npm run lint` - PASS

## Decisions
- Najpierw wyszukiwane są własne wpisy od lewej (najdłuższy w danym miejscu), dopiero potem fragmenty dzielone na pary — dlatego "4333" daje "4","333", a nie "43","33".
- `splitDigits(topic, customNumbers?)` i `generateWordImages(topic, builtin, custom?)` mają opcjonalne trzecie argumenty; dotychczasowe wywołania działają bez zmian, ale segment ma nowe pole `source`.
- Generator jeszcze nie jest podłączony do bazy (TASK-031).

## Follow-ups or Blockers
- None

## Next Recommended Task
- TASK-030: US-019 — Zarządzanie własnymi wpisami GSP.
