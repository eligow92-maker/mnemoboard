# TASK-004 Handoff

## Task
- Title: Prototyp planszy (React Flow, dotyk)
- Status: Done
- Completed at: 2026-10-03

## Acceptance Criteria Covered
- AC-1: BoardCanvas dla planszy z jedną karteczką pokazuje węzeł z jej zagadnieniem.
- AC-2: po zakończeniu przeciągania BoardCanvas wywołuje `onNoteMove` z identyfikatorem karteczki i nowym położeniem.

## Canonical Tests
- `AC-1: BoardCanvas dla planszy z jedną karteczką pokazuje węzeł z jej zagadnieniem` in `tests/integration/board-canvas.test.tsx`
- `AC-2: po zakończeniu przeciągania karteczki BoardCanvas wywołuje onNoteMove z jej identyfikatorem i nowym położeniem` in `tests/integration/board-canvas.test.tsx`
- RED potwierdzony na zaślepce komponentu (`Unable to find an element by: [data-testid="rf__node-note-1"]`), potem GREEN.
- Test techniczny: samo kliknięcie karteczki nie zgłasza przesunięcia.

## Files Changed
- `src/components/board/board-canvas.tsx`, `src/components/board/note-node.tsx`
- `tests/integration/board-canvas.test.tsx`, `tests/helpers/react-flow.ts`
- `tests/setup.ts` (sprzątanie DOM po każdym teście), `vitest.config.ts` (pominięcie konfiguracji PostCSS)
- `.prodready/plan/backlog.md`, `.prodready/plan/test-plan.md`

## Commands Run
- `docker compose exec -T app npx vitest run` - PASS (17 testów)
- `docker compose exec -T app npx tsc --noEmit` - PASS
- `docker compose exec -T app npm run lint` - PASS

## Decisions
- Konfiguracja dotyku: `nodesDraggable` + `panOnDrag` + `zoomOnPinch` (domyślne zachowanie React Flow: przeciągnięcie karteczki przesuwa karteczkę, przeciągnięcie tła przesuwa widok). Położenie zgłaszane raz, w `onNodeDragStop`.
- `BoardCanvas` trzyma stan węzłów lokalnie (`useNodesState`) i nadpisuje go przy każdej zmianie właściwości `notes`.
- Testy React Flow w jsdom: `mockReactFlow()` (ResizeObserver, DOMMatrixReadOnly, rozmiary) oraz `startDrag`/`endDrag`/`dragElement` z `tests/helpers/react-flow.ts`. Węzeł karteczki ma `data-testid="rf__node-<id>"`.
- React Flow liczy przesunięcie od pierwszego ruchu ponad próg 1 px — pomocnik testowy to kompensuje.

## Follow-ups or Blockers
- NIEWYKONANE: ręczne sprawdzenie przeciągania na prawdziwym telefonie (wymaga człowieka z urządzeniem). Zastępczo przeciąganie dotykiem sprawdzi test Playwright w profilu mobilnym w TASK-021 (AC-2).
- `onlyRenderVisibleElements` do włączenia w TASK-023.

## Next Recommended Task
- TASK-005: US-001 — Utworzenie pierwszej planszy.
