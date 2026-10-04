# Implementation Backlog

Statusy: Ready → In Progress → Done. Każde `AC-N` jest numerowane w obrębie zadania i ma dokładnie jeden test kanoniczny (patrz `test-plan.md`). Zadania realizujące historyjkę przejmują jej kryteria akceptacji bez zmian numeracji.

## Sprint 1: Fundament i pierwszy przekrój (walking skeleton)

### TASK-001: Szkielet projektu
**Priority**: P0 | **Estimate**: 3h | **Status**: Done

**Description**:
Inicjalizacja Next.js 15 (App Router) z TypeScript strict, Tailwind CSS 4, ESLint, Prettier, Vitest, Testing Library i Playwright; struktura `src/app`, `src/modules`, `src/lib`, `tests/{unit,integration,e2e}`; nagłówek aplikacji z nawigacją.

**Acceptance Criteria**:
AC-1: Given uruchomiona aplikacja, when otwieram stronę główną, then widzę nagłówek "Mnemoboard" z linkami "Plansze" i "Lista GSP".
AC-2: Given plik tsconfig.json, when odczytuję opcje kompilatora, then `strict` ma wartość true.

**TDD Tasks**:
- [x] Write failing canonical test for AC-1
- [x] Implement AC-1 (red→green)
- [x] Write failing canonical test for AC-2
- [x] Implement AC-2 (red→green)

**Blocked by**: None
**Blocks**: TASK-002, TASK-004

---

### TASK-002: Schemat bazy i migracja
**Priority**: P0 | **Estimate**: 3h | **Status**: Done

**Description**:
`schema.prisma` zgodny z `.prodready/define/data-model/schema.sql`; pierwsza migracja z ręcznie dopisanymi indeksami częściowymi i wyrażeniowymi (ADR-002); klient Prisma w `src/lib/db.ts`; testowa baza dla testów integracyjnych.

**Acceptance Criteria**:
AC-1: Given pusta baza, when wykonuję migracje, then istnieją tabele board, zone, note, connection, peg_word, review_session i review_result.
AC-2: Given połączenie karteczek A–B, when zapisuję w bazie drugie połączenie tej samej pary w odwrotnym kierunku, then baza odrzuca zapis błędem unikalności.
AC-3: Given ogniwo łańcucha A→B, when zapisuję w bazie ogniwo łańcucha A→C, then baza odrzuca zapis błędem unikalności.

**TDD Tasks**:
- [x] Write failing canonical test for AC-1
- [x] Implement AC-1 (red→green)
- [x] Write failing canonical test for AC-2
- [x] Implement AC-2 (red→green)
- [x] Write failing canonical test for AC-3
- [x] Implement AC-3 (red→green)

**Blocked by**: TASK-001
**Blocks**: TASK-003, TASK-008, TASK-014

---

### TASK-003: Fundament API
**Priority**: P0 | **Estimate**: 3h | **Status**: Done

**Description**:
Wspólna funkcja `withApi` dla handlerów (ADR-003): parsowanie JSON, walidacja Zod, jednolity format błędu `{code, message, fields}`, odrzucanie żądań modyfikujących z obcym `Origin`; endpoint `GET /api/health`.

**Acceptance Criteria**:
AC-1: Given działająca baza, when wywołuję GET /api/health, then otrzymuję status 200 i treść `{"status":"ok"}`.
AC-2: Given endpoint przyjmujący JSON, when wysyłam niepoprawny JSON, then otrzymuję status 400 z kodem `VALIDATION_ERROR`.
AC-3: Given żądanie POST z nagłówkiem Origin innej witryny, when trafia do API, then otrzymuję status 403 z kodem `FORBIDDEN_ORIGIN`.

**TDD Tasks**:
- [x] Write failing canonical test for AC-1
- [x] Implement AC-1 (red→green)
- [x] Write failing canonical test for AC-2
- [x] Implement AC-2 (red→green)
- [x] Write failing canonical test for AC-3
- [x] Implement AC-3 (red→green)

**Blocked by**: TASK-002
**Blocks**: TASK-005, TASK-009

---

### TASK-004: Prototyp planszy (React Flow, dotyk)
**Priority**: P0 | **Estimate**: 3h | **Status**: Done

**Description**:
Największe ryzyko techniczne jako pierwsze (ADR-004): komponent `BoardCanvas` z własnym węzłem `NoteNode`, pan/zoom, przeciąganie myszą i dotykiem; ręczne sprawdzenie na telefonie konfiguracji `panOnDrag`/`nodesDraggable` i zapis wniosków w handoverze.

**Acceptance Criteria**:
AC-1: Given plansza z jedną karteczką, when renderuję BoardCanvas, then widzę węzeł z zagadnieniem tej karteczki.
AC-2: Given karteczka na planszy, when kończę jej przeciąganie, then BoardCanvas wywołuje `onNoteMove` z identyfikatorem karteczki i nowym położeniem.

**TDD Tasks**:
- [x] Write failing canonical test for AC-1
- [x] Implement AC-1 (red→green)
- [x] Write failing canonical test for AC-2
- [x] Implement AC-2 (red→green)

**Blocked by**: TASK-001
**Blocks**: TASK-006

---

### TASK-005: US-001 — Utworzenie pierwszej planszy
**Priority**: P0 | **Estimate**: 3h | **Status**: Done

**Description**:
`GET/POST /api/boards`, strona listy plansz z pustym stanem, formularz nowej planszy, przekierowanie do pustej planszy.

**User Story**: US-001

**Acceptance Criteria**:
AC-1: Given w aplikacji nie ma żadnej planszy, when otwieram aplikację, then widzę pusty stan z komunikatem i przyciskiem "Utwórz pierwszą planszę".
AC-2: Given lista plansz, when tworzę planszę o nazwie "Historia Polski", then plansza pojawia się na liście i otwiera się jako pusta.
AC-3: Given formularz nowej planszy, when zatwierdzam pustą nazwę, then plansza nie powstaje i widzę komunikat "Podaj nazwę planszy".

**TDD Tasks**:
- [x] Write failing canonical test for AC-1
- [x] Implement AC-1 (red→green)
- [x] Write failing canonical test for AC-2
- [x] Implement AC-2 (red→green)
- [x] Write failing canonical test for AC-3
- [x] Implement AC-3 (red→green)

**Blocked by**: TASK-003
**Blocks**: TASK-006

---

### TASK-006: US-003 — Przyklejenie karteczki do planszy
**Priority**: P0 | **Estimate**: 3.5h | **Status**: Done

**Description**:
`GET /api/boards/{id}`, `POST /api/boards/{id}/notes`; strona edytora planszy łącząca BoardCanvas z API; formularz karteczki (NoteEditor). Zamyka pierwszy przekrój UI → API → baza → UI.

**User Story**: US-003

