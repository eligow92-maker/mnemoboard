# User Stories

Jedyny typ użytkownika w MVP: **uczący się** (właściciel aplikacji, bez logowania).

## Epic 1: Plansze

### US-001: Utworzenie pierwszej planszy
**As a** uczący się
**I want to** utworzyć planszę o wybranej nazwie
**So that** mam miejsce na karteczki z jednego tematu

**Acceptance Criteria**:
AC-1: Given w aplikacji nie ma żadnej planszy, when otwieram aplikację, then widzę pusty stan z komunikatem i przyciskiem "Utwórz pierwszą planszę".
AC-2: Given lista plansz, when tworzę planszę o nazwie "Historia Polski", then plansza pojawia się na liście i otwiera się jako pusta.
AC-3: Given formularz nowej planszy, when zatwierdzam pustą nazwę, then plansza nie powstaje i widzę komunikat "Podaj nazwę planszy".

**Priority**: P0
**Estimate**: S

---

### US-002: Zarządzanie planszami
**As a** uczący się
**I want to** zmieniać nazwę i usuwać plansze
**So that** lista plansz pozostaje uporządkowana

**Acceptance Criteria**:
AC-1: Given plansza "Historia", when zmieniam jej nazwę na "Historia Polski", then na liście plansz widnieje nowa nazwa.
AC-2: Given plansza z karteczkami, when wybieram usunięcie, then aplikacja pyta o potwierdzenie przed usunięciem.
AC-3: Given potwierdzone usunięcie planszy, when wracam do listy, then plansza oraz jej karteczki, połączenia, strefy i wyniki powtórek nie istnieją.

**Priority**: P1
**Estimate**: S

---

## Epic 2: Karteczki

### US-003: Przyklejenie karteczki do planszy
**As a** uczący się
**I want to** przykleić do planszy karteczkę z zagadnieniem
**So that** każda rzecz do zapamiętania ma swoje miejsce

**Acceptance Criteria**:
AC-1: Given otwarta plansza, when dodaję karteczkę z zagadnieniem "1410 – bitwa pod Grunwaldem" w wybranym miejscu, then karteczka jest widoczna w tym miejscu z tym zagadnieniem.
AC-2: Given formularz karteczki, when zatwierdzam puste zagadnienie, then karteczka nie powstaje i widzę komunikat "Wpisz zagadnienie".
AC-3: Given plansza z dodaną karteczką, when odświeżam stronę, then karteczka ma to samo zagadnienie i to samo położenie.

**Priority**: P0
**Estimate**: M

---

### US-004: Przesuwanie, edycja i usuwanie karteczki
**As a** uczący się
**I want to** przesuwać, poprawiać i usuwać karteczki
**So that** mogę swobodnie przebudowywać układ

**Acceptance Criteria**:
AC-1: Given karteczka na planszy, when przeciągam ją w inne miejsce i odświeżam stronę, then karteczka znajduje się w nowym miejscu.
AC-2: Given karteczka z zagadnieniem "1410", when zmieniam zagadnienie na "15.07.1410", then karteczka pokazuje nowe zagadnienie.
AC-3: Given karteczka mająca połączenia, when ją usuwam, then karteczka i wszystkie jej połączenia znikają z planszy.

**Priority**: P0
**Estimate**: M

---

### US-005: Ręczne słowa-obrazy
**As a** uczący się
**I want to** wpisać własne słowa-obrazy do karteczki
**So that** mogę zapamiętywać także treści nieliczbowe

**Acceptance Criteria**:
AC-1: Given karteczka z zagadnieniem "Mitochondrium", when wpisuję słowa-obrazy "mity, chondryt" i zapisuję, then karteczka pokazuje te słowa-obrazy pod zagadnieniem.
AC-2: Given karteczka z zagadnieniem bez cyfr, when używam akcji "Generuj słowa", then słowa nie są generowane i widzę komunikat "Brak liczb – wpisz słowa-obrazy samodzielnie".

**Priority**: P0
**Estimate**: S

---

## Epic 3: Generator słów-obrazów

