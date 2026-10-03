# TASK-014 Handoff

## Task
- Title: Geometria stref
- Status: Done
- Completed at: 2026-10-04

## Acceptance Criteria Covered
- AC-1: karteczka ze środkiem wewnątrz strefy dostaje identyfikator tej strefy.
- AC-2: przy nakładających się strefach wygrywa utworzona później.
- AC-3: po przesunięciu strefy poza karteczkę przeliczenie daje brak strefy.

## Canonical Tests
- `AC-1: dla karteczki, której środek leży wewnątrz strefy, wynikiem jest identyfikator tej strefy` in `tests/unit/zones.test.ts`
- `AC-2: dla karteczki w części wspólnej dwóch nakładających się stref wynikiem jest strefa utworzona później` in `tests/unit/zones.test.ts`
- `AC-3: po przesunięciu strefy poza karteczkę przeliczenie przypisań zostawia karteczkę bez strefy` in `tests/unit/zones.test.ts`
- RED potwierdzony na zaślepce modułu, potem GREEN.
- Testy techniczne: środek a nie róg, krawędź strefy, usunięcie nowszej strefy, minimalny rozmiar, brak stref.

## Files Changed
- `src/modules/arrangement/{zones,note-size}.ts`, `src/components/board/dimensions.ts` (reeksport rozmiaru karteczki)
- `tests/unit/zones.test.ts`
- `.prodready/plan/backlog.md`, `.prodready/plan/test-plan.md`

## Commands Run
- `docker compose exec -T app npx vitest run` - PASS (103 testy)
- `docker compose exec -T app npx tsc --noEmit` - PASS
- `docker compose exec -T app npm run lint` - PASS

## Decisions
- Środek karteczki = położenie + (90, 48) — stały rozmiar 180×96 z tokenów (`note-size.ts`), niezależnie od faktycznej wysokości karteczki z długim tekstem.
- Krawędź strefy należy do strefy. Przy tej samej dacie utworzenia wygrywa strefa późniejsza na liście.

## Follow-ups or Blockers
- None

## Next Recommended Task
- TASK-015: US-010 — Pokoje pałacu pamięci.