**Acceptance Criteria**:
AC-1: Given otwarta plansza, when dodaję karteczkę z zagadnieniem "1410 – bitwa pod Grunwaldem" w wybranym miejscu, then karteczka jest widoczna w tym miejscu z tym zagadnieniem.
AC-2: Given formularz karteczki, when zatwierdzam puste zagadnienie, then karteczka nie powstaje i widzę komunikat "Wpisz zagadnienie".
AC-3: Given plansza z dodaną karteczką, when odświeżam stronę, then karteczka ma to samo zagadnienie i to samo położenie.

**TDD Tasks**:
- [x] Write failing canonical test for AC-1
- [x] Implement AC-1 (red→green)
- [x] Write failing canonical test for AC-2
- [x] Implement AC-2 (red→green)
- [x] Write failing canonical test for AC-3
- [x] Implement AC-3 (red→green)

**Blocked by**: TASK-004, TASK-005
**Blocks**: TASK-007, TASK-022

---

## Sprint 2: Karteczki i generator słów-obrazów

### TASK-007: US-004 — Przesuwanie, edycja i usuwanie karteczki
**Priority**: P0 | **Estimate**: 3h | **Status**: Done

**Description**:
`PATCH/DELETE /api/notes/{id}`; zapis położenia po upuszczeniu; edycja w NoteEditor; usunięcie kaskadowe połączeń.

**User Story**: US-004

**Acceptance Criteria**:
AC-1: Given karteczka na planszy, when przeciągam ją w inne miejsce i odświeżam stronę, then karteczka znajduje się w nowym miejscu.
AC-2: Given karteczka z zagadnieniem "1410", when zmieniam zagadnienie na "15.07.1410", then karteczka pokazuje nowe zagadnienie.
AC-3: Given karteczka mająca połączenia, when ją usuwam, then karteczka i wszystkie jej połączenia znikają z planszy.

**TDD Tasks**:
- [x] Write failing canonical test for AC-1
- [x] Implement AC-1 (red→green)
- [x] Write failing canonical test for AC-2
- [x] Implement AC-2 (red→green)
- [x] Write failing canonical test for AC-3
- [x] Implement AC-3 (red→green)

**Blocked by**: TASK-006
**Blocks**: TASK-010, TASK-012, TASK-015

---

### TASK-008: Startowa lista GSP i seed
**Priority**: P0 | **Estimate**: 3h | **Status**: Done

**Description**:
Przygotowanie 110 polskich słów startowych (0–9, 00–99) zgodnych z GSP; moduł `word-images/encoding` sprawdzający zgodność słowa z liczbą; idempotentny seed Prisma.

**Acceptance Criteria**:
AC-1: Given pusta tabela peg_word, when uruchamiam seed, then tabela zawiera 110 haseł z niepustym słowem.
AC-2: Given startowa lista GSP, when dekoduję spółgłoski każdego słowa według GSP, then wynik jest równy liczbie hasła.
AC-3: Given hasło "14" ze słowem zmienionym na "tur", when ponownie uruchamiam seed, then hasło "14" nadal ma słowo "tur".

**TDD Tasks**:
- [x] Write failing canonical test for AC-1
- [x] Implement AC-1 (red→green)
- [x] Write failing canonical test for AC-2
- [x] Implement AC-2 (red→green)
- [x] Write failing canonical test for AC-3
- [x] Implement AC-3 (red→green)

**Blocked by**: TASK-002
**Blocks**: TASK-009, TASK-010

---

### TASK-009: US-007 — Edytowalna lista słów GSP
**Priority**: P0 | **Estimate**: 3h | **Status**: Done

**Description**:
`GET /api/peg-words`, `PUT /api/peg-words/{number}`, `POST /api/peg-words/{number}/reset`; strona `/peg-words` z edycją w miejscu.

**User Story**: US-007

**Acceptance Criteria**:
AC-1: Given świeżo zainstalowana aplikacja, when otwieram listę GSP, then widzę niepuste słowo dla każdego z 110 haseł (0–9 oraz 00–99).
AC-2: Given lista GSP, when zmieniam słowo dla "14" na "tur", then generowanie dla zagadnienia "14" zwraca "tur".
AC-3: Given lista GSP, when zapisuję puste słowo dla hasła, then zmiana jest odrzucona i hasło zachowuje poprzednie słowo.
AC-4: Given hasło ze zmienionym słowem, when używam akcji "Przywróć domyślne", then hasło ma ponownie słowo startowe.

**TDD Tasks**:
- [x] Write failing canonical test for AC-1
- [x] Implement AC-1 (red→green)
- [x] Write failing canonical test for AC-2
- [x] Implement AC-2 (red→green)
- [x] Write failing canonical test for AC-3
- [x] Implement AC-3 (red→green)
- [x] Write failing canonical test for AC-4
- [x] Implement AC-4 (red→green)

**Blocked by**: TASK-003, TASK-008, TASK-010
**Blocks**: None

---

### TASK-010: US-006 — Generowanie słów-obrazów dla liczb
**Priority**: P0 | **Estimate**: 3.5h | **Status**: Done

**Description**:
Czysta funkcja generatora (wyszukanie ciągów cyfr, podział na pary, pojedyncza cyfra na końcu); `POST /api/word-images/generate`; akcja "Generuj słowa" w NoteEditor z potwierdzeniem zastąpienia.

**User Story**: US-006

**Acceptance Criteria**:
AC-1: Given karteczka z zagadnieniem "1410", when używam akcji "Generuj słowa", then otrzymuję kolejno słowo z listy GSP dla "14" i słowo dla "10".
AC-2: Given karteczka z zagadnieniem "15.07.1410", when używam akcji "Generuj słowa", then otrzymuję kolejno słowa dla "15", "07", "14" i "10".
AC-3: Given karteczka z zagadnieniem "966", when używam akcji "Generuj słowa", then otrzymuję słowo dla "96" i słowo dla pojedynczej cyfry "6".
AC-4: Given karteczka mająca już słowa-obrazy, when używam akcji "Generuj słowa", then dotychczasowe słowa pozostają bez zmian do chwili potwierdzenia zastąpienia.

**TDD Tasks**:
- [x] Write failing canonical test for AC-1
- [x] Implement AC-1 (red→green)
- [x] Write failing canonical test for AC-2
- [x] Implement AC-2 (red→green)
- [x] Write failing canonical test for AC-3
- [x] Implement AC-3 (red→green)
- [x] Write failing canonical test for AC-4
- [x] Implement AC-4 (red→green)

**Blocked by**: TASK-007, TASK-008
**Blocks**: TASK-009, TASK-011

---

### TASK-011: US-005 — Ręczne słowa-obrazy
**Priority**: P0 | **Estimate**: 2h | **Status**: Done

