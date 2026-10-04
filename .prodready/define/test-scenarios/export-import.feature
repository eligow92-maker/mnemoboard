Feature: Eksport, import i kopie zapasowe
  As a uczący się
  I want to zapisywać plansze do plików i wczytywać je z powrotem
  So that awaria serwera nie oznacza utraty moich plansz

  Scenario: [US-021] - Pobranie pliku eksportu
    Given plansza "Historia Polski"
    When wybieram "Eksportuj"
    Then przeglądarka pobiera plik JSON
    And nazwa pliku zawiera "historia-polski"

  Scenario: [US-021] - Zawartość eksportu
    Given plansza z 3 karteczkami, 1 strefą i 2 połączeniami
    When ją eksportuję
    Then plik zawiera 3 karteczki z zagadnieniem, słowami-obrazami, opowiadaniem, emotkami, kolorem i położeniem
    And plik zawiera 1 strefę i 2 połączenia

  Scenario: [US-022] - Import tworzy nową planszę
    Given plik eksportu planszy z 3 karteczkami, 1 strefą i łańcuchem A→B→C
    When go importuję
    Then powstaje nowa plansza z 3 karteczkami i 1 strefą
    And łańcuch ma kolejność A, B, C

  Scenario: [US-022] - Import nie nadpisuje istniejącej planszy
    Given istniejąca plansza "Historia"
    And plik eksportu planszy o nazwie "Historia"
    When importuję plik
    Then istniejąca plansza "Historia" pozostaje bez zmian
    And nowa plansza nazywa się "Historia (import)"

  Scenario: [US-022] - Odrzucenie niepoprawnego pliku
    Given plik, który nie jest eksportem Mnemoboard
    When go importuję
    Then żadna plansza nie powstaje
    And widzę komunikat "Plik nie jest poprawnym eksportem Mnemoboard"

  Scenario: [US-022] - Odrzucenie zbyt dużego pliku
    Given plik większy niż 5 MB
    When go importuję
    Then żadna plansza nie powstaje
    And widzę komunikat "Plik jest za duży (limit 5 MB)"

  Scenario: [US-023] - Pobranie pełnej kopii
    Given 2 plansze, zmienione słowo GSP dla "14" i własny wpis "333"
    When wybieram "Pobierz kopię"
    Then pobrany plik zawiera 2 plansze z historią powtórek
    And plik zawiera słowo dla "14" i wpis "333"

  Scenario: [US-023] - Przywrócenie na świeżej instalacji
    Given świeża instalacja bez plansz
    And plik kopii z 2 planszami, zmienionym słowem dla "14" i wpisem "333"
    When przywracam kopię
    Then mam 2 plansze z wynikami ostatnich powtórek
    And mam zmienione słowo dla "14" i wpis "333"

  Scenario: [US-023] - Przywrócenie nie rusza istniejących plansz
    Given istniejąca plansza "Biologia"
    And plik kopii z 2 planszami
    When przywracam kopię
    Then plansza "Biologia" pozostaje bez zmian
    And lista ma 3 plansze

  Scenario: [US-023] - Potwierdzenie przed przywróceniem
    Given plik kopii z 2 planszami
    When wybieram "Przywróć z kopii"
    Then widzę komunikat "Zostaną dodane 2 plansze"
    And dane zmieniają się dopiero po potwierdzeniu

  Scenario: [US-023] - Odrzucenie uszkodzonej kopii
    Given uszkodzony plik kopii
    When go przywracam
    Then żadne dane się nie zmieniają
    And widzę komunikat "Plik nie jest poprawną kopią Mnemoboard"
