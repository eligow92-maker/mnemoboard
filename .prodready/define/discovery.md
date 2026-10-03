# Discovery Record

- Status: completed
- Stop option offered: yes
- Initial request: "Chcę zbudować aplikację Mnemoboard, która służy do zapamiętywania informacji za pomocą podstawowych mnemotechnik, widzę m.in. możliwość tworzenia mapy myśli, na nim karteczki (które się przykleja do planszy) z danym zagadnieniem (np. data) wraz z generacją obrazów (słów), które to wizualizują"

## Known Facts
- Nazwa produktu: Mnemoboard.
- Cel: zapamiętywanie informacji za pomocą podstawowych mnemotechnik.
- Użytkownik może tworzyć mapę myśli (plansza).
- Na planszy przykleja się karteczki z zagadnieniem (np. data).
- "Generacja obrazów" oznacza generowanie słów-obrazów (tekst), a nie grafiki AI.
- Karteczki obejmują zarówno liczby/daty, jak i treści nieliczbowe (nazwiska, pojęcia, słówka).
- Słowa-obrazy dla liczb/dat generuje algorytm; dla treści nieliczbowych użytkownik wpisuje je ręcznie. Brak zależności od AI/LLM.
- Grupa docelowa MVP: sam autor (narzędzie osobiste, jeden użytkownik). Publiczny produkt z kontami to możliwa przyszłość, nie MVP.
- MVP zawiera prosty tryb powtórki (zakrycie treści + samoocena); powtórki rozłożone w czasie (SRS) poza MVP.
- MVP obejmuje trzy techniki: mapę myśli, pałac pamięci i metodę łańcuchową. Akronimy/rymowanki nie zostały wybrane.
- Techniki nie są osobnymi modułami: jeden edytor planszy, jeden typ karteczki; połączenia (mapa myśli), uporządkowane połączenia (łańcuch), nazwane strefy-pokoje (pałac).
- Platformy: komputer i telefon z tymi samymi planszami → potrzebny serwer z bazą danych oraz interfejs responsywny/dotykowy.
- Wdrożenie: MVP na domowym serwerze/komputerze (sieć lokalna, 0 zł); VPS dopiero później. Logowanie nie jest wymagane w MVP, ale stanie się konieczne przed wystawieniem do internetu.
- Generator liczb: polski Główny System Pamięciowy (GSP), wbudowana lista startowa słów dla 00–99, edytowalna przez użytkownika; liczba dzielona na pary cyfr i zamieniana na słowa z listy.
- Stack technologiczny: bez preferencji użytkownika; decyzja w fazie Design.
- Mierniki sukcesu: główny — skuteczność powtórek; pomocniczy — regularność użycia. Tryb powtórki musi zapisywać wynik każdej karteczki z datą oraz daty sesji.
- Progi sukcesu potwierdzone: ≥80% karteczek odtworzonych w powtórce po tygodniu; ≥3 sesje powtórki tygodniowo po miesiącu.
- Kierunek powtórki: widoczne jest zagadnienie, zakryte są słowa-obrazy; użytkownik odtwarza skojarzenie.
- Zespół i harmonogram: jedna osoba, po godzinach, bez twardego terminu; liczy się jakość.

## Questions and Answers
1. Q: Co dokładnie ma powstać po "generacji obrazów (słów)" dla karteczki, np. z datą 1410 — słowa-obrazy wg systemu mnemotechnicznego, grafika wygenerowana przez AI, czy jedno i drugie?
   A: Słowa-obrazy (wariant a) — aplikacja generuje słowa, obraz powstaje w głowie użytkownika; bez generowania grafiki AI.
2. Q: Jakie rodzaje informacji mają trafiać na karteczki i być zamieniane na słowa-obrazy — tylko liczby/daty, czy także treści nieliczbowe (nazwiska, pojęcia, słówka)?
   A: Oba — liczby/daty oraz treści nieliczbowe (nazwiska, pojęcia, słówka).
3. Q: Skąd mają pochodzić słowa-obrazy dla treści nieliczbowych — z modelu językowego (AI), wpisywane ręcznie przez użytkownika, czy AI proponuje, a użytkownik edytuje?
   A: Użytkownik wpisuje je sam (wariant b) — brak modelu językowego; automatyczna generacja dotyczy tylko liczb/dat.
4. Q: Dla kogo jest Mnemoboard — narzędzie osobiste dla jednej osoby, czy publiczny produkt dla wielu użytkowników z kontami (i jakiej grupy)?
   A: Na początek narzędzie osobiste; w przyszłości być może publiczny produkt.
5. Q: Czy MVP ma sprawdzać, czy faktycznie zapamiętałeś (tryb powtórki/quizu), czy wystarczy samo tworzenie plansz z karteczkami?
   A: Prosty tryb powtórki (wariant b) — aplikacja zakrywa treść karteczki, użytkownik odtwarza ją z pamięci i sam zaznacza, czy pamiętał. Bez harmonogramu powtórek rozłożonych w czasie.
6. Q: Napisałeś "m.in." — jakie inne mnemotechniki lub funkcje poza planszą z karteczkami i słowami-obrazami mają wejść do MVP, a które mogą poczekać?
   A: Pałac pamięci i metoda łańcuchowa mają wejść do MVP (obok mapy myśli).
