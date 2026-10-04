# TASK-036 Handoff

## Task
- Title: US-023 — Pełna kopia zapasowa
- Status: Done
- Completed at: 2026-10-04

## Acceptance Criteria Covered
- AC-1: "Pobierz kopię" daje plik z 2 planszami z historią powtórek, słowem dla "14" i wpisem "333".
- AC-2: przywrócenie na świeżej instalacji daje 2 plansze z wynikami ostatnich powtórek, słowo "14" i wpis "333".
- AC-3: przywrócenie przy istniejącej "Biologia" nie zmienia jej, lista ma 3 plansze.
- AC-4: "Przywróć z kopii" pokazuje "Zostaną dodane 2 plansze", dane zmieniają się po potwierdzeniu.
- AC-5: uszkodzony plik → "Plik nie jest poprawną kopią Mnemoboard", bez zmian danych.

## Canonical Tests
- `AC-1…AC-5` in `tests/integration/us-023-backup.test.tsx`; RED potwierdzony (plik testowy nie przechodził bez tras), potem GREEN.
- Dane do przywracania powstają prawdziwym obiegiem: zapis kopii przez API, wyczyszczenie bazy, wczytanie pliku.
- Testy techniczne: anulowanie nie zmienia danych; plik eksportu planszy nie jest przyjmowany jako kopia; odmiana "Zostanie dodana 1 plansza"; API `dryRun` bez zapisu, 400 `INVALID_BACKUP_FILE`, 413 `FILE_TOO_LARGE` (50 MB).

## Files Changed
- `src/modules/transfer/service.ts` (`buildBackup`, `readBackupFile`), `src/app/api/backup/route.ts`, `src/app/api/backup/restore/route.ts`
- `src/components/backup/{backup-panel,restore-confirm-dialog}.tsx`, `src/components/boards/board-list-screen.tsx`, `src/lib/api-types.ts`
- `tests/integration/us-023-backup.test.tsx`, `tests/helpers/api-fetch.ts`
- `.prodready/plan/backlog.md`, `.prodready/plan/test-plan.md`

## Commands Run
- `docker compose exec -T app npx vitest run` - PASS (239 testów)
- `docker compose exec -T app npx tsc --noEmit` - PASS
- `docker compose exec -T app npm run lint` - PASS
- `npx playwright test` - patrz podsumowanie sesji

## Decisions
- Przywracanie dwuetapowe: wybór pliku → `POST /api/backup/restore?dryRun=true` → okno z liczbami → `POST` bez `dryRun` tym samym tekstem pliku.
- Okno potwierdzenia wymienia też liczbę własnych wpisów GSP i uzupełnianych słów oraz przypomina, że istniejące dane pozostają bez zmian.
- Do kopii trafiają hasła wbudowane tylko ze zmienionym słowem i wszystkie własne wpisy.
- Panel jest widoczny także w pustym stanie listy plansz (po awarii serwera tu zaczyna się odzyskiwanie danych).
- `BackupPanel` przyjmuje `onDataChanged` (odświeża listę po imporcie i przywróceniu).

## Follow-ups or Blockers
- None

## Next Recommended Task
- TASK-037: Wydajność i bezpieczeństwo plików.

## Poprawka po użyciu (2026-10-04)
- Zgłoszenie: "Importuj planszę" odrzuciła plik z komunikatem "Plik nie jest poprawnym eksportem Mnemoboard". Z logów serwera: użytkownik pobrał pełną kopię ("Pobierz kopię", `GET /api/backup`) i wczytał ją jako import planszy (`kind: backup`), więc odrzucenie było zgodne z założeniem, ale komunikat mylący.
- Zmiana: pełna kopia wczytana jako import dostaje "To jest pełna kopia zapasowa. Wczytaj ją przyciskiem „Przywróć z kopii”.", a eksport planszy wczytany jako kopia — "To jest eksport jednej planszy. Wczytaj go przyciskiem „Importuj planszę”." Kody błędów bez zmian (`INVALID_EXPORT_FILE`, `INVALID_BACKUP_FILE`).
- Testy techniczne w `tests/integration/us-023-backup.test.tsx` (dwa nowe/zmienione); RED potwierdzony przed zmianą.
