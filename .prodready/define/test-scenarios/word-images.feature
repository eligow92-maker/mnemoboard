Feature: Generator słów-obrazów
  As a uczący się
  I want to otrzymywać słowa-obrazy dla liczb według Głównego Systemu Pamięciowego
  So that nie zamieniam cyfr na słowa ręcznie i mogę używać własnych skojarzeń

  Background:
    Given lista GSP zawiera słowa startowe dla haseł 0–9 oraz 00–99

  Scenario: [US-006] - Liczba czterocyfrowa dzielona na pary
    Given karteczka z zagadnieniem "1410"
    When używam akcji "Generuj słowa"
    Then otrzymuję kolejno słowo dla "14" i słowo dla "10"

  Scenario: [US-006] - Data z separatorami
    Given karteczka z zagadnieniem "15.07.1410"
    When używam akcji "Generuj słowa"
    Then otrzymuję kolejno słowa dla "15", "07", "14" i "10"

  Scenario: [US-006] - Nieparzysta liczba cyfr
    Given karteczka z zagadnieniem "966"
    When używam akcji "Generuj słowa"
    Then otrzymuję słowo dla "96" i słowo dla pojedynczej cyfry "6"

  Scenario: [US-006] - Generator nie nadpisuje słów bez potwierdzenia
    Given karteczka z zagadnieniem "1410" ma słowa-obrazy "tor, dos"
    When używam akcji "Generuj słowa"
    Then słowa-obrazy karteczki nadal brzmią "tor, dos"
    And aplikacja pyta o potwierdzenie zastąpienia

  Scenario: [US-007] - Kompletna lista startowa
    Given świeżo zainstalowana aplikacja
    When otwieram listę GSP
    Then widzę niepuste słowo dla każdego z 110 haseł

  Scenario: [US-007] - Własne słowo jest używane przez generator
    When zmieniam słowo dla "14" na "tur"
    And generuję słowa dla zagadnienia "14"
    Then otrzymuję "tur"

  Scenario: [US-007] - Odrzucenie pustego słowa
    Given hasło "14" ma słowo "tor"
    When zapisuję puste słowo dla "14"
    Then zmiana jest odrzucona
    And hasło "14" nadal ma słowo "tor"

  Scenario: [US-007] - Przywrócenie słowa domyślnego
    Given zmieniłem słowo dla "14" na "tur"
    When używam akcji "Przywróć domyślne" dla "14"
    Then hasło "14" ma ponownie słowo startowe
