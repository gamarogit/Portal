#!/usr/bin/env bash
# Script robusto para iniciar el sistema de Activos TI
# Versión: 2.0 - 2025-12-01
# Incluye verificación automática de dependencias

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Iniciando Sistema de Activos TI${NC}\n"

# Función para limpiar procesos
cleanup() {
  echo -e "\n${YELLOW}🧹 Limpiando procesos...${NC}"
  pkill -9 node 2>/dev/null || true
  pkill -9 vite 2>/dev/null || true
  sleep 2
}

# Función para verificar si un puerto está en uso
check_port() {
  lsof -i :"$1" >/dev/null 2>&1
}

# Función para verificar e instalar dependencias de Node
check_and_install_dependencies() {
  local dir=$1
  local name=$2
  
  echo -e "${BLUE}📦 Verificando dependencias de ${name}...${NC}"
  cd "$dir"
  
  if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚙️  Instalando dependencias de ${name} (primera vez o computadora nueva)...${NC}"
    npm install
    echo -e "${GREEN}✓ Dependencias de ${name} instaladas${NC}"
  else
    # Verificar si package.json es más reciente que node_modules
    if [ package.json -nt node_modules ]; then
      echo -e "${YELLOW}⚙️  Actualizando dependencias de ${name}...${NC}"
      npm install
      echo -e "${GREEN}✓ Dependencias de ${name} actualizadas${NC}"
    else
      echo -e "${GREEN}✓ Dependencias de ${name} ya instaladas${NC}"
    fi
  fi
  
  cd - > /dev/null
}

# Limpiar procesos anteriores
cleanup

# Verificar Node.js
echo -e "${BLUE}🔍 Verificando Node.js...${NC}"
if ! command -v node >/dev/null 2>&1; then
  echo -e "${RED}✗ Node.js no está instalado${NC}"
  echo -e "${YELLOW}Instala Node.js desde: https://nodejs.org/${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Node.js $(node -v) detectado${NC}"

# Verificar npm
if ! command -v npm >/dev/null 2>&1; then
  echo -e "${RED}✗ npm no está instalado${NC}"
  exit 1
fi
echo -e "${GREEN}✓ npm $(npm -v) detectado${NC}"

# Instalar/verificar dependencias del backend
check_and_install_dependencies "backend" "Backend"

# Instalar/verificar dependencias del frontend
check_and_install_dependencies "frontend" "Frontend"

# Verificar que PostgreSQL esté disponible
echo -e "${BLUE}📊 Verificando base de datos...${NC}"
cd backend
if [ -f .env ]; then
  source .env
  if command -v psql >/dev/null 2>&1 && [ -n "$DATABASE_URL" ]; then
    echo -e "${GREEN}✓ Base de datos configurada${NC}"
  else
    echo -e "${YELLOW}⚠️  PostgreSQL no detectado, continuando...${NC}"
  fi
  
  # Generar cliente de Prisma si es necesario
  echo -e "${BLUE}🔧 Verificando Prisma Client...${NC}"
  if [ ! -d "node_modules/@prisma/client" ] || [ prisma/schema.prisma -nt node_modules/@prisma/client ]; then
    echo -e "${YELLOW}⚙️  Generando Prisma Client...${NC}"
    npx prisma generate
    echo -e "${GREEN}✓ Prisma Client generado${NC}"
  else
    echo -e "${GREEN}✓ Prisma Client actualizado${NC}"
  fi
  
  # Sincronizar esquema de base de datos si es necesario
  echo -e "${BLUE}🗄️  Verificando sincronización de base de datos...${NC}"
  if npx prisma db push --accept-data-loss --skip-generate 2>/dev/null; then
    echo -e "${GREEN}✓ Base de datos sincronizada${NC}"
  else
    echo -e "${YELLOW}⚠️  No se pudo sincronizar la base de datos automáticamente${NC}"
    echo -e "${YELLOW}   Ejecuta manualmente: cd backend && npx prisma db push${NC}"
  fi
else
  echo -e "${RED}⚠️  Archivo .env no encontrado en backend${NC}"
  echo -e "${YELLOW}   Copia .env.example a .env y configura las variables${NC}"
fi
cd ..

# Limpiar cachés problemáticos
echo -e "${YELLOW}🧹 Limpiando cachés...${NC}"
rm -rf frontend/node_modules/.vite 2>/dev/null || true
rm -rf frontend/dist 2>/dev/null || true

# Iniciar backend
echo -e "${YELLOW}🔧 Iniciando backend...${NC}"
cd backend
nohup npm run start:dev > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Esperar a que el backend esté listo
echo -e "${YELLOW}⏳ Esperando backend...${NC}"
for i in {1..30}; do
  if check_port 3000; then
    echo -e "${GREEN}✓ Backend listo en puerto 3000${NC}"
    break
  fi
  sleep 1
  if [ $i -eq 30 ]; then
    echo -e "${RED}✗ Backend no respondió a tiempo${NC}"
    echo -e "${YELLOW}Ver logs: tail -f /tmp/backend.log${NC}"
    exit 1
  fi
done

# Iniciar frontend
echo -e "${YELLOW}🎨 Iniciando frontend...${NC}"
cd frontend
nohup npm run dev > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Esperar a que el frontend esté listo
echo -e "${YELLOW}⏳ Esperando frontend...${NC}"
for i in {1..30}; do
  if check_port 5173; then
    echo -e "${GREEN}✓ Frontend listo en puerto 5173${NC}"
    break
  fi
  sleep 1
  if [ $i -eq 30 ]; then
    echo -e "${RED}✗ Frontend no respondió a tiempo${NC}"
    echo -e "${YELLOW}Ver logs: tail -f /tmp/frontend.log${NC}"
    exit 1
  fi
done

# Resumen
echo -e "\n${GREEN}✅ Sistema iniciado correctamente${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "  🌐 Frontend: ${GREEN}http://localhost:5173${NC}"
echo -e "  🔧 Backend:  ${GREEN}http://localhost:3000${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "\n📝 Logs:"
echo -e "  Backend:  tail -f /tmp/backend.log"
echo -e "  Frontend: tail -f /tmp/frontend.log"
echo -e "\n🛑 Para detener: ./stop.sh"
echo -e "\nPIDs:"
echo -e "  Backend:  $BACKEND_PID"
echo -e "  Frontend: $FRONTEND_PID\n"
