# ADR-001: Framework Selection

## Status
Accepted

## Date
2026-10-03

## Context
Mnemoboard potrzebuje interaktywnego interfejsu (plansza z przeciąganiem na myszy i dotyku) oraz API z trwałym zapisem, dostępnego z komputera i telefonu. Buduje go i utrzymuje jedna osoba, a całość ma działać w Dockerze na domowym serwerze bez usług zewnętrznych. Użytkownik nie miał preferencji w fazie Define i w fazie Design wybrał wariant Next.js + TypeScript spośród trzech przedstawionych.

## Decision
We will use Next.js 15 (App Router) with TypeScript because:
- Interfejs i API (Route Handlers) żyją w jednym projekcie, jednym procesie i jednym kontenerze.
- Jeden język i wspólne typy/schematy Zod dla klienta, API i logiki domenowej.
- React daje dostęp do React Flow (ADR-004), który pokrywa najbardziej ryzykowną część MVP.
- Tryb `output: standalone` daje mały obraz produkcyjny odpowiedni dla domowego serwera.

## Consequences

### Positive
- Jedno repozytorium, jedno polecenie uruchomienia, jeden pipeline CI.
- Logika domenowa w czystym TypeScript, testowalna bez frameworka.

### Negative
- Edytor planszy jest w całości komponentem klienckim — korzyści z React Server Components są ograniczone do listy plansz i statystyk.
- Częste zmiany głównych wersji Next.js oznaczają okresowe prace aktualizacyjne.

### Risks
- Powiązanie API z Next.js utrudniłoby wydzielenie backendu. Mitigation: handlery są cienkie, a reguły żyją w `src/modules/*` niezależnych od frameworka.

## Alternatives Considered
1. React (Vite) + FastAPI (Python): Rejected because oznacza dwa projekty, dwa języki i dwa kontenery aplikacji oraz ręczne utrzymywanie zgodności typów między nimi — zbyt duży narzut dla jednej osoby.
2. SvelteKit + SQLite: Rejected because Svelte Flow ma mniejszy ekosystem i mniej przykładów dla stref/grup, a użytkownik wybrał stack React; lżejsze wdrożenie nie równoważy tego ryzyka.
