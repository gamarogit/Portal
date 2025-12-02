#!/usr/bin/env bash
set -euo pipefail

# Función para verificar e instalar dependencias
check_and_install_deps() {
  local dir=$1
  local name=$2
  
  echo "📦 Verificando dependencias de ${name}..."
  if [[ ! -d "${dir}/node_modules" ]]; then
    echo "⚙️  Instalando dependencias de ${name}..."
    npm --prefix "$dir" install
    echo "✓ Dependencias de ${name} instaladas"
  elif [[ "${dir}/package.json" -nt "${dir}/node_modules" ]]; then
    echo "⚙️  Actualizando dependencias de ${name}..."
    npm --prefix "$dir" install
    echo "✓ Dependencias de ${name} actualizadas"
  else
    echo "✓ Dependencias de ${name} OK"
  fi
}

# Verificar Node.js
if ! command -v node >/dev/null 2>&1; then
  echo "❌ Node.js no está instalado"
  exit 1
fi

# Verificar npm
if ! command -v npm >/dev/null 2>&1; then
  echo "❌ npm no está instalado"
  exit 1
fi

# Instalar/verificar dependencias
check_and_install_deps "backend" "Backend"
check_and_install_deps "frontend" "Frontend"

# Generar Prisma Client si es necesario
if [[ ! -d "backend/node_modules/@prisma/client" ]] || [[ "backend/prisma/schema.prisma" -nt "backend/node_modules/@prisma/client" ]]; then
  echo "🔧 Generando Prisma Client..."
  npm --prefix backend run prisma:generate 2>/dev/null || npx --prefix backend prisma generate
  echo "✓ Prisma Client generado"
fi

find_available_port() {
  local port="${1:-3000}"
  while command -v lsof >/dev/null 2>&1 && lsof -i :"$port" >/dev/null 2>&1; do
    port=$((port + 1))
  done
  echo "$port"
}

BACKEND_PORT=$(find_available_port 3000)
DEV_FLAG="DEV_ALLOW_PUBLIC_ASSETS=1 PORT=${BACKEND_PORT}"
FRONT_FLAGS="VITE_ENABLE_DEV_HELPERS=1 VITE_API_URL=http://localhost:${BACKEND_PORT}"

load_db_env() {
  local dotenv="backend/.env"
  if [[ -f $dotenv ]]; then
    set -a
    # shellcheck source=/dev/null
    source "$dotenv"
    set +a
  fi
}

setup_front_env() {
  local local_env="frontend/.env.local"
  local example="frontend/.env.local.example"
  if [[ ! -f $local_env && -f $example ]]; then
    echo "Configurando env del frontend..."
    cp "$example" "$local_env"
  fi
}

wait_for_postgres() {
  if ! command -v pg_isready >/dev/null 2>&1; then
    echo "pg_isready no está disponible; saltando verificación de PostgreSQL."
    return 0
  fi

  load_db_env
  local db_host db_port db_user db_pass
  read -r db_host db_port db_user db_pass <<'PY'
import os
from urllib.parse import urlparse

url = os.environ.get('DATABASE_URL', '')
if url:
    parsed = urlparse(url)
    host = parsed.hostname or 'localhost'
    port = parsed.port or 5432
    user = parsed.username or 'postgres'
    password = parsed.password or ''
else:
    host = 'localhost'
    port = 5432
    user = 'postgres'
    password = ''
print(host, port, user, password)
PY

  local retries=10
  for ((i = 1; i <= retries; i++)); do
    PGPASSWORD="$db_pass" pg_isready -h "$db_host" -p "$db_port" -U "$db_user" >/dev/null 2>&1 && return 0
    echo "Esperando que PostgreSQL responda en $db_host:$db_port... ($i/$retries)"
    sleep 1
  done

  echo "No pude conectarme a PostgreSQL en $db_host:$db_port (usa la base definida en backend/.env)."
  exit 1
}

load_db_env
wait_for_postgres
echo "Starting backend (DEV_ALLOW_PUBLIC_ASSETS=1) on port ${BACKEND_PORT}..."
eval "$DEV_FLAG npm --prefix backend run start:dev" &
BACK_PID=$!

setup_front_env

echo "Starting frontend (VITE_ENABLE_DEV_HELPERS=1)..."
eval "$FRONT_FLAGS npm --prefix frontend run dev -- --host 0.0.0.0" &
FRONT_PID=$!

wait_for_backend() {
  for i in {1..20}; do
    if curl -sSf http://localhost:${BACKEND_PORT}/metrics >/dev/null 2>&1; then
      return 0
    fi
    sleep 1
  done
  return 1
}

seed_demo_catalogs() {
  curl -s -X POST http://localhost:${BACKEND_PORT}/dev/asset-type -H "Content-Type: application/json" -d '{"name":"Laptop"}' >/dev/null
  curl -s -X POST http://localhost:${BACKEND_PORT}/dev/location -H "Content-Type: application/json" -d '{"name":"Main Core"}' >/dev/null
  curl -s -X POST http://localhost:${BACKEND_PORT}/dev/user -H "Content-Type: application/json" -d '{"name":"Gil"}' >/dev/null
}

open_browser() {
  URL="http://localhost:5173"
  if command -v open >/dev/null 2>&1; then
    open "$URL"
  elif command -v xdg-open >/dev/null 2>&1; then
    xdg-open "$URL"
  fi
}

if wait_for_backend; then
  echo "Backend ready, seeding demo catálogos..."
  seed_demo_catalogs
  open_browser
else
  echo "Backend did not become ready in time"
fi

cleanup() {
  echo "Stopping services..."
  kill "$BACK_PID" "$FRONT_PID" 2>/dev/null || true
}
trap cleanup EXIT

wait "$BACK_PID" "$FRONT_PID"
