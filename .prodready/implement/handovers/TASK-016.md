# TASK-016 Handoff

## Task
- Title: Kolejność kart powtórki
- Status: Done
- Completed at: 2026-10-04

## Acceptance Criteria Covered
- AC-1: łańcuch B→C i najstarsza luźna karteczka A → kolejność B, C, A.
- AC-2: luźne karteczki utworzone w kolejności A, B, C → kolejność A, B, C.

## Canonical Tests
- `AC-1: dla planszy z łańcuchem B→C i luźną karteczką A utworzoną najwcześniej kolejność powtórki to B, C, A` in `tests/unit/review-order.test.ts`
- `AC-2: dla planszy z luźnymi karteczkami utworzonymi w kolejności A, B, C kolejność powtórki to A, B, C` in `tests/unit/review-order.test.ts`
- RED potwierdzony na zaślepce modułu, potem GREEN.
- Testy techniczne: kolejność wielu łańcuchów, kolejność ogniw ponad datami, karteczki łańcucha spoza listy, pusta plansza.

## Files Changed
- `src/modules/review/order.ts`, `tests/unit/review-order.test.ts`
- `.prodready/plan/backlog.md`, `.prodready/plan/test-plan.md`

## Commands Run
- `docker compose exec -T app npx vitest run` - PASS (115 testów)
- `docker compose exec -T app npx tsc --noEmit` - PASS
- `docker compose exec -T app npm run lint` - PASS

## Decisions
- `reviewOrder(notes, chainLinks)` dostaje tylko karteczki biorące udział w powtórce; karteczki łańcucha spoza listy są pomijane z zachowaniem kolejności pozostałych, a łańcuch sortuje się datą pierwszej uwzględnionej karteczki.

## Follow-ups or Blockers
- None

## Next Recommended Task
- TASK-017: US-011 — Przebieg powtórki.
