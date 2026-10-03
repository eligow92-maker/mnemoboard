Feature: Powtórka i postępy
  As a uczący się
  I want to powtarzać plansze z zakrytymi słowami-obrazami i widzieć wyniki
  So that wiem, co faktycznie pamiętam i czy uczę się regularnie

  Scenario: [US-011] - Rozpoczęcie powtórki
    Given plansza z karteczkami mającymi słowa-obrazy
    When rozpoczynam powtórkę
    Then widzę zagadnienie pierwszej karteczki
    And jej słowa-obrazy są zakryte

  Scenario: [US-011] - Odsłonięcie słów-obrazów
    Given karteczka w powtórce z zakrytymi słowami-obrazami
    When wybieram "Odsłoń"
    Then widzę słowa-obrazy
    And widzę przyciski "Pamiętałem" i "Nie pamiętałem"

  Scenario: [US-011] - Zapis samooceny
    Given odsłonięta karteczka w powtórce
    When wybieram "Pamiętałem"
    Then wynik zostaje zapisany z bieżącą datą
    And pojawia się następna karteczka

  Scenario: [US-011] - Podsumowanie powtórki
    Given powtórka 10 karteczek, z których 8 oceniłem jako zapamiętane
    When oceniam ostatnią karteczkę
    Then widzę podsumowanie "8 z 10" i wynik "80%"

  Scenario: [US-012] - Łańcuch odtwarzany po kolei
    Given plansza z łańcuchem A→B→C
    When rozpoczynam powtórkę
    Then karteczki pojawiają się w kolejności A, B, C

  Scenario: [US-012] - Karteczka bez słów-obrazów jest pomijana
    Given plansza z karteczką A ze słowami-obrazami i karteczką B bez słów-obrazów
    When przechodzę powtórkę
    Then karteczka B nie pojawia się w powtórce

  Scenario: [US-012] - Brak karteczek do powtórki
    Given plansza, na której żadna karteczka nie ma słów-obrazów
    When rozpoczynam powtórkę
    Then powtórka się nie rozpoczyna
    And widzę komunikat "Dodaj słowa-obrazy, aby rozpocząć powtórkę"

  Scenario: [US-012] - Nazwa pokoju odsłaniana ze skojarzeniem
    Given karteczka w powtórce przypisana do pokoju "Kuchnia"
    When wybieram "Odsłoń"
    Then obok słów-obrazów widzę nazwę pokoju "Kuchnia"

  Scenario: [US-013] - Wynik ostatniej powtórki na liście plansz
    Given plansza z ukończoną powtórką o wyniku 8 z 10
    When otwieram listę plansz
    Then przy planszy widzę "80%" wraz z datą powtórki

  Scenario: [US-013] - Liczba powtórek z ostatnich 7 dni
    Given ukończyłem 3 powtórki w ciągu ostatnich 7 dni
    When otwieram statystyki
    Then widzę "Powtórki w ostatnich 7 dniach: 3"

  Scenario: [US-013] - Plansza bez powtórek
    Given plansza bez żadnej ukończonej powtórki
    When otwieram listę plansz
    Then przy planszy widzę "Brak powtórek"
