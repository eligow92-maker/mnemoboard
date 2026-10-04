#!/usr/bin/env bash
# Pierwsze uruchomienie Mnemoboard. Użycie:
#   ./scripts/setup.sh        # stack produkcyjny (dom, sieć lokalna) — domyślnie
#   ./scripts/setup.sh dev    # środowisko deweloperskie z odświeżaniem kodu
set -euo pipefail

cd "$(dirname "$0")/.."
MODE="${1:-prod}"

if ! command -v docker >/dev/null 2>&1; then
  echo "Nie znaleziono Dockera. Zainstaluj Docker: https://docs.docker.com/engine/install/" >&2
  exit 1
fi
if ! docker compose version >/dev/null 2>&1; then
  echo "Nie znaleziono wtyczki 'docker compose'. Zainstaluj Docker Compose." >&2
  exit 1
fi

if [ ! -f .env ]; then
  cp .env.example .env
  echo "Utworzono .env z .env.example."
fi

# Hasło z .env.example nie nadaje się na produkcję.
if [ "$MODE" = "prod" ] && grep -q '^POSTGRES_PASSWORD=change-me$' .env; then
  PASSWORD="$(head -c 24 /dev/urandom | base64 | tr -dc 'A-Za-z0-9' | head -c 24)"
  # Zmiana hasła ma sens tylko przed pierwszym utworzeniem bazy.
  if docker volume ls --format '{{.Name}}' | grep -q '_postgres_data$'; then
    echo "Uwaga: baza już istnieje, a w .env nadal jest domyślne hasło 'change-me'." >&2
    echo "Zmiana hasła w .env nie zmieni hasła istniejącej bazy — patrz DEPLOYMENT.md." >&2
  else
    sed -i.bak "s|^POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=${PASSWORD}|; s|^DATABASE_URL=.*|DATABASE_URL=postgresql://mnemoboard:${PASSWORD}@localhost:5432/mnemoboard|; s|^DATABASE_URL_TEST=.*|DATABASE_URL_TEST=postgresql://mnemoboard:${PASSWORD}@localhost:5432/mnemoboard_test|" .env
    rm -f .env.bak
    echo "Wygenerowano losowe hasło bazy w .env."
  fi
fi

if [ "$MODE" = "dev" ]; then
  echo "Uruchamiam środowisko deweloperskie..."
  docker compose up -d --build
else
  echo "Buduję i uruchamiam stack produkcyjny (migracje i seed listy GSP wykonują się same)..."
  docker compose -f compose.yaml -f compose.prod.yaml up -d --build --wait
fi

PORT="$(grep -E '^APP_PORT=' .env | cut -d= -f2 || true)"
PORT="${PORT:-3000}"
LAN_IP="$(hostname -I 2>/dev/null | awk '{print $1}' || true)"

echo
echo "Gotowe. Mnemoboard działa pod adresem:"
echo "  http://localhost:${PORT}"
[ -n "${LAN_IP}" ] && echo "  http://${LAN_IP}:${PORT}   (z telefonu w tej samej sieci)"
echo
echo "Aplikacja nie ma logowania — nie przekierowuj portu ${PORT} na routerze i nie wystawiaj jej do internetu."
echo "Polecenia: make prod-logs | make prod-down | make help"