**Description**:
Pole słów-obrazów w NoteEditor i na karteczce; obsługa odpowiedzi `NO_DIGITS` z komunikatem.

**User Story**: US-005

**Acceptance Criteria**:
AC-1: Given karteczka z zagadnieniem "Mitochondrium", when wpisuję słowa-obrazy "mity, chondryt" i zapisuję, then karteczka pokazuje te słowa-obrazy pod zagadnieniem.
AC-2: Given karteczka z zagadnieniem bez cyfr, when używam akcji "Generuj słowa", then słowa nie są generowane i widzę komunikat "Brak liczb – wpisz słowa-obrazy samodzielnie".

**TDD Tasks**:
- [x] Write failing canonical test for AC-1
- [x] Implement AC-1 (red→green)
- [x] Write failing canonical test for AC-2
- [x] Implement AC-2 (red→green)

**Blocked by**: TASK-010
**Blocks**: TASK-017

---

## Sprint 3: Układanie karteczek

### TASK-012: US-008 — Połączenia mapy myśli
**Priority**: P0 | **Estimate**: 3h | **Status**: Done

**Description**:
`POST /api/boards/{id}/connections` (kind=association), `DELETE /api/connections/{id}`; krawędź AssociationEdge; kod `CONNECTION_EXISTS`.

**User Story**: US-008

**Acceptance Criteria**:
AC-1: Given dwie karteczki na planszy, when łączę je i odświeżam stronę, then między karteczkami widoczna jest linia.
AC-2: Given dwie już połączone karteczki, when łączę je ponownie, then drugie połączenie nie powstaje.
AC-3: Given połączenie dwóch karteczek, when usuwam połączenie, then linia znika, a obie karteczki pozostają na planszy.

**TDD Tasks**:
- [x] Write failing canonical test for AC-1
- [x] Implement AC-1 (red→green)
- [x] Write failing canonical test for AC-2
- [x] Implement AC-2 (red→green)
- [x] Write failing canonical test for AC-3
- [x] Implement AC-3 (red→green)

**Blocked by**: TASK-007
**Blocks**: TASK-013

---

### TASK-013: US-009 — Łańcuch skojarzeń
**Priority**: P0 | **Estimate**: 3.5h | **Status**: Done

**Description**:
Ogniwa `kind=chain`; moduł `arrangement/chain` (następnik, poprzednik, wykrywanie pętli, wyliczanie `chainPosition`); krawędź ChainEdge, numer na karteczce, komunikaty błędów jako Toast.

**User Story**: US-009

**Acceptance Criteria**:
AC-1: Given karteczki A, B i C, when tworzę ogniwa łańcucha A→B i B→C, then karteczki pokazują numery kolejności 1, 2 i 3.
AC-2: Given karteczka A z ogniwem wychodzącym A→B, when tworzę ogniwo A→C, then ogniwo nie powstaje i widzę komunikat "Karteczka ma już następnik w łańcuchu".
AC-3: Given łańcuch A→B→C, when tworzę ogniwo C→A, then ogniwo nie powstaje i widzę komunikat "Łańcuch nie może tworzyć pętli".

**TDD Tasks**:
- [x] Write failing canonical test for AC-1
- [x] Implement AC-1 (red→green)
- [x] Write failing canonical test for AC-2
- [x] Implement AC-2 (red→green)
- [x] Write failing canonical test for AC-3
- [x] Implement AC-3 (red→green)

**Blocked by**: TASK-012
**Blocks**: TASK-016

---

### TASK-014: Geometria stref
**Priority**: P0 | **Estimate**: 2h | **Status**: Done

**Description**:
Czysty moduł `arrangement/zones`: wyznaczanie strefy dla karteczki ze środka karteczki, rozstrzyganie nakładających się stref, przeliczenie przypisań planszy.

**Acceptance Criteria**:
AC-1: Given strefa i karteczka, której środek leży wewnątrz strefy, when wyznaczam strefę karteczki, then wynikiem jest identyfikator tej strefy.
AC-2: Given dwie nakładające się strefy i karteczka w części wspólnej, when wyznaczam strefę karteczki, then wynikiem jest strefa utworzona później.
AC-3: Given karteczka przypisana do strefy, when przeliczam przypisania po przesunięciu strefy poza karteczkę, then karteczka nie ma przypisanej strefy.

**TDD Tasks**:
- [x] Write failing canonical test for AC-1
- [x] Implement AC-1 (red→green)
- [x] Write failing canonical test for AC-2
- [x] Implement AC-2 (red→green)
- [x] Write failing canonical test for AC-3
- [x] Implement AC-3 (red→green)

**Blocked by**: TASK-002
**Blocks**: TASK-015

---

### TASK-015: US-010 — Pokoje pałacu pamięci
**Priority**: P0 | **Estimate**: 3.5h | **Status**: Done

**Description**:
`POST /api/boards/{id}/zones`, `PATCH/DELETE /api/zones/{id}`; węzeł ZoneNode pod karteczkami ze zmianą rozmiaru; ZoneEditor; przeliczanie `zoneId` na serwerze przy ruchu karteczki i zmianie strefy.

**User Story**: US-010

**Acceptance Criteria**:
AC-1: Given otwarta plansza, when tworzę strefę o nazwie "Kuchnia", then strefa z tą nazwą jest widoczna na planszy.
AC-2: Given strefa "Kuchnia", when upuszczam karteczkę w jej obrębie, then karteczka jest przypisana do pokoju "Kuchnia".
AC-3: Given karteczka przypisana do pokoju "Kuchnia", when przeciągam ją poza strefę, then karteczka nie jest przypisana do żadnego pokoju.
AC-4: Given strefa zawierająca karteczki, when usuwam strefę, then karteczki pozostają na planszy bez przypisanego pokoju.

**TDD Tasks**:
- [x] Write failing canonical test for AC-1
- [x] Implement AC-1 (red→green)
- [x] Write failing canonical test for AC-2
- [x] Implement AC-2 (red→green)
- [x] Write failing canonical test for AC-3
- [x] Implement AC-3 (red→green)
- [x] Write failing canonical test for AC-4
- [x] Implement AC-4 (red→green)

**Blocked by**: TASK-007, TASK-014
**Blocks**: TASK-018, TASK-021, TASK-023

---

## Sprint 4: Powtórka, statystyki, telefon, dopracowanie

### TASK-016: Kolejność kart powtórki
**Priority**: P0 | **Estimate**: 2h | **Status**: Done

**Description**:
Czysty moduł `review/order`: łańcuchy po kolei (łańcuchy sortowane datą utworzenia pierwszej karteczki), potem pozostałe karteczki według daty utworzenia.

**Acceptance Criteria**:
AC-1: Given plansza z łańcuchem B→C i luźną karteczką A utworzoną najwcześniej, when wyznaczam kolejność powtórki, then kolejność to B, C, A.
AC-2: Given plansza z luźnymi karteczkami utworzonymi w kolejności A, B, C, when wyznaczam kolejność powtórki, then kolejność to A, B, C.

