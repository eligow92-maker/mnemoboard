# TASK-011 Handoff

## Task
- Title: US-005 — Ręczne słowa-obrazy
- Status: Done
- Completed at: 2026-10-04

## Acceptance Criteria Covered
- AC-1: ręcznie wpisane i zapisane słowa-obrazy są widoczne na karteczce pod zagadnieniem.
- AC-2: "Generuj słowa" dla zagadnienia bez cyfr pokazuje "Brak liczb – wpisz słowa-obrazy samodzielnie".

## Canonical Tests
- `AC-1: słowa-obrazy "mity, chondryt" wpisane i zapisane dla karteczki "Mitochondrium" są widoczne na karteczce pod zagadnieniem` in `tests/integration/us-005-manual-words.test.tsx`
- `AC-2: "Generuj słowa" dla zagadnienia bez cyfr nie generuje słów i pokazuje komunikat "Brak liczb – wpisz słowa-obrazy samodzielnie"` in `tests/integration/us-005-manual-words.test.tsx`
- RED potwierdzony (słowa nie były zapisywane; komunikat nie istniał), potem GREEN.
- Testy techniczne: słowa-obrazy przy tworzeniu karteczki, wyczyszczenie pola zapisuje `null`.

## Files Changed
- `src/components/board/{note-editor,board-editor-screen}.tsx`
- `tests/integration/us-005-manual-words.test.tsx`
- `.prodready/plan/backlog.md`, `.prodready/plan/test-plan.md`

## Commands Run
- `docker compose exec -T app npx vitest run` - PASS (70 testów)
- `docker compose exec -T app npx tsc --noEmit` - PASS
- `docker compose exec -T app npm run lint` - PASS

## Decisions
- Puste pole słów-obrazów jest wysyłane jako `null`.
- Komunikat `NO_DIGITS` pokazywany pod polem słów-obrazów (`role="status"`), stała `NO_DIGITS_MESSAGE` w `note-editor.tsx`.

## Follow-ups or Blockers
- None

## Next Recommended Task
- TASK-009: US-007 — Edytowalna lista słów GSP.
