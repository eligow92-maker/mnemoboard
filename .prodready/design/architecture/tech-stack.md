# Tech Stack

Wybór użytkownika (faza Design): **Next.js + TypeScript**, PostgreSQL + Prisma, plansza na React Flow.

## Core

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Language | TypeScript (strict) | Jeden język dla interfejsu, API i logiki domenowej; typy współdzielone |
| Runtime | Node.js 22 LTS | Stabilne wydanie LTS, oficjalne obrazy Docker |
| Framework | Next.js 15 (App Router) | Interfejs i API w jednym projekcie i jednym kontenerze |
| UI library | React 19 | Wymagane przez Next.js; bogaty ekosystem |
| Board canvas | React Flow (`@xyflow/react`) | Przeciąganie węzłów, krawędzie, grupy/strefy, obsługa dotyku i zoomu gotowe |
| Styling | Tailwind CSS 4 | Szybkie, responsywne style bez własnego systemu CSS |
| Validation | Zod | Walidacja wejścia API po stronie serwera, typy z jednego schematu |
| Database | PostgreSQL 16 | Schemat z Define (indeksy częściowe, enum) działa bez zmian; gotowe na VPS |
| ORM | Prisma 6 | Migracje, typowany klient, seed listy GSP |

## Infrastructure

| Component | Technology | Rationale |
|-----------|------------|-----------|
| Container | Docker + Docker Compose | Wymóg z constraints: uruchomienie na domowym serwerze |
| Reverse Proxy | brak w MVP (sieć lokalna, HTTP); Caddy przy VPS | Mniej elementów teraz; automatyczny HTTPS później |
| CI/CD | GitHub Actions | Darmowe, integracja z repozytorium |

## Development

| Tool | Purpose |
|------|---------|
| ESLint (`eslint-config-next`) | Linting |
| Prettier | Formatting |
| Vitest | Unit/Integration testing (moduły domenowe, handlery API z testową bazą) |
| Testing Library (React) | Testy komponentów |
| Playwright | E2E testing (w tym profil mobilny 375 px z dotykiem) |
| Husky + lint-staged | Git hooks |

## Commands

| Purpose | Command |
|---------|---------|
| Test (unit + integration) | `npm test` |
| E2E | `npm run test:e2e` |
| Type check | `npx tsc --noEmit` |
| Lint | `npm run lint` |
| Migrations | `npx prisma migrate deploy` |
| Seed (lista GSP) | `npx prisma db seed` |

## Versions

```json
{
  "node": "22.x",
  "typescript": "5.x",
  "next": "15.x",
  "react": "19.x",
  "@xyflow/react": "12.x",
  "tailwindcss": "4.x",
  "zod": "3.x",
  "prisma": "6.x",
  "postgresql": "16",
  "vitest": "3.x",
  "@playwright/test": "1.x"
}
```

## Authentication

- Strategy: brak w MVP — aplikacja dostępna wyłącznie w sieci lokalnej (ADR-003).
- Library: nie dotyczy w MVP; przed VPS: sesja w ciasteczku (`iron-session`) z jednym hasłem z zmiennej środowiskowej.
- Storage: nie dotyczy w MVP; później ciasteczko `HttpOnly`, `Secure`, `SameSite=Lax`.

## Monitoring (Optional)

- Logging: logi strukturalne na stdout (`docker compose logs`).
- Error tracking: none (brak usług zewnętrznych — non-negotiable).
- Analytics: none; mierniki sukcesu pochodzą ze statystyk aplikacji.
- Health: `GET /api/health` sprawdza połączenie z bazą (healthcheck kontenera).
