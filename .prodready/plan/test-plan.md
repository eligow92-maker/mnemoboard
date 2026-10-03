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
| review/order | łańcuchy przed luźnymi, pomijanie karteczek bez słów-obrazów, procent z zaokrągleniem |

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
```

## Test Data

### Fixtures

```typescript
// tests/fixtures/boards.ts
export const boardInput = { name: 'Historia Polski' }
export const numericNote = { topic: '1410 – bitwa pod Grunwaldem', x: 100, y: 100 }
export const textNote = { topic: 'Mitochondrium', imageWords: 'mity, chondryt', x: 320, y: 100 }
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

67 kryteriów → 67 testów kanonicznych. Kolumna Red Confirmed jest uzupełniana w fazie Implement.

| Story/Task | AC | Canonical Test File | Canonical Test Name | Red Confirmed |
|------------|----|---------------------|---------------------|---------------|
| TASK-001 | AC-1 | tests/integration/app-shell.test.tsx | AC-1: Given uruchomiona aplikacja, when otwieram stronę główną, then widzę nagłówek "Mnemoboard" z linkami "Plansze" i "Lista GSP". | Yes |
| TASK-001 | AC-2 | tests/integration/app-shell.test.tsx | AC-2: Given plik tsconfig.json, when odczytuję opcje kompilatora, then `strict` ma wartość true. | Yes |
| TASK-002 | AC-1 | tests/integration/db-schema.test.ts | AC-1: Given pusta baza, when wykonuję migracje, then istnieją tabele board, zone, note, connection, peg_word, review_session i review_result. | Pending |
| TASK-002 | AC-2 | tests/integration/db-schema.test.ts | AC-2: Given połączenie karteczek A–B, when zapisuję w bazie drugie połączenie tej samej pary w odwrotnym kierunku, then baza odrzuca zapis błędem unikalności. | Pending |
| TASK-002 | AC-3 | tests/integration/db-schema.test.ts | AC-3: Given ogniwo łańcucha A→B, when zapisuję w bazie ogniwo łańcucha A→C, then baza odrzuca zapis błędem unikalności. | Pending |
| TASK-003 | AC-1 | tests/integration/api-foundation.test.ts | AC-1: Given działająca baza, when wywołuję GET /api/health, then otrzymuję status 200 i treść `{"status":"ok"}`. | Pending |
| TASK-003 | AC-2 | tests/integration/api-foundation.test.ts | AC-2: Given endpoint przyjmujący JSON, when wysyłam niepoprawny JSON, then otrzymuję status 400 z kodem `VALIDATION_ERROR`. | Pending |
| TASK-003 | AC-3 | tests/integration/api-foundation.test.ts | AC-3: Given żądanie POST z nagłówkiem Origin innej witryny, when trafia do API, then otrzymuję status 403 z kodem `FORBIDDEN_ORIGIN`. | Pending |
| TASK-004 | AC-1 | tests/integration/board-canvas.test.tsx | AC-1: Given plansza z jedną karteczką, when renderuję BoardCanvas, then widzę węzeł z zagadnieniem tej karteczki. | Pending |
| TASK-004 | AC-2 | tests/integration/board-canvas.test.tsx | AC-2: Given karteczka na planszy, when kończę jej przeciąganie, then BoardCanvas wywołuje `onNoteMove` z identyfikatorem karteczki i nowym położeniem. | Pending |
| US-001 / TASK-005 | AC-1 | tests/integration/us-001-create-board.test.tsx | AC-1: Given w aplikacji nie ma żadnej planszy, when otwieram aplikację, then widzę pusty stan z komunikatem i przyciskiem "Utwórz pierwszą planszę". | Pending |
| US-001 / TASK-005 | AC-2 | tests/integration/us-001-create-board.test.tsx | AC-2: Given lista plansz, when tworzę planszę o nazwie "Historia Polski", then plansza pojawia się na liście i otwiera się jako pusta. | Pending |
| US-001 / TASK-005 | AC-3 | tests/integration/us-001-create-board.test.tsx | AC-3: Given formularz nowej planszy, when zatwierdzam pustą nazwę, then plansza nie powstaje i widzę komunikat "Podaj nazwę planszy". | Pending |
| US-003 / TASK-006 | AC-1 | tests/integration/us-003-add-note.test.tsx | AC-1: Given otwarta plansza, when dodaję karteczkę z zagadnieniem "1410 – bitwa pod Grunwaldem" w wybranym miejscu, then karteczka jest widoczna w tym miejscu z tym zagadnieniem. | Pending |
| US-003 / TASK-006 | AC-2 | tests/integration/us-003-add-note.test.tsx | AC-2: Given formularz karteczki, when zatwierdzam puste zagadnienie, then karteczka nie powstaje i widzę komunikat "Wpisz zagadnienie". | Pending |
| US-003 / TASK-006 | AC-3 | tests/integration/us-003-add-note.test.tsx | AC-3: Given plansza z dodaną karteczką, when odświeżam stronę, then karteczka ma to samo zagadnienie i to samo położenie. | Pending |
| US-004 / TASK-007 | AC-1 | tests/e2e/us-004-edit-note.spec.ts | AC-1: Given karteczka na planszy, when przeciągam ją w inne miejsce i odświeżam stronę, then karteczka znajduje się w nowym miejscu. | Pending |
| US-004 / TASK-007 | AC-2 | tests/integration/us-004-edit-note.test.tsx | AC-2: Given karteczka z zagadnieniem "1410", when zmieniam zagadnienie na "15.07.1410", then karteczka pokazuje nowe zagadnienie. | Pending |
| US-004 / TASK-007 | AC-3 | tests/integration/us-004-edit-note.test.tsx | AC-3: Given karteczka mająca połączenia, when ją usuwam, then karteczka i wszystkie jej połączenia znikają z planszy. | Pending |
| TASK-008 | AC-1 | tests/integration/peg-seed.test.ts | AC-1: Given pusta tabela peg_word, when uruchamiam seed, then tabela zawiera 110 haseł z niepustym słowem. | Pending |
| TASK-008 | AC-2 | tests/unit/peg-seed.test.ts | AC-2: Given startowa lista GSP, when dekoduję spółgłoski każdego słowa według GSP, then wynik jest równy liczbie hasła. | Pending |
| TASK-008 | AC-3 | tests/integration/peg-seed.test.ts | AC-3: Given hasło "14" ze słowem zmienionym na "tur", when ponownie uruchamiam seed, then hasło "14" nadal ma słowo "tur". | Pending |
| US-007 / TASK-009 | AC-1 | tests/integration/us-007-peg-words.test.tsx | AC-1: Given świeżo zainstalowana aplikacja, when otwieram listę GSP, then widzę niepuste słowo dla każdego z 110 haseł (0–9 oraz 00–99). | Pending |
| US-007 / TASK-009 | AC-2 | tests/integration/us-007-peg-words.test.tsx | AC-2: Given lista GSP, when zmieniam słowo dla "14" na "tur", then generowanie dla zagadnienia "14" zwraca "tur". | Pending |
| US-007 / TASK-009 | AC-3 | tests/integration/us-007-peg-words.test.tsx | AC-3: Given lista GSP, when zapisuję puste słowo dla hasła, then zmiana jest odrzucona i hasło zachowuje poprzednie słowo. | Pending |
| US-007 / TASK-009 | AC-4 | tests/integration/us-007-peg-words.test.tsx | AC-4: Given hasło ze zmienionym słowem, when używam akcji "Przywróć domyślne", then hasło ma ponownie słowo startowe. | Pending |
| US-006 / TASK-010 | AC-1 | tests/integration/us-006-generate.test.tsx | AC-1: Given karteczka z zagadnieniem "1410", when używam akcji "Generuj słowa", then otrzymuję kolejno słowo z listy GSP dla "14" i słowo dla "10". | Pending |
| US-006 / TASK-010 | AC-2 | tests/integration/us-006-generate.test.tsx | AC-2: Given karteczka z zagadnieniem "15.07.1410", when używam akcji "Generuj słowa", then otrzymuję kolejno słowa dla "15", "07", "14" i "10". | Pending |
| US-006 / TASK-010 | AC-3 | tests/integration/us-006-generate.test.tsx | AC-3: Given karteczka z zagadnieniem "966", when używam akcji "Generuj słowa", then otrzymuję słowo dla "96" i słowo dla pojedynczej cyfry "6". | Pending |
| US-006 / TASK-010 | AC-4 | tests/integration/us-006-generate.test.tsx | AC-4: Given karteczka mająca już słowa-obrazy, when używam akcji "Generuj słowa", then dotychczasowe słowa pozostają bez zmian do chwili potwierdzenia zastąpienia. | Pending |
| US-005 / TASK-011 | AC-1 | tests/integration/us-005-manual-words.test.tsx | AC-1: Given karteczka z zagadnieniem "Mitochondrium", when wpisuję słowa-obrazy "mity, chondryt" i zapisuję, then karteczka pokazuje te słowa-obrazy pod zagadnieniem. | Pending |
| US-005 / TASK-011 | AC-2 | tests/integration/us-005-manual-words.test.tsx | AC-2: Given karteczka z zagadnieniem bez cyfr, when używam akcji "Generuj słowa", then słowa nie są generowane i widzę komunikat "Brak liczb – wpisz słowa-obrazy samodzielnie". | Pending |
| US-008 / TASK-012 | AC-1 | tests/integration/us-008-connections.test.tsx | AC-1: Given dwie karteczki na planszy, when łączę je i odświeżam stronę, then między karteczkami widoczna jest linia. | Pending |
| US-008 / TASK-012 | AC-2 | tests/integration/us-008-connections.test.tsx | AC-2: Given dwie już połączone karteczki, when łączę je ponownie, then drugie połączenie nie powstaje. | Pending |
| US-008 / TASK-012 | AC-3 | tests/integration/us-008-connections.test.tsx | AC-3: Given połączenie dwóch karteczek, when usuwam połączenie, then linia znika, a obie karteczki pozostają na planszy. | Pending |
| US-009 / TASK-013 | AC-1 | tests/integration/us-009-chain.test.tsx | AC-1: Given karteczki A, B i C, when tworzę ogniwa łańcucha A→B i B→C, then karteczki pokazują numery kolejności 1, 2 i 3. | Pending |
| US-009 / TASK-013 | AC-2 | tests/integration/us-009-chain.test.tsx | AC-2: Given karteczka A z ogniwem wychodzącym A→B, when tworzę ogniwo A→C, then ogniwo nie powstaje i widzę komunikat "Karteczka ma już następnik w łańcuchu". | Pending |
| US-009 / TASK-013 | AC-3 | tests/integration/us-009-chain.test.tsx | AC-3: Given łańcuch A→B→C, when tworzę ogniwo C→A, then ogniwo nie powstaje i widzę komunikat "Łańcuch nie może tworzyć pętli". | Pending |
| TASK-014 | AC-1 | tests/unit/zones.test.ts | AC-1: Given strefa i karteczka, której środek leży wewnątrz strefy, when wyznaczam strefę karteczki, then wynikiem jest identyfikator tej strefy. | Pending |
| TASK-014 | AC-2 | tests/unit/zones.test.ts | AC-2: Given dwie nakładające się strefy i karteczka w części wspólnej, when wyznaczam strefę karteczki, then wynikiem jest strefa utworzona później. | Pending |
| TASK-014 | AC-3 | tests/unit/zones.test.ts | AC-3: Given karteczka przypisana do strefy, when przeliczam przypisania po przesunięciu strefy poza karteczkę, then karteczka nie ma przypisanej strefy. | Pending |
| US-010 / TASK-015 | AC-1 | tests/integration/us-010-zones.test.tsx | AC-1: Given otwarta plansza, when tworzę strefę o nazwie "Kuchnia", then strefa z tą nazwą jest widoczna na planszy. | Pending |
| US-010 / TASK-015 | AC-2 | tests/integration/us-010-zones.test.tsx | AC-2: Given strefa "Kuchnia", when upuszczam karteczkę w jej obrębie, then karteczka jest przypisana do pokoju "Kuchnia". | Pending |
| US-010 / TASK-015 | AC-3 | tests/integration/us-010-zones.test.tsx | AC-3: Given karteczka przypisana do pokoju "Kuchnia", when przeciągam ją poza strefę, then karteczka nie jest przypisana do żadnego pokoju. | Pending |
| US-010 / TASK-015 | AC-4 | tests/integration/us-010-zones.test.tsx | AC-4: Given strefa zawierająca karteczki, when usuwam strefę, then karteczki pozostają na planszy bez przypisanego pokoju. | Pending |
| TASK-016 | AC-1 | tests/unit/review-order.test.ts | AC-1: Given plansza z łańcuchem B→C i luźną karteczką A utworzoną najwcześniej, when wyznaczam kolejność powtórki, then kolejność to B, C, A. | Pending |
| TASK-016 | AC-2 | tests/unit/review-order.test.ts | AC-2: Given plansza z luźnymi karteczkami utworzonymi w kolejności A, B, C, when wyznaczam kolejność powtórki, then kolejność to A, B, C. | Pending |
| US-011 / TASK-017 | AC-1 | tests/integration/us-011-review.test.tsx | AC-1: Given plansza z karteczkami mającymi słowa-obrazy, when rozpoczynam powtórkę, then widzę zagadnienie pierwszej karteczki, a jej słowa-obrazy są zakryte. | Pending |
| US-011 / TASK-017 | AC-2 | tests/integration/us-011-review.test.tsx | AC-2: Given karteczka w powtórce z zakrytymi słowami-obrazami, when wybieram "Odsłoń", then widzę słowa-obrazy oraz przyciski "Pamiętałem" i "Nie pamiętałem". | Pending |
| US-011 / TASK-017 | AC-3 | tests/integration/us-011-review.test.tsx | AC-3: Given odsłonięta karteczka, when wybieram "Pamiętałem", then wynik zostaje zapisany z bieżącą datą i pojawia się następna karteczka. | Pending |
| US-011 / TASK-017 | AC-4 | tests/integration/us-011-review.test.tsx | AC-4: Given ostatnia karteczka powtórki została oceniona, when powtórka się kończy, then widzę podsumowanie z liczbą zapamiętanych, liczbą wszystkich i wynikiem procentowym. | Pending |
| US-012 / TASK-018 | AC-1 | tests/integration/us-012-review-scope.test.tsx | AC-1: Given plansza z łańcuchem A→B→C, when rozpoczynam powtórkę, then karteczki pojawiają się w kolejności A, B, C. | Pending |
| US-012 / TASK-018 | AC-2 | tests/integration/us-012-review-scope.test.tsx | AC-2: Given plansza z karteczką bez słów-obrazów, when przechodzę powtórkę, then ta karteczka nie pojawia się w powtórce. | Pending |
| US-012 / TASK-018 | AC-3 | tests/integration/us-012-review-scope.test.tsx | AC-3: Given plansza, na której żadna karteczka nie ma słów-obrazów, when rozpoczynam powtórkę, then powtórka się nie rozpoczyna i widzę komunikat "Dodaj słowa-obrazy, aby rozpocząć powtórkę". | Pending |
| US-012 / TASK-018 | AC-4 | tests/integration/us-012-review-scope.test.tsx | AC-4: Given karteczka w powtórce przypisana do pokoju "Kuchnia", when wybieram "Odsłoń", then obok słów-obrazów widoczna jest nazwa pokoju "Kuchnia". | Pending |
| US-013 / TASK-019 | AC-1 | tests/integration/us-013-stats.test.tsx | AC-1: Given plansza z ukończoną powtórką o wyniku 8 z 10, when otwieram listę plansz, then przy planszy widzę wynik ostatniej powtórki "80%" wraz z jej datą. | Pending |
| US-013 / TASK-019 | AC-2 | tests/integration/us-013-stats.test.tsx | AC-2: Given 3 ukończone powtórki w ciągu ostatnich 7 dni, when otwieram statystyki, then widzę "Powtórki w ostatnich 7 dniach: 3". | Pending |
| US-013 / TASK-019 | AC-3 | tests/integration/us-013-stats.test.tsx | AC-3: Given plansza bez żadnej ukończonej powtórki, when otwieram listę plansz, then przy planszy widzę "Brak powtórek". | Pending |
| US-002 / TASK-020 | AC-1 | tests/integration/us-002-manage-boards.test.tsx | AC-1: Given plansza "Historia", when zmieniam jej nazwę na "Historia Polski", then na liście plansz widnieje nowa nazwa. | Pending |
| US-002 / TASK-020 | AC-2 | tests/integration/us-002-manage-boards.test.tsx | AC-2: Given plansza z karteczkami, when wybieram usunięcie, then aplikacja pyta o potwierdzenie przed usunięciem. | Pending |
| US-002 / TASK-020 | AC-3 | tests/integration/us-002-manage-boards.test.tsx | AC-3: Given potwierdzone usunięcie planszy, when wracam do listy, then plansza oraz jej karteczki, połączenia, strefy i wyniki powtórek nie istnieją. | Pending |
| US-014 / TASK-021 | AC-1 | tests/e2e/us-014-mobile.spec.ts | AC-1: Given ekran o szerokości 375 px, when przechodzę powtórkę, then wszystkie elementy powtórki mieszczą się na ekranie bez przewijania w poziomie. | Pending |
| US-014 / TASK-021 | AC-2 | tests/e2e/us-014-mobile.spec.ts | AC-2: Given plansza otwarta na urządzeniu dotykowym, when przeciągam karteczkę palcem, then karteczka zmienia położenie. | Pending |
| US-014 / TASK-021 | AC-3 | tests/e2e/us-014-mobile.spec.ts | AC-3: Given karteczka dodana na jednym urządzeniu, when otwieram tę planszę na drugim urządzeniu, then widzę tę karteczkę. | Pending |
| TASK-022 | AC-1 | tests/integration/security.test.tsx | AC-1: Given dowolna odpowiedź aplikacji, when sprawdzam nagłówki, then zawiera `Content-Security-Policy` oraz `X-Content-Type-Options: nosniff`. | Pending |
| TASK-022 | AC-2 | tests/integration/security.test.tsx | AC-2: Given karteczka z zagadnieniem `<script>alert(1)</script>`, when plansza ją renderuje, then zagadnienie jest widoczne jako tekst i nie powstaje element script. | Pending |
| TASK-023 | AC-1 | tests/integration/performance.test.ts | AC-1: Given plansza z 200 karteczkami, 20 strefami i 200 połączeniami, when wywołuję GET /api/boards/{id}, then odpowiedź przychodzi w czasie krótszym niż 500 ms. | Pending |

## Technical Tests

Testy dodatkowe, bez prefiksu `AC-N: `:

- word-images: liczby z zerami wiodącymi ("007"), bardzo długie ciągi cyfr, cyfry rozdzielone różnymi separatorami, zagadnienie złożone z samych separatorów.
- chain: usunięcie środkowej karteczki dzieli łańcuch na dwa; zamiana połączenia association na chain dla tej samej pary jest odrzucana jako duplikat.
- zones: karteczka dokładnie na krawędzi strefy; strefa o minimalnym rozmiarze; usunięcie strefy nakładającej się przypisuje karteczkę do strefy pod spodem.
- review: procent zaokrąglany do liczby całkowitej; sesja nieukończona nie liczy się do statystyk; ponowna ocena tej samej karteczki → 409.
- API: limity długości pól (topic 500, name 100, word 40); identyfikator w złym formacie → 400; nieistniejący zasób → 404.
- Baza: kaskadowe usunięcie planszy usuwa sesje i wyniki; usunięcie karteczki usuwa jej wyniki.
- Bezpieczeństwo: treść HTML w nazwie planszy, strefy i słowach-obrazach renderowana jako tekst.
