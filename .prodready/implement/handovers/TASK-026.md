# TASK-026 Handoff

## Task
- Title: US-016 — Emotki na karteczce
- Status: Done
- Completed at: 2026-10-04

## Acceptance Criteria Covered
- AC-1: emotki wpisane w edytorze są po odświeżeniu widoczne na karteczce.
- AC-2: emotki na planszy przy powiększeniu 100% mają rozmiar czcionki ≥ 24 px (Playwright).
- AC-3: 9 emotek → odrzucenie z komunikatem "Najwyżej 8 emotek".
- AC-4: w powtórce emotki są przed odsłonięciem zakryte ("Słowa-obrazy i emotki są zakryte.").

## Canonical Tests
- `AC-1`, `AC-3`, `AC-4` in `tests/integration/us-016-emoji.test.tsx`
- `AC-2` in `tests/e2e/us-016-emoji.spec.ts`
- RED potwierdzony dla wszystkich czterech, potem GREEN.
- Test techniczny: flaga, emotka z odcieniem skóry i sekwencja ZWJ liczą się jako po jedna (8 emotek przechodzi).

## Files Changed
- `src/modules/notes/{schema,service}.ts`, `src/modules/review/service.ts`, `src/lib/api-types.ts`, `src/app/globals.css`
- `src/components/board/{note-editor,note-node,board-canvas,board-editor-screen}.tsx`, `src/components/review/review-screen.tsx`
- `tests/integration/us-016-emoji.test.tsx`, `tests/e2e/us-016-emoji.spec.ts`, `tests/e2e/helpers.ts`
- `.prodready/plan/backlog.md`, `.prodready/plan/test-plan.md`

## Commands Run
- `docker compose exec -T app npx vitest run` - PASS (161 testów)
- `docker compose exec -T app npx tsc --noEmit` - PASS
- `docker compose exec -T app npm run lint` - PASS
- `npx playwright test tests/e2e/us-016-emoji.spec.ts --project=desktop` - PASS

## Decisions
- Limit 8 liczony `Intl.Segmenter` (ADR-006); dodatkowo długość napisu ≤ 64 (kolumna), z tym samym komunikatem.
- Tokeny `--text-emoji` (1.5rem) i `--text-emoji-review` (2.5rem) w `globals.css` zgodnie z `tokens.md`.
- Komunikat zakrycia w powtórce składany z tego, co karteczka ma: "Słowa-obrazy[, opowiadanie] [i emotki] są zakryte."
- Po migracji i `prisma generate` serwer dev w kontenerze trzyma stary klient Prisma — E2E dostawało 500 do czasu `docker compose restart app`.

## Follow-ups or Blockers
- None

## Next Recommended Task
- TASK-027: US-017 — Kolory karteczek.
