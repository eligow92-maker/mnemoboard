# Mnemoboard

Plansza do zapamiętywania faktów mnemotechnikami. Przyklejasz karteczki z zagadnieniami (daty, liczby, nazwiska, pojęcia), dodajesz słowa-obrazy, opowiadanie, emotki i kolor, układasz je w mapę myśli, łańcuch skojarzeń albo pokoje pałacu pamięci, a potem sprawdzasz w powtórce, co zostało w głowie.

Narzędzie osobiste: jedna osoba, komputer i telefon w sieci domowej, bez kont i bez zewnętrznych usług (nic nie wymaga internetu w czasie działania).

## Co potrafi

- **Plansze i karteczki** — zagadnienie, słowa-obrazy, opowiadanie (do 2000 znaków), do 8 emotek, 5 kolorów (np. ważność).
- **Słowa-obrazy dla liczb** — Główny System Pamięciowy: lista 0–9 i 00–99 do edycji oraz własne wpisy 3–15 cyfr (np. `333 → mumia-mysz`, przydatne dla numerów telefonów).
- **Trzy techniki na jednej planszy** — połączenia (mapa myśli), łańcuch z numeracją, nazwane pokoje (pałac pamięci).
- **Powtórka** — widzisz zagadnienie, odtwarzasz skojarzenie, oceniasz się; filtr po kolorze; statystyki wyników.
- **Eksport, import i kopie zapasowe** — pojedyncza plansza do pliku JSON, pełna kopia ze wszystkim, przywracanie tylko dokłada dane.

## Szybki start (dom, sieć lokalna)

Wymagania: Docker z wtyczką Compose.

```bash
git clone https://github.com/eligow92-maker/mnemoboard
cd mnemoboard
./scripts/setup.sh        # tworzy .env z losowym hasłem bazy, buduje i uruchamia
```

Aplikacja działa pod `http://localhost:3000` oraz pod adresem komputera w sieci (np. z telefonu). Skrypt wypisze oba adresy.

> **Uwaga:** aplikacja nie ma logowania. Działa wyłącznie w sieci lokalnej — nie przekierowuj jej portu na routerze i nie wystawiaj do internetu. Szczegóły i warunki przeniesienia na VPS: [DEPLOYMENT.md](./DEPLOYMENT.md).

Codzienna obsługa: `make prod-up`, `make prod-down`, `make prod-logs`, `make help`.

## Rozwój

```bash
cp .env.example .env
make dev            # środowisko z odświeżaniem kodu na http://localhost:3000
make test           # testy jednostkowe i integracyjne (w kontenerze)
make test-e2e       # testy E2E z hosta przeciw działającemu środowisku dev
make lint typecheck
```

Pierwsze uruchomienie E2E: `npx playwright install chromium`.

## Zmienne środowiskowe

Wszystkie w `.env` (wzór: `.env.example`).

| Zmienna                                             | Wymagana              | Opis                                                                                                 |
| --------------------------------------------------- | --------------------- | ---------------------------------------------------------------------------------------------------- |
| `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` | tak                   | Dane bazy; compose składa z nich `DATABASE_URL` dla kontenera. Hasło `change-me` jest tylko dla dev. |
| `APP_PORT`                                          | nie                   | Port aplikacji na hoście (domyślnie `3000`).                                                         |
| `DATABASE_URL`, `DATABASE_URL_TEST`                 | tylko poza kontenerem | Do poleceń Prisma uruchamianych z hosta.                                                             |

## Architektura w skrócie

Modularny monolit: jedna aplikacja Next.js (interfejs + API + moduły domenowe) i PostgreSQL. Zależności idą w dół: interfejs → API → moduły domenowe (`src/modules/*`, czysty TypeScript) → Prisma. Plansza to React Flow z obsługą dotyku. Szczegóły i decyzje: `.prodready/design/architecture/` (wzorzec, stos, ADR-001…006).

## API

Kontrakt: `.prodready/design/api/openapi.yaml`, przegląd z przykładami: [docs/api.md](./docs/api.md).

## Proces i artefakty

Projekt powstał w procesie ProdReady (Define → Design → Plan → Scaffold → Implement → Build → Verify). Specyfikacja, historyjki, plan i notatki z implementacji są w `.prodready/`.
