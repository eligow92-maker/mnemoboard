# Security Audit Report

Generated: 2026-10-04

## Dependency Scan

Stan początkowy: `npm audit --omit=dev` → 5 podatności (4 high, 1 moderate).
Poprawka (`prodready-fix security`, 2026-10-04): w `package.json` dodano `overrides`:

- `deepmerge-ts: ^8.0.2` (naprawia stack exhaustion; używany przez `@prisma/config`, tylko CLI Prisma)
- `postcss: ^8.5.28` (naprawia XSS/odczyt `.map`; nested w `next@15.5.27` był 8.4.31)

Odrzucono `npm audit fix` bez override'ów: „naprawiał" przez obniżenie Prismy 6.19.3 → 6.12.0 (cofnięcie ORM o 7 wydań przy bazie migrowanej pod 6.19). Odrzucono `--force` (Next 16, zmiana major).

`npm audit --omit=dev`: **found 0 vulnerabilities**.
`npm audit` (z devDependencies): 2 podatności tylko deweloperskie, bez wpływu na obraz produkcyjny:

| Pakiet | Severity | Źródło | Fix |
|---|---|---|---|
| braces (przez eslint-config-next → fast-glob) | high | stack exhaustion przy głęboko zagnieżdżonych wzorcach; tylko lint lokalnie/CI | wymaga downgrade eslint-config-next (nie robić) |
| @vitest/mocker (przez vitest) | moderate | path traversal w redirect mock; tylko testy | vitest 5 (major) |

| Severity | Prod | Dev-only |
|----------|------|----------|
| Critical | 0 | 0 |
| High | 0 | 1 |
| Medium | 0 | 1 |

Ryzyko override'u: `next@15.5.27` deklaruje postcss 8.4.31, a działa na 8.5.28. Po zmianie: build produkcyjny OK, 244/244 testów, E2E 14/14, rozmiar bundla bez zmian (186 kB).

## Secrets Detection

`gitleaks detect` (obraz `zricethezav/gitleaks`, cała historia git): 45 commitów, **no leaks found**. `.env` nie jest śledzony w git; `.env.example` zawiera tylko wartości przykładowe.

## OWASP Top 10 Checklist

| # | Vulnerability | Status | Notes |
|---|---------------|--------|-------|
| A01 | Broken Access Control | ✓ Pass (z zastrzeżeniem) | Aplikacja jednoużytkownikowa bez logowania (ADR-003, założenie z Define). Wdrożenie musi być w sieci zaufanej / za reverse proxy z uwierzytelnieniem |
| A02 | Cryptographic Failures | ✓ N/A | Brak haseł i sesji; brak danych wrażliwych |
| A03 | Injection | ✓ Pass | Prisma (zapytania parametryzowane); jedyne `$queryRaw` to stałe `SELECT 1` w /api/health; brak `eval`, `child_process`, `dangerouslySetInnerHTML` |
| A04 | Insecure Design | ✓ Pass | Limity rozmiaru importu/backupu (TASK-037), testy `transfer-hardening` |
| A05 | Security Misconfiguration | ✓ Pass | CSP, X-Content-Type-Options, Referrer-Policy, X-Frame-Options DENY, Permissions-Policy na każdej odpowiedzi (E2E security.spec.ts); `poweredByHeader: false`; kontener działa jako `USER node` |
| A06 | Vulnerable Components | ✓ Pass | `npm audit --omit=dev`: 0 podatności; 2 dev-only (zob. wyżej) |
| A07 | Auth Failures | ✓ N/A | Brak uwierzytelniania z założenia |
| A08 | Data Integrity Failures | ✓ Pass | Walidacja wejścia Zod we wszystkich modułach (`schema.ts`), walidacja formatu importu/backupu |
| A09 | Logging Failures | ✓ Pass | Brak logowania treści użytkownika i sekretów |
| A10 | SSRF | ✓ Pass | Aplikacja nie pobiera zewnętrznych URL; CSP `connect-src 'self'` |

## Code Review

- [x] No hardcoded secrets (grep po `src`, `prisma`, `scripts`, compose, Dockerfile, `.github`)
- [x] N/A: hashowanie haseł i JWT (brak logowania)
- [x] Zmienne środowiskowe z `.env`, dokumentowane w `.env.example`
- [x] Wejście walidowane Zod
- [x] Nagłówki bezpieczeństwa skonfigurowane
- [ ] CSP zawiera `'unsafe-inline'` dla script/style (wymóg Next.js i React Flow, udokumentowany w `next.config.ts`); osłabia ochronę przed XSS, ale brak `unsafe-eval` w produkcji
- [ ] Rate limiting: brak (nie dotyczy przy braku uwierzytelniania; zalecany na reverse proxy przy publicznym wdrożeniu)

## Issues Found

| Sev | Problem | Status |
|---|---|---|
| High (prod) | postcss w next, deepmerge-ts/@prisma/config/prisma | ✓ Naprawione override'ami |
| High (dev) | braces (stack exhaustion przy głęboko zagnieżdżonych wzorcach) przez eslint-config-next → fast-glob → micromatch | **Zaakceptowane przez właściciela (2026-10-04)**: brak poprawki upstream (zakres `*`), pakiet wyłącznie w devDependencies, nie trafia do obrazu produkcyjnego; wzorce pochodzą z konfiguracji repo, nie od użytkownika. Do ponownej oceny przy aktualizacji eslint-config-next |
| Moderate (dev) | @vitest/mocker | Zaakceptowane: tylko testy; upgrade do vitest 5 w osobnym zadaniu |

## Result

**Status: PASSED** (Critical: 0, High prod: 0; 1 High i 1 Moderate dev-only zaakceptowane świadomie)
