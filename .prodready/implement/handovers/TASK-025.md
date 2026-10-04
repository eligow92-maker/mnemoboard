# TASK-025 Handoff

## Task
- Title: US-015 — Opowiadanie na karteczce
- Status: Done
- Completed at: 2026-10-04

## Acceptance Criteria Covered
- AC-1: opowiadanie wpisane w edytorze jest po odświeżeniu widoczne na karteczce pod słowami-obrazami.
- AC-2: w powtórce opowiadanie jest przed odsłonięciem zakryte (karta pokazuje "Słowa-obrazy i opowiadanie są zakryte.").
- AC-3: po "Odsłoń" opowiadanie widać obok słów-obrazów.
- AC-4: opowiadanie dłuższe niż 2000 znaków jest odrzucane z komunikatem "Opowiadanie może mieć najwyżej 2000 znaków".

## Canonical Tests
- `AC-1…AC-4` in `tests/integration/us-015-story.test.tsx`
- RED potwierdzony dla wszystkich czterech, potem GREEN. AC-2 początkowo przechodziło bez implementacji (opowiadania nie było w karcie), więc wzmocniono je o komunikat zakrycia.
- Test techniczny: karteczka tylko z opowiadaniem, bez słów-obrazów, nie wchodzi do powtórki (potwierdzone w Define, odpowiedź 6).

## Files Changed
- `src/modules/notes/schema.ts`, `src/modules/notes/service.ts`, `src/modules/review/service.ts`, `src/lib/api-types.ts`
- `src/components/board/{note-editor,note-node,board-canvas,board-editor-screen}.tsx`, `src/components/review/review-screen.tsx`
- `tests/integration/us-015-story.test.tsx`
- `.prodready/plan/backlog.md`, `.prodready/plan/test-plan.md`

## Commands Run
- `docker compose exec -T app npx vitest run` - PASS (157 testów)
- `docker compose exec -T app npx tsc --noEmit` - PASS
- `docker compose exec -T app npm run lint` - PASS
- `docker compose exec -T app npx prettier --check src tests` - PASS

## Decisions
- Pole "Opowiadanie" w edytorze nie ma atrybutu `maxLength`: limit 2000 egzekwuje serwer, a edytor pokazuje komunikat przy polu (inaczej AC-4 byłoby nieosiągalne z interfejsu).
- Na karteczce opowiadanie jest obcięte do 2 wierszy (`line-clamp-2`), kursywą; całość w edytorze i powtórce.
- `NoteDto` dostało tylko `story`; `emoji` i `color` dojdą w TASK-026 i TASK-027 (API zwraca je już teraz, bo serwis zwraca cały rekord).

## Follow-ups or Blockers
- None

## Next Recommended Task
- TASK-026: US-016 — Emotki na karteczce.