7. Q: MVP ma teraz trzy techniki (mapa myśli, pałac pamięci, łańcuch) plus tryb powtórki. Która jedna musi działać wyjątkowo dobrze i czy pałac/łańcuch mogą być uproszczonymi wariantami tej samej planszy zamiast osobnych modułów?
   A: Wariant a — jedna plansza, trzy sposoby układania tych samych karteczek: mapa myśli = połączenia, łańcuch = połączenia z ustaloną kolejnością, pałac = nazwane strefy-"pokoje" na planszy.
8. Q: Na czym będziesz używać Mnemoboard — tylko w przeglądarce na komputerze, czy także na telefonie, i czy plansze mają być dostępne na kilku urządzeniach?
   A: Komputer i telefon, te same plansze na obu urządzeniach (wariant b).
9. Q: Gdzie aplikacja ma działać, żeby telefon i komputer widziały te same plansze — własny VPS, serwer domowy w sieci lokalnej, czy darmowa chmura — i jaki jest budżet miesięczny?
   A: Na początek domowy serwer/komputer; w późniejszym etapie VPS.
10. Q: Według jakiego systemu algorytm ma zamieniać liczby na słowa-obrazy i w jakim języku — polski Główny System Pamięciowy ze słownikiem polskich słów, własna stała lista 00–99, czy coś innego?
    A: Wariant c — Główny System Pamięciowy z gotową, edytowalną listą startową 00–99; liczby dzielone na pary cyfr.
11. Q: Czy masz preferencje technologiczne (język, framework, baza danych), czy wybór zostawiasz na fazę Design?
    A: Brak preferencji — stack zostanie dobrany i uzasadniony w fazie Design.
12. Q: Po czym poznasz, że Mnemoboard działa — jaki mierzalny wynik uznasz za sukces (np. odsetek karteczek odtworzonych w powtórce, liczba plansz używanych po miesiącu)?
    A: Wariant c — skuteczność powtórek jako miernik główny, regularność użycia jako pomocniczy.
13. Q: Kto to buduje i w jakim czasie — sam, po godzinach, z jakim terminem na pierwszą działającą wersję?
    A: Sam, po godzinach, bez twardego terminu — liczy się jakość, nie data.
14. Q: (pytanie otwarte z bramki Define) Czy progi sukcesu — ≥80% karteczek odtworzonych po tygodniu i ≥3 powtórki tygodniowo po miesiącu — zostają?
    A: Zostają.
15. Q: (pytanie otwarte z bramki Define) Kierunek powtórki: widzisz słowa-obrazy i odtwarzasz zagadnienie, czy odwrotnie?
    A: Odwrotnie — widzę zagadnienie, odtwarzam skojarzenie (słowa-obrazy).

## Assumptions
- A-1: (potwierdzone przez użytkownika w odpowiedzi 14 — już nie założenie) Progi mierników sukcesu.
- A-2: Liczba o nieparzystej liczbie cyfr jest dzielona na pary od lewej, a ostatnia pojedyncza cyfra korzysta z dodatkowych haseł 0–9; lista GSP ma więc 110 haseł (0–9 oraz 00–99).
- A-3: Generator wyszukuje w zagadnieniu wszystkie ciągi cyfr (np. "15.07.1410" → 15, 07, 14, 10) i każdy zamienia osobno; reszta tekstu jest ignorowana.
- A-4: Wygenerowane słowa są propozycją, którą użytkownik może edytować; istniejących słów-obrazów generator nie nadpisuje bez potwierdzenia.
- A-5: Kierunek powtórki ustalił użytkownik (odpowiedź 15). Założeniem pozostaje, że karteczki bez słów-obrazów są pomijane (nie ma czego odtwarzać) oraz że nazwa pokoju jest częścią skojarzenia — jest zakryta i odsłaniana razem ze słowami-obrazami.
- A-6: Kolejność powtórki: najpierw karteczki połączone w łańcuch w kolejności łańcucha, potem pozostałe w kolejności utworzenia.
- A-7: Karteczka ma najwyżej jedno ogniwo łańcucha wychodzące i jedno wchodzące; łańcuch nie może tworzyć pętli. Na planszy może być kilka łańcuchów.
- A-8: Karteczka należy do najwyżej jednej strefy-pokoju; przynależność wynika z położenia karteczki w obrębie strefy.
- A-9: Brak logowania i kont w MVP, bo aplikacja działa wyłącznie w sieci lokalnej. Logowanie jest warunkiem wstępnym przeniesienia na VPS.
- A-10: Skala: 1 użytkownik, do ok. 50 plansz i ok. 200 karteczek na planszę; brak edycji równoczesnej — zmiany z drugiego urządzenia widać po odświeżeniu.
- A-11: Interfejs w języku polskim; brak wymagań zgodności (RODO itp.), bo dane są prywatne i przechowywane lokalnie u jedynego użytkownika.
- A-12: Schemat danych zapisany jako czysty SQL (dialekt PostgreSQL), bo ORM i baza zostaną wybrane w fazie Design.

## Open Questions
- (nieblokujące) Ostateczna treść startowej listy 110 polskich słów GSP — do przygotowania w fazie Implement; użytkownik może ją edytować.
- (nieblokujące) Eksport/kopia zapasowa plansz — poza MVP, do rozważenia przed przeniesieniem na VPS.
- (nieblokujące) Model kont i logowania dla przyszłej wersji publicznej.
