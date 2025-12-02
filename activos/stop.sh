#!/usr/bin/env bash
# Script para detener el sistema de Activos TI

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🛑 Deteniendo Sistema de Activos TI${NC}\n"

# Detener procesos
pkill -9 node 2>/dev/null && echo -e "${GREEN}✓ Backend detenido${NC}" || echo -e "${YELLOW}⚠️  Backend no estaba corriendo${NC}"
pkill -9 vite 2>/dev/null && echo -e "${GREEN}✓ Frontend detenido${NC}" || echo -e "${YELLOW}⚠️  Frontend no estaba corriendo${NC}"

sleep 2

# Verificar que se detuvieron
if lsof -i :3000 >/dev/null 2>&1 || lsof -i :5173 >/dev/null 2>&1; then
  echo -e "${RED}✗ Algunos procesos aún están corriendo${NC}"
  echo -e "${YELLOW}Puertos en uso:${NC}"
  lsof -i :3000 -i :5173 | grep LISTEN || true
else
  echo -e "\n${GREEN}✅ Todos los servicios detenidos correctamente${NC}"
fi
