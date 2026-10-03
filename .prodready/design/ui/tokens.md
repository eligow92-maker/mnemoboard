# Design Tokens

Kierunek: korkowa tablica z papierowymi karteczkami — ciepłe tło, żółte karteczki, spokojny akcent. Interfejs po polsku, projektowany od 375 px.

## Colors

### Brand
- primary: #2F6F5E (akcent, przyciski główne, ogniwa łańcucha)
- primary-dark: #24574A
- secondary: #C2703D (strefy-pokoje, wyróżnienia)

### Semantic
- success: #2E7D4F ("Pamiętałem", wynik ≥ 80%)
- warning: #B7791F
- error: #C0392B ("Nie pamiętałem", błędy walidacji)
- info: #2B6CB0

### Neutral
- background: #F6F1E7 (tło aplikacji)
- board: #EADFC8 (tło planszy)
- surface: #FFFDF8 (karty, okna dialogowe)
- text-primary: #2A2622
- text-secondary: #6B635A
- border: #D9CFBD

### Board
- note: #FFF3A6 (karteczka)
- note-border: #E6D36A
- note-selected: #FFE66D
- zone-fill: rgba(194, 112, 61, 0.10)
- zone-border: #C2703D
- edge-association: #8A8072 (linia mapy myśli)
- edge-chain: #2F6F5E (ogniwo łańcucha, ze strzałką)

Kontrast tekstu do tła co najmniej 4.5:1 (text-primary na note, surface i background spełnia).

## Typography

- font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif (bez czcionek z sieci — aplikacja działa offline)
- font-size-xs: 0.75rem
- font-size-sm: 0.875rem
- font-size-base: 1rem
- font-size-lg: 1.125rem
- font-size-xl: 1.25rem
- font-size-2xl: 1.5rem
- font-size-review: 1.75rem (zagadnienie w trybie powtórki)
- font-weight-normal: 400
- font-weight-medium: 500
- font-weight-bold: 700

## Spacing

- spacing-1: 0.25rem
- spacing-2: 0.5rem
- spacing-3: 0.75rem
- spacing-4: 1rem
- spacing-6: 1.5rem
- spacing-8: 2rem

## Sizing

- touch-target-min: 44px (każdy element klikalny na telefonie)
- note-width: 180px
- note-min-height: 96px
- zone-min-size: 160px
- content-max-width: 960px (listy i powtórka)

## Breakpoints

- sm: 375px (minimalna obsługiwana szerokość)
- md: 768px
- lg: 1024px

## Border Radius

- radius-sm: 0.25rem (karteczki)
- radius-md: 0.375rem
- radius-lg: 0.5rem (strefy, karty)
- radius-full: 9999px (numer w łańcuchu)

## Shadows

- shadow-sm: 0 1px 2px rgba(42,38,34,0.08)
- shadow-note: 0 2px 4px rgba(42,38,34,0.18)
- shadow-note-drag: 0 8px 16px rgba(42,38,34,0.25)
- shadow-lg: 0 10px 15px rgba(42,38,34,0.15)
