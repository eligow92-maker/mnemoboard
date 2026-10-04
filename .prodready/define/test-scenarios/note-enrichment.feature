Feature: Bogatsze karteczki
  As a uczący się
  I want to dodawać do karteczek opowiadanie, emotki i kolor
  So that skojarzenia są pełniejsze, a ważne karteczki wyróżnione

  Background:
    Given otwarta plansza "Historia Polski"

  Scenario: [US-015] - Zapis opowiadania
    Given karteczka z zagadnieniem "1410" i słowami-obrazami "tor, dos"
    When wpisuję opowiadanie "Po torze jedzie dos"
    And odświeżam stronę
    Then karteczka pokazuje opowiadanie "Po torze jedzie dos" pod słowami-obrazami

  Scenario: [US-015] - Opowiadanie zakryte w powtórce
    Given karteczka w powtórce mająca opowiadanie
    When widzę jej zagadnienie przed odsłonięciem
    Then opowiadanie jest zakryte

  Scenario: [US-015] - Opowiadanie odsłaniane ze słowami-obrazami
    Given karteczka w powtórce mająca opowiadanie
    When wybieram "Odsłoń"
    Then widzę opowiadanie obok słów-obrazów

  Scenario: [US-015] - Za długie opowiadanie
    Given formularz karteczki
    When zapisuję opowiadanie o długości 2001 znaków
    Then zmiana jest odrzucona
    And widzę komunikat "Opowiadanie może mieć najwyżej 2000 znaków"

  Scenario: [US-016] - Zapis emotek
    Given karteczka na planszy
    When wpisuję emotki "🏰⚔️"
    And odświeżam stronę
    Then karteczka pokazuje emotki "🏰⚔️"

  Scenario: [US-016] - Emotki są czytelne na planszy
    Given karteczka z emotkami na planszy przy powiększeniu 100%
    When odczytuję rozmiar czcionki emotek
    Then wynosi on co najmniej 24 px

  Scenario: [US-016] - Za dużo emotek
    Given formularz karteczki
    When zapisuję 9 emotek
    Then zmiana jest odrzucona
    And widzę komunikat "Najwyżej 8 emotek"

  Scenario: [US-016] - Emotki zakryte w powtórce
    Given karteczka w powtórce mająca emotki
    When widzę jej zagadnienie przed odsłonięciem
    Then emotki są zakryte

  Scenario: [US-017] - Domyślny kolor
    When dodaję nową karteczkę
    Then karteczka ma kolor żółty

  Scenario: [US-017] - Paleta pięciu kolorów
    Given karteczka na planszy
    When otwieram wybór koloru
    Then widzę dokładnie 5 kolorów: żółty, czerwony, pomarańczowy, zielony i niebieski

  Scenario: [US-017] - Zmiana koloru jest utrwalana
    Given żółta karteczka
    When zmieniam jej kolor na czerwony
    And odświeżam stronę
    Then karteczka jest czerwona

  Scenario: [US-018] - Powtórka tylko wybranego koloru
    Given plansza z karteczkami czerwonymi i żółtymi mającymi słowa-obrazy
    When rozpoczynam powtórkę z zaznaczonym tylko kolorem czerwonym
    Then w powtórce pojawiają się wyłącznie czerwone karteczki

  Scenario: [US-018] - Domyślnie wszystkie kolory
    Given plansza z karteczkami w różnych kolorach
    When otwieram rozpoczęcie powtórki
    Then wszystkie kolory są zaznaczone

  Scenario: [US-018] - Brak karteczek w wybranych kolorach
    Given plansza bez niebieskich karteczek ze słowami-obrazami
    When rozpoczynam powtórkę z zaznaczonym tylko kolorem niebieskim
    Then powtórka się nie rozpoczyna
    And widzę komunikat "Brak karteczek w wybranych kolorach"

  Scenario: [US-018] - Filtr zachowuje kolejność łańcucha
    Given łańcuch A→B→C, w którym A i C są czerwone, a B żółta
    When rozpoczynam powtórkę z zaznaczonym tylko kolorem czerwonym
    Then karteczki pojawiają się w kolejności A, C
