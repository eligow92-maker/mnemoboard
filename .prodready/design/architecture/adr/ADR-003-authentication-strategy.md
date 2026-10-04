# ADR-003: Authentication Strategy

## Status
Accepted

## Date
2026-10-03

## Context
MVP to narzędzie osobiste dla jednej osoby, uruchamiane na domowym serwerze i dostępne tylko w sieci lokalnej. Konta i logowanie są jawnym non-goalem MVP (constitution.md), ale przeniesienie na VPS jest planowane, a wersja publiczna możliwa.

## Decision
We will ship the MVP without authentication, with a prepared extension point, because:
- W sieci lokalnej z jednym użytkownikiem logowanie nie chroni niczego, a dodaje tarcie przy każdej powtórce na telefonie.
- Brak pojęcia użytkownika oznacza też brak autoryzacji: każdy, kto ma dostęp sieciowy do aplikacji, ma pełny dostęp do wszystkich danych — to świadoma decyzja, nie przeoczenie.
- Wszystkie handlery API są opakowane wspólną funkcją pośrednią (`withApi`), w której później zostanie dodane sprawdzanie sesji bez zmian w poszczególnych endpointach.

Warunek: aplikacja nie może być wystawiona poza sieć lokalną, dopóki nie zostanie wdrożony etap "przed VPS" poniżej. Port jest publikowany wyłącznie przez Compose na hoście domowym; README i DEPLOYMENT.md muszą zawierać to ostrzeżenie.

Etap "przed VPS" (poza MVP): logowanie jednym hasłem (`APP_PASSWORD`), sesja w szyfrowanym ciasteczku `HttpOnly` + `Secure` + `SameSite=Lax` (`iron-session`), HTTPS przez Caddy, ograniczenie liczby prób logowania.

## Consequences

### Positive
- Zero tarcia w codziennym użyciu; mniejszy zakres MVP.
- Brak przechowywania haseł i danych osobowych — brak wymagań zgodności.

### Negative
- Każde urządzenie w sieci domowej (goście, IoT) może czytać i zmieniać plansze.
- Dodanie kont wieloosobowych będzie wymagało migracji danych (`ownerId`).

### Risks
- Przypadkowe wystawienie do internetu (przekierowanie portu, tunel). Mitigation: ostrzeżenie w dokumentacji, brak konfiguracji reverse proxy w MVP, nagłówki bezpieczeństwa i walidacja wejścia mimo braku logowania.
- Żądania międzywitrynowe z przeglądarki w tej samej sieci (CSRF na API bez sesji). Mitigation: API przyjmuje wyłącznie `Content-Type: application/json` i odrzuca żądania modyfikujące z obcym nagłówkiem `Origin`.

## Alternatives Considered
1. Jedno hasło i sesja już w MVP: Rejected because użytkownik jawnie wyłączył logowanie z MVP, a w sieci lokalnej koszt (tarcie, obsługa sesji, testy) przewyższa korzyść; pozostaje zaplanowane jako warunek przeniesienia na VPS.
2. Pełne konta (NextAuth/OAuth): Rejected because wymaga usług zewnętrznych lub własnej rejestracji, co łamie non-goal "konta w MVP" i non-negotiable "brak zależności zewnętrznych".
3. HTTP Basic Auth w reverse proxy: Rejected because dodaje kontener proxy bez HTTPS w sieci lokalnej, więc hasło i tak szłoby otwartym tekstem.
