# Implementation Plan

## Overview

Project: Mnemoboard
Pattern: Modular Monolith (Next.js: UI + API + moduły domenowe, PostgreSQL)
Stack: TypeScript, Next.js 15, React 19, React Flow, Tailwind CSS 4, Zod, Prisma 6, PostgreSQL 16, Vitest, Playwright, Docker Compose

Backlog: 37 zadań, 119 kryteriów akceptacji (81 z historyjek + 38 technicznych), 104 h. MVP (TASK-001–023, 66 h) jest ukończone; iteracja 2 to TASK-024–037 (52 kryteria, 38 h).

## Phases

### Phase 1: Fundament i pierwszy przekrój (Sprint 1, 18.5 h)
**Goal**: działający przekrój UI → API → baza → UI oraz rozbrojenie największego ryzyka.
- Szkielet projektu, schemat bazy z regułami integralności, fundament API (TASK-001–003).
- Prototyp planszy na React Flow z przeciąganiem myszą i dotykiem (TASK-004) — ryzyko jako pierwsze.
- Utworzenie planszy i przyklejenie karteczki (TASK-005, TASK-006) — po tym sprincie można utworzyć planszę, dodać karteczkę i zobaczyć ją po odświeżeniu.

### Phase 2: Karteczki i generator (Sprint 2, 14.5 h)
**Goal**: kompletna karteczka ze słowami-obrazami.
- Przesuwanie, edycja, usuwanie (TASK-007).
- Startowa lista 110 słów GSP z automatycznym sprawdzeniem zgodności kodowania (TASK-008).
- Generator dla liczb, edycja listy GSP, ręczne słowa-obrazy (TASK-009–011).

### Phase 3: Układanie (Sprint 3, 12 h)
**Goal**: trzy techniki na jednej planszy.
- Połączenia mapy myśli (TASK-012), łańcuch z regułami i numeracją (TASK-013).
- Geometria stref jako czysty moduł (TASK-014) i pokoje pałacu pamięci (TASK-015).

### Phase 4: Powtórka, statystyki, telefon, dopracowanie (Sprint 4, 21 h)
**Goal**: zamknięcie pętli nauki i mierników sukcesu.
- Kolejność kart, przebieg i zakres powtórki (TASK-016–018).
- Statystyki i zarządzanie planszami (TASK-019, TASK-020).
- Dopracowanie na telefonie z testami E2E w profilu mobilnym (TASK-021).
- Nagłówki bezpieczeństwa, XSS, wydajność planszy z 200 karteczkami (TASK-022, TASK-023).

### Phase 5: Bogatsze karteczki (Sprint 5, 13.5 h) — iteracja 2
**Goal**: karteczka z opowiadaniem, emotkami i kolorem, widoczna na planszy i w powtórce.
- Migracja schematu dla całej iteracji jako pierwsze zadanie (TASK-024) — jedna zmiana bazy zamiast trzech.
- Opowiadanie, emotki, kolory (TASK-025–027): każde zadanie to pełny przekrój API → edytor → karteczka → powtórka.
- Filtr koloru w powtórce (TASK-028, P1).

### Phase 6: Własne wpisy GSP (Sprint 6, 7.5 h) — iteracja 2
**Goal**: generator podaje własne skojarzenia dla dłuższych liczb.
- Dopasowanie własnych wpisów jako czysta funkcja (TASK-029), zarządzanie wpisami (TASK-030), podłączenie do generatora (TASK-031).

### Phase 7: Eksport, import i kopie zapasowe (Sprint 7, 17 h) — iteracja 2
**Goal**: dane da się wynieść poza serwer i wczytać bez ryzyka dla istniejących plansz.
- Format pliku i walidacja jako czysty moduł (TASK-032) — po Sprincie 5, żeby format od razu obejmował nowe pola karteczki.
- Eksport i import planszy (TASK-033, TASK-034), reguły scalania kopii (TASK-035), pełna kopia w interfejsie (TASK-036).
- Wydajność i bezpieczeństwo plików (TASK-037, P1).

Kolejność sprintów 5–7 wynika z zależności: format pliku musi znać ostateczny kształt karteczki i listy GSP, więc eksport idzie ostatni. Po TASK-025 pierwszy przekrój iteracji działa od bazy do powtórki.

## Capacity Check

