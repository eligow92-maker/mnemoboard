# TASK-022 Handoff

## Task
- Title: Utwardzenie bezpieczeństwa
- Status: Done
- Completed at: 2026-10-04

## Acceptance Criteria Covered
- AC-1: każda odpowiedź zawiera `Content-Security-Policy` i `X-Content-Type-Options: nosniff`.
- AC-2: zagadnienie `<script>alert(1)</script>` jest widoczne jako tekst, bez elementu script.

## Canonical Tests
- `AC-1: dowolna odpowiedź aplikacji zawiera nagłówki Content-Security-Policy oraz X-Content-Type-Options: nosniff` in `tests/integration/security.test.tsx`
- `AC-2: zagadnienie <script>alert(1)</script> jest widoczne na planszy jako tekst i nie powstaje element script` in `tests/integration/security.test.tsx`
- RED — stan faktyczny:
  - AC-1: RED (brak `headers()` w konfiguracji), potem GREEN.
  - AC-2: przechodził od pierwszego uruchomienia, bo React wstawia treść jako tekst. Czułość testu potwierdzona mutacją (`dangerouslySetInnerHTML` w NoteNode → test pada); mutacja wycofana.
- Testy techniczne: dyrektywy CSP i pozostałe nagłówki, HTML w nazwie planszy/strefy/słowach-obrazach jako tekst, limity długości pól i rozmiaru żądania; `tests/e2e/security.spec.ts` — nagłówki w prawdziwych odpowiedziach (strona, API, 404) i brak naruszeń CSP na wszystkich ekranach.

## Files Changed
- `next.config.ts` (nagłówki, `poweredByHeader: false`), `src/lib/api.ts` (limit treści żądania 16 kB)
- `tests/integration/security.test.tsx`, `tests/e2e/security.spec.ts`
- `.prodready/plan/backlog.md`, `.prodready/plan/test-plan.md`

## Commands Run
- `docker compose exec -T app npx vitest run` - PASS (147 testów)
- `npx playwright test` (z hosta, po restarcie `app`) - PASS (12 testów)
- `docker compose exec -T app npx tsc --noEmit`, `npm run lint` - PASS
- `curl -I http://localhost:3000/` — nagłówki obecne

## Decisions
- AC-1 kanonicznie sprawdza konfigurację (`nextConfig.headers()`, reguła `/:path*`), a test E2E — rzeczywiste odpowiedzi.
- CSP: `default-src 'self'`, bez żadnych obcych źródeł, `object-src 'none'`, `frame-ancestors 'none'`. `script-src` i `style-src` zawierają `'unsafe-inline'` (wymagane przez Next.js bez nonce i przez style React Flow); w trybie dev dodatkowo `'unsafe-eval'` i `ws:`.
- Przegląd renderowania: w kodzie nie ma `dangerouslySetInnerHTML`; cała treść użytkownika trafia do DOM jako tekst.

## Follow-ups or Blockers
- `'unsafe-inline'` w `script-src` osłabia ochronę przed XSS. Przed wystawieniem na VPS warto przejść na CSP z nonce (middleware Next.js) — poza zakresem tego zadania, które wskazuje `next.config`.
- Zmiana `next.config.ts` wymaga restartu kontenera `app`.

## Next Recommended Task
- TASK-023: Wydajność dużej planszy.
