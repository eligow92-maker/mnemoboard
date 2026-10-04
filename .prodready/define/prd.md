# Product Requirements Document (PRD)

## 1. Executive Summary

**Product**: Mnemoboard
**Problem**: Suche fakty (daty, liczby, nazwiska, pojęcia) słabo zostają w pamięci, a stosowanie mnemotechnik wymaga żmudnej pracy ręcznej i nie daje informacji, czy skojarzenia faktycznie działają.
**Solution**: Aplikacja webowa z planszą, na której przykleja się karteczki z zagadnieniami i słowami-obrazami, układa je w mapę myśli, łańcuch lub pokoje pałacu pamięci, a następnie sprawdza zapamiętanie w prostej powtórce.
**Target Users**: Jedna osoba ucząca się na własne potrzeby (autor), na komputerze i telefonie w sieci domowej.
**Success Metric**: ≥ 80% karteczek odtworzonych poprawnie w powtórce wykonanej co najmniej tydzień po utworzeniu planszy; pomocniczo ≥ 3 sesje powtórki tygodniowo po miesiącu.

## 2. Goals & Non-Goals

### Goals
- Umożliwić szybkie zbudowanie planszy z karteczkami i słowami-obrazami dla dowolnego tematu.
- Zdjąć z użytkownika zamianę cyfr na słowa: algorytm oparty na Głównym Systemie Pamięciowym z listą, którą można dopasować do siebie.
- Obsłużyć trzy techniki jednym edytorem: połączenia, uporządkowany łańcuch, nazwane pokoje.
- Pozwolić sprawdzić zapamiętanie i mierzyć je w czasie.
- Udostępnić te same dane na komputerze i telefonie.
- Iteracja 2: wzbogacić karteczkę (opowiadanie, emotki, kolor), dać własne wpisy GSP dla dłuższych liczb i zabezpieczyć dane eksportem, importem oraz ręczną kopią zapasową.

### Non-Goals
- Generowanie grafik oraz jakiekolwiek użycie AI/LLM.
- Powtórki rozłożone w czasie (SRS) i przypomnienia.
- Konta, logowanie, wielu użytkowników, wystawienie do internetu.
- Akronimy, rymowanki, współdzielenie plansz, edycja równoczesna, aplikacje natywne.
- Wgrywanie plików graficznych, automatyczne kopie zapasowe, przywracanie z zastąpieniem danych, wbudowana lista GSP 000–999, statystyki per kolor.

## 3. User Personas

### Persona 1: Uczący się (właściciel aplikacji)
- **Context**: Osoba techniczna ucząca się faktów na własny użytek; zna podstawy mnemotechnik; tworzy materiały przy komputerze, powtarza z telefonu.
- **Pain Point**: Ręczna zamiana liczb na słowa i rysowanie układów na papierze zabiera czas, a postępów nie da się zmierzyć.
- **Desired Outcome**: Po tygodniu odtwarza z pamięci większość karteczek z planszy i widzi to w statystykach.

## 4. Functional Requirements

### FR-1: Plansze
- Tworzenie, zmiana nazwy i usuwanie plansz; pusty stan przy pierwszym uruchomieniu.
- **Acceptance**: nazwa wymagana; usunięcie po potwierdzeniu kasuje całą zawartość planszy (US-001, US-002).

### FR-2: Karteczki
- Karteczka ma zagadnienie (wymagane), opcjonalne słowa-obrazy i położenie na planszy.
- Dodawanie, przeciąganie, edycja i usuwanie; każda zmiana jest utrwalana.
- **Acceptance**: stan planszy jest identyczny po odświeżeniu; usunięcie karteczki usuwa jej połączenia (US-003, US-004, US-005).

### FR-3: Generator słów-obrazów
- Akcja "Generuj słowa" wyszukuje w zagadnieniu ciągi cyfr, dzieli każdy na pary od lewej (ostatnia pojedyncza cyfra osobno) i podstawia słowa z listy GSP.
- Lista GSP ma 110 haseł (0–9, 00–99) z wartościami startowymi; każde hasło można zmienić i przywrócić.
- Dla zagadnień bez cyfr użytkownik wpisuje słowa-obrazy sam; generator nie nadpisuje istniejących słów bez potwierdzenia.
- **Acceptance**: "1410" → słowa dla 14 i 10; zmienione hasło jest używane przy kolejnych generacjach (US-006, US-007).

### FR-4: Układanie
- Połączenie zwykłe (mapa myśli): jedna linia na parę karteczek.
- Ogniwo łańcucha: skierowane, najwyżej jeden następnik i poprzednik, bez pętli; karteczki pokazują numer kolejności.
- Strefa-pokój: nazwany prostokąt na planszy; karteczka w jego obrębie jest przypisana do pokoju.
- **Acceptance**: reguły łańcucha są egzekwowane z komunikatem; usunięcie strefy zachowuje karteczki (US-008, US-009, US-010).

### FR-5: Powtórka i statystyki
- Powtórka pokazuje zagadnienie, zakrywa słowa-obrazy (i nazwę pokoju); po odsłonięciu użytkownik ocenia "Pamiętałem" / "Nie pamiętałem".
- Kolejność: najpierw łańcuchy po kolei, potem pozostałe karteczki; karteczki bez słów-obrazów są pomijane.
- Każdy wynik jest zapisywany z datą; po powtórce podsumowanie z wynikiem procentowym.
- Lista plansz pokazuje wynik i datę ostatniej powtórki; statystyki pokazują liczbę sesji z ostatnich 7 dni.
- **Acceptance**: US-011, US-012, US-013.

