# TASK-034 Handoff

## Task
- Title: US-022 — Import planszy
- Status: Done
- Completed at: 2026-10-04

## Acceptance Criteria Covered
- AC-1: import pliku z 3 karteczkami, 1 strefą i łańcuchem A→B→C tworzy nową planszę z tą zawartością i kolejnością łańcucha.
- AC-2: import pliku "Historia" przy istniejącej "Historia" nie zmienia istniejącej, nowa to "Historia (import)".
- AC-3: plik, który nie jest eksportem → "Plik nie jest poprawnym eksportem Mnemoboard", brak planszy.
- AC-4: plik > 5 MB → "Plik jest za duży (limit 5 MB)", brak planszy.

## Canonical Tests
- `AC-1…AC-4` in `tests/integration/us-022-import.test.tsx`; RED potwierdzony (plik testowy nie przechodził bez trasy), potem GREEN.
- Testy techniczne: 413 `FILE_TOO_LARGE` z API; 400 `INVALID_EXPORT_FILE` (zły JSON, zły rodzaj, niespójne powiązania); trzy importy → "Historia", "Historia (import)", "Historia (import 2)" z nowymi identyfikatorami; nazwa 100-znakowa mieści się po dopisku; odrzucony plik nie zostawia częściowych danych.

## Files Changed
- `src/modules/transfer/service.ts` (`importBoard`, `createBoardFromContent`, `uniqueBoardName`, `readJsonFile`, `readBoardExportFile`), `src/app/api/boards/import/route.ts`
- `src/lib/api-client.ts` (`apiJsonText`), `src/components/backup/{file-button,backup-panel}.tsx`, `src/components/boards/board-list-screen.tsx`
- `tests/integration/us-022-import.test.tsx`, `tests/helpers/api-fetch.ts` (trasa importu przed `[boardId]`)
- `.prodready/plan/backlog.md`, `.prodready/plan/test-plan.md`

## Commands Run
- `docker compose exec -T app npx vitest run` - PASS (221 testów)
- `docker compose exec -T app npx tsc --noEmit` - PASS
- `docker compose exec -T app npm run lint` - PASS
- `npx playwright test` - patrz wynik w podsumowaniu sesji

## Decisions
- Limit rozmiaru sprawdzany przed parsowaniem: nagłówek `content-length`, potem rzeczywista długość tekstu. Limit w `withApi` (16 KB) nie dotyczy trasy importu, bo ta czyta treść sama (`readJsonFile`); klient dodatkowo odrzuca zbyt duży plik bez wysyłania.
- Zapis: jedna transakcja interaktywna (timeout 60 s), `createMany` dla stref, karteczek i połączeń; identyfikatory z pliku służą tylko do mapowania, rekordy dostają nowe.
- Zajęta nazwa: " (import)", potem " (import 2)", " (import 3)"…; podstawa skracana do 100 znaków.
- `FileReader` zamiast `File.text()` (jsdom go nie ma); `FileButton` to `<label>` z ukrytym polem pliku, więc nazwa pola = tekst przycisku.
- `createBoardFromContent` jest gotowe do ponownego użycia przy przywracaniu kopii (TASK-035).
- `BackupPanel` ma na razie tylko import; "Pobierz kopię" i "Przywróć z kopii" w TASK-036.

## Follow-ups or Blockers
- None

## Next Recommended Task
- TASK-035: Przywracanie kopii — reguły scalania.
