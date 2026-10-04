# Constraints

## Deployment
- Target: domowy serwer/komputer, Docker (Compose), dostęp w sieci lokalnej z komputera i telefonu.
- Region: nie dotyczy (sieć domowa).
- Później (poza MVP): VPS — wymaga wcześniejszego dodania logowania i HTTPS.

## Scale
- Launch: 1 użytkownik, 2 urządzenia, < 1 żądanie/s; do ok. 50 plansz i ok. 200 karteczek na planszę (założenie A-10).
- 6 months: bez zmian — nadal 1 użytkownik; ewentualne przeniesienie na VPS.
- Wydajność: plansza z 200 karteczkami otwiera się w < 2 s w sieci lokalnej; zapis zmiany karteczki < 500 ms.
- Eksport i import planszy z 200 karteczkami < 2 s; pełna kopia 50 plansz < 10 s.
- Limity plików: 5 MB dla eksportu planszy, 50 MB dla pełnej kopii; do 500 własnych wpisów GSP.

## Budget
- Infrastructure: 0 zł (własny sprzęt). Po przeniesieniu na VPS: ok. 20–30 zł/mies.
- Tooling: wyłącznie darmowe i otwarte narzędzia.

## Compliance & Security
- Brak wymagań formalnych (RODO/HIPAA/SOC2): dane prywatne jedynego użytkownika, przechowywane lokalnie (założenie A-11).
- Brak uwierzytelniania w MVP — aplikacja nie może być wystawiona poza sieć lokalną (założenie A-9).
- Walidacja danych wejściowych po stronie serwera; ochrona przed XSS w treści karteczek; zapytania parametryzowane.
- Sekrety (np. hasło do bazy) wyłącznie w zmiennych środowiskowych, nie w repozytorium.
- Wczytywane pliki są niezaufanym wejściem: limit rozmiaru, pełna walidacja struktury i wartości po stronie serwera przed zapisem, zapis w jednej transakcji, treść traktowana jak dane (ochrona przed XSS).

## Tech Stack Preferences
- Language: to be decided in Design phase
- Framework: to be decided in Design phase
- Database: to be decided in Design phase
- ORM: to be decided in Design phase
- Additional: interaktywna plansza z przeciąganiem (mysz i dotyk); interfejs po polsku; brak usług zewnętrznych w czasie działania.
