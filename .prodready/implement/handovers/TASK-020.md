# TASK-020 Handoff

## Task
- Title: US-002 — Zarządzanie planszami
- Status: Done
- Completed at: 2026-10-04

## Acceptance Criteria Covered
- AC-1: zmiana nazwy "Historia" → "Historia Polski" widoczna na liście.
- AC-2: usunięcie planszy wymaga potwierdzenia.
- AC-3: po potwierdzeniu znika plansza i jej karteczki, połączenia, strefy oraz wyniki powtórek.

## Canonical Tests
- `AC-1: po zmianie nazwy planszy "Historia" na "Historia Polski" na liście plansz widnieje nowa nazwa` in `tests/integration/us-002-manage-boards.test.tsx`
- `AC-2: wybranie usunięcia planszy z karteczkami pokazuje pytanie o potwierdzenie przed usunięciem` in `tests/integration/us-002-manage-boards.test.tsx`
- `AC-3: po potwierdzonym usunięciu planszy nie istnieje ona ani jej karteczki, połączenia, strefy i wyniki powtórek` in `tests/integration/us-002-manage-boards.test.tsx`
- RED potwierdzony (brak przycisków, trasy 404), potem GREEN.
- Test techniczny: PATCH/DELETE — walidacja nazwy i 404.

## Files Changed
- `src/app/api/boards/[boardId]/route.ts`, `src/modules/boards/service.ts`
- `src/components/boards/{board-card,board-form,board-list-screen}.tsx`
- `tests/integration/us-002-manage-boards.test.tsx`
- `.prodready/plan/backlog.md`, `.prodready/plan/test-plan.md`

## Commands Run
- `docker compose exec -T app npx vitest run` - PASS (142 testy)
- `docker compose exec -T app npx tsc --noEmit` - PASS
- `docker compose exec -T app npm run lint` - PASS

## Decisions
- Zamiast rozwijanego menu karta planszy ma dwa przyciski pod spodem: "Zmień nazwę" (formularz w karcie) i "Usuń" (ConfirmDialog "Usunąć planszę?" → "Usuń planszę").
- Kaskadę usuwania realizuje baza (klucze obce ON DELETE CASCADE).
- `DELETE /api/boards/{id}` umożliwia testom E2E sprzątanie po sobie.

## Follow-ups or Blockers
- None

## Next Recommended Task
- TASK-021: US-014 — Praca na telefonie.