### US-006: Generowanie słów-obrazów dla liczb
**As a** uczący się
**I want to** otrzymać słowa-obrazy dla liczb i dat z karteczki
**So that** nie muszę ręcznie zamieniać cyfr na słowa

**Acceptance Criteria**:
AC-1: Given karteczka z zagadnieniem "1410", when używam akcji "Generuj słowa", then otrzymuję kolejno słowo z listy GSP dla "14" i słowo dla "10".
AC-2: Given karteczka z zagadnieniem "15.07.1410", when używam akcji "Generuj słowa", then otrzymuję kolejno słowa dla "15", "07", "14" i "10".
AC-3: Given karteczka z zagadnieniem "966", when używam akcji "Generuj słowa", then otrzymuję słowo dla "96" i słowo dla pojedynczej cyfry "6".
AC-4: Given karteczka mająca już słowa-obrazy, when używam akcji "Generuj słowa", then dotychczasowe słowa pozostają bez zmian do chwili potwierdzenia zastąpienia.

**Priority**: P0
**Estimate**: M

---

### US-007: Edytowalna lista słów GSP
**As a** uczący się
**I want to** przeglądać i zmieniać słowa przypisane do liczb
**So that** generator używa moich własnych skojarzeń

**Acceptance Criteria**:
AC-1: Given świeżo zainstalowana aplikacja, when otwieram listę GSP, then widzę niepuste słowo dla każdego z 110 haseł (0–9 oraz 00–99).
AC-2: Given lista GSP, when zmieniam słowo dla "14" na "tur", then generowanie dla zagadnienia "14" zwraca "tur".
AC-3: Given lista GSP, when zapisuję puste słowo dla hasła, then zmiana jest odrzucona i hasło zachowuje poprzednie słowo.
AC-4: Given hasło ze zmienionym słowem, when używam akcji "Przywróć domyślne", then hasło ma ponownie słowo startowe.

**Priority**: P0
**Estimate**: M

---

## Epic 4: Układanie karteczek

### US-008: Połączenia mapy myśli
**As a** uczący się
**I want to** łączyć karteczki liniami
**So that** widzę zależności między zagadnieniami

**Acceptance Criteria**:
AC-1: Given dwie karteczki na planszy, when łączę je i odświeżam stronę, then między karteczkami widoczna jest linia.
AC-2: Given dwie już połączone karteczki, when łączę je ponownie, then drugie połączenie nie powstaje.
AC-3: Given połączenie dwóch karteczek, when usuwam połączenie, then linia znika, a obie karteczki pozostają na planszy.

**Priority**: P0
**Estimate**: M

---

### US-009: Łańcuch skojarzeń
**As a** uczący się
**I want to** ustawić karteczki w łańcuch o ustalonej kolejności
**So that** mogę zapamiętać sekwencję jako historyjkę

**Acceptance Criteria**:
AC-1: Given karteczki A, B i C, when tworzę ogniwa łańcucha A→B i B→C, then karteczki pokazują numery kolejności 1, 2 i 3.
AC-2: Given karteczka A z ogniwem wychodzącym A→B, when tworzę ogniwo A→C, then ogniwo nie powstaje i widzę komunikat "Karteczka ma już następnik w łańcuchu".
AC-3: Given łańcuch A→B→C, when tworzę ogniwo C→A, then ogniwo nie powstaje i widzę komunikat "Łańcuch nie może tworzyć pętli".

**Priority**: P0
**Estimate**: M

---

### US-010: Pokoje pałacu pamięci
**As a** uczący się
**I want to** tworzyć na planszy nazwane strefy-pokoje i umieszczać w nich karteczki
**So that** kojarzę informacje z miejscem

**Acceptance Criteria**:
AC-1: Given otwarta plansza, when tworzę strefę o nazwie "Kuchnia", then strefa z tą nazwą jest widoczna na planszy.
AC-2: Given strefa "Kuchnia", when upuszczam karteczkę w jej obrębie, then karteczka jest przypisana do pokoju "Kuchnia".
AC-3: Given karteczka przypisana do pokoju "Kuchnia", when przeciągam ją poza strefę, then karteczka nie jest przypisana do żadnego pokoju.
AC-4: Given strefa zawierająca karteczki, when usuwam strefę, then karteczki pozostają na planszy bez przypisanego pokoju.