### FR-6: Komputer i telefon
- Interfejs responsywny od 375 px szerokości, przeciąganie dotykiem, wspólne dane na serwerze.
- **Acceptance**: US-014.

### FR-7: Bogatsze karteczki (iteracja 2)
- Karteczka ma opcjonalne opowiadanie (do 2000 znaków), emotki (do 8, co najmniej 24 px na planszy) i jeden z 5 kolorów (domyślnie żółty).
- W powtórce opowiadanie i emotki są zakryte i odsłaniane razem ze słowami-obrazami; do powtórki nadal wchodzą tylko karteczki ze słowami-obrazami.
- Przy rozpoczynaniu powtórki można zawęzić ją do wybranych kolorów; kolejność łańcucha jest zachowana.
- **Acceptance**: US-015, US-016, US-017, US-018.

### FR-8: Własne wpisy GSP (iteracja 2)
- Użytkownik dodaje, zmienia i usuwa własne wpisy: ciąg 3–15 cyfr → słowo lub fraza (np. 333 → "mumia-mysz").
- Generator szuka własnych wpisów od lewej (najdłuższy wygrywa), a pozostałe fragmenty dzieli na pary jak dotąd.
- **Acceptance**: "48333" → słowo dla 48 i "mumia-mysz" (US-019, US-020).

### FR-9: Eksport, import i kopie zapasowe (iteracja 2)
- Eksport planszy do pliku JSON i import, który zawsze tworzy nową planszę.
- Pełna kopia: jeden plik ze wszystkimi planszami, historią powtórek i listą GSP; przywrócenie tylko dokłada dane, po potwierdzeniu.
- Błędny lub zbyt duży plik jest odrzucany w całości.
- **Acceptance**: US-021, US-022, US-023.

## 5. Non-Functional Requirements

- **Performance**: plansza z 200 karteczkami otwiera się w < 2 s w sieci lokalnej; zapis zmiany < 500 ms; eksport i import planszy < 2 s; pełna kopia 50 plansz < 10 s.
- **Security**: brak uwierzytelniania w MVP — wyłącznie sieć lokalna; walidacja wejścia po stronie serwera, ochrona przed XSS, zapytania parametryzowane, sekrety w zmiennych środowiskowych; wczytywane pliki są niezaufanym wejściem (limit 5 MB / 50 MB, pełna walidacja, jedna transakcja).
- **Availability**: Docker Compose na domowym serwerze/komputerze; działa bez dostępu do internetu; brak wymagań SLA.
- **Budget**: 0 zł; tylko darmowe i otwarte narzędzia.

## 6. Data Model Summary

### Entities
- **Board**: plansza — nazwa.
- **Note**: karteczka — zagadnienie, słowa-obrazy, opowiadanie, emotki, kolor, położenie, opcjonalny pokój.
- **Zone**: strefa-pokój — nazwa, położenie i rozmiar.
- **Connection**: połączenie dwóch karteczek — rodzaj `association` lub `chain`.
- **PegWord**: hasło listy GSP — liczba, słowo aktualne, słowo startowe (brak = własny wpis 3–15 cyfr).
- **ReviewSession**: sesja powtórki planszy — początek i koniec.
- **ReviewResult**: wynik jednej karteczki w sesji — pamiętał / nie pamiętał, data.

### Key Relationships
- Board → Note, Zone, Connection, ReviewSession: 1:N, kaskadowe usuwanie.
- Zone → Note: 1:N, opcjonalna; usunięcie strefy odpina karteczki.
- Note → Connection: karteczka jest źródłem lub celem połączeń.
- ReviewSession → ReviewResult ← Note: wynik łączy sesję z karteczką.

## 7. Scope & Timeline

- **MVP Features**: plansze; karteczki; generator GSP z edytowalną listą; połączenia, łańcuch, pokoje; powtórka z samooceną; statystyki; obsługa telefonu.
- **Iteracja 2**: opowiadanie, emotki i kolory karteczek; filtr koloru w powtórce; własne wpisy GSP; eksport i import planszy; ręczna pełna kopia.
- **Future Features**: SRS; konta i VPS; akronimy/rymowanki; podpowiedzi AI i grafiki; wgrywanie obrazów; automatyczne kopie; współdzielenie.
- **Timeline**: bez twardego terminu, jakość ponad datę.
- **Team**: jedna osoba, po godzinach.

## 8. Open Questions & Risks

- Startowa lista 110 polskich słów GSP wymaga ręcznego przygotowania; jej jakość decyduje o użyteczności generatora.
- Edytor planszy z przeciąganiem, połączeniami i strefami na dotyku to największe ryzyko techniczne MVP.
- Brak logowania jest bezpieczny tylko w sieci lokalnej; przeniesienie na VPS wymaga wcześniej uwierzytelniania i HTTPS.
- Kopia zapasowa jest ręczna — chroni tylko wtedy, gdy użytkownik ją pobiera; dwukrotne przywrócenie tej samej kopii dubluje plansze.
- Pozostałe założenia (A-2…A-12, B-1…B-12) spisano w `discovery.md`.

## 9. References

- Discovery trail: `discovery.md`
- Detailed user stories: `requirements/user-stories.md`
- Data model details: `data-model/entities.md`, `data-model/schema.sql`
- Test scenarios: `test-scenarios/*.feature`
- Constraints: `constraints.md`, `constitution.md`