**TDD Tasks**:
- [x] Write failing canonical test for AC-1
- [x] Implement AC-1 (red→green)
- [x] Write failing canonical test for AC-2
- [x] Implement AC-2 (red→green)

**Blocked by**: TASK-013
**Blocks**: TASK-017

---

### TASK-017: US-011 — Przebieg powtórki
**Priority**: P0 | **Estimate**: 3.5h | **Status**: Done

**Description**:
`POST /api/boards/{id}/review-sessions`, `POST /api/review-sessions/{id}/results`, `POST /api/review-sessions/{id}/finish`; strona `/boards/[id]/review` z ReviewCard, ReviewActions, ReviewProgress i ReviewSummary.

**User Story**: US-011

**Acceptance Criteria**:
AC-1: Given plansza z karteczkami mającymi słowa-obrazy, when rozpoczynam powtórkę, then widzę zagadnienie pierwszej karteczki, a jej słowa-obrazy są zakryte.
AC-2: Given karteczka w powtórce z zakrytymi słowami-obrazami, when wybieram "Odsłoń", then widzę słowa-obrazy oraz przyciski "Pamiętałem" i "Nie pamiętałem".
AC-3: Given odsłonięta karteczka, when wybieram "Pamiętałem", then wynik zostaje zapisany z bieżącą datą i pojawia się następna karteczka.
AC-4: Given ostatnia karteczka powtórki została oceniona, when powtórka się kończy, then widzę podsumowanie z liczbą zapamiętanych, liczbą wszystkich i wynikiem procentowym.

**TDD Tasks**:
- [x] Write failing canonical test for AC-1
- [x] Implement AC-1 (red→green)
- [x] Write failing canonical test for AC-2
- [x] Implement AC-2 (red→green)
- [x] Write failing canonical test for AC-3
- [x] Implement AC-3 (red→green)
- [x] Write failing canonical test for AC-4
- [x] Implement AC-4 (red→green)

**Blocked by**: TASK-011, TASK-016
**Blocks**: TASK-018, TASK-019

---

### TASK-018: US-012 — Zakres i kolejność powtórki
**Priority**: P0 | **Estimate**: 3h | **Status**: Done

**Description**:
Pomijanie karteczek bez słów-obrazów, kod `NO_REVIEWABLE_NOTES` i ekran ReviewUnavailable, nazwa pokoju odsłaniana ze słowami-obrazami, kolejność z modułu `review/order`.

**User Story**: US-012

**Acceptance Criteria**:
AC-1: Given plansza z łańcuchem A→B→C, when rozpoczynam powtórkę, then karteczki pojawiają się w kolejności A, B, C.
AC-2: Given plansza z karteczką bez słów-obrazów, when przechodzę powtórkę, then ta karteczka nie pojawia się w powtórce.
AC-3: Given plansza, na której żadna karteczka nie ma słów-obrazów, when rozpoczynam powtórkę, then powtórka się nie rozpoczyna i widzę komunikat "Dodaj słowa-obrazy, aby rozpocząć powtórkę".
AC-4: Given karteczka w powtórce przypisana do pokoju "Kuchnia", when wybieram "Odsłoń", then obok słów-obrazów widoczna jest nazwa pokoju "Kuchnia".

**TDD Tasks**:
- [x] Write failing canonical test for AC-1
- [x] Implement AC-1 (red→green)
- [x] Write failing canonical test for AC-2
- [x] Implement AC-2 (red→green)
- [x] Write failing canonical test for AC-3
- [x] Implement AC-3 (red→green)
- [x] Write failing canonical test for AC-4
- [x] Implement AC-4 (red→green)

**Blocked by**: TASK-015, TASK-017
**Blocks**: TASK-021

---

### TASK-019: US-013 — Statystyki zapamiętywania
**Priority**: P0 | **Estimate**: 3h | **Status**: Done

**Description**:
`lastReview` i `noteCount` w `GET /api/boards`, `GET /api/stats`; BoardCard z wynikiem i datą, StatsPanel.

**User Story**: US-013

**Acceptance Criteria**:
AC-1: Given plansza z ukończoną powtórką o wyniku 8 z 10, when otwieram listę plansz, then przy planszy widzę wynik ostatniej powtórki "80%" wraz z jej datą.
AC-2: Given 3 ukończone powtórki w ciągu ostatnich 7 dni, when otwieram statystyki, then widzę "Powtórki w ostatnich 7 dniach: 3".
AC-3: Given plansza bez żadnej ukończonej powtórki, when otwieram listę plansz, then przy planszy widzę "Brak powtórek".

**TDD Tasks**:
- [x] Write failing canonical test for AC-1
- [x] Implement AC-1 (red→green)
- [x] Write failing canonical test for AC-2
- [x] Implement AC-2 (red→green)
- [x] Write failing canonical test for AC-3
- [x] Implement AC-3 (red→green)

**Blocked by**: TASK-017
**Blocks**: TASK-020

---

### TASK-020: US-002 — Zarządzanie planszami
**Priority**: P1 | **Estimate**: 2h | **Status**: Done

**Description**:
`PATCH/DELETE /api/boards/{id}`; menu BoardCard, ConfirmDialog, kaskadowe usunięcie zawartości.

**User Story**: US-002

**Acceptance Criteria**:
AC-1: Given plansza "Historia", when zmieniam jej nazwę na "Historia Polski", then na liście plansz widnieje nowa nazwa.
AC-2: Given plansza z karteczkami, when wybieram usunięcie, then aplikacja pyta o potwierdzenie przed usunięciem.
AC-3: Given potwierdzone usunięcie planszy, when wracam do listy, then plansza oraz jej karteczki, połączenia, strefy i wyniki powtórek nie istnieją.

**TDD Tasks**:
- [x] Write failing canonical test for AC-1
- [x] Implement AC-1 (red→green)
- [x] Write failing canonical test for AC-2
- [x] Implement AC-2 (red→green)
- [x] Write failing canonical test for AC-3
- [x] Implement AC-3 (red→green)

**Blocked by**: TASK-019
**Blocks**: None

---

### TASK-021: US-014 — Praca na telefonie
**Priority**: P0 | **Estimate**: 3.5h | **Status**: Done

**Description**:
Układ responsywny od 375 px (pasek narzędzi na dole, NoteEditor jako arkusz dolny, powtórka w jednej kolumnie), cele dotykowe 44 px, testy Playwright w profilu mobilnym z dotykiem.

**User Story**: US-014

