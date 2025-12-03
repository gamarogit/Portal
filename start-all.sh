#!/bin/bash
set -e

# Determine the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
PORTAL_ROOT="$SCRIPT_DIR"

echo "🚀 Iniciando todos los servicios del portal..."
echo "📂 Raíz del proyecto: $PORTAL_ROOT"
echo ""

# Function to generate .env content
generate_env_content() {
    local service_name="$1"
    local port="$2"
    
    echo "DATABASE_URL=postgresql://$USER@localhost:5433/activos_portal"
    echo "JWT_SECRET=change-me-in-production-but-must-match-gateway"
    echo "PORT=$port"
    echo "NODE_ENV=development"
    echo "REDIS_URL=redis://localhost:6379"
    echo "PUBLIC_HOST=http://localhost"
    
    # Service specific URLs
    echo "ACTIVOS_API=http://localhost:3001"
    echo "ENTRENAMIENTO_API=http://localhost:3002"
    echo "GASTOS_API=http://localhost:3003"
    
    # Frontend URLs
    echo "PORTAL_FRONTEND=http://localhost:5174"
    echo "CORS_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:3101,http://localhost:3102,http://localhost:3103"
}

# Function to check and install dependencies and env vars
check_and_install() {
    local service_dir="$1"
    local service_name="$2"
    local port="$3" # Optional, for backend env generation
    
    if [ -d "$service_dir" ]; then
        # Check for .env
        if [ ! -f "$service_dir/.env" ]; then
            if [ -f "$service_dir/.env.example" ]; then
                echo "⚠️  .env faltante en $service_name. Copiando de .env.example..."
                cp "$service_dir/.env.example" "$service_dir/.env"
                # Update DATABASE_URL to use current user
                sed -i '' "s|postgresql://postgres:postgres@localhost|postgresql://$USER@localhost|g" "$service_dir/.env" 2>/dev/null || true
                echo "✅ .env creado en $service_name."
            elif [[ "$service_name" == *"backend"* ]]; then
                 echo "⚠️  .env faltante en $service_name y no hay ejemplo. Generando uno nuevo..."
                 generate_env_content "$service_name" "$port" > "$service_dir/.env"
                 echo "✅ .env generado para $service_name."
            elif [[ "$service_name" == *"frontend"* ]]; then
                 echo "⚠️  .env faltante en $service_name. Generando configuración básica..."
                 echo "VITE_API_URL=http://localhost:3000" > "$service_dir/.env"
                 echo "✅ .env generado para $service_name."
            else
                echo "ℹ️  No se encontró .env ni .env.example en $service_name. Saltando configuración de entorno."
            fi
        fi

        # Check for node_modules
        if [ ! -d "$service_dir/node_modules" ]; then
            echo "⚠️  Dependencias faltantes en $service_name. Instalando..."
            (cd "$service_dir" && npm install)
            echo "✅ Dependencias instaladas en $service_name."
        fi
    else
        echo "❌ Directorio no encontrado: $service_dir"
    fi
}

# Check and install Docker or PostgreSQL
echo "🗄️  Verificando base de datos..."

# Check if Docker is available
if command -v docker &> /dev/null; then
    # Check if Docker daemon is running
    if docker info &> /dev/null; then
        echo "   Docker detectado y corriendo. Usando contenedores..."
        if [ -f "$PORTAL_ROOT/gateway/docker-compose.yml" ]; then
            (cd "$PORTAL_ROOT/gateway" && docker compose up -d postgres redis 2>&1)
            if [ $? -eq 0 ]; then
                echo "✅ PostgreSQL y Redis iniciados en Docker."
                sleep 5
            else
                echo "⚠️  Error al iniciar Docker. Verifica que Docker Desktop esté corriendo."
                exit 1
            fi
        fi
    else
        echo "⚠️  Docker está instalado pero no está corriendo."
        echo "   Por favor, inicia Docker Desktop desde Applications."
        echo ""
        echo "   Esperando a que Docker inicie..."
        open -a Docker
        
        # Wait for Docker to start (max 60 seconds)
        for i in {1..60}; do
            if docker info &> /dev/null 2>&1; then
                echo "✅ Docker iniciado correctamente."
                (cd "$PORTAL_ROOT/gateway" && docker compose up -d postgres redis 2>&1)
                sleep 5
                break
            fi
            sleep 1
        done
        
        if ! docker info &> /dev/null 2>&1; then
            echo "❌ Docker no pudo iniciar. Por favor, inícialo manualmente."
            exit 1
        fi
    fi
