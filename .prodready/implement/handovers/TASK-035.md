# TASK-035 Handoff

## Task
- Title: Przywracanie kopii — reguły scalania
- Status: Done
- Completed at: 2026-10-04

## Acceptance Criteria Covered
- AC-1: hasło "14" równe startowemu przyjmuje "tur" z kopii.
- AC-2: hasło "14" zmienione na "tara" zostaje "tara".
- AC-3: istniejący własny wpis "333" ("mamut") nie jest nadpisywany przez kopię.
- AC-4: plansza z ukończoną powtórką 8 z 10 trafia jako nowa, z 10 wynikami przypisanymi do jej własnych karteczek.

## Canonical Tests
- `AC-1…AC-4` in `tests/integration/backup-restore.test.ts`; RED potwierdzony (9/9), potem GREEN.
- Testy techniczne: dodawanie brakujących własnych wpisów; `dryRun` zlicza i nic nie zapisuje; unikalne nazwy plansz o tej samej nazwie; przekroczenie 500 własnych wpisów → 409 `PEG_LIMIT` bez żadnych zmian (także plansz); hasło wbudowane nieobecne w bazie jest pomijane.

## Files Changed
- `src/modules/transfer/service.ts` (`restoreBackup`, `planPegWords`, `addReviewSessions`; `createBoardFromContent` zwraca też mapowanie id karteczek)
- `tests/integration/backup-restore.test.ts`
- `.prodready/plan/backlog.md`, `.prodready/plan/test-plan.md`

## Commands Run
- `docker compose exec -T app npx vitest run` - PASS (230 testów)
- `docker compose exec -T app npx tsc --noEmit` - PASS
- `docker compose exec -T app npm run lint` - PASS

## Decisions
- Przywrócenie tylko dokłada; ponowne wczytanie tej samej kopii dubluje plansze (znane ryzyko z PRD).
- Słowo hasła wbudowanego z kopii dłuższe niż 40 znaków jest pomijane (limit hasła wbudowanego).
- Transakcja interaktywna z timeoutem 120 s; sesje i wyniki powtórek zapisywane wsadowo po planszy.
- `dryRun` korzysta z tej samej funkcji planującej (`planPegWords`), więc zapowiedź zgadza się z zapisem, łącznie z błędem `PEG_LIMIT`.
- Warstwa HTTP (`/api/backup`, `/api/backup/restore`, komunikaty `INVALID_BACKUP_FILE`) i interfejs — TASK-036.

## Follow-ups or Blockers
- None

## Next Recommended Task
- TASK-036: US-023 — Pełna kopia zapasowa.
