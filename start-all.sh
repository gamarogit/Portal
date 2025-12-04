#!/bin/bash
set -e

PORTAL_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export JWT_SECRET="super-secret-key-123"

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Iniciando script de arranque y configuración del Portal...${NC}"
echo ""

# 0. Detener servicios previos
echo -e "${YELLOW}🛑 Deteniendo servicios previos...${NC}"
pkill -f 'nest|vite' || true
sleep 2
echo -e "${GREEN}✅ Servicios detenidos.${NC}"
echo ""

# 1. Verificación de Prerrequisitos
echo -e "${YELLOW}🔍 Verificando prerrequisitos...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js no está instalado. Por favor instálalo para continuar.${NC}"
    exit 1
fi
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm no está instalado. Por favor instálalo para continuar.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Prerrequisitos encontrados.${NC}"
echo ""

# Función para configurar un servicio
setup_service() {
    local service_name=$1
    local path=$2
    local port=$3
    local type=$4 # backend o frontend

    echo -e "${YELLOW}⚙️  Configurando $service_name ($type)...${NC}"

    if [ ! -d "$path" ]; then
        echo -e "${RED}❌ Directorio no encontrado: $path${NC}"
        return
    fi

    cd "$path"

    # Instalar dependencias si no existen
    if [ ! -d "node_modules" ]; then
        echo "   📦 Instalando dependencias..."
        npm install
    else
        echo "   ✅ Dependencias ya instaladas."
    fi

    # Configurar .env si es backend y no existe
    if [ "$type" == "backend" ] && [ ! -f ".env" ]; then
        echo "   📝 Creando archivo .env..."
        if [ -f ".env.example" ]; then
            cp .env.example .env
        else
            # Crear un .env básico si no hay ejemplo
            echo "PORT=$port" > .env
            echo "DATABASE_URL=\"postgresql://postgres:postgres@localhost:5432/portal?schema=public\"" >> .env
            echo "JWT_SECRET=\"super-secret-key-123\"" >> .env
            echo "JWT_ISSUER=\"portal\"" >> .env
            echo "JWT_AUDIENCE=\"portal-users\"" >> .env
        fi
        echo -e "   ${GREEN}✅ .env creado. ¡Revisa la configuración de base de datos!${NC}"
    fi

    cd "$PORTAL_ROOT"
}

# 2. Configuración de Servicios
setup_service "Gateway" "gateway/backend" "3000" "backend"
setup_service "Gateway" "gateway/frontend" "5174" "frontend"
setup_service "Activos" "activos/backend" "3001" "backend"
setup_service "Activos" "activos/frontend" "3101" "frontend"
setup_service "Entrenamiento" "entrenamiento/backend" "3002" "backend"
setup_service "Entrenamiento" "entrenamiento/frontend" "3102" "frontend"
setup_service "Gastos" "gastos/backend" "3003" "backend"
setup_service "Gastos" "gastos/frontend" "3103" "frontend"

echo ""
echo -e "${GREEN}✅ Configuración completada.${NC}"
echo ""

# 3. Inicio de Servicios
echo -e "${GREEN}🚀 Iniciando servicios...${NC}"

start_service() {
    local name=$1
    local path=$2
    local cmd=$3
    local logfile=$4
    
    echo "   Iniciando $name..."
    (cd "$path" && $cmd > "$logfile" 2>&1) &
    echo $! > "/tmp/${logfile##*/}.pid"
}

start_service "Gateway Backend" "gateway/backend" "npm run start:dev" "/tmp/portal-gateway-backend.log"
start_service "Gateway Frontend" "gateway/frontend" "npm run dev" "/tmp/portal-gateway-frontend.log"

start_service "Activos Backend" "activos/backend" "npm run start:dev" "/tmp/portal-activos-backend.log"
start_service "Activos Frontend" "activos/frontend" "npm run dev" "/tmp/portal-activos-frontend.log"

start_service "Entrenamiento Backend" "entrenamiento/backend" "npm run start:dev" "/tmp/portal-entrenamiento-backend.log"
start_service "Entrenamiento Frontend" "entrenamiento/frontend" "npm run dev" "/tmp/portal-entrenamiento-frontend.log"

start_service "Gastos Backend" "gastos/backend" "npm run start:dev" "/tmp/portal-gastos-backend.log"
start_service "Gastos Frontend" "gastos/frontend" "npm run dev" "/tmp/portal-gastos-frontend.log"

echo ""
echo -e "${GREEN}✅ Todos los servicios han sido iniciados en segundo plano.${NC}"
echo "   Puedes monitorear los logs en /tmp/portal-*.log"
echo ""
echo "   Gateway: http://localhost:5174"
echo "   Activos: http://localhost:3101"
echo ""
echo "   Para detener todo: pkill -f 'nest|vite'"
