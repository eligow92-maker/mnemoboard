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
**Priority**: P0 | **Estimate**: 3.5h | **Status**: Ready

**Description**:
`POST /api/boards/{id}/review-sessions`, `POST /api/review-sessions/{id}/results`, `POST /api/review-sessions/{id}/finish`; strona `/boards/[id]/review` z ReviewCard, ReviewActions, ReviewProgress i ReviewSummary.

**User Story**: US-011

**Acceptance Criteria**:
AC-1: Given plansza z karteczkami mającymi słowa-obrazy, when rozpoczynam powtórkę, then widzę zagadnienie pierwszej karteczki, a jej słowa-obrazy są zakryte.
AC-2: Given karteczka w powtórce z zakrytymi słowami-obrazami, when wybieram "Odsłoń", then widzę słowa-obrazy oraz przyciski "Pamiętałem" i "Nie pamiętałem".
AC-3: Given odsłonięta karteczka, when wybieram "Pamiętałem", then wynik zostaje zapisany z bieżącą datą i pojawia się następna karteczka.
AC-4: Given ostatnia karteczka powtórki została oceniona, when powtórka się kończy, then widzę podsumowanie z liczbą zapamiętanych, liczbą wszystkich i wynikiem procentowym.

**TDD Tasks**:
- [ ] Write failing canonical test for AC-1
- [ ] Implement AC-1 (red→green)
- [ ] Write failing canonical test for AC-2
- [ ] Implement AC-2 (red→green)
- [ ] Write failing canonical test for AC-3
- [ ] Implement AC-3 (red→green)
- [ ] Write failing canonical test for AC-4
- [ ] Implement AC-4 (red→green)

**Blocked by**: TASK-011, TASK-016
**Blocks**: TASK-018, TASK-019

---

### TASK-018: US-012 — Zakres i kolejność powtórki
**Priority**: P0 | **Estimate**: 3h | **Status**: Ready

**Description**:
Pomijanie karteczek bez słów-obrazów, kod `NO_REVIEWABLE_NOTES` i ekran ReviewUnavailable, nazwa pokoju odsłaniana ze słowami-obrazami, kolejność z modułu `review/order`.

**User Story**: US-012

**Acceptance Criteria**:
AC-1: Given plansza z łańcuchem A→B→C, when rozpoczynam powtórkę, then karteczki pojawiają się w kolejności A, B, C.
AC-2: Given plansza z karteczką bez słów-obrazów, when przechodzę powtórkę, then ta karteczka nie pojawia się w powtórce.
AC-3: Given plansza, na której żadna karteczka nie ma słów-obrazów, when rozpoczynam powtórkę, then powtórka się nie rozpoczyna i widzę komunikat "Dodaj słowa-obrazy, aby rozpocząć powtórkę".
AC-4: Given karteczka w powtórce przypisana do pokoju "Kuchnia", when wybieram "Odsłoń", then obok słów-obrazów widoczna jest nazwa pokoju "Kuchnia".

**TDD Tasks**:
- [ ] Write failing canonical test for AC-1
- [ ] Implement AC-1 (red→green)
- [ ] Write failing canonical test for AC-2
- [ ] Implement AC-2 (red→green)
- [ ] Write failing canonical test for AC-3
- [ ] Implement AC-3 (red→green)
- [ ] Write failing canonical test for AC-4
- [ ] Implement AC-4 (red→green)

**Blocked by**: TASK-015, TASK-017
**Blocks**: TASK-021

---

### TASK-019: US-013 — Statystyki zapamiętywania
**Priority**: P0 | **Estimate**: 3h | **Status**: Ready

**Description**:
`lastReview` i `noteCount` w `GET /api/boards`, `GET /api/stats`; BoardCard z wynikiem i datą, StatsPanel.

**User Story**: US-013

**Acceptance Criteria**:
AC-1: Given plansza z ukończoną powtórką o wyniku 8 z 10, when otwieram listę plansz, then przy planszy widzę wynik ostatniej powtórki "80%" wraz z jej datą.
AC-2: Given 3 ukończone powtórki w ciągu ostatnich 7 dni, when otwieram statystyki, then widzę "Powtórki w ostatnich 7 dniach: 3".
AC-3: Given plansza bez żadnej ukończonej powtórki, when otwieram listę plansz, then przy planszy widzę "Brak powtórek".

**TDD Tasks**:
- [ ] Write failing canonical test for AC-1
- [ ] Implement AC-1 (red→green)
- [ ] Write failing canonical test for AC-2
- [ ] Implement AC-2 (red→green)
- [ ] Write failing canonical test for AC-3
- [ ] Implement AC-3 (red→green)

**Blocked by**: TASK-017
**Blocks**: TASK-020

