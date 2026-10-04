# Test Plan

## Testing Strategy

### Acceptance Criteria TDD

- Każde `AC-N` z backlogu (numerowane w obrębie zadania) ma dokładnie jeden test kanoniczny.
- Nazwa testu kanonicznego zaczyna się od `AC-N: `, po czym następuje treść kryterium.
- Testy kanoniczne jednego zadania leżą w pliku wskazanym w tabeli Traceability, w bloku `describe("TASK-XXX …")` — numeracja `AC-N` jest jednoznaczna w obrębie tego bloku.
- Zadanie `Write failing canonical test for AC-N` musi być wykonane i potwierdzone jako RED (test uruchomiony i nieprzechodzący; `skip`/`todo` się nie liczy), zanim zacznie się `Implement AC-N (red→green)`.
- Dodatkowe testy techniczne są mile widziane, ale nie używają prefiksu `AC-N: ` i nie liczą się jako pokrycie kanoniczne.

### Test Pyramid

```
        /\
       /  \  E2E (~6%: 4 kryteria wymagające prawdziwej przeglądarki)
      /----\
     /      \  Integration (~80% kanonicznych: API + baza, komponenty)
    /--------\
   /          \  Unit (moduły domenowe + testy techniczne)
  /-----------\
```

Testy kanoniczne są celowo w większości integracyjne, bo kryteria opisują zachowanie obserwowalne przez użytkownika. Piramidę u podstawy wypełniają jednostkowe testy techniczne modułów domenowych.

## Unit Tests

**Coverage Target**: 80%+ dla `src/modules/*`

| Module | What to Test |
|--------|--------------|
| word-images | podział na pary cyfr, kodowanie/dekodowanie GSP, zagadnienia bez cyfr, wiele ciągów cyfr |
| arrangement/chain | następnik, poprzednik, wykrywanie pętli, numeracja, wiele łańcuchów |
| arrangement/zones | środek karteczki w strefie, strefy nakładające się, krawędzie stref |
| review/order | łańcuchy przed luźnymi, pomijanie karteczek bez słów-obrazów, procent z zaokrągleniem; filtr koloru zachowujący kolejność |
| word-images (iteracja 2) | dopasowanie własnych wpisów: od lewej, najdłuższy wygrywa, pary w przerwach |
| notes (iteracja 2) | liczenie emotek jako znaków graficznych (flagi, odcienie skóry, sekwencje ZWJ) |
| transfer (iteracja 2) | schemat pliku, wersja i rodzaj, walidacja powiązań, nazwa pliku |

**Framework**: Vitest
**Location**: `tests/unit/`
**Command**: `npm test`

## Integration Tests

**What to Test**:
- Handlery API wywoływane bezpośrednio z prawdziwą testową bazą PostgreSQL (żądanie → odpowiedź → stan bazy).
- Komponenty i strony w Testing Library (jsdom) z API podstawionym przez handlery testowe.
- Reguły integralności bazy (unikalność połączeń i ogniw łańcucha, kaskady).

**Framework**: Vitest + Testing Library; baza testowa czyszczona przed każdym testem.
**Location**: `tests/integration/`
**Command**: `npm test`

### API Test Cases

```markdown
### Boards
- [ ] GET /api/boards - pusta lista
- [ ] POST /api/boards - sukces
- [ ] POST /api/boards - pusta nazwa → 400
- [ ] GET /api/boards/:id - nie istnieje → 404
- [ ] PATCH /api/boards/:id - zmiana nazwy
- [ ] DELETE /api/boards/:id - kaskada

### Notes
- [ ] POST /api/boards/:id/notes - sukces
- [ ] POST /api/boards/:id/notes - puste zagadnienie → 400
- [ ] PATCH /api/notes/:id - treść, położenie, przeliczenie zoneId
- [ ] DELETE /api/notes/:id - usuwa połączenia

### Zones
- [ ] POST /api/boards/:id/zones - przypisuje karteczki w obrębie
- [ ] PATCH /api/zones/:id - przelicza przypisania
- [ ] DELETE /api/zones/:id - karteczki zostają, zoneId = null

### Connections
- [ ] POST - association sukces
- [ ] POST - duplikat pary → 409 CONNECTION_EXISTS
- [ ] POST - karteczka z samą sobą → 400
- [ ] POST - chain drugi następnik → 409 CHAIN_SUCCESSOR_EXISTS
- [ ] POST - chain pętla → 409 CHAIN_CYCLE
- [ ] DELETE - karteczki zostają

### Word images
- [ ] POST /api/word-images/generate - "1410", "15.07.1410", "966"
- [ ] POST /api/word-images/generate - bez cyfr → 422 NO_DIGITS
- [ ] GET /api/peg-words - 110 haseł
- [ ] PUT /api/peg-words/:number - sukces, puste słowo → 400
- [ ] POST /api/peg-words/:number/reset

### Review
- [ ] POST /api/boards/:id/review-sessions - kolejność kart
- [ ] POST /api/boards/:id/review-sessions - brak kart → 422 NO_REVIEWABLE_NOTES
- [ ] POST /api/review-sessions/:id/results - zapis, duplikat → 409
- [ ] POST /api/review-sessions/:id/finish - podsumowanie
- [ ] GET /api/stats - sesje z 7 dni, nieukończone pominięte

### Iteracja 2 — karteczki i powtórka
- [ ] POST/PATCH karteczki - story, emoji, color; story > 2000 → 400; 9 emotek → 400; nieznany kolor → 400
- [ ] POST /api/boards/:id/review-sessions - colors zawęża karty z zachowaniem kolejności
- [ ] POST /api/boards/:id/review-sessions - brak kart w kolorach → 422 NO_NOTES_IN_COLORS

### Iteracja 2 — własne wpisy GSP
- [ ] POST /api/peg-words - sukces; duplikat → 409 PEG_EXISTS; "33" → 400
- [ ] PUT /api/peg-words/:number - własny wpis
- [ ] DELETE /api/peg-words/:number - własny wpis; hasło wbudowane → 409 PEG_BUILTIN
- [ ] POST /api/peg-words/:number/reset - własny wpis → 409 PEG_NO_DEFAULT
- [ ] POST /api/word-images/generate - "333", "48333", "3334" z własnymi wpisami

### Iteracja 2 — eksport, import, kopia
- [ ] GET /api/boards/:id/export - plik i nagłówek Content-Disposition
- [ ] POST /api/boards/import - nowa plansza; zajęta nazwa → " (import)"
- [ ] POST /api/boards/import - zły plik → 400 INVALID_EXPORT_FILE; > 5 MB → 413 FILE_TOO_LARGE
- [ ] GET /api/backup - wszystkie plansze, historia powtórek, lista GSP
- [ ] POST /api/backup/restore?dryRun=true - liczby bez zapisu
- [ ] POST /api/backup/restore - tylko dokłada; zły plik → 400 INVALID_BACKUP_FILE

### System
- [ ] GET /api/health - ok / 503
- [ ] Obcy Origin → 403
```

