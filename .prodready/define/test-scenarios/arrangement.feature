Feature: Układanie karteczek
  As a uczący się
  I want to układać karteczki w mapę myśli, łańcuch i pokoje pałacu pamięci
  So that stosuję wybraną mnemotechnikę na jednej planszy

  Background:
    Given istnieje otwarta plansza z karteczkami A, B i C

  Scenario: [US-008] - Połączenie dwóch karteczek
    When łączę karteczki A i B
    And odświeżam stronę
    Then między A i B widoczna jest linia

  Scenario: [US-008] - Odrzucenie zdublowanego połączenia
    Given karteczki A i B są połączone
    When łączę je ponownie
    Then drugie połączenie nie powstaje

  Scenario: [US-008] - Usunięcie połączenia
    Given karteczki A i B są połączone
    When usuwam połączenie
    Then linia znika
    And karteczki A i B pozostają na planszy

  Scenario: [US-009] - Kolejność w łańcuchu
    When tworzę ogniwa łańcucha A→B i B→C
    Then karteczki A, B i C pokazują numery kolejności 1, 2 i 3

  Scenario: [US-009] - Karteczka ma tylko jeden następnik
    Given istnieje ogniwo łańcucha A→B
    When tworzę ogniwo A→C
    Then ogniwo nie powstaje
    And widzę komunikat "Karteczka ma już następnik w łańcuchu"

  Scenario: [US-009] - Łańcuch nie tworzy pętli
    Given istnieje łańcuch A→B→C
    When tworzę ogniwo C→A
    Then ogniwo nie powstaje
    And widzę komunikat "Łańcuch nie może tworzyć pętli"

  Scenario: [US-010] - Utworzenie pokoju
    When tworzę strefę o nazwie "Kuchnia"
    Then strefa "Kuchnia" jest widoczna na planszy

  Scenario: [US-010] - Umieszczenie karteczki w pokoju
    Given na planszy jest strefa "Kuchnia"
    When upuszczam karteczkę A w obrębie strefy
    Then karteczka A jest przypisana do pokoju "Kuchnia"

  Scenario: [US-010] - Wyjęcie karteczki z pokoju
    Given karteczka A jest przypisana do pokoju "Kuchnia"
    When przeciągam ją poza strefę
    Then karteczka A nie jest przypisana do żadnego pokoju

  Scenario: [US-010] - Usunięcie pokoju zachowuje karteczki
    Given strefa "Kuchnia" zawiera karteczki A i B
    When usuwam strefę
    Then karteczki A i B pozostają na planszy bez przypisanego pokoju
