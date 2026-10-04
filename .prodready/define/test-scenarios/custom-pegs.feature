Feature: Własne wpisy GSP
  As a uczący się
  I want to dodawać własne wpisy dla dłuższych ciągów cyfr
  So that generator podaje moje skojarzenia dla numerów telefonów i innych długich liczb

  Background:
    Given lista GSP zawiera słowa startowe dla haseł 0–9 oraz 00–99

  Scenario: [US-019] - Dodanie własnego wpisu
    When dodaję własny wpis "333" ze słowem "mumia-mysz"
    Then wpis "333 – mumia-mysz" jest widoczny na liście własnych wpisów

  Scenario: [US-019] - Odrzucenie duplikatu
    Given istniejący własny wpis "333"
    When dodaję kolejny wpis "333"
    Then wpis nie powstaje
    And widzę komunikat "Wpis dla tej liczby już istnieje"

  Scenario: [US-019] - Odrzucenie zbyt krótkiej liczby
    When zatwierdzam własny wpis dla liczby "33"
    Then wpis nie powstaje
    And widzę komunikat "Własny wpis musi mieć od 3 do 15 cyfr"

  Scenario: [US-019] - Zmiana słowa własnego wpisu
    Given własny wpis "333" ze słowem "mumia-mysz"
    When zmieniam słowo na "mamut"
    Then wpis pokazuje "333 – mamut"

  Scenario: [US-019] - Usunięcie własnego wpisu
    Given własny wpis "333"
    When go usuwam
    Then wpisu nie ma na liście własnych wpisów

  Scenario: [US-020] - Dokładne dopasowanie własnego wpisu
    Given własny wpis "333" ze słowem "mumia-mysz"
    When generuję słowa dla zagadnienia "333"
    Then otrzymuję "mumia-mysz"

  Scenario: [US-020] - Własny wpis wewnątrz dłuższej liczby
    Given własny wpis "333" ze słowem "mumia-mysz"
    When generuję słowa dla zagadnienia "48333"
    Then otrzymuję kolejno słowo z listy GSP dla "48" i "mumia-mysz"

  Scenario: [US-020] - Najdłuższy wpis wygrywa
    Given własne wpisy "333" i "3334"
    When generuję słowa dla zagadnienia "3334"
    Then otrzymuję słowo wpisu "3334"

  Scenario: [US-020] - Bez własnych wpisów podział na pary
    Given brak własnych wpisów
    When generuję słowa dla zagadnienia "333"
    Then otrzymuję słowo z listy GSP dla "33" i słowo dla pojedynczej cyfry "3"