## E2E Tests

**What to Test**:
- Kryteria wymagające prawdziwej przeglądarki: przeciąganie z zapisem, ekran 375 px, dotyk, dwa konteksty przeglądarki jako dwa urządzenia.
- Jeden dymny przebieg ścieżki głównej.

**Framework**: Playwright (projekty: `desktop` i `mobile` — 375 px, `hasTouch`)
**Location**: `tests/e2e/`
**Command**: `npm run test:e2e`

### E2E Scenarios

Mapowane z `.prodready/define/test-scenarios/*.feature`:

```markdown
- [ ] Przesunięcie karteczki i odświeżenie (notes.feature, US-004)
- [ ] Powtórka na ekranie 375 px bez przewijania w poziomie (multi-device.feature, US-014)
- [ ] Przeciąganie karteczki dotykiem (multi-device.feature, US-014)
- [ ] Karteczka dodana w jednym kontekście widoczna w drugim (multi-device.feature, US-014)
- [ ] Dym: plansza → karteczka "1410" → Generuj słowa → powtórka → wynik na liście plansz
- [ ] Emotki na karteczce mają co najmniej 24 px przy powiększeniu 100% (note-enrichment.feature, US-016)
- [ ] Dym iteracji 2: eksport planszy → import pliku → nowa plansza z tymi samymi karteczkami (export-import.feature)
```

## Test Data

### Fixtures

```typescript
// tests/fixtures/boards.ts
export const boardInput = { name: 'Historia Polski' }
export const numericNote = { topic: '1410 – bitwa pod Grunwaldem', x: 100, y: 100 }
export const textNote = { topic: 'Mitochondrium', imageWords: 'mity, chondryt', x: 320, y: 100 }
// iteracja 2
export const richNote = { topic: '1410', imageWords: 'tor, dos', story: 'Po torze jedzie dos', emoji: '🏰⚔️', color: 'red', x: 100, y: 300 }
export const customPeg = { number: '333', word: 'mumia-mysz' }
```

### Seed Data

Lista GSP pochodzi z seeda Prisma (TASK-008); testy integracyjne uruchamiają ten sam seed na bazie testowej, a słowa odczytują z bazy zamiast wpisywać je na sztywno.

## CI Integration

Testy uruchamiane przy każdym pushu i PR:
1. Lint (`npm run lint`)
2. Type check (`npx tsc --noEmit`)
3. Unit + integration (`npm test`, usługa PostgreSQL w CI)
4. E2E (`npm run test:e2e`, aplikacja zbudowana i uruchomiona z bazą testową)

## Traceability

119 kryteriów → 119 testów kanonicznych (67 z MVP, 52 z iteracji 2). Kolumna Red Confirmed jest uzupełniana w fazie Implement.

