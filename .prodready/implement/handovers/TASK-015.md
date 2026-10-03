# TASK-015 Handoff

## Task
- Title: US-010 — Pokoje pałacu pamięci
- Status: Done
- Completed at: 2026-10-04

## Acceptance Criteria Covered
- AC-1: strefa utworzona z nazwą "Kuchnia" jest widoczna na planszy.
- AC-2: karteczka upuszczona w strefie jest przypisana do pokoju "Kuchnia".
- AC-3: karteczka przeciągnięta poza strefę nie ma pokoju.
- AC-4: po usunięciu strefy karteczki zostają bez pokoju.

## Canonical Tests
- `AC-1: strefa utworzona z nazwą "Kuchnia" jest widoczna na planszy z tą nazwą` in `tests/integration/us-010-zones.test.tsx`
- `AC-2: karteczka upuszczona w obrębie strefy "Kuchnia" jest przypisana do pokoju "Kuchnia"` in `tests/integration/us-010-zones.test.tsx`
- `AC-3: karteczka przeciągnięta poza strefę "Kuchnia" nie jest przypisana do żadnego pokoju` in `tests/integration/us-010-zones.test.tsx`
- `AC-4: po usunięciu strefy zawierającej karteczki karteczki pozostają na planszy bez przypisanego pokoju` in `tests/integration/us-010-zones.test.tsx`
- RED potwierdzony na pustych trasach i braku elementów interfejsu, potem GREEN.
- Testy techniczne: pusta nazwa pokoju; API stref (przypisania po utworzeniu, przesunięciu i usunięciu nakładającej się strefy, walidacja, 404).

## Files Changed
- `src/app/api/boards/[boardId]/zones/route.ts`, `src/app/api/zones/[zoneId]/route.ts`
- `src/modules/arrangement/{zone-service,schema}.ts`, `src/modules/notes/service.ts`
- `src/components/board/{board-canvas,board-editor-screen,board-toolbar,note-node,zone-node,zone-editor,side-panel,note-editor,connection-panel}.tsx`
- `tests/integration/us-010-zones.test.tsx`, `tests/helpers/api-fetch.ts`
- `.prodready/plan/backlog.md`, `.prodready/plan/test-plan.md`

## Commands Run
- `docker compose exec -T app npx vitest run` - PASS (109 testów)
- `docker compose exec -T app npx tsc --noEmit` - PASS
- `docker compose exec -T app npm run lint` - PASS
- Skrypt Playwright ad hoc w Chromium: dodanie karteczki kliknięciem wewnątrz strefy, przesunięcie strefy za etykietę (PATCH + przeliczenie), 4 uchwyty rozmiaru po zaznaczeniu — działa.

## Decisions
- "Dodaj pokój" → wskazanie miejsca → ZoneEditor z nazwą; nowa strefa ma 320×240 ze środkiem we wskazanym punkcie.
- Strefa to węzeł React Flow pod karteczkami; jej powierzchnia nie przechwytuje dotyku (przesuwanie widoku i wskazywanie miejsca działają także nad strefą). Strefę przesuwa się za etykietę z nazwą, rozmiar zmienia uchwytami po zaznaczeniu (min. 160 px).
- Dotknięcie etykiety otwiera ZoneEditor (zmiana nazwy, "Usuń pokój").
- Karteczka pokazuje znaczek z nazwą pokoju (`aria-label="Pokój: …"`).
- `zoneId` liczy serwer: przy utworzeniu i przesunięciu karteczki oraz po każdej zmianie/usunięciu strefy (`recalculateBoardZones`); klient po zmianie strefy wczytuje planszę ponownie.
- Wspólny `SidePanel` dla NoteEditor, ZoneEditor i ConnectionPanel.

## Follow-ups or Blockers
- None

## Next Recommended Task
- TASK-016: Kolejność kart powtórki.
