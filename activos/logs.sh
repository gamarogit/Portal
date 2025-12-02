#!/usr/bin/env bash
# Script para ver logs del sistema

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}📝 Logs del Sistema de Activos TI${NC}\n"
echo -e "${YELLOW}Presiona Ctrl+C para salir${NC}\n"

tail -f /tmp/backend.log /tmp/frontend.log