| Story/Task | AC | Canonical Test File | Canonical Test Name | Red Confirmed |
|------------|----|---------------------|---------------------|---------------|
| TASK-001 | AC-1 | tests/integration/app-shell.test.tsx | AC-1: Given uruchomiona aplikacja, when otwieram stronę główną, then widzę nagłówek "Mnemoboard" z linkami "Plansze" i "Lista GSP". | Yes |
| TASK-001 | AC-2 | tests/integration/app-shell.test.tsx | AC-2: Given plik tsconfig.json, when odczytuję opcje kompilatora, then `strict` ma wartość true. | Yes |
| TASK-002 | AC-1 | tests/integration/db-schema.test.ts | AC-1: Given pusta baza, when wykonuję migracje, then istnieją tabele board, zone, note, connection, peg_word, review_session i review_result. | Yes |
| TASK-002 | AC-2 | tests/integration/db-schema.test.ts | AC-2: Given połączenie karteczek A–B, when zapisuję w bazie drugie połączenie tej samej pary w odwrotnym kierunku, then baza odrzuca zapis błędem unikalności. | Yes |
| TASK-002 | AC-3 | tests/integration/db-schema.test.ts | AC-3: Given ogniwo łańcucha A→B, when zapisuję w bazie ogniwo łańcucha A→C, then baza odrzuca zapis błędem unikalności. | Yes |
| TASK-003 | AC-1 | tests/integration/api-foundation.test.ts | AC-1: Given działająca baza, when wywołuję GET /api/health, then otrzymuję status 200 i treść `{"status":"ok"}`. | Yes |
| TASK-003 | AC-2 | tests/integration/api-foundation.test.ts | AC-2: Given endpoint przyjmujący JSON, when wysyłam niepoprawny JSON, then otrzymuję status 400 z kodem `VALIDATION_ERROR`. | Yes |
| TASK-003 | AC-3 | tests/integration/api-foundation.test.ts | AC-3: Given żądanie POST z nagłówkiem Origin innej witryny, when trafia do API, then otrzymuję status 403 z kodem `FORBIDDEN_ORIGIN`. | Yes |
| TASK-004 | AC-1 | tests/integration/board-canvas.test.tsx | AC-1: Given plansza z jedną karteczką, when renderuję BoardCanvas, then widzę węzeł z zagadnieniem tej karteczki. | Yes |
| TASK-004 | AC-2 | tests/integration/board-canvas.test.tsx | AC-2: Given karteczka na planszy, when kończę jej przeciąganie, then BoardCanvas wywołuje `onNoteMove` z identyfikatorem karteczki i nowym położeniem. | Yes |
| US-001 / TASK-005 | AC-1 | tests/integration/us-001-create-board.test.tsx | AC-1: Given w aplikacji nie ma żadnej planszy, when otwieram aplikację, then widzę pusty stan z komunikatem i przyciskiem "Utwórz pierwszą planszę". | Yes |
| US-001 / TASK-005 | AC-2 | tests/integration/us-001-create-board.test.tsx | AC-2: Given lista plansz, when tworzę planszę o nazwie "Historia Polski", then plansza pojawia się na liście i otwiera się jako pusta. | Yes |
| US-001 / TASK-005 | AC-3 | tests/integration/us-001-create-board.test.tsx | AC-3: Given formularz nowej planszy, when zatwierdzam pustą nazwę, then plansza nie powstaje i widzę komunikat "Podaj nazwę planszy". | Yes |
| US-003 / TASK-006 | AC-1 | tests/integration/us-003-add-note.test.tsx | AC-1: Given otwarta plansza, when dodaję karteczkę z zagadnieniem "1410 – bitwa pod Grunwaldem" w wybranym miejscu, then karteczka jest widoczna w tym miejscu z tym zagadnieniem. | Yes |
| US-003 / TASK-006 | AC-2 | tests/integration/us-003-add-note.test.tsx | AC-2: Given formularz karteczki, when zatwierdzam puste zagadnienie, then karteczka nie powstaje i widzę komunikat "Wpisz zagadnienie". | Yes |
| US-003 / TASK-006 | AC-3 | tests/integration/us-003-add-note.test.tsx | AC-3: Given plansza z dodaną karteczką, when odświeżam stronę, then karteczka ma to samo zagadnienie i to samo położenie. | Yes |
| US-004 / TASK-007 | AC-1 | tests/e2e/us-004-edit-note.spec.ts | AC-1: Given karteczka na planszy, when przeciągam ją w inne miejsce i odświeżam stronę, then karteczka znajduje się w nowym miejscu. | Yes |
| US-004 / TASK-007 | AC-2 | tests/integration/us-004-edit-note.test.tsx | AC-2: Given karteczka z zagadnieniem "1410", when zmieniam zagadnienie na "15.07.1410", then karteczka pokazuje nowe zagadnienie. | Yes |
| US-004 / TASK-007 | AC-3 | tests/integration/us-004-edit-note.test.tsx | AC-3: Given karteczka mająca połączenia, when ją usuwam, then karteczka i wszystkie jej połączenia znikają z planszy. | Yes |
| TASK-008 | AC-1 | tests/integration/peg-seed.test.ts | AC-1: Given pusta tabela peg_word, when uruchamiam seed, then tabela zawiera 110 haseł z niepustym słowem. | Yes |
| TASK-008 | AC-2 | tests/unit/peg-seed.test.ts | AC-2: Given startowa lista GSP, when dekoduję spółgłoski każdego słowa według GSP, then wynik jest równy liczbie hasła. | Yes |
| TASK-008 | AC-3 | tests/integration/peg-seed.test.ts | AC-3: Given hasło "14" ze słowem zmienionym na "tur", when ponownie uruchamiam seed, then hasło "14" nadal ma słowo "tur". | Yes |
| US-007 / TASK-009 | AC-1 | tests/integration/us-007-peg-words.test.tsx | AC-1: Given świeżo zainstalowana aplikacja, when otwieram listę GSP, then widzę niepuste słowo dla każdego z 110 haseł (0–9 oraz 00–99). | Yes |
| US-007 / TASK-009 | AC-2 | tests/integration/us-007-peg-words.test.tsx | AC-2: Given lista GSP, when zmieniam słowo dla "14" na "tur", then generowanie dla zagadnienia "14" zwraca "tur". | Yes |
| US-007 / TASK-009 | AC-3 | tests/integration/us-007-peg-words.test.tsx | AC-3: Given lista GSP, when zapisuję puste słowo dla hasła, then zmiana jest odrzucona i hasło zachowuje poprzednie słowo. | Yes |
| US-007 / TASK-009 | AC-4 | tests/integration/us-007-peg-words.test.tsx | AC-4: Given hasło ze zmienionym słowem, when używam akcji "Przywróć domyślne", then hasło ma ponownie słowo startowe. | Yes |
| US-006 / TASK-010 | AC-1 | tests/integration/us-006-generate.test.tsx | AC-1: Given karteczka z zagadnieniem "1410", when używam akcji "Generuj słowa", then otrzymuję kolejno słowo z listy GSP dla "14" i słowo dla "10". | Yes |
| US-006 / TASK-010 | AC-2 | tests/integration/us-006-generate.test.tsx | AC-2: Given karteczka z zagadnieniem "15.07.1410", when używam akcji "Generuj słowa", then otrzymuję kolejno słowa dla "15", "07", "14" i "10". | Yes |
| US-006 / TASK-010 | AC-3 | tests/integration/us-006-generate.test.tsx | AC-3: Given karteczka z zagadnieniem "966", when używam akcji "Generuj słowa", then otrzymuję słowo dla "96" i słowo dla pojedynczej cyfry "6". | Yes |
| US-006 / TASK-010 | AC-4 | tests/integration/us-006-generate.test.tsx | AC-4: Given karteczka mająca już słowa-obrazy, when używam akcji "Generuj słowa", then dotychczasowe słowa pozostają bez zmian do chwili potwierdzenia zastąpienia. | Yes |
| US-005 / TASK-011 | AC-1 | tests/integration/us-005-manual-words.test.tsx | AC-1: Given karteczka z zagadnieniem "Mitochondrium", when wpisuję słowa-obrazy "mity, chondryt" i zapisuję, then karteczka pokazuje te słowa-obrazy pod zagadnieniem. | Yes |
| US-005 / TASK-011 | AC-2 | tests/integration/us-005-manual-words.test.tsx | AC-2: Given karteczka z zagadnieniem bez cyfr, when używam akcji "Generuj słowa", then słowa nie są generowane i widzę komunikat "Brak liczb – wpisz słowa-obrazy samodzielnie". | Yes |
| US-008 / TASK-012 | AC-1 | tests/integration/us-008-connections.test.tsx | AC-1: Given dwie karteczki na planszy, when łączę je i odświeżam stronę, then między karteczkami widoczna jest linia. | Yes |
| US-008 / TASK-012 | AC-2 | tests/integration/us-008-connections.test.tsx | AC-2: Given dwie już połączone karteczki, when łączę je ponownie, then drugie połączenie nie powstaje. | Yes |
| US-008 / TASK-012 | AC-3 | tests/integration/us-008-connections.test.tsx | AC-3: Given połączenie dwóch karteczek, when usuwam połączenie, then linia znika, a obie karteczki pozostają na planszy. | Yes |
| US-009 / TASK-013 | AC-1 | tests/integration/us-009-chain.test.tsx | AC-1: Given karteczki A, B i C, when tworzę ogniwa łańcucha A→B i B→C, then karteczki pokazują numery kolejności 1, 2 i 3. | Yes |
| US-009 / TASK-013 | AC-2 | tests/integration/us-009-chain.test.tsx | AC-2: Given karteczka A z ogniwem wychodzącym A→B, when tworzę ogniwo A→C, then ogniwo nie powstaje i widzę komunikat "Karteczka ma już następnik w łańcuchu". | Yes |
| US-009 / TASK-013 | AC-3 | tests/integration/us-009-chain.test.tsx | AC-3: Given łańcuch A→B→C, when tworzę ogniwo C→A, then ogniwo nie powstaje i widzę komunikat "Łańcuch nie może tworzyć pętli". | Yes |
| TASK-014 | AC-1 | tests/unit/zones.test.ts | AC-1: Given strefa i karteczka, której środek leży wewnątrz strefy, when wyznaczam strefę karteczki, then wynikiem jest identyfikator tej strefy. | Yes |
| TASK-014 | AC-2 | tests/unit/zones.test.ts | AC-2: Given dwie nakładające się strefy i karteczka w części wspólnej, when wyznaczam strefę karteczki, then wynikiem jest strefa utworzona później. | Yes |
| TASK-014 | AC-3 | tests/unit/zones.test.ts | AC-3: Given karteczka przypisana do strefy, when przeliczam przypisania po przesunięciu strefy poza karteczkę, then karteczka nie ma przypisanej strefy. | Yes |
| US-010 / TASK-015 | AC-1 | tests/integration/us-010-zones.test.tsx | AC-1: Given otwarta plansza, when tworzę strefę o nazwie "Kuchnia", then strefa z tą nazwą jest widoczna na planszy. | Yes |
| US-010 / TASK-015 | AC-2 | tests/integration/us-010-zones.test.tsx | AC-2: Given strefa "Kuchnia", when upuszczam karteczkę w jej obrębie, then karteczka jest przypisana do pokoju "Kuchnia". | Yes |
| US-010 / TASK-015 | AC-3 | tests/integration/us-010-zones.test.tsx | AC-3: Given karteczka przypisana do pokoju "Kuchnia", when przeciągam ją poza strefę, then karteczka nie jest przypisana do żadnego pokoju. | Yes |
| US-010 / TASK-015 | AC-4 | tests/integration/us-010-zones.test.tsx | AC-4: Given strefa zawierająca karteczki, when usuwam strefę, then karteczki pozostają na planszy bez przypisanego pokoju. | Yes |
| TASK-016 | AC-1 | tests/unit/review-order.test.ts | AC-1: Given plansza z łańcuchem B→C i luźną karteczką A utworzoną najwcześniej, when wyznaczam kolejność powtórki, then kolejność to B, C, A. | Yes |
| TASK-016 | AC-2 | tests/unit/review-order.test.ts | AC-2: Given plansza z luźnymi karteczkami utworzonymi w kolejności A, B, C, when wyznaczam kolejność powtórki, then kolejność to A, B, C. | Yes |
| US-011 / TASK-017 | AC-1 | tests/integration/us-011-review.test.tsx | AC-1: Given plansza z karteczkami mającymi słowa-obrazy, when rozpoczynam powtórkę, then widzę zagadnienie pierwszej karteczki, a jej słowa-obrazy są zakryte. | Yes |
| US-011 / TASK-017 | AC-2 | tests/integration/us-011-review.test.tsx | AC-2: Given karteczka w powtórce z zakrytymi słowami-obrazami, when wybieram "Odsłoń", then widzę słowa-obrazy oraz przyciski "Pamiętałem" i "Nie pamiętałem". | Yes |
| US-011 / TASK-017 | AC-3 | tests/integration/us-011-review.test.tsx | AC-3: Given odsłonięta karteczka, when wybieram "Pamiętałem", then wynik zostaje zapisany z bieżącą datą i pojawia się następna karteczka. | Yes |
| US-011 / TASK-017 | AC-4 | tests/integration/us-011-review.test.tsx | AC-4: Given ostatnia karteczka powtórki została oceniona, when powtórka się kończy, then widzę podsumowanie z liczbą zapamiętanych, liczbą wszystkich i wynikiem procentowym. | Yes |
| US-012 / TASK-018 | AC-1 | tests/integration/us-012-review-scope.test.tsx | AC-1: Given plansza z łańcuchem A→B→C, when rozpoczynam powtórkę, then karteczki pojawiają się w kolejności A, B, C. | Yes |
| US-012 / TASK-018 | AC-2 | tests/integration/us-012-review-scope.test.tsx | AC-2: Given plansza z karteczką bez słów-obrazów, when przechodzę powtórkę, then ta karteczka nie pojawia się w powtórce. | Yes |
| US-012 / TASK-018 | AC-3 | tests/integration/us-012-review-scope.test.tsx | AC-3: Given plansza, na której żadna karteczka nie ma słów-obrazów, when rozpoczynam powtórkę, then powtórka się nie rozpoczyna i widzę komunikat "Dodaj słowa-obrazy, aby rozpocząć powtórkę". | Yes |
| US-012 / TASK-018 | AC-4 | tests/integration/us-012-review-scope.test.tsx | AC-4: Given karteczka w powtórce przypisana do pokoju "Kuchnia", when wybieram "Odsłoń", then obok słów-obrazów widoczna jest nazwa pokoju "Kuchnia". | Yes |
| US-013 / TASK-019 | AC-1 | tests/integration/us-013-stats.test.tsx | AC-1: Given plansza z ukończoną powtórką o wyniku 8 z 10, when otwieram listę plansz, then przy planszy widzę wynik ostatniej powtórki "80%" wraz z jej datą. | Yes |
| US-013 / TASK-019 | AC-2 | tests/integration/us-013-stats.test.tsx | AC-2: Given 3 ukończone powtórki w ciągu ostatnich 7 dni, when otwieram statystyki, then widzę "Powtórki w ostatnich 7 dniach: 3". | Yes |
| US-013 / TASK-019 | AC-3 | tests/integration/us-013-stats.test.tsx | AC-3: Given plansza bez żadnej ukończonej powtórki, when otwieram listę plansz, then przy planszy widzę "Brak powtórek". | Yes |
| US-002 / TASK-020 | AC-1 | tests/integration/us-002-manage-boards.test.tsx | AC-1: Given plansza "Historia", when zmieniam jej nazwę na "Historia Polski", then na liście plansz widnieje nowa nazwa. | Yes |
| US-002 / TASK-020 | AC-2 | tests/integration/us-002-manage-boards.test.tsx | AC-2: Given plansza z karteczkami, when wybieram usunięcie, then aplikacja pyta o potwierdzenie przed usunięciem. | Yes |
| US-002 / TASK-020 | AC-3 | tests/integration/us-002-manage-boards.test.tsx | AC-3: Given potwierdzone usunięcie planszy, when wracam do listy, then plansza oraz jej karteczki, połączenia, strefy i wyniki powtórek nie istnieją. | Yes |
| US-014 / TASK-021 | AC-1 | tests/e2e/us-014-mobile.spec.ts | AC-1: Given ekran o szerokości 375 px, when przechodzę powtórkę, then wszystkie elementy powtórki mieszczą się na ekranie bez przewijania w poziomie. | Yes |
| US-014 / TASK-021 | AC-2 | tests/e2e/us-014-mobile.spec.ts | AC-2: Given plansza otwarta na urządzeniu dotykowym, when przeciągam karteczkę palcem, then karteczka zmienia położenie. | Yes |
| US-014 / TASK-021 | AC-3 | tests/e2e/us-014-mobile.spec.ts | AC-3: Given karteczka dodana na jednym urządzeniu, when otwieram tę planszę na drugim urządzeniu, then widzę tę karteczkę. | Yes |
| TASK-022 | AC-1 | tests/integration/security.test.tsx | AC-1: Given dowolna odpowiedź aplikacji, when sprawdzam nagłówki, then zawiera `Content-Security-Policy` oraz `X-Content-Type-Options: nosniff`. | Yes |
| TASK-022 | AC-2 | tests/integration/security.test.tsx | AC-2: Given karteczka z zagadnieniem `<script>alert(1)</script>`, when plansza ją renderuje, then zagadnienie jest widoczne jako tekst i nie powstaje element script. | Yes |
| TASK-023 | AC-1 | tests/integration/performance.test.ts | AC-1: Given plansza z 200 karteczkami, 20 strefami i 200 połączeniami, when wywołuję GET /api/boards/{id}, then odpowiedź przychodzi w czasie krótszym niż 500 ms. | Yes |
| TASK-024 | AC-1 | tests/integration/db-schema-v2.test.ts | AC-1: Given karteczka zapisana w bazie bez podania koloru, opowiadania i emotek, when ją odczytuję, then ma kolor `yellow` oraz puste opowiadanie i emotki. | No |
| TASK-024 | AC-2 | tests/integration/db-schema-v2.test.ts | AC-2: Given tabela peg_word, when zapisuję hasło "333" bez słowa startowego, then zapis się udaje. | No |
| TASK-024 | AC-3 | tests/integration/db-schema-v2.test.ts | AC-3: Given tabela peg_word, when zapisuję hasło "33" bez słowa startowego, then baza odrzuca zapis błędem ograniczenia CHECK. | No |
| US-015 / TASK-025 | AC-1 | tests/integration/us-015-story.test.tsx | AC-1: Given karteczka z zagadnieniem "1410" i słowami-obrazami "tor, dos", when wpisuję opowiadanie "Po torze jedzie dos" i odświeżam stronę, then karteczka pokazuje to opowiadanie pod słowami-obrazami. | No |
| US-015 / TASK-025 | AC-2 | tests/integration/us-015-story.test.tsx | AC-2: Given karteczka w powtórce mająca opowiadanie, when widzę jej zagadnienie przed odsłonięciem, then opowiadanie jest zakryte. | No |
| US-015 / TASK-025 | AC-3 | tests/integration/us-015-story.test.tsx | AC-3: Given karteczka w powtórce mająca opowiadanie, when wybieram "Odsłoń", then widzę opowiadanie obok słów-obrazów. | No |
| US-015 / TASK-025 | AC-4 | tests/integration/us-015-story.test.tsx | AC-4: Given formularz karteczki, when zapisuję opowiadanie dłuższe niż 2000 znaków, then zmiana jest odrzucona i widzę komunikat "Opowiadanie może mieć najwyżej 2000 znaków". | No |
| US-016 / TASK-026 | AC-1 | tests/integration/us-016-emoji.test.tsx | AC-1: Given karteczka na planszy, when wpisuję emotki "🏰⚔️" i odświeżam stronę, then karteczka pokazuje emotki "🏰⚔️". | No |
| US-016 / TASK-026 | AC-2 | tests/e2e/us-016-emoji.spec.ts | AC-2: Given karteczka z emotkami na planszy przy powiększeniu 100%, when odczytuję rozmiar czcionki emotek, then wynosi on co najmniej 24 px. | No |
| US-016 / TASK-026 | AC-3 | tests/integration/us-016-emoji.test.tsx | AC-3: Given formularz karteczki, when zapisuję 9 emotek, then zmiana jest odrzucona i widzę komunikat "Najwyżej 8 emotek". | No |
| US-016 / TASK-026 | AC-4 | tests/integration/us-016-emoji.test.tsx | AC-4: Given karteczka w powtórce mająca emotki, when widzę jej zagadnienie przed odsłonięciem, then emotki są zakryte. | No |
| US-017 / TASK-027 | AC-1 | tests/integration/us-017-colors.test.tsx | AC-1: Given otwarta plansza, when dodaję nową karteczkę, then karteczka ma kolor żółty. | No |
| US-017 / TASK-027 | AC-2 | tests/integration/us-017-colors.test.tsx | AC-2: Given karteczka na planszy, when otwieram wybór koloru, then widzę dokładnie 5 kolorów: żółty, czerwony, pomarańczowy, zielony i niebieski. | No |
| US-017 / TASK-027 | AC-3 | tests/integration/us-017-colors.test.tsx | AC-3: Given żółta karteczka, when zmieniam jej kolor na czerwony i odświeżam stronę, then karteczka jest czerwona. | No |
| US-018 / TASK-028 | AC-1 | tests/integration/us-018-review-colors.test.tsx | AC-1: Given plansza z karteczkami czerwonymi i żółtymi mającymi słowa-obrazy, when rozpoczynam powtórkę z zaznaczonym tylko kolorem czerwonym, then w powtórce pojawiają się wyłącznie czerwone karteczki. | No |
| US-018 / TASK-028 | AC-2 | tests/integration/us-018-review-colors.test.tsx | AC-2: Given plansza z karteczkami w różnych kolorach, when otwieram rozpoczęcie powtórki, then wszystkie kolory są zaznaczone. | No |
| US-018 / TASK-028 | AC-3 | tests/integration/us-018-review-colors.test.tsx | AC-3: Given plansza bez niebieskich karteczek ze słowami-obrazami, when rozpoczynam powtórkę z zaznaczonym tylko kolorem niebieskim, then powtórka się nie rozpoczyna i widzę komunikat "Brak karteczek w wybranych kolorach". | No |
| US-018 / TASK-028 | AC-4 | tests/integration/us-018-review-colors.test.tsx | AC-4: Given łańcuch A→B→C, w którym A i C są czerwone, a B żółta, when rozpoczynam powtórkę z zaznaczonym tylko kolorem czerwonym, then karteczki pojawiają się w kolejności A, C. | No |
| TASK-029 | AC-1 | tests/unit/custom-pegs.test.ts | AC-1: Given własny wpis "333" i ciąg cyfr "48333", when dzielę ciąg na segmenty, then otrzymuję kolejno "48" i "333". | No |
| TASK-029 | AC-2 | tests/unit/custom-pegs.test.ts | AC-2: Given własne wpisy "333" i "3334" oraz ciąg cyfr "3334", when dzielę ciąg na segmenty, then otrzymuję jeden segment "3334". | No |
| TASK-029 | AC-3 | tests/unit/custom-pegs.test.ts | AC-3: Given własny wpis "333" i ciąg cyfr "3331333", when dzielę ciąg na segmenty, then otrzymuję kolejno "333", "1" i "333". | No |
| US-019 / TASK-030 | AC-1 | tests/integration/us-019-custom-pegs.test.tsx | AC-1: Given lista GSP, when dodaję własny wpis "333" ze słowem "mumia-mysz", then wpis "333 – mumia-mysz" jest widoczny na liście własnych wpisów. | No |
| US-019 / TASK-030 | AC-2 | tests/integration/us-019-custom-pegs.test.tsx | AC-2: Given istniejący własny wpis "333", when dodaję kolejny wpis "333", then wpis nie powstaje i widzę komunikat "Wpis dla tej liczby już istnieje". | No |
| US-019 / TASK-030 | AC-3 | tests/integration/us-019-custom-pegs.test.tsx | AC-3: Given formularz własnego wpisu, when zatwierdzam liczbę "33", then wpis nie powstaje i widzę komunikat "Własny wpis musi mieć od 3 do 15 cyfr". | No |
| US-019 / TASK-030 | AC-4 | tests/integration/us-019-custom-pegs.test.tsx | AC-4: Given własny wpis "333" ze słowem "mumia-mysz", when zmieniam słowo na "mamut", then wpis pokazuje "333 – mamut". | No |
| US-019 / TASK-030 | AC-5 | tests/integration/us-019-custom-pegs.test.tsx | AC-5: Given własny wpis "333", when go usuwam, then wpisu nie ma na liście własnych wpisów. | No |
| US-020 / TASK-031 | AC-1 | tests/integration/us-020-generate-custom.test.tsx | AC-1: Given własny wpis "333" ze słowem "mumia-mysz", when generuję słowa dla zagadnienia "333", then otrzymuję "mumia-mysz". | No |
| US-020 / TASK-031 | AC-2 | tests/integration/us-020-generate-custom.test.tsx | AC-2: Given własny wpis "333", when generuję słowa dla zagadnienia "48333", then otrzymuję kolejno słowo z listy GSP dla "48" i "mumia-mysz". | No |
| US-020 / TASK-031 | AC-3 | tests/integration/us-020-generate-custom.test.tsx | AC-3: Given własne wpisy "333" i "3334", when generuję słowa dla zagadnienia "3334", then otrzymuję słowo wpisu "3334". | No |
| US-020 / TASK-031 | AC-4 | tests/integration/us-020-generate-custom.test.tsx | AC-4: Given brak własnych wpisów, when generuję słowa dla zagadnienia "333", then otrzymuję słowo z listy GSP dla "33" i słowo dla pojedynczej cyfry "3". | No |
| TASK-032 | AC-1 | tests/unit/transfer-format.test.ts | AC-1: Given plansza z 3 karteczkami, 1 strefą i 2 połączeniami, when serializuję ją do pliku i parsuję ten plik, then wynik zawiera te same 3 karteczki, 1 strefę i 2 połączenia. | No |
| TASK-032 | AC-2 | tests/unit/transfer-format.test.ts | AC-2: Given plik z połączeniem wskazującym karteczkę spoza pliku, when go waliduję, then walidacja zwraca błąd. | No |
| TASK-032 | AC-3 | tests/unit/transfer-format.test.ts | AC-3: Given plik z ogniwami łańcucha A→B, B→C i C→A, when go waliduję, then walidacja zwraca błąd. | No |
| TASK-032 | AC-4 | tests/unit/transfer-format.test.ts | AC-4: Given plansza o nazwie "Żółta Historia Polski", when wyznaczam nazwę pliku eksportu, then nazwa zawiera "zolta-historia-polski". | No |
| US-021 / TASK-033 | AC-1 | tests/integration/us-021-export.test.tsx | AC-1: Given plansza "Historia Polski", when wybieram "Eksportuj", then przeglądarka pobiera plik JSON, którego nazwa zawiera "historia-polski". | No |
| US-021 / TASK-033 | AC-2 | tests/integration/us-021-export.test.tsx | AC-2: Given plansza z 3 karteczkami, 1 strefą i 2 połączeniami, when ją eksportuję, then plik zawiera 3 karteczki z zagadnieniem, słowami-obrazami, opowiadaniem, emotkami, kolorem i położeniem, 1 strefę i 2 połączenia. | No |
| US-022 / TASK-034 | AC-1 | tests/integration/us-022-import.test.tsx | AC-1: Given plik eksportu planszy z 3 karteczkami, 1 strefą i łańcuchem A→B→C, when go importuję, then powstaje nowa plansza z 3 karteczkami, 1 strefą i łańcuchem w kolejności A, B, C. | No |
| US-022 / TASK-034 | AC-2 | tests/integration/us-022-import.test.tsx | AC-2: Given istniejąca plansza "Historia" i plik eksportu planszy o nazwie "Historia", when importuję plik, then istniejąca plansza pozostaje bez zmian, a nowa nazywa się "Historia (import)". | No |
| US-022 / TASK-034 | AC-3 | tests/integration/us-022-import.test.tsx | AC-3: Given plik, który nie jest eksportem Mnemoboard, when go importuję, then żadna plansza nie powstaje i widzę komunikat "Plik nie jest poprawnym eksportem Mnemoboard". | No |
| US-022 / TASK-034 | AC-4 | tests/integration/us-022-import.test.tsx | AC-4: Given plik większy niż 5 MB, when go importuję, then żadna plansza nie powstaje i widzę komunikat "Plik jest za duży (limit 5 MB)". | No |
| TASK-035 | AC-1 | tests/integration/backup-restore.test.ts | AC-1: Given hasło "14" o słowie równym startowemu i kopia ze słowem "tur" dla "14", when przywracam kopię, then hasło "14" ma słowo "tur". | No |
| TASK-035 | AC-2 | tests/integration/backup-restore.test.ts | AC-2: Given hasło "14" zmienione przez użytkownika na "tara" i kopia ze słowem "tur" dla "14", when przywracam kopię, then hasło "14" nadal ma słowo "tara". | No |
| TASK-035 | AC-3 | tests/integration/backup-restore.test.ts | AC-3: Given istniejący własny wpis "333" ze słowem "mamut" i kopia z wpisem "333" ze słowem "mumia-mysz", when przywracam kopię, then wpis "333" nadal ma słowo "mamut". | No |
| TASK-035 | AC-4 | tests/integration/backup-restore.test.ts | AC-4: Given kopia z planszą mającą ukończoną powtórkę o wyniku 8 z 10, when przywracam kopię, then nowa plansza ma ukończoną powtórkę z 10 wynikami przypisanymi do jej własnych karteczek. | No |
| US-023 / TASK-036 | AC-1 | tests/integration/us-023-backup.test.tsx | AC-1: Given 2 plansze, zmienione słowo GSP dla "14" i własny wpis "333", when wybieram "Pobierz kopię", then pobrany plik zawiera 2 plansze z historią powtórek, słowo dla "14" i wpis "333". | No |
| US-023 / TASK-036 | AC-2 | tests/integration/us-023-backup.test.tsx | AC-2: Given świeża instalacja bez plansz i plik kopii z 2 planszami, zmienionym słowem dla "14" i wpisem "333", when przywracam kopię, then mam 2 plansze z wynikami ostatnich powtórek, zmienione słowo dla "14" i wpis "333". | No |
| US-023 / TASK-036 | AC-3 | tests/integration/us-023-backup.test.tsx | AC-3: Given istniejąca plansza "Biologia" i plik kopii z 2 planszami, when przywracam kopię, then plansza "Biologia" pozostaje bez zmian, a lista ma 3 plansze. | No |
| US-023 / TASK-036 | AC-4 | tests/integration/us-023-backup.test.tsx | AC-4: Given plik kopii z 2 planszami, when wybieram "Przywróć z kopii", then przed zapisem widzę komunikat "Zostaną dodane 2 plansze" i dane zmieniają się dopiero po potwierdzeniu. | No |
| US-023 / TASK-036 | AC-5 | tests/integration/us-023-backup.test.tsx | AC-5: Given uszkodzony plik kopii, when go przywracam, then żadne dane się nie zmieniają i widzę komunikat "Plik nie jest poprawną kopią Mnemoboard". | No |
| TASK-037 | AC-1 | tests/integration/transfer-hardening.test.tsx | AC-1: Given plik eksportu planszy z 200 karteczkami, 20 strefami i 200 połączeniami, when importuję go przez API, then odpowiedź przychodzi w czasie krótszym niż 2 s. | No |
| TASK-037 | AC-2 | tests/integration/transfer-hardening.test.tsx | AC-2: Given plik kopii z 50 planszami po 200 karteczek, when przywracam go przez API, then odpowiedź przychodzi w czasie krótszym niż 10 s. | No |
| TASK-037 | AC-3 | tests/integration/transfer-hardening.test.tsx | AC-3: Given plik eksportu z karteczką o zagadnieniu `<script>alert(1)</script>`, when importuję go i otwieram planszę, then zagadnienie jest widoczne jako tekst i nie powstaje element script. | No |