---

### TASK-020: US-002 — Zarządzanie planszami
**Priority**: P1 | **Estimate**: 2h | **Status**: Ready

**Description**:
`PATCH/DELETE /api/boards/{id}`; menu BoardCard, ConfirmDialog, kaskadowe usunięcie zawartości.

**User Story**: US-002

**Acceptance Criteria**:
AC-1: Given plansza "Historia", when zmieniam jej nazwę na "Historia Polski", then na liście plansz widnieje nowa nazwa.
AC-2: Given plansza z karteczkami, when wybieram usunięcie, then aplikacja pyta o potwierdzenie przed usunięciem.
AC-3: Given potwierdzone usunięcie planszy, when wracam do listy, then plansza oraz jej karteczki, połączenia, strefy i wyniki powtórek nie istnieją.

**TDD Tasks**:
- [ ] Write failing canonical test for AC-1
- [ ] Implement AC-1 (red→green)
- [ ] Write failing canonical test for AC-2
- [ ] Implement AC-2 (red→green)
- [ ] Write failing canonical test for AC-3
- [ ] Implement AC-3 (red→green)

**Blocked by**: TASK-019
**Blocks**: None

---

### TASK-021: US-014 — Praca na telefonie
**Priority**: P0 | **Estimate**: 3.5h | **Status**: Ready

**Description**:
Układ responsywny od 375 px (pasek narzędzi na dole, NoteEditor jako arkusz dolny, powtórka w jednej kolumnie), cele dotykowe 44 px, testy Playwright w profilu mobilnym z dotykiem.

**User Story**: US-014

**Acceptance Criteria**:
AC-1: Given ekran o szerokości 375 px, when przechodzę powtórkę, then wszystkie elementy powtórki mieszczą się na ekranie bez przewijania w poziomie.
AC-2: Given plansza otwarta na urządzeniu dotykowym, when przeciągam karteczkę palcem, then karteczka zmienia położenie.
AC-3: Given karteczka dodana na jednym urządzeniu, when otwieram tę planszę na drugim urządzeniu, then widzę tę karteczkę.

**TDD Tasks**:
- [ ] Write failing canonical test for AC-1
- [ ] Implement AC-1 (red→green)
- [ ] Write failing canonical test for AC-2
- [ ] Implement AC-2 (red→green)
- [ ] Write failing canonical test for AC-3
- [ ] Implement AC-3 (red→green)

**Blocked by**: TASK-018, TASK-015
**Blocks**: None

---

### TASK-022: Utwardzenie bezpieczeństwa
**Priority**: P0 | **Estimate**: 2h | **Status**: Ready

**Description**:
Nagłówki bezpieczeństwa w `next.config` (CSP, X-Content-Type-Options, Referrer-Policy), przegląd renderowania treści użytkownika, limity długości pól.

**Acceptance Criteria**:
AC-1: Given dowolna odpowiedź aplikacji, when sprawdzam nagłówki, then zawiera `Content-Security-Policy` oraz `X-Content-Type-Options: nosniff`.
AC-2: Given karteczka z zagadnieniem `<script>alert(1)</script>`, when plansza ją renderuje, then zagadnienie jest widoczne jako tekst i nie powstaje element script.

**TDD Tasks**:
- [ ] Write failing canonical test for AC-1
- [ ] Implement AC-1 (red→green)
- [ ] Write failing canonical test for AC-2
- [ ] Implement AC-2 (red→green)

**Blocked by**: TASK-006
**Blocks**: None

---

### TASK-023: Wydajność dużej planszy
**Priority**: P1 | **Estimate**: 2h | **Status**: Ready

**Description**:
Sprawdzenie celu z constraints: plansza z 200 karteczkami; `onlyRenderVisibleElements`; brak zapytań N+1 w `GET /api/boards/{id}`.

**Acceptance Criteria**:
AC-1: Given plansza z 200 karteczkami, 20 strefami i 200 połączeniami, when wywołuję GET /api/boards/{id}, then odpowiedź przychodzi w czasie krótszym niż 500 ms.

**TDD Tasks**:
- [ ] Write failing canonical test for AC-1
- [ ] Implement AC-1 (red→green)

**Blocked by**: TASK-015
**Blocks**: None

---

## Task Summary

| Sprint | Tasks | Total Estimate |
|--------|-------|----------------|
| Sprint 1 | TASK-001 to TASK-006 (6) | 18.5h |
| Sprint 2 | TASK-007 to TASK-011 (5) | 14.5h |
| Sprint 3 | TASK-012 to TASK-015 (4) | 12h |
| Sprint 4 | TASK-016 to TASK-023 (8) | 21h |
| **Total** | **23 tasks, 67 AC** | **66h** |