**Acceptance Criteria**:
AC-1: Given ekran o szerokości 375 px, when przechodzę powtórkę, then wszystkie elementy powtórki mieszczą się na ekranie bez przewijania w poziomie.
AC-2: Given plansza otwarta na urządzeniu dotykowym, when przeciągam karteczkę palcem, then karteczka zmienia położenie.
AC-3: Given karteczka dodana na jednym urządzeniu, when otwieram tę planszę na drugim urządzeniu, then widzę tę karteczkę.

**TDD Tasks**:
- [x] Write failing canonical test for AC-1
- [x] Implement AC-1 (red→green)
- [x] Write failing canonical test for AC-2
- [x] Implement AC-2 (red→green)
- [x] Write failing canonical test for AC-3
- [x] Implement AC-3 (red→green)

**Blocked by**: TASK-018, TASK-015
**Blocks**: None

---

### TASK-022: Utwardzenie bezpieczeństwa
**Priority**: P0 | **Estimate**: 2h | **Status**: Done

**Description**:
Nagłówki bezpieczeństwa w `next.config` (CSP, X-Content-Type-Options, Referrer-Policy), przegląd renderowania treści użytkownika, limity długości pól.

**Acceptance Criteria**:
AC-1: Given dowolna odpowiedź aplikacji, when sprawdzam nagłówki, then zawiera `Content-Security-Policy` oraz `X-Content-Type-Options: nosniff`.
AC-2: Given karteczka z zagadnieniem `<script>alert(1)</script>`, when plansza ją renderuje, then zagadnienie jest widoczne jako tekst i nie powstaje element script.

**TDD Tasks**:
- [x] Write failing canonical test for AC-1
- [x] Implement AC-1 (red→green)
- [x] Write failing canonical test for AC-2
- [x] Implement AC-2 (red→green)

**Blocked by**: TASK-006
**Blocks**: None

---

### TASK-023: Wydajność dużej planszy
**Priority**: P1 | **Estimate**: 2h | **Status**: Done

**Description**:
Sprawdzenie celu z constraints: plansza z 200 karteczkami; `onlyRenderVisibleElements`; brak zapytań N+1 w `GET /api/boards/{id}`.

**Acceptance Criteria**:
AC-1: Given plansza z 200 karteczkami, 20 strefami i 200 połączeniami, when wywołuję GET /api/boards/{id}, then odpowiedź przychodzi w czasie krótszym niż 500 ms.

**TDD Tasks**:
- [x] Write failing canonical test for AC-1
- [x] Implement AC-1 (red→green)

**Blocked by**: TASK-015
**Blocks**: None

---

## Sprint 5: Bogatsze karteczki (iteracja 2)

### TASK-024: Migracja schematu iteracji 2
**Priority**: P0 | **Estimate**: 2h | **Status**: Done

**Description**:
Migracja Prisma: enum `note_color`, kolumny `note.story`, `note.emoji`, `note.color` (domyślnie `yellow`, także dla istniejących karteczek); `peg_word.number` do 15 znaków, `word` do 80, `default_word` dopuszcza NULL; ręcznie dopisane ograniczenie CHECK wiążące brak słowa startowego z długością liczby ≥ 3 (jak w ADR-002). Aktualizacja `schema.prisma` i typów.

**Acceptance Criteria**:
AC-1: Given karteczka zapisana w bazie bez podania koloru, opowiadania i emotek, when ją odczytuję, then ma kolor `yellow` oraz puste opowiadanie i emotki.
AC-2: Given tabela peg_word, when zapisuję hasło "333" bez słowa startowego, then zapis się udaje.
AC-3: Given tabela peg_word, when zapisuję hasło "33" bez słowa startowego, then baza odrzuca zapis błędem ograniczenia CHECK.

**TDD Tasks**:
- [x] Write failing canonical test for AC-1
- [x] Implement AC-1 (red→green)
- [x] Write failing canonical test for AC-2
- [x] Implement AC-2 (red→green)
- [x] Write failing canonical test for AC-3
- [x] Implement AC-3 (red→green)

**Blocked by**: None
**Blocks**: TASK-025, TASK-026, TASK-027, TASK-030

---

### TASK-025: US-015 — Opowiadanie na karteczce
**Priority**: P0 | **Estimate**: 3h | **Status**: Done

**Description**:
Pole `story` w `NoteCreate`/`NoteUpdate`/`Note` (Zod, limit 2000) i w `ReviewCard`; pole "Opowiadanie" w NoteEditor; NoteNode pokazuje opowiadanie obcięte do 2 wierszy; ReviewCard zakrywa je i odsłania razem ze słowami-obrazami.

**User Story**: US-015

**Acceptance Criteria**:
AC-1: Given karteczka z zagadnieniem "1410" i słowami-obrazami "tor, dos", when wpisuję opowiadanie "Po torze jedzie dos" i odświeżam stronę, then karteczka pokazuje to opowiadanie pod słowami-obrazami.
AC-2: Given karteczka w powtórce mająca opowiadanie, when widzę jej zagadnienie przed odsłonięciem, then opowiadanie jest zakryte.
AC-3: Given karteczka w powtórce mająca opowiadanie, when wybieram "Odsłoń", then widzę opowiadanie obok słów-obrazów.
AC-4: Given formularz karteczki, when zapisuję opowiadanie dłuższe niż 2000 znaków, then zmiana jest odrzucona i widzę komunikat "Opowiadanie może mieć najwyżej 2000 znaków".

**TDD Tasks**:
- [x] Write failing canonical test for AC-1
- [x] Implement AC-1 (red→green)
- [x] Write failing canonical test for AC-2
- [x] Implement AC-2 (red→green)
- [x] Write failing canonical test for AC-3
- [x] Implement AC-3 (red→green)
- [x] Write failing canonical test for AC-4
- [x] Implement AC-4 (red→green)

**Blocked by**: TASK-024
**Blocks**: TASK-032

---

### TASK-026: US-016 — Emotki na karteczce
**Priority**: P0 | **Estimate**: 3h | **Status**: Done

**Description**:
Pole `emoji` w API karteczki i w `ReviewCard`; limit 8 znaków graficznych liczony przez `Intl.Segmenter` w schemacie Zod (ADR-006); pole "Emotki" w NoteEditor; NoteNode pokazuje emotki w rozmiarze `font-size-emoji` (24 px); ReviewCard zakrywa je do "Odsłoń". AC-2 wymaga prawdziwej przeglądarki (wyliczony rozmiar czcionki), więc jego test kanoniczny jest w Playwright.

**User Story**: US-016

**Acceptance Criteria**:
AC-1: Given karteczka na planszy, when wpisuję emotki "🏰⚔️" i odświeżam stronę, then karteczka pokazuje emotki "🏰⚔️".
AC-2: Given karteczka z emotkami na planszy przy powiększeniu 100%, when odczytuję rozmiar czcionki emotek, then wynosi on co najmniej 24 px.
AC-3: Given formularz karteczki, when zapisuję 9 emotek, then zmiana jest odrzucona i widzę komunikat "Najwyżej 8 emotek".
AC-4: Given karteczka w powtórce mająca emotki, when widzę jej zagadnienie przed odsłonięciem, then emotki są zakryte.

