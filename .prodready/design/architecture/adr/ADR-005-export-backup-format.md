# ADR-005: Export and Backup File Format

## Status
Accepted

## Date
2026-10-04

## Context
Iteracja 2 dodaje eksport i import pojedynczej planszy oraz ręczną pełną kopię zapasową (US-021–US-023). Constitution wymaga, by wczytanie pliku nigdy nie zmieniało ani nie usuwało istniejących plansz, a błędny plik nie zmieniał niczego. Użytkownik pobiera i wczytuje pliki z przeglądarki na komputerze i telefonie; na serwerze nie ma do tego powłoki ani harmonogramu. Karteczki mają tylko tekst (emotki zamiast obrazów).

## Decision
We will use własny, wersjonowany format JSON obsługiwany przez API aplikacji because:
- Jeden plik JSON (`format: "mnemoboard"`, `version: 1`, `kind: "board" | "backup"`) da się pobrać i wczytać z przeglądarki bez dodatkowych narzędzi, także na telefonie.
- Ten sam schemat Zod waliduje plik w całości przed zapisem, a zapis idzie jedną transakcją — spełnia to regułę "błędny plik niczego nie zmienia".
- Import na poziomie aplikacji nadaje nowe identyfikatory i przechodzi przez reguły domenowe (łańcuch bez pętli, jedno połączenie na parę), więc z definicji tylko dokłada dane.
- Numer wersji formatu pozwala wczytać stare pliki po przyszłych zmianach schematu.

Plik jest przesyłany jako ciało `application/json` (klient czyta plik i wysyła jego treść), a pobierany z nagłówkiem `Content-Disposition: attachment`. Limit rozmiaru (5 MB plansza, 50 MB kopia) jest sprawdzany przed parsowaniem. Przywrócenie ma tryb `dryRun`, który zwraca liczbę plansz do dodania — na nim opiera się potwierdzenie w interfejsie. Pliki nie są przechowywane na serwerze.

## Consequences

### Positive
- Brak nowych zależności i brak nowych elementów infrastruktury.
- Format jest czytelny dla człowieka i niezależny od wersji bazy danych oraz migracji Prisma.
- Eksport i import jednej planszy korzystają z tego samego kodu co pełna kopia.

### Negative
- Format trzeba utrzymywać razem ze schematem: każde nowe pole karteczki wymaga decyzji, czy trafia do pliku, i ewentualnie podniesienia wersji.
- Cała kopia jest trzymana w pamięci podczas walidacji (do 50 MB JSON) — akceptowalne przy jednym użytkowniku.
- Dwukrotne przywrócenie tej samej kopii dubluje plansze, bo przywracanie tylko dokłada.

### Risks
- Kopia jest ręczna: chroni tylko wtedy, gdy użytkownik ją pobiera. Mitygacja: przycisk "Pobierz kopię" na liście plansz; automatyczne kopie zapisane jako przyszła funkcja.
- Wczytywany plik jest niezaufanym wejściem. Mitygacja: limit rozmiaru, ścisły schemat (odrzucanie nieznanych wartości `kind`/`version`), limity liczby elementów, treść renderowana jak zwykły tekst.

## Alternatives Considered
1. `pg_dump` / `pg_restore` uruchamiane z Makefile: Rejected because wymaga dostępu do powłoki serwera (niedostępne z telefonu), przywraca przez zastąpienie całej bazy — wbrew regule "tylko dokłada" — i nie pozwala przenieść pojedynczej planszy.
2. Archiwum ZIP z JSON w środku: Rejected because bez plików graficznych nie daje nic poza kompresją, a wymaga dodatkowej biblioteki po obu stronach. Wróci jako wersja formatu 2, gdy karteczki dostaną wgrywane obrazy.
3. Przesyłanie pliku jako `multipart/form-data`: Rejected because plik jest i tak JSON-em — wysłanie go jako ciała `application/json` pozwala użyć istniejącej warstwy walidacji API bez parsera formularzy.