elif [ -f "/opt/homebrew/opt/postgresql@15/bin/psql" ] || command -v psql &> /dev/null; then
    echo "   PostgreSQL ya está instalado."
    
    # Add to PATH if not already there
    export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"
    
    # Check if service is running
    if brew services list 2>/dev/null | grep -q "postgresql@15.*started"; then
        echo "✅ PostgreSQL está corriendo."
    else
        echo "   Iniciando PostgreSQL..."
        brew services stop postgresql@15 2>/dev/null
        sleep 2
        brew services start postgresql@15
        sleep 3
    fi
    
    # Check if database exists (without password prompt)
    if ! /opt/homebrew/opt/postgresql@15/bin/psql -U $USER -d postgres -lqt 2>/dev/null | cut -d \| -f 1 | grep -qw activos_portal; then
        echo "   Creando base de datos activos_portal..."
        /opt/homebrew/opt/postgresql@15/bin/createdb activos_portal 2>/dev/null || echo "   Base de datos ya existe."
        echo "✅ Base de datos lista."
    else
        echo "✅ Base de datos activos_portal ya existe."
    fi
else
    echo "⚠️  Ni Docker ni PostgreSQL están instalados."
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  🐳 INSTALACIÓN DE DOCKER REQUERIDA"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Docker Desktop es necesario para ejecutar la base de datos."
    echo ""
    echo "Descargando Docker Desktop..."
    
    # Detect architecture
    ARCH=$(uname -m)
    if [ "$ARCH" = "arm64" ]; then
        DOCKER_URL="https://desktop.docker.com/mac/main/arm64/Docker.dmg"
        echo "   Detectado: Apple Silicon (M1/M2/M3)"
    else
        DOCKER_URL="https://desktop.docker.com/mac/main/amd64/Docker.dmg"
        echo "   Detectado: Intel"
    fi
    
    echo ""
    echo "Descargando desde: $DOCKER_URL"
    curl -L -o ~/Downloads/Docker.dmg "$DOCKER_URL"
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Docker.dmg descargado en ~/Downloads/"
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "  📋 PASOS PARA INSTALAR:"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        echo "1. Abre el archivo: ~/Downloads/Docker.dmg"
        echo "2. Arrastra Docker a la carpeta Applications"
        echo "3. Abre Docker desde Applications"
        echo "4. Acepta los permisos que solicite"
        echo "5. Espera a que Docker diga 'Docker Desktop is running'"
        echo "6. Vuelve a ejecutar: ./start-all.sh"
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        
        # Try to open the DMG
        open ~/Downloads/Docker.dmg 2>/dev/null
        
        exit 1
    else
        echo "❌ Error al descargar Docker."
        echo ""
        echo "Por favor, descárgalo manualmente desde:"
        echo "https://www.docker.com/products/docker-desktop"
        exit 1
    fi
fi
echo ""

# List of services to check
# Format: "path service_name port"
check_and_install "$PORTAL_ROOT/gateway/backend" "gateway/backend" "3000"
check_and_install "$PORTAL_ROOT/gateway/frontend" "gateway/frontend" ""
check_and_install "$PORTAL_ROOT/activos/backend" "activos/backend" "3001"
check_and_install "$PORTAL_ROOT/activos/frontend" "activos/frontend" ""
check_and_install "$PORTAL_ROOT/entrenamiento/backend" "entrenamiento/backend" "3002"
check_and_install "$PORTAL_ROOT/entrenamiento/frontend" "entrenamiento/frontend" ""
check_and_install "$PORTAL_ROOT/gastos/backend" "gastos/backend" "3003"
check_and_install "$PORTAL_ROOT/gastos/frontend" "gastos/frontend" ""

