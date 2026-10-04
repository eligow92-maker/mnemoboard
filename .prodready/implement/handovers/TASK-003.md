# TASK-003 Handoff

## Task
- Title: Fundament API
- Status: Done
- Completed at: 2026-10-03

## Acceptance Criteria Covered
- AC-1: GET /api/health przy działającej bazie zwraca 200 i `{"status":"ok"}`.
- AC-2: niepoprawny JSON wysłany do endpointu przyjmującego JSON daje 400 z kodem `VALIDATION_ERROR`.
- AC-3: żądanie POST z nagłówkiem Origin innej witryny daje 403 z kodem `FORBIDDEN_ORIGIN`.

## Canonical Tests
- `AC-1: GET /api/health przy działającej bazie zwraca 200 i treść {"status":"ok"}` in `tests/integration/api-foundation.test.ts`
- `AC-2: niepoprawny JSON wysłany do endpointu przyjmującego JSON daje 400 z kodem VALIDATION_ERROR` in `tests/integration/api-foundation.test.ts`
- `AC-3: żądanie POST z nagłówkiem Origin innej witryny daje 403 z kodem FORBIDDEN_ORIGIN` in `tests/integration/api-foundation.test.ts`
- RED potwierdzony na zaślepce `withApi` zwracającej 501 (`expected 501 to be 200 / 400 / 403`); GREEN po implementacji.
- W tym samym pliku 6 testów technicznych bez prefiksu `AC-N: ` (zgodny Origin, błędy Zod per pole, zły Content-Type, `ApiError` → odpowiedź, 500 bez szczegółów, parametry ścieżki).

## Files Changed
- `src/lib/api.ts` (`withApi`, `ApiError`, `ApiContext`)
- `src/app/api/health/route.ts`
- `tests/integration/api-foundation.test.ts`
- `.prodready/plan/backlog.md`, `.prodready/plan/test-plan.md`

## Commands Run
- `docker compose exec -T app npx vitest run` - PASS (14 testów)
- `docker compose exec -T app npx tsc --noEmit` - PASS
- `docker compose exec -T app npm run lint` - PASS
- `docker compose exec -T app npx prettier --check src tests` - PASS
- `curl http://localhost:3000/api/health` - 200 `{"status":"ok"}` na działającym środowisku dev

## Decisions
- Użycie: `export const POST = withApi({ body: schemaZod }, async ({ request, params, body }) => Response.json(...))`. Bez `body` w opcjach treść nie jest czytana (`body` ma wartość `undefined`). `params` to już rozwiązany obiekt parametrów ścieżki.
- Błędy domenowe zgłaszać przez `throw new ApiError(status, code, message, fields?)` — `withApi` zamienia je na `{code, message, fields}`. Każdy inny wyjątek daje 500 `INTERNAL_ERROR` z ogólnym komunikatem i `console.error` po stronie serwera.
- Kontrola Origin: dotyczy metod innych niż GET/HEAD/OPTIONS; nagłówek `Origin` porównywany (host+port) z nagłówkiem `Host`, a przy jego braku z hostem z adresu żądania. Brak nagłówka `Origin` przepuszcza żądanie (klient spoza przeglądarki, np. curl).
- Treść z `Content-Type` innym niż `application/json` daje 400 `VALIDATION_ERROR` (ADR-003; kontrakt OpenAPI nie przewiduje 415).
- Błędy Zod: `fields` ma klucz = ścieżka pola łączona kropką, wartość = pierwszy komunikat dla pola.
- `/api/health` przy niedostępnej bazie zwraca 503 `SERVICE_UNAVAILABLE` (zgodnie z OpenAPI) — bez testu automatycznego.
- Drugi argument zwracanego handlera jest obowiązkowy (`{ params: Promise<...> }`), bo tego wymaga sprawdzanie typów tras Next.js; w testach przekazywać `{ params: Promise.resolve({...}) }`.

## Follow-ups or Blockers
- Mapowanie błędu Prisma `P2002` na 409 nie jest częścią `withApi` — robić w handlerach/modułach, które znają właściwy kod domenowy (`CONNECTION_EXISTS` itd.).
- Za reverse proxy (etap "przed VPS") porównanie Origin z `Host` trzeba będzie rozszerzyć o `X-Forwarded-Host`.
- Na hoście (poza kontenerem) klient Prisma jest nieaktualny — `npx prisma generate` naprawia `npm test`/`tsc` uruchamiane lokalnie.

## Next Recommended Task
- TASK-004: Prototyp planszy (React Flow, dotyk) — odblokowane, niezależne. TASK-005 (US-001) jest teraz odblokowane przez TASK-003.
