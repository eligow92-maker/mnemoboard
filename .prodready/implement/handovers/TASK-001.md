# TASK-001 Handoff

## Task
- Title: Szkielet projektu
- Status: Done
- Completed at: 2026-10-03

## Acceptance Criteria Covered
- AC-1: strona główna pokazuje nagłówek "Mnemoboard" z linkami "Plansze" i "Lista GSP".
- AC-2: `strict` w tsconfig.json ma wartość true.

## Canonical Tests
- `AC-1: strona główna pokazuje nagłówek "Mnemoboard" z linkami "Plansze" i "Lista GSP"` in `tests/integration/app-shell.test.tsx`
- `AC-2: tsconfig.json ma włączony tryb strict` in `tests/integration/app-shell.test.tsx`
- RED potwierdzony dla obu (AC-1: brak roli `banner`; AC-2: `expected false to be true`), potem GREEN.

## Files Changed
- `src/components/app-shell.tsx` (nowy: nagłówek + nawigacja)
- `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css` (tokeny z `design/ui/tokens.md` jako Tailwind `@theme`)
- `tsconfig.json` (`strict: true`)
- `tests/integration/app-shell.test.tsx`
- `.prodready/plan/backlog.md`, `.prodready/plan/test-plan.md`

## Commands Run
- `docker compose exec -T app npx vitest run` - PASS (2 testy)
- `docker compose exec -T app npm run lint` - PASS
- `docker compose exec -T app npx tsc --noEmit` - PASS
- `docker compose exec -T app npx prettier --check src tests` - PASS

## Decisions
- Polecenia uruchamiane w kontenerze `app` (`docker compose up -d`); kod jest podmontowany, więc zmiany na hoście są widoczne od razu.
- Testy kanoniczne zadania siedzą w jednym pliku, w bloku `describe("TASK-XXX …")`.
- Testy `.tsx` działają w jsdom, `.ts` w środowisku node (`environmentMatchGlobs` w `vitest.config.ts` — Vitest zgłasza, że opcja jest przestarzała; do zamiany na `test.projects` przy okazji).
- Kolory i cienie z tokenów są dostępne jako klasy Tailwind (`bg-note`, `text-primary`, `shadow-note` itd.).
- Link "Lista GSP" prowadzi do `/peg-words`, której jeszcze nie ma (powstanie w TASK-009).

## Follow-ups or Blockers
- Skrypty instalacyjne npm są na hoście zablokowane (Prisma, esbuild) — polecenia uruchamiać w kontenerze.
- Testy E2E (Playwright) uruchamiać z hosta; przeglądarkę trzeba doinstalować (`npx playwright install chromium`) przed TASK-007.

## Next Recommended Task
- TASK-002: Schemat bazy i migracja (odblokowane; TASK-004 też jest odblokowane i niezależne).
