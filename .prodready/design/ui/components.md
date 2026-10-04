# UI Components

## Screens

| Ekran | Ścieżka | Historyjki |
|-------|---------|------------|
| Lista plansz + statystyki + kopia zapasowa | `/` | US-001, US-002, US-013, US-021–US-023 |
| Edytor planszy | `/boards/[id]` | US-003–US-006, US-008–US-010, US-014–US-017 |
| Powtórka | `/boards/[id]/review` | US-011, US-012, US-014–US-016, US-018 |
| Lista GSP + własne wpisy | `/peg-words` | US-007, US-019 |

## Primitives
- [ ] Button (primary, secondary, ghost, danger; min. 44 px wysokości)
- [ ] IconButton (z etykietą `aria-label`)
- [ ] Input (text)
- [ ] Textarea (zagadnienie, słowa-obrazy)
- [ ] FieldError (komunikat walidacji pod polem)
- [ ] Badge (numer w łańcuchu, nazwa pokoju, wynik procentowy)
- [ ] ColorSwatch (próbka jednego z 5 kolorów, stan zaznaczenia, `aria-label` z nazwą koloru)
- [ ] FileButton (przycisk otwierający wybór pliku `.json`)

## Composite
- [ ] ConfirmDialog (usunięcie planszy, zastąpienie słów-obrazów)
- [ ] Toast (błędy reguł: "Karteczka ma już następnik w łańcuchu", "Łańcuch nie może tworzyć pętli")
- [ ] EmptyState (brak plansz: "Utwórz pierwszą planszę")
- [ ] BoardCard (nazwa, liczba karteczek, wynik i data ostatniej powtórki lub "Brak powtórek", menu: zmień nazwę / eksportuj / usuń)
- [ ] BackupPanel (na liście plansz, także w pustym stanie: "Importuj planszę", "Pobierz kopię", "Przywróć z kopii"; błędy "Plik nie jest poprawnym eksportem Mnemoboard", "Plik jest za duży (limit 5 MB)", "Plik nie jest poprawną kopią Mnemoboard")
- [ ] RestoreConfirmDialog (wynik `dryRun`: "Zostaną dodane N plansze"; zapis dopiero po potwierdzeniu)
- [ ] BoardForm (nazwa; błąd "Podaj nazwę planszy")
- [ ] StatsPanel ("Powtórki w ostatnich 7 dniach: N")

## Board Editor
- [ ] BoardCanvas (React Flow: pan/zoom, dotyk)
- [ ] NoteNode (kolor tła wg `color`; emotki w rozmiarze font-size-emoji nad zagadnieniem; zagadnienie, słowa-obrazy, opowiadanie obcięte do 2 wierszy; numer w łańcuchu, uchwyty połączeń)
- [ ] ZoneNode (nazwany prostokąt pod karteczkami, zmiana rozmiaru)
- [ ] AssociationEdge (linia bez strzałki)
- [ ] ChainEdge (linia ze strzałką, kolor łańcucha)
- [ ] BoardToolbar (dodaj karteczkę, dodaj pokój, tryb połączenia: mapa myśli / łańcuch, rozpocznij powtórkę)
- [ ] NoteEditor (panel boczny na komputerze, arkusz dolny na telefonie: zagadnienie, słowa-obrazy, "Generuj słowa", opowiadanie, emotki, ColorPicker, usuń; błędy "Wpisz zagadnienie", "Opowiadanie może mieć najwyżej 2000 znaków", "Najwyżej 8 emotek"; komunikat "Brak liczb – wpisz słowa-obrazy samodzielnie")
- [ ] ColorPicker (5 próbek ColorSwatch, wybór pojedynczy, zapis od razu)
- [ ] ZoneEditor (nazwa pokoju, usuń)

## Review
- [ ] ReviewStart (przed pierwszą kartą: ColorFilter + "Rozpocznij"; komunikat "Brak karteczek w wybranych kolorach")
- [ ] ColorFilter (5 próbek ColorSwatch, wybór wielokrotny, domyślnie wszystkie zaznaczone)
- [ ] ReviewCard (zagadnienie widoczne; słowa-obrazy, opowiadanie, emotki i nazwa pokoju zakryte do "Odsłoń"; pasek w kolorze karteczki)
- [ ] ReviewActions ("Odsłoń" → "Pamiętałem" / "Nie pamiętałem")
- [ ] ReviewProgress (karta N z M)
- [ ] ReviewSummary ("8 z 10", "80%", powrót do planszy)
- [ ] ReviewUnavailable ("Dodaj słowa-obrazy, aby rozpocząć powtórkę")

## Peg Words
- [ ] PegWordTable (110 haseł: liczba, słowo, znacznik "własne")
- [ ] PegWordRow (edycja w miejscu, "Przywróć domyślne", błąd pustego słowa)
- [ ] CustomPegSection (lista własnych wpisów "333 – mumia-mysz" pod tabelą 110 haseł; pusty stan z zachętą do dodania pierwszego wpisu)
- [ ] CustomPegForm (liczba + słowo; błędy "Własny wpis musi mieć od 3 do 15 cyfr", "Wpis dla tej liczby już istnieje")
- [ ] CustomPegRow (edycja słowa w miejscu, usuń)

## Layout
- [ ] AppHeader (nazwa aplikacji, nawigacja: Plansze, Lista GSP)
- [ ] Container (content-max-width; pełna szerokość dla edytora planszy)

## Responsive Rules
- Edytor planszy zajmuje cały ekran pod nagłówkiem; pasek narzędzi na dole ekranu poniżej `md`.
- NoteEditor jako arkusz dolny poniżej `md`, panel boczny od `md`.
- BackupPanel i ColorFilter zawijają przyciski/próbki do kolejnego wiersza przy 375 px; żadna próbka nie ma obszaru dotyku mniejszego niż 44 px.
- Powtórka: jedna kolumna, przyciski na całą szerokość, bez przewijania w poziomie przy 375 px.
- Na dotyku przeciągnięcie karteczki przesuwa karteczkę, przeciągnięcie tła przesuwa widok.
