# Launch Checklist

Project: Mnemoboard
Date: 2026-10-04
Verified by: ProdReady

## Specification

- [x] All user stories implemented (23/23)
- [x] All API endpoints match OpenAPI spec (28/28)
- [x] Data model matches schema
- [x] Test coverage > 80% (95,6 % statements)

## Security

- [x] No critical/high vulnerabilities in dependencies (prod: 0; 2 dev-only zaakceptowane, zob. security-report.md)
- [x] No secrets in codebase (gitleaks: 0 leaków)
- [x] OWASP Top 10 addressed (A06 z zastrzeżeniem powyżej)
- [x] Authentication: N/A (aplikacja jednoużytkownikowa z założenia)
- [x] Authorization: N/A
- [x] Input validation on all endpoints (Zod)

## Performance

- [x] Core Web Vitals meet targets (Lighthouse mobile na buildzie prod, mediana z 5: perf 97–100, CLS ≤ 0,005, TBT ≤ 75 ms; LCP 1,7–2,1 s, edytor 2,5 s = odstępstwo zaakceptowane, zob. performance-report.md)
- [x] API response times < 200 ms (p95 ≤ 23 ms)
- [x] Database queries optimized
- [x] No N+1 queries

## Testing

- [x] Unit tests passing
- [x] Integration tests passing (244/244 Vitest)
- [x] E2E tests passing (14/14 Playwright)
- [x] Every story/task-scoped acceptance criterion has exactly one canonical passing test (81/81)
- [x] No canonical acceptance tests are skipped, todo, pending, missing, or duplicated
- [x] Lint i typecheck bez błędów

## Infrastructure

- [x] Docker builds successfully (target `runner`, `USER node`, HEALTHCHECK)
- [x] compose.prod.yaml configured
- [x] Health checks working (/api/health 200)
- [x] Environment variables documented
- [x] CI/CD pipeline configured (`.github/workflows`); nie uruchomiony w GitHub w tej weryfikacji

## Documentation

- [x] README.md complete
- [x] DEPLOYMENT.md complete
- [x] API documentation complete (docs/api.md)
- [x] .env.example has all variables

## Pre-Deployment

- [ ] Production environment variables set
- [ ] Database credentials secured
- [ ] Dostęp do aplikacji ograniczony (brak logowania: sieć zaufana / reverse proxy z uwierzytelnieniem)
- [ ] Domain configured (if applicable)
- [ ] SSL certificate ready (if applicable)
- [ ] Backup strategy defined (funkcja backupu w aplikacji: US-023; harmonogram kopii bazy do ustalenia)
- [ ] Monitoring configured (optional)

---

## Result

Wszystkie automatyczne kontrole przeszły (podatności produkcyjne naprawione, Web Vitals zmierzone). Zostają punkty Pre-Deployment do wykonania przy wdrożeniu.

🎉 **PRODUCTION READY** (po `prodready-gate verify`)
