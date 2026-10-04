# Wdrożenie

Mnemoboard jest zaprojektowany jako **narzędzie osobiste w sieci lokalnej**: domowy serwer lub komputer z Dockerem, dostęp z komputera i telefonu przez Wi-Fi. Budżet: 0 zł.

> ## Ważne: brak logowania
>
> Aplikacja nie ma uwierzytelniania (ADR-003). Każdy, kto dotrze do jej portu, może czytać i kasować plansze.
>
> - **Nie** przekierowuj portu na routerze (port forwarding, DMZ, UPnP).
> - **Nie** publikuj jej przez tunel (Cloudflare Tunnel, ngrok itp.) ani na VPS, dopóki nie ma logowania i HTTPS — patrz [Przeniesienie na VPS](#przeniesienie-na-vps).
> - Aplikacja odrzuca żądania modyfikujące z obcym nagłówkiem `Origin` (ochrona przed cudzą stroną otwartą w Twojej przeglądarce), ale to nie zastępuje logowania.

## Wymagania

- Docker z wtyczką Compose (`docker compose version`).
- Około 1 GB wolnego miejsca (obraz aplikacji ma ok. 600 MB) i 1 GB RAM.
- Architektura: przetestowane na `linux/amd64`. Obrazy bazowe (Node, PostgreSQL) są wieloplatformowe, więc `arm64` (np. Raspberry Pi) powinien działać, ale nie było sprawdzane.

## Pierwsze uruchomienie

```bash
git clone https://github.com/eligow92-maker/mnemoboard
cd mnemoboard
./scripts/setup.sh
```

Skrypt tworzy `.env` (z losowym hasłem bazy), buduje obraz i uruchamia stack poleceniem:

```bash
docker compose -f compose.yaml -f compose.prod.yaml up -d --build --wait
```

Przy starcie kontener sam wykonuje migracje bazy i seed listy GSP (110 haseł; nie nadpisuje Twoich zmian), potem startuje serwer. `--wait` kończy się dopiero, gdy `/api/health` odpowiada (czyli działa też połączenie z bazą).

Ręcznie, bez skryptu:

```bash
cp .env.example .env
# ustaw w .env mocne POSTGRES_PASSWORD (i takie samo w DATABASE_URL, jeśli używasz Prisma z hosta)
make prod-up
```

> `compose.override.yaml` (tryb dev: bind mount kodu, port bazy) **nie** jest ładowany, bo podajemy pliki jawnie przez `-f`.

### Adres aplikacji

- Na serwerze: `http://localhost:3000` (port zmienisz przez `APP_PORT` w `.env`).
- Z telefonu: `http://<adres-IP-serwera>:3000`, np. `http://192.168.1.20:3000`. Adres sprawdzisz poleceniem `hostname -I`.
- Żeby adres się nie zmieniał, ustaw serwerowi stały adres (rezerwacja DHCP w routerze).

## Codzienna obsługa

| Co                         | Polecenie                                                   |
| -------------------------- | ----------------------------------------------------------- |
| Stan i zdrowie kontenerów  | `make prod-ps`                                              |
| Logi na żywo               | `make prod-logs`                                            |
| Zatrzymanie (dane zostają) | `make prod-down`                                            |
| Start / aktualizacja       | `make prod-up`                                              |
| Test działania             | `curl http://localhost:3000/api/health` → `{"status":"ok"}` |

Kontenery mają `restart: unless-stopped`, więc wracają po restarcie komputera, o ile Docker startuje z systemem (`sudo systemctl enable docker`).

## Aktualizacja

```bash
git pull
make prod-up          # przebuduje obraz, wykona nowe migracje, poczeka na zdrowie
```

Migracje wykonują się automatycznie przy starcie i nie kasują danych. Przed większą aktualizacją zrób kopię (niżej).

## Kopie zapasowe

Dane leżą w wolumenie Dockera `postgres_data` na dysku serwera. Awaria dysku bez kopii oznacza utratę plansz, więc kopie rób regularnie i trzymaj **poza** tym dyskiem.

1. **Z interfejsu (zalecane na co dzień):** na stronie „Plansze” → panel „Import i kopie zapasowe” → **Pobierz kopię**. Plik zawiera wszystkie plansze, historię powtórek i listę GSP. Zapisz go na innym urządzeniu lub w chmurze.
   - **Przywróć z kopii** tylko _dokłada_ dane: nic istniejącego nie jest zastępowane, a słowa GSP, które zmieniłeś, zostają. Wczytanie tego samego pliku dwa razy zdubluje plansze.
   - Pojedynczą planszę eksportujesz przyciskiem **Eksportuj** na jej karcie i wczytujesz przez **Importuj planszę**. To inny rodzaj pliku niż pełna kopia.
2. **Zrzut bazy (administracyjnie):**
   ```bash
   make db-backup        # tworzy backups/mnemoboard-<data>.sql
   docker compose -f compose.yaml -f compose.prod.yaml exec -T db \
     sh -c 'pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB"' > mnemoboard-$(date +%F).sql
   ```
   Odtworzenie zrzutu do **pustej** bazy:
   ```bash
   docker compose -f compose.yaml -f compose.prod.yaml exec -T db \
     sh -c 'psql -U "$POSTGRES_USER" "$POSTGRES_DB"' < mnemoboard-2026-10-04.sql
   ```

Automatycznych kopii nie ma (świadoma decyzja zakresu). Jeśli chcesz, dodaj `cron` wywołujący zrzut z punktu 2 i kopiujący plik na inny dysk.

## Zmiana hasła bazy

Hasło `POSTGRES_PASSWORD` jest używane tylko **przy pierwszym utworzeniu** wolumenu bazy. Zmiana wartości w `.env` później nie zmienia hasła istniejącej bazy i aplikacja przestanie się łączyć. Żeby je zmienić:

```bash
docker compose -f compose.yaml -f compose.prod.yaml exec db \
  psql -U "$POSTGRES_USER" -c "ALTER USER $POSTGRES_USER PASSWORD 'nowe-haslo';"
# potem to samo hasło w .env i:
make prod-up
```

## Rozwiązywanie problemów

| Objaw                                        | Co sprawdzić                                                                                     |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `make prod-up` kończy się błędem „unhealthy” | `make prod-logs` — najczęściej złe hasło bazy (patrz wyżej) albo zajęty port (`APP_PORT`).       |
| Telefon nie widzi aplikacji                  | Ten sam Wi-Fi? Zapora na serwerze przepuszcza port 3000 z sieci lokalnej? Adres z `hostname -I`. |
| `Ustaw POSTGRES_PASSWORD w .env`             | Brakuje hasła w `.env` — uruchom `./scripts/setup.sh` albo ustaw je ręcznie.                     |
| Po aktualizacji pusta lista GSP              | Seed uruchamia się przy starcie; sprawdź logi pod kątem „Lista GSP: 110 haseł”.                  |

## Przeniesienie na VPS

Nie jest częścią tej wersji. Przed wystawieniem aplikacji do internetu trzeba **koniecznie**:

1. dodać logowanie (np. jedno hasło i sesja w ciasteczku `HttpOnly`, `Secure`, `SameSite=Lax`) — miejsce w kodzie jest przygotowane: wszystkie trasy API przechodzą przez `withApi` (`src/lib/api.ts`);
2. dodać HTTPS (np. Caddy z automatycznym certyfikatem jako osobny kontener przed aplikacją) i przestać publikować port 3000 bezpośrednio;
3. ustawić automatyczne kopie zapasowe poza serwerem;
4. rozważyć ograniczenie liczby żądań na poziomie proxy.

Koszt orientacyjny: 20–30 zł/mies. Zakres i ryzyka opisuje `.prodready/define/constraints.md`.
