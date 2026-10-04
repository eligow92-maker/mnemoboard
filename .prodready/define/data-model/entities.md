# Data Model

MVP nie ma kont, więc brak encji User. Wszystkie dane należą do jedynego użytkownika instalacji.

## Entities

### Board (plansza)
- id: UUID
- name: String (1–100 znaków, wymagane)
- createdAt: DateTime
- updatedAt: DateTime

### Zone (strefa-pokój pałacu pamięci)
- id: UUID
- boardId: UUID (FK → Board, kaskadowe usuwanie)
- name: String (1–60 znaków, wymagane)
- x: Float (lewy górny róg)
- y: Float
- width: Float (> 0)
- height: Float (> 0)
- createdAt: DateTime
- updatedAt: DateTime

### Note (karteczka)
- id: UUID
- boardId: UUID (FK → Board, kaskadowe usuwanie)
- zoneId: UUID? (FK → Zone, przy usunięciu strefy → NULL)
- topic: String (1–500 znaków, wymagane) — zagadnienie do zapamiętania
- imageWords: String? (do 500 znaków) — słowa-obrazy; puste = karteczka pomijana w powtórce
- story: String? (do 2000 znaków) — opowiadanie; w powtórce zakryte razem ze słowami-obrazami
- emoji: String? (do 8 emotek, czyli znaków graficznych) — w powtórce zakryte razem ze słowami-obrazami
- color: Enum (`yellow` — domyślny, `red`, `orange`, `green`, `blue`)
- x: Float
- y: Float
- createdAt: DateTime
- updatedAt: DateTime

### Connection (połączenie)
- id: UUID
- boardId: UUID (FK → Board, kaskadowe usuwanie)
- sourceNoteId: UUID (FK → Note, kaskadowe usuwanie)
- targetNoteId: UUID (FK → Note, kaskadowe usuwanie)
- kind: Enum (`association` — linia mapy myśli, `chain` — ogniwo łańcucha, skierowane source → target)
- createdAt: DateTime

Reguły:
- sourceNoteId ≠ targetNoteId; obie karteczki należą do tej samej planszy.
- Para karteczek ma najwyżej jedno połączenie (niezależnie od kierunku).
- `chain`: karteczka ma najwyżej jedno ogniwo wychodzące i jedno wchodzące; ogniwa nie tworzą pętli (walidacja w aplikacji).
- Numer kolejności w łańcuchu nie jest przechowywany — wynika z przejścia po ogniwach.

### PegWord (hasło listy GSP)
- number: String (klucz główny; 1–15 cyfr)
- word: String (1–80 znaków, wymagane) — aktualne słowo lub fraza użytkownika
- defaultWord: String? (1–40 znaków) — słowo startowe, niezmienne; NULL = własny wpis
- updatedAt: DateTime

Reguły:
- Hasła wbudowane: "0"–"9" oraz "00"–"99" (110 haseł), zawsze z defaultWord; nie można ich usunąć ani dodać.
- Własne wpisy: 3–15 cyfr, defaultWord = NULL; można je dodawać, zmieniać i usuwać; najwyżej 500.
- Generator: w ciągu cyfr szuka własnych wpisów od lewej, w tym samym miejscu wybiera najdłuższy; pozostałe fragmenty dzieli na pary.

### ReviewSession (sesja powtórki)
- id: UUID
- boardId: UUID (FK → Board, kaskadowe usuwanie)
- startedAt: DateTime
- finishedAt: DateTime? (NULL = sesja nieukończona, nie liczy się do statystyk)

### ReviewResult (wynik karteczki w powtórce)
- id: UUID
- sessionId: UUID (FK → ReviewSession, kaskadowe usuwanie)
- noteId: UUID (FK → Note, kaskadowe usuwanie)
- remembered: Boolean
- answeredAt: DateTime

## Pliki eksportu i kopii

Pliki nie są encjami — aplikacja ich nie przechowuje. Oba to JSON z polami `format: "mnemoboard"`, `version: 1`, `kind` i `exportedAt`.

- `kind: "board"` — eksport planszy: `board` (name), `notes`, `zones`, `connections`. Bez historii powtórek.
- `kind: "backup"` — pełna kopia: `boards` (każda jak wyżej oraz `reviewSessions` z `results`), `pegWords` (hasła wbudowane o słowie innym niż startowe oraz wszystkie własne wpisy).

Reguły wczytywania:
- Identyfikatory z pliku służą tylko do odtworzenia powiązań; wczytane rekordy dostają nowe identyfikatory.
- Import planszy zawsze tworzy nową planszę; przy zajętej nazwie dopisuje " (import)".
- Przywrócenie kopii dodaje każdą planszę jako nową; słowo hasła wbudowanego jest wczytywane tylko wtedy, gdy bieżące słowo równa się startowemu; własne wpisy — tylko brakujące.
- Plik jest walidowany w całości przed zapisem, a zapis odbywa się w jednej transakcji.

## Relationships
- Board 1:N Zone
- Board 1:N Note
- Board 1:N Connection
- Board 1:N ReviewSession
- Zone 1:N Note (opcjonalna po stronie Note)
- Note 1:N Connection (jako source) oraz 1:N Connection (jako target)
- ReviewSession 1:N ReviewResult
- Note 1:N ReviewResult

## Indexes
- Note.boardId (ładowanie planszy)
- Note.zoneId
- Zone.boardId
- Connection.boardId
- Connection (least(source, target), greatest(source, target)) — unikalny, jedno połączenie na parę
- Connection.sourceNoteId gdzie kind = `chain` — unikalny (jeden następnik)
- Connection.targetNoteId gdzie kind = `chain` — unikalny (jeden poprzednik)
- ReviewSession (boardId, finishedAt) — ostatnia powtórka planszy
- ReviewSession.finishedAt — liczba sesji w ostatnich 7 dniach
- ReviewResult (sessionId, noteId) — unikalny, jeden wynik na karteczkę w sesji
