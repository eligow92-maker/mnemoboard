Feature: Komputer i telefon
  As a uczący się
  I want to korzystać z tych samych plansz na komputerze i telefonie
  So that tworzę przy biurku, a powtarzam gdziekolwiek w domu

  Scenario: [US-014] - Powtórka na wąskim ekranie
    Given ekran o szerokości 375 px
    When przechodzę powtórkę
    Then wszystkie elementy powtórki mieszczą się na ekranie bez przewijania w poziomie

  Scenario: [US-014] - Przeciąganie karteczki dotykiem
    Given plansza otwarta na urządzeniu dotykowym
    When przeciągam karteczkę palcem
    Then karteczka zmienia położenie

  Scenario: [US-014] - Wspólne dane między urządzeniami
    Given dodałem karteczkę na komputerze
    When otwieram tę planszę na telefonie
    Then widzę tę karteczkę
