# Architecture Pattern

## Selected Pattern: Modular Monolith

## Rationale
Based on:
- Deployment: jeden domowy serwer/komputer, Docker Compose, sieć lokalna; później VPS.
- Scale: 1 użytkownik, 2 urządzenia, < 1 żądanie/s, do ok. 50 plansz × 200 karteczek.
- Team: jedna osoba, po godzinach, bez twardego terminu.

Modular Monolith was selected because:
- Jedna aplikacja Next.js (interfejs + API) i jedna baza to najmniej elementów do uruchomienia i utrzymania przez jedną osobę.
- Skala nie uzasadnia mikroserwisów ani serverless; serverless kłóci się też z wdrożeniem na własnym sprzęcie bez internetu.
- Wyraźne moduły domenowe (czysta logika bez zależności od frameworka) pozwalają testować reguły łańcucha, stref i generatora jednostkowo oraz ułatwią późniejsze dodanie logowania.

## Structure

```
 Przeglądarka (komputer / telefon, sieć lokalna)
        │  HTTP
        ▼
┌──────────────────────────────────────────────────────┐
│ Kontener "app" — Next.js (Node.js)                   │
│                                                      │
│  UI (App Router, React)                              │
│   ├─ /                lista plansz + statystyki      │
│   ├─ /boards/[id]     edytor planszy (React Flow)    │
│   ├─ /boards/[id]/review   tryb powtórki             │
│   └─ /peg-words       lista GSP                      │
│                                                      │
│  API (Route Handlers, /api/*)  ── walidacja Zod      │
│        │                                             │
│  Moduły domenowe (src/modules/*, czysty TypeScript)  │
│   ├─ boards       plansze                            │
│   ├─ notes        karteczki                          │
│   ├─ arrangement  połączenia, łańcuch, strefy        │
│   ├─ word-images  generator GSP, lista haseł         │
│   └─ review       sesje, wyniki, statystyki          │
│        │                                             │
│  Dostęp do danych (Prisma)                           │
└────────┼─────────────────────────────────────────────┘
         ▼
┌──────────────────────┐
│ Kontener "db"        │
│ PostgreSQL + wolumen │
└──────────────────────┘
```

Zależności idą tylko w dół: UI → API → moduły domenowe → Prisma. Moduły nie importują Reacta ani Next.js.

## Key Decisions
- Serwer jest jedynym źródłem prawdy; klient zapisuje każdą zmianę od razu przez API (bez trybu offline i bez synchronizacji w czasie rzeczywistym — drugie urządzenie widzi zmiany po odświeżeniu).
- Reguły domenowe egzekwuje serwer, nie interfejs: unikalność połączenia, jeden następnik/poprzednik w łańcuchu, brak pętli, przypisanie do strefy.
- Przypisanie karteczki do pokoju (`zoneId`) wylicza serwer z położenia: środek karteczki wewnątrz prostokąta strefy; przy nakładających się strefach wygrywa strefa utworzona najpóźniej. Przeliczenie następuje przy utworzeniu/przesunięciu karteczki oraz przy przesunięciu, zmianie rozmiaru lub usunięciu strefy.
- Numer kolejności w łańcuchu i kolejność powtórki są wyliczane (nie przechowywane) w module `arrangement`/`review`.
- Generator słów-obrazów to czysta funkcja `(tekst, lista GSP) → słowa`, wywoływana przez API; domyślne hasła GSP trafiają do bazy przez seed przy pierwszym uruchomieniu.
- Sesja powtórki przechowuje listę kart po stronie serwera tylko jako wyniki; kolejność kart jest zwracana przy starcie sesji i trzymana przez klienta.
- Brak uwierzytelniania w MVP (ADR-003); wszystkie handlery API przechodzą przez jedną warstwę pośrednią, w której później zostanie dodana kontrola sesji.

## Scale & Bottlenecks
- Przy docelowej skali (1 użytkownik, plansza do 200 karteczek) pierwszym wąskim gardłem nie jest serwer, lecz renderowanie planszy na telefonie. React Flow renderuje tylko widoczne węzły (`onlyRenderVisibleElements`), a plansza ładuje się jednym żądaniem `GET /boards/{id}` (trzy zapytania po indeksach `board_id`).
- Przeciąganie zapisuje położenie raz, po upuszczeniu (nie przy każdym ruchu), więc cel "zapis < 500 ms" dotyczy pojedynczego `PATCH`.
- Przeliczenie stref przy zmianie geometrii strefy to jedno przejście po karteczkach planszy (≤ 200) — świadomie bez optymalizacji.

## Future Considerations
- Przeniesienie na VPS: dodać logowanie (jedno hasło, sesja w ciasteczku), reverse proxy z HTTPS (Caddy) i kopie zapasowe bazy — przed wystawieniem do internetu.
- Wersja publiczna z kontami: dodać encję User i `ownerId` na Board/PegWord; moduły pozostają bez zmian strukturalnych.
- Wzorzec przestaje być właściwy dopiero przy współpracy w czasie rzeczywistym lub tysiącach użytkowników — wtedy rozważyć wydzielenie warstwy synchronizacji (WebSocket/CRDT).
