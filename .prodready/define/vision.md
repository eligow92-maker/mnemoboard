# Vision

## Problem Statement
Suche fakty — daty, liczby, nazwiska, pojęcia — trudno zapamiętać przez samo powtarzanie. Mnemotechniki (słowa-obrazy, mapa myśli, pałac pamięci, łańcuch skojarzeń) działają, ale wymagają żmudnej pracy ręcznej: zamiany cyfr na słowa, rozrysowania układu na kartce i pilnowania, czy skojarzenia faktycznie zostały w głowie. Brakuje jednego miejsca, w którym można zbudować taki układ, dostać podpowiedź słów dla liczb i sprawdzić, co się zapamiętało.

## Target Users
- MVP: jedna osoba — autor aplikacji — ucząca się na własne potrzeby, na komputerze i telefonie w domowej sieci.
- Przyszłość (poza MVP): osoby uczące się faktów (uczniowie, studenci) jako użytkownicy publicznego produktu z kontami.

## Core Value Proposition
Jedna plansza, na której przyklejam karteczki z tym, co chcę zapamiętać, dostaję dla liczb gotowe słowa-obrazy, układam karteczki w mapę myśli, łańcuch lub pokoje pałacu pamięci — i od razu sprawdzam w powtórce, czy pamiętam.

## Success Metrics
- Główny: w powtórce planszy wykonanej co najmniej 7 dni po jej utworzeniu użytkownik odtwarza poprawnie ≥ 80% karteczek.
- Pomocniczy: po miesiącu od pierwszego użycia użytkownik wykonuje ≥ 3 sesje powtórki tygodniowo.
- Oba mierniki są odczytywane ze statystyk aplikacji (wyniki powtórek z datami).
- Iteracja 2: plansza po eksporcie i imporcie ma te same karteczki, strefy i połączenia co oryginał (100% zgodności).

## MVP Scope

### Must Have (MVP)
- Plansze: tworzenie, zmiana nazwy, usuwanie, pusty stan przy pierwszym uruchomieniu.
- Karteczki przyklejane do planszy: zagadnienie + słowa-obrazy, przesuwanie, edycja, usuwanie.
- Karteczka (iteracja 2): opcjonalne opowiadanie, emotki i jeden z 5 kolorów.
- Słowa-obrazy: generowane algorytmicznie dla liczb/dat (Główny System Pamięciowy), wpisywane ręcznie dla pozostałych treści.
- Edytowalna lista słów GSP (0–9 i 00–99) z wbudowanymi wartościami startowymi.
- Własne wpisy GSP (iteracja 2): dowolny ciąg 3–15 cyfr z własnym słowem lub frazą, używany przez generator w pierwszej kolejności.
- Trzy sposoby układania na jednej planszy: połączenia (mapa myśli), ogniwa z kolejnością (łańcuch), nazwane strefy-pokoje (pałac pamięci).
- Prosty tryb powtórki: widoczne zagadnienie, zakryte słowa-obrazy, odsłonięcie, samoocena, podsumowanie.
- Filtr koloru w powtórce (iteracja 2).
- Eksport i import pojedynczej planszy oraz ręczna pełna kopia zapasowa z przywracaniem (iteracja 2).
- Statystyki: wynik ostatniej powtórki planszy i liczba sesji z ostatnich 7 dni.
- Działanie na komputerze i telefonie (dotyk), wspólne dane na serwerze domowym.

### Nice to Have (Future)
- Powtórki rozłożone w czasie (SRS) z automatycznym harmonogramem.
- Konta użytkowników, logowanie i wdrożenie na VPS / wersja publiczna.
- Akronimy i rymowanki jako osobne typy karteczek.
- Podpowiedzi skojarzeń dla treści nieliczbowych (model językowy) i generowanie grafik.
- Wgrywanie własnych plików graficznych na karteczki.
- Automatyczne kopie zapasowe na serwerze i przywracanie z zastąpieniem danych.
- Wbudowana lista GSP 000–999 i statystyki per kolor.
- Współdzielenie plansz i edycja równoczesna.
