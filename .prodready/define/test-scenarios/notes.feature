Feature: Karteczki
  As a uczący się
  I want to przyklejać do planszy karteczki z zagadnieniami i słowami-obrazami
  So that każda rzecz do zapamiętania ma swoje miejsce i skojarzenie

  Background:
    Given istnieje otwarta plansza "Historia Polski"

  Scenario: [US-003] - Przyklejenie karteczki
    When dodaję karteczkę z zagadnieniem "1410 – bitwa pod Grunwaldem" w wybranym miejscu
    Then karteczka jest widoczna w tym miejscu z tym zagadnieniem

  Scenario: [US-003] - Odrzucenie pustego zagadnienia
    When zatwierdzam karteczkę z pustym zagadnieniem
    Then karteczka nie powstaje
    And widzę komunikat "Wpisz zagadnienie"

  Scenario: [US-003] - Karteczka jest utrwalona
    Given dodałem karteczkę z zagadnieniem "1410"
    When odświeżam stronę
    Then karteczka ma to samo zagadnienie i to samo położenie

  Scenario: [US-004] - Przesunięcie karteczki
    Given na planszy jest karteczka
    When przeciągam ją w inne miejsce
    And odświeżam stronę
    Then karteczka znajduje się w nowym miejscu

  Scenario: [US-004] - Edycja zagadnienia
    Given na planszy jest karteczka z zagadnieniem "1410"
    When zmieniam zagadnienie na "15.07.1410"
    Then karteczka pokazuje zagadnienie "15.07.1410"

  Scenario: [US-004] - Usunięcie karteczki z połączeniami
    Given na planszy jest karteczka połączona z dwiema innymi
    When usuwam tę karteczkę
    Then karteczka znika z planszy
    And oba jej połączenia znikają

  Scenario: [US-005] - Ręczne słowa-obrazy dla treści nieliczbowej
    Given na planszy jest karteczka z zagadnieniem "Mitochondrium"
    When wpisuję słowa-obrazy "mity, chondryt" i zapisuję
    Then karteczka pokazuje słowa-obrazy "mity, chondryt" pod zagadnieniem

  Scenario: [US-005] - Generator nie działa dla zagadnienia bez cyfr
    Given na planszy jest karteczka z zagadnieniem "Mitochondrium"
    When używam akcji "Generuj słowa"
    Then słowa nie są generowane
    And widzę komunikat "Brak liczb – wpisz słowa-obrazy samodzielnie"