echo "✅ Verificación de dependencias y entorno completada."
echo ""

# Gateway Backend
echo "📦 Iniciando Gateway Backend (puerto 3000)..."
(cd "$PORTAL_ROOT/gateway/backend" && npm run start:dev > /tmp/portal-gateway-backend.log 2>&1) &
GATEWAY_PID=$!

sleep 2

# Gateway Frontend
echo "🎨 Iniciando Gateway Frontend (puerto 5174)..."
(cd "$PORTAL_ROOT/gateway/frontend" && npm run dev > /tmp/portal-gateway-frontend.log 2>&1) &
PORTAL_PID=$!

sleep 2

# Activos Backend
echo "📦 Iniciando Activos Backend (puerto 3001)..."
(cd "$PORTAL_ROOT/activos/backend" && npm run start:dev > /tmp/portal-activos-backend.log 2>&1) &
ACTIVOS_BE_PID=$!

sleep 2

# Activos Frontend
echo "🎨 Iniciando Activos Frontend (puerto 3101)..."
(cd "$PORTAL_ROOT/activos/frontend" && npm run dev > /tmp/portal-activos-frontend.log 2>&1) &
ACTIVOS_FE_PID=$!

# Entrenamiento Backend
echo "📦 Iniciando Entrenamiento Backend (puerto 3002)..."
(cd "$PORTAL_ROOT/entrenamiento/backend" && npm run start:dev > /tmp/portal-entrenamiento-backend.log 2>&1) &
ENTRENAMIENTO_BE_PID=$!

sleep 2

# Entrenamiento Frontend
echo "🎨 Iniciando Entrenamiento Frontend (puerto 3102)..."
(cd "$PORTAL_ROOT/entrenamiento/frontend" && npm run dev > /tmp/portal-entrenamiento-frontend.log 2>&1) &
ENTRENAMIENTO_FE_PID=$!

sleep 2

# Gastos Backend
echo "📦 Iniciando Gastos Backend (puerto 3003)..."
(cd "$PORTAL_ROOT/gastos/backend" && npm run start:dev > /tmp/portal-gastos-backend.log 2>&1) &
GASTOS_BE_PID=$!

sleep 2

# Gastos Frontend
echo "🎨 Iniciando Gastos Frontend (puerto 3103)..."
(cd "$PORTAL_ROOT/gastos/frontend" && npm run dev > /tmp/portal-gastos-frontend.log 2>&1) &
GASTOS_FE_PID=$!

echo ""
echo "✅ Servicios iniciados:"
echo "   Gateway Backend:  PID $GATEWAY_PID  - http://localhost:3000"
echo "   Gateway Frontend: PID $PORTAL_PID   - http://localhost:5174"
echo "   Activos Backend:  PID $ACTIVOS_BE_PID - http://localhost:3001"
echo "   Activos Frontend: PID $ACTIVOS_FE_PID - http://localhost:3101"
echo "   Entren. Backend:  PID $ENTRENAMIENTO_BE_PID - http://localhost:3002"
echo "   Entren. Frontend: PID $ENTRENAMIENTO_FE_PID - http://localhost:3102"
echo "   Gastos Backend:   PID $GASTOS_BE_PID - http://localhost:3003"
echo "   Gastos Frontend:  PID $GASTOS_FE_PID - http://localhost:3103"
echo ""
echo "⏳ Esperando inicialización (10 segundos)..."
sleep 10
echo ""
echo "📝 Ver logs:"
echo "   tail -f /tmp/portal-gateway-backend.log"
echo "   tail -f /tmp/portal-gateway-frontend.log"
echo "   tail -f /tmp/portal-activos-backend.log"
echo "   tail -f /tmp/portal-activos-frontend.log"
echo "   tail -f /tmp/portal-entrenamiento-backend.log"
echo "   tail -f /tmp/portal-entrenamiento-frontend.log"
echo "   tail -f /tmp/portal-gastos-backend.log"
echo "   tail -f /tmp/portal-gastos-frontend.log"
echo ""
echo "🛑 Detener servicios:"
echo "   pkill -f 'nest|vite'"