**TDD Tasks**:
- [x] Write failing canonical test for AC-1
- [x] Implement AC-1 (red→green)
- [x] Write failing canonical test for AC-2
- [x] Implement AC-2 (red→green)
- [x] Write failing canonical test for AC-3
- [x] Implement AC-3 (red→green)
- [x] Write failing canonical test for AC-4
- [x] Implement AC-4 (red→green)

**Blocked by**: TASK-024
**Blocks**: TASK-032

---

### TASK-027: US-017 — Kolory karteczek
**Priority**: P0 | **Estimate**: 2.5h | **Status**: Done

**Description**:
Pole `color` w API karteczki; tokeny pięciu kolorów w Tailwind; ColorSwatch i ColorPicker w NoteEditor (zapis od razu, `aria-label` z nazwą koloru); NoteNode przyjmuje tło i obramowanie według koloru.

**User Story**: US-017

**Acceptance Criteria**:
AC-1: Given otwarta plansza, when dodaję nową karteczkę, then karteczka ma kolor żółty.
AC-2: Given karteczka na planszy, when otwieram wybór koloru, then widzę dokładnie 5 kolorów: żółty, czerwony, pomarańczowy, zielony i niebieski.
AC-3: Given żółta karteczka, when zmieniam jej kolor na czerwony i odświeżam stronę, then karteczka jest czerwona.

**TDD Tasks**:
- [x] Write failing canonical test for AC-1
- [x] Implement AC-1 (red→green)
- [x] Write failing canonical test for AC-2
- [x] Implement AC-2 (red→green)
- [x] Write failing canonical test for AC-3
- [x] Implement AC-3 (red→green)

**Blocked by**: TASK-024
**Blocks**: TASK-028, TASK-032

---

### TASK-028: US-018 — Filtr koloru w powtórce
**Priority**: P1 | **Estimate**: 3h | **Status**: Ready

**Description**:
Opcjonalne `colors` w `POST /api/boards/{id}/review-sessions`: filtr nakładany po wyliczeniu pełnej kolejności kart; błąd 422 `NO_NOTES_IN_COLORS`. Okno ReviewStart z ColorFilter otwierane przyciskiem "Rozpocznij powtórkę" w edytorze planszy; wybór trafia do strony powtórki w parametrze `?colors=`. Wejście na stronę powtórki bez parametru oznacza wszystkie kolory, więc dotychczasowe testy US-011 i US-012 pozostają bez zmian.

**User Story**: US-018

**Acceptance Criteria**:
AC-1: Given plansza z karteczkami czerwonymi i żółtymi mającymi słowa-obrazy, when rozpoczynam powtórkę z zaznaczonym tylko kolorem czerwonym, then w powtórce pojawiają się wyłącznie czerwone karteczki.
AC-2: Given plansza z karteczkami w różnych kolorach, when otwieram rozpoczęcie powtórki, then wszystkie kolory są zaznaczone.
AC-3: Given plansza bez niebieskich karteczek ze słowami-obrazami, when rozpoczynam powtórkę z zaznaczonym tylko kolorem niebieskim, then powtórka się nie rozpoczyna i widzę komunikat "Brak karteczek w wybranych kolorach".
AC-4: Given łańcuch A→B→C, w którym A i C są czerwone, a B żółta, when rozpoczynam powtórkę z zaznaczonym tylko kolorem czerwonym, then karteczki pojawiają się w kolejności A, C.

**TDD Tasks**:
- [ ] Write failing canonical test for AC-1
- [ ] Implement AC-1 (red→green)
- [ ] Write failing canonical test for AC-2
- [ ] Implement AC-2 (red→green)
- [ ] Write failing canonical test for AC-3
- [ ] Implement AC-3 (red→green)
- [ ] Write failing canonical test for AC-4
- [ ] Implement AC-4 (red→green)

**Blocked by**: TASK-027
**Blocks**: None

---

## Sprint 6: Własne wpisy GSP (iteracja 2)

### TASK-029: Dopasowanie własnych wpisów w generatorze
**Priority**: P0 | **Estimate**: 2h | **Status**: Ready

**Description**:
Czysta funkcja podziału ciągu cyfr z własnymi wpisami: wyszukanie od lewej, w tym samym miejscu najdłuższy wpis, fragmenty między dopasowaniami dzielone na pary. `generateWordImages` przyjmuje osobno hasła wbudowane i własne oraz zwraca `source` segmentu.

**Acceptance Criteria**:
AC-1: Given własny wpis "333" i ciąg cyfr "48333", when dzielę ciąg na segmenty, then otrzymuję kolejno "48" i "333".
AC-2: Given własne wpisy "333" i "3334" oraz ciąg cyfr "3334", when dzielę ciąg na segmenty, then otrzymuję jeden segment "3334".
AC-3: Given własny wpis "333" i ciąg cyfr "3331333", when dzielę ciąg na segmenty, then otrzymuję kolejno "333", "1" i "333".

**TDD Tasks**:
- [ ] Write failing canonical test for AC-1
- [ ] Implement AC-1 (red→green)
- [ ] Write failing canonical test for AC-2
- [ ] Implement AC-2 (red→green)
- [ ] Write failing canonical test for AC-3
- [ ] Implement AC-3 (red→green)

**Blocked by**: None
**Blocks**: TASK-031

---

### TASK-030: US-019 — Zarządzanie własnymi wpisami GSP
**Priority**: P0 | **Estimate**: 3.5h | **Status**: Ready

**Description**:
`POST /api/peg-words`, `DELETE /api/peg-words/{number}`, rozszerzony `PUT` (własny wpis do 80 znaków), pole `kind` w odpowiedzi, `reset` własnego wpisu → 409 `PEG_NO_DEFAULT`, limit 500 wpisów (`PEG_LIMIT`). Na stronie `/peg-words` sekcja CustomPegSection z formularzem, edycją w miejscu i usuwaniem; tabela 110 haseł wbudowanych pozostaje bez zmian.

**User Story**: US-019

**Acceptance Criteria**:
AC-1: Given lista GSP, when dodaję własny wpis "333" ze słowem "mumia-mysz", then wpis "333 – mumia-mysz" jest widoczny na liście własnych wpisów.
AC-2: Given istniejący własny wpis "333", when dodaję kolejny wpis "333", then wpis nie powstaje i widzę komunikat "Wpis dla tej liczby już istnieje".
AC-3: Given formularz własnego wpisu, when zatwierdzam liczbę "33", then wpis nie powstaje i widzę komunikat "Własny wpis musi mieć od 3 do 15 cyfr".
AC-4: Given własny wpis "333" ze słowem "mumia-mysz", when zmieniam słowo na "mamut", then wpis pokazuje "333 – mamut".
AC-5: Given własny wpis "333", when go usuwam, then wpisu nie ma na liście własnych wpisów.