**Priority**: P0
**Estimate**: L

---

## Epic 5: Powtórka i postępy

### US-011: Przebieg powtórki
**As a** uczący się
**I want to** przejść powtórkę planszy z zakrytymi słowami-obrazami
**So that** sprawdzam, co faktycznie pamiętam

**Acceptance Criteria**:
AC-1: Given plansza z karteczkami mającymi słowa-obrazy, when rozpoczynam powtórkę, then widzę zagadnienie pierwszej karteczki, a jej słowa-obrazy są zakryte.
AC-2: Given karteczka w powtórce z zakrytymi słowami-obrazami, when wybieram "Odsłoń", then widzę słowa-obrazy oraz przyciski "Pamiętałem" i "Nie pamiętałem".
AC-3: Given odsłonięta karteczka, when wybieram "Pamiętałem", then wynik zostaje zapisany z bieżącą datą i pojawia się następna karteczka.
AC-4: Given ostatnia karteczka powtórki została oceniona, when powtórka się kończy, then widzę podsumowanie z liczbą zapamiętanych, liczbą wszystkich i wynikiem procentowym.

**Priority**: P0
**Estimate**: L

---

### US-012: Zakres i kolejność powtórki
**As a** uczący się
**I want to** aby powtórka obejmowała właściwe karteczki we właściwej kolejności
**So that** łańcuch odtwarzam po kolei, a w pałacu przypominam sobie także miejsce

**Acceptance Criteria**:
AC-1: Given plansza z łańcuchem A→B→C, when rozpoczynam powtórkę, then karteczki pojawiają się w kolejności A, B, C.
AC-2: Given plansza z karteczką bez słów-obrazów, when przechodzę powtórkę, then ta karteczka nie pojawia się w powtórce.
AC-3: Given plansza, na której żadna karteczka nie ma słów-obrazów, when rozpoczynam powtórkę, then powtórka się nie rozpoczyna i widzę komunikat "Dodaj słowa-obrazy, aby rozpocząć powtórkę".
AC-4: Given karteczka w powtórce przypisana do pokoju "Kuchnia", when wybieram "Odsłoń", then obok słów-obrazów widoczna jest nazwa pokoju "Kuchnia".

**Priority**: P0
**Estimate**: M

---

### US-013: Statystyki zapamiętywania
**As a** uczący się
**I want to** widzieć wyniki powtórek i regularność nauki
**So that** wiem, czy metoda działa i czy uczę się systematycznie

**Acceptance Criteria**:
AC-1: Given plansza z ukończoną powtórką o wyniku 8 z 10, when otwieram listę plansz, then przy planszy widzę wynik ostatniej powtórki "80%" wraz z jej datą.
AC-2: Given 3 ukończone powtórki w ciągu ostatnich 7 dni, when otwieram statystyki, then widzę "Powtórki w ostatnich 7 dniach: 3".
AC-3: Given plansza bez żadnej ukończonej powtórki, when otwieram listę plansz, then przy planszy widzę "Brak powtórek".

**Priority**: P0
**Estimate**: M

---

## Epic 6: Komputer i telefon

### US-014: Praca na telefonie
**As a** uczący się
**I want to** korzystać z tych samych plansz na telefonie
**So that** tworzę przy biurku, a powtarzam gdziekolwiek w domu

**Acceptance Criteria**:
AC-1: Given ekran o szerokości 375 px, when przechodzę powtórkę, then wszystkie elementy powtórki mieszczą się na ekranie bez przewijania w poziomie.
AC-2: Given plansza otwarta na urządzeniu dotykowym, when przeciągam karteczkę palcem, then karteczka zmienia położenie.
AC-3: Given karteczka dodana na jednym urządzeniu, when otwieram tę planszę na drugim urządzeniu, then widzę tę karteczkę.

**Priority**: P0
**Estimate**: L
