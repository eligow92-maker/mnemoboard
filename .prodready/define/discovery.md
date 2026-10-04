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

---

# Iteracja 2 (rozszerzenie po MVP) — 2026-10-04

- Status: completed
- Stop option offered: yes
- Initial request: "Chciałbym rozszerzyć aplikację o nowe funkcjonalności i małe upgrade'y: Pole dodatkowe zapamiętywania (np. zdanie lub opowiadanie) obok słowa-obrazy i zagadnienie i pole na obraz lub emotki, dodajmy też kilka kolorów (które mogą oznaczać ważność). dodatkowo chcę Eksport, import i kopie zapasowe plansz. Przydałoby się rozszerzenie GŚP do 999 (przydatne będzie zwłaszcza dla numerów telefonów) lub opcja dodania cyfry samemu, np. użytkownik podaje 333 i podaje mumia-mysz"

## Known Facts
- Stan wyjścia: wszystkie 23 zadania backlogu MVP mają status Done; faza Build nierozpoczęta.
- Karteczka dostaje dodatkowe pole zapamiętywania (zdanie lub opowiadanie) obok zagadnienia i słów-obrazów.
- Karteczka dostaje pole na obraz lub emotki.
- Karteczki mają mieć kilka kolorów, które mogą oznaczać ważność.
- Eksport, import i kopie zapasowe plansz wchodzą do zakresu (dotąd "poza MVP").
- GSP: własne wpisy użytkownika (dowolny ciąg cyfr → własne słowo/fraza) zamiast wbudowanej listy 000–999.
- Generator najpierw dopasowuje najdłuższy własny wpis, resztę ciągu dzieli na pary jak dotąd.
- Pole graficzne karteczki: w tej iteracji tylko emotki; wgrywanie plików graficznych odłożone na później.
- Emotki muszą być czytelne na karteczce na planszy — nie muszą być duże, ale ma być widać, co przedstawiają.
- Kopie zapasowe: w tej iteracji ręczne — pobranie jednego pliku ze wszystkimi danymi i przywrócenie z pliku; osobno eksport/import pojedynczej planszy. Kopie automatyczne odłożone na później.
- Wczytywanie plików ma być bezpieczne: import planszy zawsze dodaje nową planszę i niczego nie nadpisuje. Przywrócenie pełnej kopii działa tak samo — dokłada dane, nie zastępuje istniejących (interpretacja agenta odpowiedzi 4, do potwierdzenia przez użytkownika).
- Kolor karteczki: oznaczenie wizualne (znaczenie nadaje użytkownik) plus filtr koloru przy rozpoczynaniu powtórki. Bez statystyk per kolor.

## Questions and Answers
1. Q: Czy wystarczą własne wpisy GSP (dowolny ciąg cyfr → własne słowo lub fraza, generator dopasowuje najdłuższy wpis, reszta dzielona na pary), czy potrzebna jest wbudowana lista 1000 słów 000–999 z podziałem na trójki?
   A: Własne wpisy.
2. Q: Czy na karteczce wystarczą emotki, czy mają być też wgrywane własne pliki graficzne?
   A: Emotki najpierw, obrazy później; ważne, żeby były widoczne (nie muszą być duże, ale ma być widać, co to jest).
3. Q: Czy kopia zapasowa ma się robić automatycznie na serwerze, czy wystarczy ręczne pobranie pliku i przywrócenie z pliku?
   A: Ręcznie starczy na początku.
4. Q: Co ma się stać z istniejącymi danymi przy wczytywaniu pliku — import planszy dodaje nową planszę, a przywrócenie pełnej kopii zastępuje wszystko, czy kopia ma być scalana bez nadpisywania?
   A: "import planszy myślę bezpieczniejszy" — odczytane jako: wczytywanie ma tylko dodawać, bez zastępowania istniejących danych.
5. Q: Czy kolor karteczki ma być tylko oznaczeniem wizualnym, czy aplikacja ma go też używać jako ważności (filtr w powtórce, statystyki per kolor)?
   A: Wizualny + filtr koloru.
6. Q: (pytanie otwarte z bramki Define) Czy karteczka z samym opowiadaniem, bez słów-obrazów, ma wchodzić do powtórki?
   A: Nie wchodzi.

## Assumptions
- B-1: Dodatkowe pole nazywa się "Opowiadanie", jest opcjonalne, ma do 2000 znaków; na karteczce na planszy widoczne są jego pierwsze 2 wiersze, całość w edycji i w powtórce.
- B-2: W powtórce opowiadanie i emotki są częścią skojarzenia — zakryte i odsłaniane razem ze słowami-obrazami. Reguła zakresu powtórki się nie zmienia: karteczka wchodzi do powtórki tylko wtedy, gdy ma słowa-obrazy (samo opowiadanie nie wystarcza) — regułę zakresu potwierdził użytkownik w odpowiedzi 6.
- B-3: Pole emotek mieści do 8 emotek (znaków graficznych); użytkownik wpisuje je klawiaturą emotek systemu — aplikacja nie ma własnego wybieraka. Na planszy przy powiększeniu 100% emotki mają co najmniej 24 px.
- B-4: Paleta ma 5 kolorów: żółty (domyślny, także dla istniejących karteczek), czerwony, pomarańczowy, zielony, niebieski.
- B-5: Filtr koloru jest wybierany przy rozpoczynaniu powtórki; domyślnie zaznaczone są wszystkie kolory. Sesja z filtrem liczy się w statystykach jak każda inna, a wybór filtra nie jest zapamiętywany.
- B-6: Własny wpis GSP to ciąg 3–15 cyfr ze słowem lub frazą do 80 znaków; hasła 1–2-cyfrowe pozostają na wbudowanej liście 110 haseł. Własny wpis można zmienić i usunąć.
- B-7: Generator w każdym ciągu cyfr wyszukuje własne wpisy od lewej; przy kilku pasujących w tym samym miejscu wygrywa najdłuższy. Fragmenty przed, między i za dopasowaniami są dzielone na pary jak dotąd (np. własny wpis 333: "48333" → 48 + 333).
- B-8: Eksport planszy to jeden plik JSON z karteczkami, strefami i połączeniami, bez historii powtórek. Pełna kopia to jeden plik JSON ze wszystkimi planszami, historią powtórek i listą GSP.
- B-9: Import planszy tworzy nową planszę; przy zajętej nazwie dostaje ona dopisek " (import)". Wczytanie tego samego pliku dwa razy tworzy dwie plansze.
- B-10: Przywrócenie pełnej kopii tylko dokłada: każda plansza z pliku wchodzi jako nowa (z historią powtórek); słowo GSP z kopii trafia do hasła tylko wtedy, gdy użytkownik nie zmienił tego hasła; własne wpisy — tylko brakujące. Przed przywróceniem aplikacja pokazuje liczbę plansz do dodania i czeka na potwierdzenie.
- B-11: Wczytywany plik jest sprawdzany w całości przed zapisem — błędny plik niczego nie zmienia. Limity: 5 MB dla planszy, 50 MB dla pełnej kopii.
- B-12: Mierniki sukcesu produktu się nie zmieniają; miernikiem tej iteracji jest wierność kopii: plansza po eksporcie i imporcie ma te same karteczki, strefy i połączenia.

## Open Questions
- (nieblokujące) Wgrywanie plików graficznych na karteczki — odłożone; zmieni format eksportu (obrazy obok JSON).
- (nieblokujące) Automatyczne kopie zapasowe na serwerze — odłożone.