**TDD Tasks**:
- [ ] Write failing canonical test for AC-1
- [ ] Implement AC-1 (red→green)
- [ ] Write failing canonical test for AC-2
- [ ] Implement AC-2 (red→green)
- [ ] Write failing canonical test for AC-3
- [ ] Implement AC-3 (red→green)
- [ ] Write failing canonical test for AC-4
- [ ] Implement AC-4 (red→green)
- [ ] Write failing canonical test for AC-5
- [ ] Implement AC-5 (red→green)

**Blocked by**: TASK-024
**Blocks**: TASK-031, TASK-035

---

### TASK-031: US-020 — Generator korzysta z własnych wpisów
**Priority**: P0 | **Estimate**: 2h | **Status**: Ready

**Description**:
`POST /api/word-images/generate` wczytuje własne wpisy i przekazuje je do generatora z TASK-029; odpowiedź zawiera `source` segmentu. Akcja "Generuj słowa" w NoteEditor działa bez zmian w interfejsie.

**User Story**: US-020

**Acceptance Criteria**:
AC-1: Given własny wpis "333" ze słowem "mumia-mysz", when generuję słowa dla zagadnienia "333", then otrzymuję "mumia-mysz".
AC-2: Given własny wpis "333", when generuję słowa dla zagadnienia "48333", then otrzymuję kolejno słowo z listy GSP dla "48" i "mumia-mysz".
AC-3: Given własne wpisy "333" i "3334", when generuję słowa dla zagadnienia "3334", then otrzymuję słowo wpisu "3334".
AC-4: Given brak własnych wpisów, when generuję słowa dla zagadnienia "333", then otrzymuję słowo z listy GSP dla "33" i słowo dla pojedynczej cyfry "3".

**TDD Tasks**:
- [ ] Write failing canonical test for AC-1
- [ ] Implement AC-1 (red→green)
- [ ] Write failing canonical test for AC-2
- [ ] Implement AC-2 (red→green)
- [ ] Write failing canonical test for AC-3
- [ ] Implement AC-3 (red→green)
- [ ] Write failing canonical test for AC-4
- [ ] Implement AC-4 (red→green)

**Blocked by**: TASK-029, TASK-030
**Blocks**: None

---

## Sprint 7: Eksport, import i kopie zapasowe (iteracja 2)

### TASK-032: Format pliku i walidacja (moduł transfer)
**Priority**: P0 | **Estimate**: 3h | **Status**: Ready

**Description**:
Nowy moduł `src/modules/transfer`: schematy Zod `BoardExportFile` i `BackupFile` (format, wersja, rodzaj), serializacja planszy do pliku, walidacja powiązań z użyciem reguł modułu `arrangement` (połączenia tylko między karteczkami z pliku, jedno połączenie na parę, łańcuch bez pętli), nazwa pliku bez polskich znaków. Czyste funkcje, bez bazy.

**Acceptance Criteria**:
AC-1: Given plansza z 3 karteczkami, 1 strefą i 2 połączeniami, when serializuję ją do pliku i parsuję ten plik, then wynik zawiera te same 3 karteczki, 1 strefę i 2 połączenia.
AC-2: Given plik z połączeniem wskazującym karteczkę spoza pliku, when go waliduję, then walidacja zwraca błąd.
AC-3: Given plik z ogniwami łańcucha A→B, B→C i C→A, when go waliduję, then walidacja zwraca błąd.
AC-4: Given plansza o nazwie "Żółta Historia Polski", when wyznaczam nazwę pliku eksportu, then nazwa zawiera "zolta-historia-polski".

**TDD Tasks**:
- [ ] Write failing canonical test for AC-1
- [ ] Implement AC-1 (red→green)
- [ ] Write failing canonical test for AC-2
- [ ] Implement AC-2 (red→green)
- [ ] Write failing canonical test for AC-3
- [ ] Implement AC-3 (red→green)
- [ ] Write failing canonical test for AC-4
- [ ] Implement AC-4 (red→green)

**Blocked by**: TASK-025, TASK-026, TASK-027
**Blocks**: TASK-033

---

### TASK-033: US-021 — Eksport planszy
**Priority**: P0 | **Estimate**: 2h | **Status**: Ready

**Description**:
`GET /api/boards/{id}/export` z nagłówkiem `Content-Disposition: attachment`; pozycja "Eksportuj" w menu BoardCard.

**User Story**: US-021

**Acceptance Criteria**:
AC-1: Given plansza "Historia Polski", when wybieram "Eksportuj", then przeglądarka pobiera plik JSON, którego nazwa zawiera "historia-polski".
AC-2: Given plansza z 3 karteczkami, 1 strefą i 2 połączeniami, when ją eksportuję, then plik zawiera 3 karteczki z zagadnieniem, słowami-obrazami, opowiadaniem, emotkami, kolorem i położeniem, 1 strefę i 2 połączenia.

**TDD Tasks**:
- [ ] Write failing canonical test for AC-1
- [ ] Implement AC-1 (red→green)
- [ ] Write failing canonical test for AC-2
- [ ] Implement AC-2 (red→green)

**Blocked by**: TASK-032
**Blocks**: TASK-034

---

### TASK-034: US-022 — Import planszy
**Priority**: P0 | **Estimate**: 3.5h | **Status**: Ready

**Description**:
`POST /api/boards/import`: limit 5 MB sprawdzany przed parsowaniem (osobny limit trasy ponad domyślny z `withApi`), walidacja całego pliku, zapis jedną transakcją z nowymi identyfikatorami (`createMany`), dopisek " (import)" przy zajętej nazwie (gdy i ta jest zajęta: " (import 2)", " (import 3)"…), przeliczenie `zoneId` z mapowania identyfikatorów. BackupPanel na liście plansz (także w pustym stanie) z przyciskiem "Importuj planszę" i komunikatami błędów.

**User Story**: US-022

**Acceptance Criteria**:
AC-1: Given plik eksportu planszy z 3 karteczkami, 1 strefą i łańcuchem A→B→C, when go importuję, then powstaje nowa plansza z 3 karteczkami, 1 strefą i łańcuchem w kolejności A, B, C.
AC-2: Given istniejąca plansza "Historia" i plik eksportu planszy o nazwie "Historia", when importuję plik, then istniejąca plansza pozostaje bez zmian, a nowa nazywa się "Historia (import)".
AC-3: Given plik, który nie jest eksportem Mnemoboard, when go importuję, then żadna plansza nie powstaje i widzę komunikat "Plik nie jest poprawnym eksportem Mnemoboard".
AC-4: Given plik większy niż 5 MB, when go importuję, then żadna plansza nie powstaje i widzę komunikat "Plik jest za duży (limit 5 MB)".

