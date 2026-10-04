# Dokumentacja API

Źródłem prawdy jest kontrakt OpenAPI: [`.prodready/design/api/openapi.yaml`](../.prodready/design/api/openapi.yaml). Ten plik to przegląd z przykładami; tabela endpointów jest wygenerowana z kontraktu.

Adres bazowy: `http://localhost:3000/api` (w sieci domowej: `http://<adres-serwera>:3000/api`).

## Uwierzytelnianie i bezpieczeństwo

API **nie ma uwierzytelniania** — aplikacja działa tylko w sieci lokalnej (ADR-003). Żądania modyfikujące (`POST`, `PUT`, `PATCH`, `DELETE`) z obcym nagłówkiem `Origin` są odrzucane odpowiedzią `403 FORBIDDEN_ORIGIN`. Klienci spoza przeglądarki (np. `curl`) nie wysyłają `Origin` i są przyjmowani.

Treść żądań to JSON (`Content-Type: application/json`), limit 16 KB; wyjątki: import planszy (5 MB) i przywracanie kopii (50 MB).

## Format błędów

```json
{
  "code": "VALIDATION_ERROR",
  "message": "Niepoprawne dane",
  "fields": { "topic": "Wpisz zagadnienie" }
}
```

`code` to stabilny kod maszynowy, `message` — komunikat po polsku do pokazania użytkownikowi, `fields` — błędy per pole (tylko przy walidacji).

| Kod                                                                                      | Status | Znaczenie                                                  |
| ---------------------------------------------------------------------------------------- | ------ | ---------------------------------------------------------- |
| `VALIDATION_ERROR`                                                                       | 400    | Niepoprawne dane lub JSON                                  |
| `FORBIDDEN_ORIGIN`                                                                       | 403    | Obcy `Origin`                                              |
| `NOT_FOUND`                                                                              | 404    | Zasób nie istnieje                                         |
| `CONNECTION_EXISTS`, `CHAIN_SUCCESSOR_EXISTS`, `CHAIN_PREDECESSOR_EXISTS`, `CHAIN_CYCLE` | 409    | Reguły połączeń i łańcucha                                 |
| `RESULT_EXISTS`, `SESSION_FINISHED`                                                      | 409    | Reguły powtórki                                            |
| `PEG_EXISTS`, `PEG_LIMIT`, `PEG_BUILTIN`, `PEG_NO_DEFAULT`                               | 409    | Reguły listy GSP i własnych wpisów                         |
| `INVALID_EXPORT_FILE`, `INVALID_BACKUP_FILE`                                             | 400    | Plik importu / kopii niepoprawny lub niewłaściwego rodzaju |
| `FILE_TOO_LARGE`                                                                         | 413    | Plik większy niż limit (5 MB / 50 MB)                      |
| `NO_DIGITS`, `NO_REVIEWABLE_NOTES`, `NO_NOTES_IN_COLORS`                                 | 422    | Żądanie poprawne, ale niewykonalne w tym stanie            |
| `INTERNAL_ERROR`                                                                         | 500    | Nieoczekiwany błąd                                         |
| —                                                                                        | 503    | Baza niedostępna (`/health`)                               |

## Endpointy

### Plansze

| Metoda   | Ścieżka             | Opis                                                                     | Odpowiedzi    |
| -------- | ------------------- | ------------------------------------------------------------------------ | ------------- |
| `GET`    | `/boards`           | Lista plansz z wynikiem ostatniej powtórki (US-001, US-013)              | 200           |
| `POST`   | `/boards`           | Utworzenie planszy (US-001)                                              | 201, 400      |
| `GET`    | `/boards/{boardId}` | Pełna zawartość planszy — karteczki, strefy, połączenia (US-003, US-014) | 200, 404      |
| `PATCH`  | `/boards/{boardId}` | Zmiana nazwy planszy (US-002)                                            | 200, 400, 404 |
| `DELETE` | `/boards/{boardId}` | Usunięcie planszy wraz z zawartością i wynikami powtórek (US-002)        | 204, 404      |

