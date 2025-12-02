#!/usr/bin/env bash
# Health check del sistema

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🏥 Health Check - Sistema de Activos TI${NC}\n"

# Verificar Backend
echo -n "🔧 Backend (puerto 3000): "
if lsof -i :3000 >/dev/null 2>&1; then
  if curl -s http://localhost:3000/metrics >/dev/null 2>&1; then
    echo -e "${GREEN}✓ OK${NC}"
  else
    echo -e "${YELLOW}⚠️  Puerto abierto pero no responde${NC}"
  fi
else
  echo -e "${RED}✗ NO CORRIENDO${NC}"
fi

# Verificar Frontend
echo -n "🎨 Frontend (puerto 5173): "
if lsof -i :5173 >/dev/null 2>&1; then
  if curl -s http://localhost:5173 >/dev/null 2>&1; then
    echo -e "${GREEN}✓ OK${NC}"
  else
    echo -e "${YELLOW}⚠️  Puerto abierto pero no responde${NC}"
  fi
else
  echo -e "${RED}✗ NO CORRIENDO${NC}"
fi

# Verificar PostgreSQL
echo -n "🐘 PostgreSQL: "
if command -v psql >/dev/null 2>&1; then
  if [ -f backend/.env ]; then
    source backend/.env
    if psql "$DATABASE_URL" -c "SELECT 1" >/dev/null 2>&1; then
      echo -e "${GREEN}✓ OK${NC}"
    else
      echo -e "${YELLOW}⚠️  Instalado pero no conecta${NC}"
    fi
  else
    echo -e "${YELLOW}⚠️  No se encontró .env${NC}"
  fi
else
  echo -e "${YELLOW}⚠️  Cliente no instalado${NC}"
fi

# Verificar logs
echo -e "\n📝 Logs recientes:"
if [ -f /tmp/backend.log ]; then
  echo -e "${YELLOW}Backend (últimas 3 líneas):${NC}"
  tail -3 /tmp/backend.log 2>/dev/null
else
  echo -e "${RED}No hay logs de backend${NC}"
fi

echo ""
if [ -f /tmp/frontend.log ]; then
  echo -e "${YELLOW}Frontend (últimas 3 líneas):${NC}"
  tail -3 /tmp/frontend.log 2>/dev/null
else
  echo -e "${RED}No hay logs de frontend${NC}"
fi

echo -e "\n${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
