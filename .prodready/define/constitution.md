# Constitution

## Non-Negotiables
- Aplikacja działa bez żadnego zewnętrznego AI/LLM ani płatnego API; cała logika jest lokalna i deterministyczna.
- Te same plansze są dostępne na komputerze i na telefonie; interfejs jest obsługiwalny dotykiem.
- Słowa-obrazy zawsze pozostają edytowalne przez użytkownika — własne skojarzenie ma pierwszeństwo przed wygenerowanym.
- Jedna plansza i jeden typ karteczki dla wszystkich trzech technik (mapa myśli, łańcuch, pałac) — bez osobnych modułów na technikę.
- Każdy wynik powtórki jest zapisywany z datą, aby dało się policzyć mierniki sukcesu.
- Dane użytkownika nie giną: każda zmiana na planszy jest utrwalana na serwerze.

## Explicit Non-Goals
- Generowanie grafik/obrazków (AI lub inne).
- Automatyczne skojarzenia dla treści nieliczbowych (brak modelu językowego).
- Powtórki rozłożone w czasie (SRS) i przypomnienia.
- Konta, rejestracja, logowanie i wielu użytkowników w MVP.
- Wystawienie aplikacji do internetu / wdrożenie na VPS w MVP.
- Akronimy, rymowanki i inne techniki poza trzema wybranymi.
- Edycja równoczesna w czasie rzeczywistym i współdzielenie plansz.
- Natywne aplikacje mobilne (telefon korzysta z przeglądarki).

## Technical Constraints
- Uruchamianie w kontenerach Docker na domowym serwerze/komputerze w sieci lokalnej.
- Brak zależności od usług zewnętrznych w czasie działania (aplikacja działa bez internetu).
- Stack technologiczny do wyboru w fazie Design (brak preferencji użytkownika).
- Generator liczb oparty na polskim Głównym Systemie Pamięciowym: 0=s/z, 1=t/d, 2=n, 3=m, 4=r, 5=l, 6=j, 7=k/g, 8=f/w, 9=p/b.
- Architektura nie może blokować późniejszego dodania logowania i przeniesienia na VPS.

## Timeline & Resources
- Timeline: bez twardego terminu; priorytetem jest jakość.
- Team: jedna osoba, po godzinach.
- Constraints: brak budżetu na infrastrukturę w MVP (0 zł); startowa lista 110 słów GSP musi zostać przygotowana ręcznie.
