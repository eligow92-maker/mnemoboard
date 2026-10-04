Feature: Plansze
  As a uczący się
  I want to tworzyć i porządkować plansze
  So that każdy temat ma własne miejsce na karteczki

  Scenario: [US-001] - Pusty stan przy pierwszym uruchomieniu
    Given w aplikacji nie ma żadnej planszy
    When otwieram aplikację
    Then widzę pusty stan z przyciskiem "Utwórz pierwszą planszę"

  Scenario: [US-001] - Utworzenie planszy
    Given jestem na liście plansz
    When tworzę planszę o nazwie "Historia Polski"
    Then plansza "Historia Polski" pojawia się na liście
    And otwiera się jako pusta plansza

  Scenario: [US-001] - Odrzucenie pustej nazwy
    Given otwarty formularz nowej planszy
    When zatwierdzam pustą nazwę
    Then plansza nie powstaje
    And widzę komunikat "Podaj nazwę planszy"

  Scenario: [US-002] - Zmiana nazwy planszy
    Given istnieje plansza "Historia"
    When zmieniam jej nazwę na "Historia Polski"
    Then na liście plansz widnieje "Historia Polski"

  Scenario: [US-002] - Usunięcie wymaga potwierdzenia
    Given istnieje plansza z karteczkami
    When wybieram usunięcie planszy
    Then aplikacja pyta o potwierdzenie

  Scenario: [US-002] - Usunięcie planszy usuwa jej zawartość
    Given istnieje plansza z karteczkami, połączeniami, strefami i wynikami powtórek
    When potwierdzam usunięcie planszy
    Then plansza nie istnieje na liście
    And jej karteczki, połączenia, strefy i wyniki powtórek nie istnieją
