#!/bin/bash

# Script para levantar los servicios del sistema de gestión de activos
# Ejecutar desde el directorio raíz del proyecto

set -e

echo "🚀 Iniciando Sistema de Gestión de Activos TI"
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Error: Ejecutar desde el directorio raíz del proyecto"
    echo "   (debe contener las carpetas backend/ y frontend/)"
    exit 1
fi

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. Verificar PostgreSQL
echo -e "${YELLOW}[1/4] Verificando PostgreSQL...${NC}"
if command -v psql &> /dev/null; then
    # Cargar DATABASE_URL desde backend/.env
    if [ -f "backend/.env" ]; then
        export $(cat backend/.env | grep DATABASE_URL | xargs)
        if psql "$DATABASE_URL" -c '\q' 2>/dev/null; then
            echo -e "${GREEN}✓ PostgreSQL conectado${NC}"
        else
            echo -e "${YELLOW}⚠ PostgreSQL no responde. Verificar DATABASE_URL en backend/.env${NC}"
        fi
    else
        echo -e "${YELLOW}⚠ Archivo backend/.env no encontrado${NC}"
    fi
else
    echo -e "${YELLOW}⚠ psql no encontrado. Asegúrate de tener PostgreSQL instalado${NC}"
fi
echo ""

# 2. Instalar dependencias si es necesario
echo -e "${YELLOW}[2/4] Verificando dependencias...${NC}"

if [ ! -d "backend/node_modules" ]; then
    echo "Instalando dependencias del backend..."
    cd backend && npm install && cd ..
    echo -e "${GREEN}✓ Dependencias backend instaladas${NC}"
else
    echo -e "${GREEN}✓ Dependencias backend OK${NC}"
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "Instalando dependencias del frontend..."
    cd frontend && npm install && cd ..
    echo -e "${GREEN}✓ Dependencias frontend instaladas${NC}"
else
    echo -e "${GREEN}✓ Dependencias frontend OK${NC}"
fi
echo ""

# 3. Limpiar procesos previos
echo -e "${YELLOW}[3/4] Limpiando procesos previos...${NC}"
pkill -f "ts-node-dev.*src/main.ts" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true
# Verificar si el puerto 5173 está en uso y liberar
lsof -ti:5173 | xargs kill -9 2>/dev/null || true
# Verificar puerto 3000
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
sleep 2
echo -e "${GREEN}✓ Procesos limpiados${NC}"
echo ""

# 4. Iniciar servicios
echo -e "${YELLOW}[4/4] Iniciando servicios...${NC}"

# Backend
echo "🔧 Iniciando backend..."
cd backend
npx ts-node-dev --respawn --transpile-only -r tsconfig-paths/register src/main.ts > /tmp/activos-backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Esperar a que el backend esté listo
echo "⏳ Esperando backend..."
for i in {1..30}; do
    if curl -s http://localhost:3000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Backend listo (PID: $BACKEND_PID)${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${YELLOW}⚠ Backend tardó más de lo esperado. Ver logs: tail -f /tmp/activos-backend.log${NC}"
    fi
    sleep 1
done

# Frontend
echo "🎨 Iniciando frontend..."
cd frontend
npm run dev > /tmp/activos-frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Esperar a que el frontend esté listo
echo "⏳ Esperando frontend..."
for i in {1..30}; do
    if curl -s http://localhost:5173 > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Frontend listo (PID: $FRONTEND_PID)${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${YELLOW}⚠ Frontend tardó más de lo esperado. Ver logs: tail -f /tmp/activos-frontend.log${NC}"
    fi
    sleep 1
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Sistema iniciado correctamente${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${BLUE}🌐 URLs:${NC}"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:3000"
echo "   Health:   http://localhost:3000/health"
echo ""
echo -e "${BLUE}📝 Logs:${NC}"
echo "   Backend:  tail -f /tmp/activos-backend.log"
echo "   Frontend: tail -f /tmp/activos-frontend.log"
echo ""
echo -e "${BLUE}🔧 Gestión:${NC}"
echo "   Detener:  ./stop.sh"
echo "   Ver logs: ./logs.sh"
echo "   Estado:   ./health.sh"
echo ""
echo -e "${BLUE}📊 PIDs:${NC}"
echo "   Backend:  $BACKEND_PID"
echo "   Frontend: $FRONTEND_PID"
echo ""
echo -e "${BLUE}📚 Endpoints disponibles:${NC}"
echo "   GET  /dashboard          - Métricas ejecutivas"
echo "   GET  /notifications      - Alertas activas"
echo "   GET  /assets/search      - Búsqueda avanzada"
echo "   GET  /licenses           - Gestión de licencias"
echo "   GET  /vendors            - Gestión de proveedores"
echo "   GET  /history/asset/:id  - Timeline del activo"
echo "   GET  /qr/asset/:id       - Generar código QR"
echo "   POST /attachments/upload/:assetId - Subir archivos"
echo ""
