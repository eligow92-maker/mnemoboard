# TASK-005 Handoff

## Task
- Title: US-001 — Utworzenie pierwszej planszy
- Status: Done
- Completed at: 2026-10-04

## Acceptance Criteria Covered
- AC-1: bez plansz widoczny pusty stan z komunikatem i przyciskiem "Utwórz pierwszą planszę".
- AC-2: utworzona plansza "Historia Polski" pojawia się na liście i otwiera się jako pusta.
- AC-3: pusta nazwa nie tworzy planszy, komunikat "Podaj nazwę planszy".

## Canonical Tests
- `AC-1: bez żadnej planszy aplikacja pokazuje pusty stan z komunikatem i przyciskiem "Utwórz pierwszą planszę"` in `tests/integration/us-001-create-board.test.tsx`
- `AC-2: utworzona plansza "Historia Polski" pojawia się na liście i otwiera się jako pusta` in `tests/integration/us-001-create-board.test.tsx`
- `AC-3: zatwierdzenie pustej nazwy nie tworzy planszy i pokazuje komunikat "Podaj nazwę planszy"` in `tests/integration/us-001-create-board.test.tsx`
- RED potwierdzony na pustym komponencie i pustej trasie (brak elementów, 404), potem GREEN.
- Testy techniczne: walidacja POST (pusta nazwa, > 100 znaków), kolejność i `noteCount` w GET.

## Files Changed
- `src/app/api/boards/route.ts`, `src/modules/boards/{schema,service}.ts`
- `src/lib/api-client.ts`, `src/lib/api-types.ts`
- `src/components/ui/{button,field}.tsx`, `src/components/boards/{board-list-screen,board-form,board-card}.tsx`, `src/app/page.tsx`
- `tests/helpers/{api-fetch,navigation}.ts`, `tests/setup.ts`, `tests/integration/us-001-create-board.test.tsx`
- `.prodready/plan/backlog.md`, `.prodready/plan/test-plan.md`

## Commands Run
- `docker compose exec -T app npx vitest run` - PASS (22 testy)
- `docker compose exec -T app npx tsc --noEmit` - PASS
- `docker compose exec -T app npm run lint` - PASS

## Decisions
- Ekrany to komponenty klienckie (`*Screen`), które same pobierają dane z API; strony w `src/app` są cienkimi opakowaniami. "Odświeżenie strony" w testach = ponowne wyrenderowanie ekranu.
- Testy komponentów: `installApiFetch()` podstawia `fetch`, który wywołuje prawdziwe handlery tras z testową bazą (pełny przekrój UI → API → baza). Każdą nową trasę trzeba dopisać do tablicy `ROUTES` w `tests/helpers/api-fetch.ts`.
- `next/navigation` jest globalnie zastąpione atrapą (`routerMock` z `tests/helpers/navigation.ts`).
- Kształty odpowiedzi API dla klienta: `src/lib/api-types.ts`; klient: `api<T>(path, method, body)` rzuca `ApiClientError {status, code, message, fields}`.
- `lastReview` w `GET /api/boards` zwraca na razie `null` — wyliczenie w TASK-019.
- "Otwiera się jako pusta" w AC-2 sprawdzane jako przekierowanie do `/boards/{id}` i brak karteczek w bazie; sama strona edytora powstaje w TASK-006.

## Follow-ups or Blockers
- None

## Next Recommended Task
- TASK-006: US-003 — Przyklejenie karteczki do planszy.