- Timeline z constitution.md: brak twardego terminu, jedna osoba po godzinach.
- Przy ok. 6 h tygodniowo backlog 66 h to ok. 11 tygodni; z buforem 30% na niedoszacowanie — ok. 16 tygodni.
- Iteracja 2: 38 h, czyli ok. 6–7 tygodni przy 6 h tygodniowo, z buforem 30% ok. 9 tygodni. Zadania P1 (TASK-028, TASK-037) są na końcach sprintów i nic od nich nie zależy.
- Brak terminu oznacza, że plan nie wymaga cięcia zakresu; jedyne zadania P1 (TASK-020, TASK-023) są na końcu i można je odłożyć bez wpływu na pozostałe.

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Przeciąganie dotykiem w React Flow koliduje z przesuwaniem widoku lub jest niewygodne na telefonie | High | TASK-004 w Sprincie 1 jako prototyp sprawdzony ręcznie na telefonie; wnioski w handoverze; w razie niepowodzenia powrót do ADR-004 przed budową reszty edytora |
| TASK-015 (pokoje) trwa 3× dłużej — strefy pod węzłami, zmiana rozmiaru, przeliczanie przypisań | High | Reguły wydzielone do czystego modułu (TASK-014) testowanego jednostkowo; w UI dopuszczalne uproszczenie: strefa o stałym rozmiarze ustawianym w ZoneEditor zamiast uchwytów |
| Startowa lista 110 polskich słów GSP jest słabej jakości lub niezgodna z kodowaniem | Medium | TASK-008 AC-2 automatycznie sprawdza zgodność każdego słowa z liczbą; lista jest edytowalna (US-007), więc jakość można poprawiać w użyciu |
| Niestabilne testy E2E przeciągania | Medium | Reguły testowane na poziomie API/jednostkowym; E2E tylko dla 4 kryteriów wymagających prawdziwej przeglądarki |
| Indeksy częściowe poza `schema.prisma` rozjadą się ze schematem | Medium | TASK-002 AC-2 i AC-3 testują reguły bezpośrednio na bazie |
| Przypadkowe wystawienie aplikacji bez logowania do internetu | High | Ostrzeżenie w README/DEPLOYMENT (faza Build), odrzucanie obcego Origin (TASK-003), nagłówki bezpieczeństwa (TASK-022); logowanie jako warunek VPS |
| Utrata danych przy awarii dysku (brak kopii w MVP) | Medium | Nazwany wolumen i cel `db-backup` w Makefile (faza Scaffold/Build); od iteracji 2 ręczna kopia z interfejsu (TASK-036) |
| Iteracja 2: przywracanie kopii (TASK-035) trwa 3× dłużej — przepinanie identyfikatorów karteczek, stref, połączeń i wyników powtórek | High | Import jednej planszy (TASK-034) powstaje wcześniej i daje sprawdzone mapowanie identyfikatorów; reguły scalania GSP testowane osobno; w razie kłopotów historia powtórek może wejść do kopii w kolejnym kroku bez zmiany formatu |
| Iteracja 2: migracja `peg_word` (klucz do 15 znaków, słowo startowe NULL) psuje seed lub istniejące testy listy 110 haseł | Medium | TASK-024 uruchamia pełny zestaw testów MVP po migracji; seed dotyka tylko haseł wbudowanych; własne wpisy są osobną sekcją strony |
| Iteracja 2: zmiana formatu pliku po dodaniu kolejnych pól unieważnia stare kopie | Medium | Numer wersji w pliku od początku (ADR-005); nieznana wersja jest odrzucana z komunikatem zamiast częściowego wczytania |
| Iteracja 2: okno wyboru kolorów zmienia dotychczasowy start powtórki i psuje testy US-011/US-012 | Low | Filtr jest w oknie w edytorze planszy; strona powtórki bez parametru `colors` działa jak dotąd |

## Dependencies

External dependencies:
- [x] Brak usług zewnętrznych, kont i kluczy API w czasie działania (non-negotiable).
- [ ] Docker i Docker Compose na komputerze deweloperskim i serwerze domowym.
- [ ] Dostęp do rejestru npm i Docker Hub w czasie budowania (nie w czasie działania).
- [ ] Telefon w tej samej sieci lokalnej do ręcznego sprawdzenia TASK-004 i TASK-021.
- [ ] Treść startowej listy GSP — do przygotowania w TASK-008 (decyzja autora, bez zależności od osób trzecich).