### Karteczki

| Metoda   | Ścieżka                   | Opis                                                           | Odpowiedzi    |
| -------- | ------------------------- | -------------------------------------------------------------- | ------------- |
| `POST`   | `/boards/{boardId}/notes` | Przyklejenie karteczki do planszy (US-003)                     | 201, 400, 404 |
| `PATCH`  | `/notes/{noteId}`         | Edycja treści lub położenia karteczki (US-004, US-005, US-010) | 200, 400, 404 |
| `DELETE` | `/notes/{noteId}`         | Usunięcie karteczki wraz z jej połączeniami (US-004)           | 204, 404      |

### Strefy-pokoje pałacu pamięci

| Metoda   | Ścieżka                   | Opis                                                      | Odpowiedzi    |
| -------- | ------------------------- | --------------------------------------------------------- | ------------- |
| `POST`   | `/boards/{boardId}/zones` | Utworzenie strefy-pokoju (US-010)                         | 201, 400, 404 |
| `PATCH`  | `/zones/{zoneId}`         | Zmiana nazwy, położenia lub rozmiaru strefy (US-010)      | 200, 400, 404 |
| `DELETE` | `/zones/{zoneId}`         | Usunięcie strefy; karteczki pozostają bez pokoju (US-010) | 204, 404      |

### Połączenia mapy myśli i ogniwa łańcucha

| Metoda   | Ścieżka                         | Opis                                                                   | Odpowiedzi         |
| -------- | ------------------------------- | ---------------------------------------------------------------------- | ------------------ |
| `POST`   | `/boards/{boardId}/connections` | Połączenie dwóch karteczek linią lub ogniwem łańcucha (US-008, US-009) | 201, 400, 404, 409 |
| `DELETE` | `/connections/{connectionId}`   | Usunięcie połączenia; karteczki pozostają (US-008)                     | 204, 404           |

### Generator słów-obrazów i lista GSP

| Metoda   | Ścieżka                     | Opis                                                                        | Odpowiedzi    |
| -------- | --------------------------- | --------------------------------------------------------------------------- | ------------- |
| `POST`   | `/word-images/generate`     | Wygenerowanie słów-obrazów dla liczb w zagadnieniu (US-005, US-006, US-020) | 200, 400, 422 |
| `GET`    | `/peg-words`                | Lista haseł GSP — 110 wbudowanych i własne wpisy (US-007, US-019)           | 200           |
| `POST`   | `/peg-words`                | Dodanie własnego wpisu GSP (US-019)                                         | 201, 400, 409 |
| `PUT`    | `/peg-words/{number}`       | Zmiana słowa dla hasła wbudowanego lub własnego wpisu (US-007, US-019)      | 200, 400, 404 |
| `DELETE` | `/peg-words/{number}`       | Usunięcie własnego wpisu GSP (US-019)                                       | 204, 404, 409 |
| `POST`   | `/peg-words/{number}/reset` | Przywrócenie słowa domyślnego (US-007)                                      | 200, 404, 409 |

### Powtórki i statystyki

| Metoda | Ścieżka                                | Opis                                                  | Odpowiedzi         |
| ------ | -------------------------------------- | ----------------------------------------------------- | ------------------ |
| `POST` | `/boards/{boardId}/review-sessions`    | Rozpoczęcie powtórki planszy (US-011, US-012, US-018) | 201, 400, 404, 422 |
| `POST` | `/review-sessions/{sessionId}/results` | Zapis samooceny karteczki (US-011)                    | 201, 400, 404, 409 |
| `POST` | `/review-sessions/{sessionId}/finish`  | Zakończenie powtórki i podsumowanie (US-011)          | 200, 404, 409      |
| `GET`  | `/stats`                               | Statystyki regularności (US-013)                      | 200                |

