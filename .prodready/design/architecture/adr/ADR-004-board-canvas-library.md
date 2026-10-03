# ADR-004: Board Canvas Library

## Status
Accepted

## Date
2026-10-03

## Context
Edytor planszy to największe ryzyko techniczne MVP (PRD §8): karteczki przeciągane myszą i palcem, linie między nimi, skierowane ogniwa łańcucha z numeracją, prostokątne strefy-pokoje, przesuwanie i powiększanie widoku — wszystko także na ekranie 375 px.

## Decision
We will use React Flow (`@xyflow/react` 12) because:
- Węzły, krawędzie, przeciąganie, pan/zoom i obsługa dotyku są gotowe i dojrzałe.
- Własne typy węzłów pozwalają zrobić karteczkę i strefę jako zwykłe komponenty React; krawędzie mogą mieć typ i strzałkę (łańcuch) lub nie (mapa myśli).
- Model danych biblioteki (nodes + edges) odpowiada wprost encjom Note/Zone i Connection.
- Licencja MIT, działa w całości po stronie klienta, bez usług zewnętrznych.

Strefy są węzłami własnego typu renderowanymi pod karteczkami; przynależność karteczki do strefy liczy serwer z położenia (pattern.md), a nie mechanizm `parentId` biblioteki — dzięki temu reguła jest testowalna bez interfejsu.

## Consequences

### Positive
- Znacznie mniej własnego kodu dla interakcji na canvasie; czas idzie na reguły domenowe i powtórkę.
- Gotowe zachowania dostępności i klawiatury dla węzłów.

### Negative
- Zależność od zewnętrznej biblioteki w centralnej części aplikacji; rozmiar paczki klienckiej rośnie.
- Testy E2E przeciągania wymagają symulacji zdarzeń wskaźnika w Playwright, co bywa niestabilne.

### Risks
- Zachowanie dotyku na telefonie odbiega od oczekiwań (konflikt przeciągania karteczki z przesuwaniem widoku). Mitigation: prototyp planszy na telefonie jako jedno z pierwszych zadań planu; konfiguracja `panOnDrag`/`nodesDraggable` zależna od trybu.
- Niestabilne testy przeciągania. Mitigation: reguły (strefy, łańcuch) testowane na poziomie API; E2E sprawdza tylko, że przeciągnięcie wywołuje zapis położenia.

## Alternatives Considered
1. Własna implementacja na SVG/DOM z Pointer Events: Rejected because pan/zoom, hit-testing krawędzi i dotyk to tygodnie pracy bez wartości dla użytkownika.
2. tldraw: Rejected because to pełny edytor rysunkowy z własnym modelem dokumentu i licencją wymagającą znaku wodnego lub opłaty; trudniej wymusić w nim reguły domenowe.
3. Konva / react-konva (canvas): Rejected because treść karteczek to edytowalny tekst — renderowanie w `<canvas>` utrudnia edycję, dostępność i testy względem węzłów DOM.