## Technical Tests

Testy dodatkowe, bez prefiksu `AC-N: `:

- word-images: liczby z zerami wiodącymi ("007"), bardzo długie ciągi cyfr, cyfry rozdzielone różnymi separatorami, zagadnienie złożone z samych separatorów.
- chain: usunięcie środkowej karteczki dzieli łańcuch na dwa; zamiana połączenia association na chain dla tej samej pary jest odrzucana jako duplikat.
- zones: karteczka dokładnie na krawędzi strefy; strefa o minimalnym rozmiarze; usunięcie strefy nakładającej się przypisuje karteczkę do strefy pod spodem.
- review: procent zaokrąglany do liczby całkowitej; sesja nieukończona nie liczy się do statystyk; ponowna ocena tej samej karteczki → 409.
- API: limity długości pól (topic 500, name 100, word 40); identyfikator w złym formacie → 400; nieistniejący zasób → 404.
- Baza: kaskadowe usunięcie planszy usuwa sesje i wyniki; usunięcie karteczki usuwa jej wyniki.
- Bezpieczeństwo: treść HTML w nazwie planszy, strefy i słowach-obrazach renderowana jako tekst.
- Iteracja 2 — emotki: flaga, emotka z odcieniem skóry i sekwencja ZWJ liczą się jako jedna; dokładnie 8 emotek przechodzi.
- Iteracja 2 — własne wpisy: liczba z zerami wiodącymi ("007"), wpis 15-cyfrowy, 16 cyfr → 400, limit 500 wpisów → 409 `PEG_LIMIT`; własny wpis nachodzący na wcześniejsze dopasowanie nie jest używany drugi raz.
- Iteracja 2 — transfer: nieznana wersja formatu i zły `kind` → 400; plik kopii wysłany jako import planszy → 400; błąd w ostatniej planszy kopii nie zapisuje żadnej (transakcja); `dryRun` nie zmienia bazy; drugi import tego samego pliku, gdy istnieją już "Historia" i "Historia (import)", tworzy "Historia (import 2)".
- Iteracja 2 — powtórka: `colors` z nieznanym kolorem → 400; filtr nie zmienia zapisu wyników ani statystyk.
