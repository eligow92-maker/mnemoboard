# UI Components

## Screens

| Ekran | Ścieżka | Historyjki |
|-------|---------|------------|
| Lista plansz + statystyki | `/` | US-001, US-002, US-013 |
| Edytor planszy | `/boards/[id]` | US-003–US-006, US-008–US-010, US-014 |
| Powtórka | `/boards/[id]/review` | US-011, US-012, US-014 |
| Lista GSP | `/peg-words` | US-007 |

## Primitives
- [ ] Button (primary, secondary, ghost, danger; min. 44 px wysokości)
- [ ] IconButton (z etykietą `aria-label`)
- [ ] Input (text)
- [ ] Textarea (zagadnienie, słowa-obrazy)
- [ ] FieldError (komunikat walidacji pod polem)
- [ ] Badge (numer w łańcuchu, nazwa pokoju, wynik procentowy)

## Composite
- [ ] ConfirmDialog (usunięcie planszy, zastąpienie słów-obrazów)
- [ ] Toast (błędy reguł: "Karteczka ma już następnik w łańcuchu", "Łańcuch nie może tworzyć pętli")
- [ ] EmptyState (brak plansz: "Utwórz pierwszą planszę")
- [ ] BoardCard (nazwa, liczba karteczek, wynik i data ostatniej powtórki lub "Brak powtórek", menu: zmień nazwę / usuń)
- [ ] BoardForm (nazwa; błąd "Podaj nazwę planszy")
- [ ] StatsPanel ("Powtórki w ostatnich 7 dniach: N")

## Board Editor
- [ ] BoardCanvas (React Flow: pan/zoom, dotyk)
- [ ] NoteNode (zagadnienie, słowa-obrazy, numer w łańcuchu, uchwyty połączeń)
- [ ] ZoneNode (nazwany prostokąt pod karteczkami, zmiana rozmiaru)
- [ ] AssociationEdge (linia bez strzałki)
- [ ] ChainEdge (linia ze strzałką, kolor łańcucha)
- [ ] BoardToolbar (dodaj karteczkę, dodaj pokój, tryb połączenia: mapa myśli / łańcuch, rozpocznij powtórkę)
- [ ] NoteEditor (panel boczny na komputerze, arkusz dolny na telefonie: zagadnienie, słowa-obrazy, "Generuj słowa", usuń; błąd "Wpisz zagadnienie", komunikat "Brak liczb – wpisz słowa-obrazy samodzielnie")
- [ ] ZoneEditor (nazwa pokoju, usuń)

## Review
- [ ] ReviewCard (zagadnienie widoczne; słowa-obrazy i nazwa pokoju zakryte do "Odsłoń")
- [ ] ReviewActions ("Odsłoń" → "Pamiętałem" / "Nie pamiętałem")
- [ ] ReviewProgress (karta N z M)
- [ ] ReviewSummary ("8 z 10", "80%", powrót do planszy)
- [ ] ReviewUnavailable ("Dodaj słowa-obrazy, aby rozpocząć powtórkę")

## Peg Words
- [ ] PegWordTable (110 haseł: liczba, słowo, znacznik "własne")
- [ ] PegWordRow (edycja w miejscu, "Przywróć domyślne", błąd pustego słowa)

## Layout
- [ ] AppHeader (nazwa aplikacji, nawigacja: Plansze, Lista GSP)
- [ ] Container (content-max-width; pełna szerokość dla edytora planszy)

## Responsive Rules
- Edytor planszy zajmuje cały ekran pod nagłówkiem; pasek narzędzi na dole ekranu poniżej `md`.
- NoteEditor jako arkusz dolny poniżej `md`, panel boczny od `md`.
- Powtórka: jedna kolumna, przyciski na całą szerokość, bez przewijania w poziomie przy 375 px.
- Na dotyku przeciągnięcie karteczki przesuwa karteczkę, przeciągnięcie tła przesuwa widok.
