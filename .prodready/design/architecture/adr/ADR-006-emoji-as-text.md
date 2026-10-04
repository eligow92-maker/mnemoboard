# ADR-006: Emoji as Plain Text

## Status
Accepted

## Date
2026-10-04

## Context
Karteczka dostaje pole na emotki (US-016): do 8 emotek, czytelnych na planszy (co najmniej 24 px). Wgrywanie plików graficznych jest odłożone. Aplikacja musi działać bez internetu i bez usług zewnętrznych (constitution). Jedna emotka to często kilka punktów kodowych Unicode (np. flaga, emotka z odcieniem skóry, sekwencje ze złączką ZWJ), więc długość napisu nie odpowiada liczbie emotek.

## Decision
We will use zwykłe pole tekstowe wypełniane klawiaturą emotek systemu, z limitem liczonym w znakach graficznych przez `Intl.Segmenter` because:
- Emotki zapisane jako tekst trafiają do bazy, eksportu i kopii bez żadnej dodatkowej obsługi.
- `Intl.Segmenter` jest wbudowany w Node.js 22 i we współczesne przeglądarki — poprawnie liczy złożone emotki bez biblioteki.
- Każdy system (Windows, macOS, Linux, Android, iOS) ma własną klawiaturę emotek, więc własny wybierak nie jest potrzebny do spełnienia US-016.

Limit 8 znaków graficznych egzekwuje serwer (Zod `refine`); kolumna `VARCHAR(64)` jest tylko górnym ograniczeniem technicznym. Emotki renderuje czcionka systemowa urządzenia.

## Consequences

### Positive
- Brak nowych zależności i brak wzrostu paczki klienckiej.
- Jedna reguła walidacji współdzielona przez API, import planszy i przywracanie kopii.

### Negative
- Pole przyjmuje dowolne znaki, nie tylko emotki — użytkownik może wpisać tam litery; akceptowalne w narzędziu osobistym.
- Wygląd tej samej emotki różni się między komputerem a telefonem, a bardzo nowe emotki mogą nie wyświetlić się na starszym urządzeniu.

### Risks
- Sekwencja dłuższa niż 64 znaki przy 8 złożonych emotkach (np. rodziny ze złączkami) zostanie odrzucona mimo zgodności z limitem 8. Mitygacja: komunikat walidacji pola; przypadek skrajny, kolumnę można poszerzyć migracją.

## Alternatives Considered
1. Wbudowany wybierak emotek (np. `emoji-mart`): Rejected because dodaje kilkaset kB danych do paczki klienckiej dla funkcji, którą daje klawiatura systemowa; można dodać później bez zmiany modelu danych.
2. Zamknięta lista kilkudziesięciu ikon do wyboru: Rejected because ogranicza skojarzenia użytkownika, a istotą pola jest dowolny własny obraz.
3. Liczenie limitu długością napisu lub wyrażeniem regularnym: Rejected because jedna emotka ma od 1 do kilkunastu jednostek kodowych, więc limit byłby nieprzewidywalny dla użytkownika.
