#!/usr/bin/env sh
# SpecHub dev indító: Postgres (Docker) + .NET backend + Vite frontend.
# Használat:  ./start-dev.sh
# Leállítás:  Ctrl+C (lezárja a backendet, a frontendet és az adatbázist)
set -eu
cd "$(dirname "$0")"

need() { command -v "$1" >/dev/null 2>&1 || { echo "'$1' nem található a PATH-ban." >&2; exit 1; }; }
echo "[1/5] Előfeltételek ellenőrzése..."
need docker; need dotnet; need npm
echo "  mindhárom OK"

echo "[2/5] .env fájlok ellenőrzése..."
[ -f .env ] || { echo "  .env hiányzik, másolom .env.example-ból"; cp .env.example .env; }
[ -f frontend/.env ] || { echo "  frontend/.env hiányzik, másolom .env.example-ból"; cp frontend/.env.example frontend/.env; }
echo "  .env-ek OK"

echo "[3/5] Postgres indítása (Docker, localhost:5432)..."
docker compose up -d db

# Várunk, amíg a Postgres healthy lesz (max ~60 mp)
echo "[4/5] Várakozás a Postgres-re (healthcheck)..."
i=0
status=""
while [ "$status" != "healthy" ] && [ "$i" -lt 30 ]; do
  i=$((i + 1))
  status=$(docker inspect --format '{{.State.Health.Status}}' spechub-db 2>/dev/null || true)
  echo "  próba $i/30: status=$status"
  if [ "$status" != "healthy" ]; then
    sleep 2
  fi
done
if [ "$status" != "healthy" ]; then
  echo "A Postgres nem lett healthy 60 mp alatt." >&2
  exit 1
fi
echo "Postgres: healthy (localhost:5432)"

# Frontend függőségek, ha kellenek
echo "[5/5] Backend + frontend indítása..."
if [ ! -d frontend/node_modules ]; then
  echo "  frontend/node_modules hiányzik, npm install..."
  (cd frontend && npm install)
else
  echo "  frontend/node_modules OK"
fi

cleanup() {
  kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true
  docker compose stop db
}
trap cleanup INT TERM EXIT

dotnet run --project backend/SpecHub.Api &
BACKEND_PID=$!
(cd frontend && npm run dev) &
FRONTEND_PID=$!

echo ""
echo "============================================"
echo " Minden elindult:"
echo "  Postgres : localhost:5432 (db=spechub)"
echo "  Backend  : http://localhost:5117"
echo "             http://localhost:5117/api/health"
echo "             http://localhost:5117/openapi/v1.json"
echo "             http://localhost:5117/swagger"
echo "  Frontend : http://localhost:5173"
echo "============================================"
echo "Leállítás: Ctrl+C"
wait