### Eksport, import i kopie zapasowe (iteracja 2)

| Metoda | Ścieżka                    | Opis                                                    | Odpowiedzi    |
| ------ | -------------------------- | ------------------------------------------------------- | ------------- |
| `GET`  | `/boards/{boardId}/export` | Eksport planszy do pliku JSON (US-021)                  | 200, 404      |
| `POST` | `/boards/import`           | Import planszy z pliku eksportu (US-022)                | 201, 400, 413 |
| `GET`  | `/backup`                  | Pobranie pełnej kopii zapasowej (US-023)                | 200           |
| `POST` | `/backup/restore`          | Przywrócenie pełnej kopii — tylko dokłada dane (US-023) | 200, 400, 413 |

### Stan aplikacji

| Metoda | Ścieżka   | Opis                               | Odpowiedzi |
| ------ | --------- | ---------------------------------- | ---------- |
| `GET`  | `/health` | Stan aplikacji i połączenia z bazą | 200, 503   |

## Przykłady

Stan aplikacji:

```bash
curl http://localhost:3000/api/health
# {"status":"ok"}
```

Utworzenie planszy i karteczki z opowiadaniem, emotkami i kolorem:

```bash
curl -X POST http://localhost:3000/api/boards \
  -H 'content-type: application/json' -d '{"name":"Historia Polski"}'
# 201 {"id":"<boardId>","name":"Historia Polski","createdAt":"…","updatedAt":"…"}

curl -X POST http://localhost:3000/api/boards/<boardId>/notes \
  -H 'content-type: application/json' \
  -d '{"topic":"1410","imageWords":"tor, dos","story":"Po torze jedzie dos","emoji":"🏰⚔️","color":"red","x":100,"y":100}'
```

Kolory: `yellow` (domyślny), `red`, `orange`, `green`, `blue`. Zagadnienie do 500 znaków, opowiadanie do 2000, emotki do 8 (znaki graficzne).

Generator słów-obrazów (uwzględnia własne wpisy GSP):

```bash
curl -X POST http://localhost:3000/api/word-images/generate \
  -H 'content-type: application/json' -d '{"topic":"15.07.1410"}'
# {"segments":[{"number":"15","word":"…","source":"builtin"}, …],"imageWords":"…, …"}
```

Własny wpis GSP (3–15 cyfr) i jego użycie:

```bash
curl -X POST http://localhost:3000/api/peg-words \
  -H 'content-type: application/json' -d '{"number":"333","word":"mumia-mysz"}'
# generowanie dla "48333" → słowo dla "48" i "mumia-mysz" (source: "custom")
```

Powtórka tylko czerwonych karteczek (ciało jest opcjonalne; bez niego — wszystkie kolory):

```bash
curl -X POST http://localhost:3000/api/boards/<boardId>/review-sessions \
  -H 'content-type: application/json' -d '{"colors":["red"]}'
# 201 {"id":"…","cards":[{"noteId":"…","topic":"…","imageWords":"…","story":null,"emoji":null,"color":"red","zoneName":null}]}
```

Eksport planszy, import i kopia zapasowa:

```bash
curl -OJ http://localhost:3000/api/boards/<boardId>/export     # plik mnemoboard-<nazwa>-<data>.json
curl -X POST -H 'content-type: application/json' \
  --data-binary @plansza.json http://localhost:3000/api/boards/import
curl -OJ http://localhost:3000/api/backup                       # pełna kopia
curl -X POST -H 'content-type: application/json' \
  --data-binary @kopia.json 'http://localhost:3000/api/backup/restore?dryRun=true'
# {"dryRun":true,"boardsAdded":2,"pegWordsUpdated":1,"customPegWordsAdded":1}
```

Import zawsze tworzy nową planszę (przy zajętej nazwie dopisuje „ (import)”). Przywracanie kopii tylko dokłada dane; `dryRun=true` zwraca zapowiedź bez zapisu.