**TDD Tasks**:
- [ ] Write failing canonical test for AC-1
- [ ] Implement AC-1 (red→green)
- [ ] Write failing canonical test for AC-2
- [ ] Implement AC-2 (red→green)
- [ ] Write failing canonical test for AC-3
- [ ] Implement AC-3 (red→green)
- [ ] Write failing canonical test for AC-4
- [ ] Implement AC-4 (red→green)

**Blocked by**: TASK-033
**Blocks**: TASK-035

---

### TASK-035: Przywracanie kopii — reguły scalania
**Priority**: P0 | **Estimate**: 3h | **Status**: Ready

**Description**:
Serwis przywracania w module `transfer`: każda plansza z kopii dodawana jako nowa z historią powtórek (wyniki przepięte na nowe identyfikatory karteczek); słowo hasła wbudowanego przyjmowane tylko wtedy, gdy bieżące równa się startowemu; własne wpisy tylko brakujące; tryb `dryRun` liczący zmiany bez zapisu; jedna transakcja.

**Acceptance Criteria**:
AC-1: Given hasło "14" o słowie równym startowemu i kopia ze słowem "tur" dla "14", when przywracam kopię, then hasło "14" ma słowo "tur".
AC-2: Given hasło "14" zmienione przez użytkownika na "tara" i kopia ze słowem "tur" dla "14", when przywracam kopię, then hasło "14" nadal ma słowo "tara".
AC-3: Given istniejący własny wpis "333" ze słowem "mamut" i kopia z wpisem "333" ze słowem "mumia-mysz", when przywracam kopię, then wpis "333" nadal ma słowo "mamut".
AC-4: Given kopia z planszą mającą ukończoną powtórkę o wyniku 8 z 10, when przywracam kopię, then nowa plansza ma ukończoną powtórkę z 10 wynikami przypisanymi do jej własnych karteczek.

**TDD Tasks**:
- [ ] Write failing canonical test for AC-1
- [ ] Implement AC-1 (red→green)
- [ ] Write failing canonical test for AC-2
- [ ] Implement AC-2 (red→green)
- [ ] Write failing canonical test for AC-3
- [ ] Implement AC-3 (red→green)
- [ ] Write failing canonical test for AC-4
- [ ] Implement AC-4 (red→green)

**Blocked by**: TASK-030, TASK-034
**Blocks**: TASK-036

---

### TASK-036: US-023 — Pełna kopia zapasowa
**Priority**: P0 | **Estimate**: 3.5h | **Status**: Ready

**Description**:
`GET /api/backup` (plik `mnemoboard-kopia-<data>.json`) i `POST /api/backup/restore` z `dryRun` (limit 50 MB); w BackupPanel przyciski "Pobierz kopię" i "Przywróć z kopii"; RestoreConfirmDialog pokazuje wynik `dryRun` i zapisuje dopiero po potwierdzeniu.

**User Story**: US-023

**Acceptance Criteria**:
AC-1: Given 2 plansze, zmienione słowo GSP dla "14" i własny wpis "333", when wybieram "Pobierz kopię", then pobrany plik zawiera 2 plansze z historią powtórek, słowo dla "14" i wpis "333".
AC-2: Given świeża instalacja bez plansz i plik kopii z 2 planszami, zmienionym słowem dla "14" i wpisem "333", when przywracam kopię, then mam 2 plansze z wynikami ostatnich powtórek, zmienione słowo dla "14" i wpis "333".
AC-3: Given istniejąca plansza "Biologia" i plik kopii z 2 planszami, when przywracam kopię, then plansza "Biologia" pozostaje bez zmian, a lista ma 3 plansze.
AC-4: Given plik kopii z 2 planszami, when wybieram "Przywróć z kopii", then przed zapisem widzę komunikat "Zostaną dodane 2 plansze" i dane zmieniają się dopiero po potwierdzeniu.
AC-5: Given uszkodzony plik kopii, when go przywracam, then żadne dane się nie zmieniają i widzę komunikat "Plik nie jest poprawną kopią Mnemoboard".

**TDD Tasks**:
- [ ] Write failing canonical test for AC-1
- [ ] Implement AC-1 (red→green)
- [ ] Write failing canonical test for AC-2
- [ ] Implement AC-2 (red→green)
- [ ] Write failing canonical test for AC-3
- [ ] Implement AC-3 (red→green)
- [ ] Write failing canonical test for AC-4
- [ ] Implement AC-4 (red→green)
- [ ] Write failing canonical test for AC-5
- [ ] Implement AC-5 (red→green)

**Blocked by**: TASK-035
**Blocks**: TASK-037

---

### TASK-037: Wydajność i bezpieczeństwo plików
**Priority**: P1 | **Estimate**: 2h | **Status**: Ready

**Description**:
Testy czasu importu i przywracania na dużych danych oraz renderowania treści z pliku jako tekstu; poprawki wsadowego zapisu, jeśli cele nie są spełnione.

**Acceptance Criteria**:
AC-1: Given plik eksportu planszy z 200 karteczkami, 20 strefami i 200 połączeniami, when importuję go przez API, then odpowiedź przychodzi w czasie krótszym niż 2 s.
AC-2: Given plik kopii z 50 planszami po 200 karteczek, when przywracam go przez API, then odpowiedź przychodzi w czasie krótszym niż 10 s.
AC-3: Given plik eksportu z karteczką o zagadnieniu `<script>alert(1)</script>`, when importuję go i otwieram planszę, then zagadnienie jest widoczne jako tekst i nie powstaje element script.

**TDD Tasks**:
- [ ] Write failing canonical test for AC-1
- [ ] Implement AC-1 (red→green)
- [ ] Write failing canonical test for AC-2
- [ ] Implement AC-2 (red→green)
- [ ] Write failing canonical test for AC-3
- [ ] Implement AC-3 (red→green)

**Blocked by**: TASK-036
**Blocks**: None

---

## Task Summary

| Sprint | Tasks | Total Estimate |
|--------|-------|----------------|
| Sprint 1 | TASK-001 to TASK-006 (6) | 18.5h |
| Sprint 2 | TASK-007 to TASK-011 (5) | 14.5h |
| Sprint 3 | TASK-012 to TASK-015 (4) | 12h |
| Sprint 4 | TASK-016 to TASK-023 (8) | 21h |
| Sprint 5 | TASK-024 to TASK-028 (5) | 13.5h |
| Sprint 6 | TASK-029 to TASK-031 (3) | 7.5h |
| Sprint 7 | TASK-032 to TASK-037 (6) | 17h |
| **Total** | **37 tasks, 119 AC** | **104h** |
