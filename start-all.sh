#!/bin/bash
set -e

PORTAL_ROOT="/Users/gamaro/Git/portal"

echo "🚀 Iniciando todos los servicios del portal..."
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

echo ""
echo "✅ Servicios iniciados:"
echo "   Gateway Backend:  PID $GATEWAY_PID  - http://localhost:3000"
echo "   Gateway Frontend: PID $PORTAL_PID   - http://localhost:5174"
echo "   Activos Backend:  PID $ACTIVOS_BE_PID - http://localhost:3001"
echo "   Activos Frontend: PID $ACTIVOS_FE_PID - http://localhost:3101"
echo ""
echo "⏳ Esperando inicialización (10 segundos)..."
sleep 10
echo ""
echo "📝 Ver logs:"
echo "   tail -f /tmp/portal-gateway-backend.log"
echo "   tail -f /tmp/portal-gateway-frontend.log"
echo "   tail -f /tmp/portal-activos-backend.log"
echo "   tail -f /tmp/portal-activos-frontend.log"
echo ""
echo "🛑 Detener servicios:"
echo "   pkill -f 'nest|vite'"
