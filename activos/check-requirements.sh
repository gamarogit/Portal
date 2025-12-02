#!/usr/bin/env bash
# Script para verificar todos los requisitos del sistema
# Útil al cambiar de computadora o configuración inicial

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔍 Verificación de Requisitos - Activos TI${NC}\n"

ERRORS=0
WARNINGS=0

# Función para verificar comando
check_command() {
  local cmd=$1
  local name=$2
  local required=$3
  local install_msg=$4
  
  if command -v "$cmd" >/dev/null 2>&1; then
    local version
    version=$($cmd --version 2>&1 | head -n 1 || echo "")
    echo -e "${GREEN}✓${NC} $name encontrado: $version"
    return 0
  else
    if [ "$required" = "true" ]; then
      echo -e "${RED}✗${NC} $name NO encontrado (REQUERIDO)"
      echo -e "  ${YELLOW}→${NC} $install_msg"
      ((ERRORS++))
    else
      echo -e "${YELLOW}⚠${NC} $name NO encontrado (opcional)"
      echo -e "  ${YELLOW}→${NC} $install_msg"
      ((WARNINGS++))
    fi
    return 1
  fi
}

# Verificar Node.js
echo -e "${BLUE}Node.js${NC}"
check_command "node" "Node.js" "true" "Instala desde: https://nodejs.org/ (Recomendado: v18 o superior)"

# Verificar npm
check_command "npm" "npm" "true" "npm se instala con Node.js"

# Verificar PostgreSQL
echo -e "\n${BLUE}Base de Datos${NC}"
check_command "psql" "PostgreSQL" "true" "macOS: brew install postgresql | Ubuntu: sudo apt install postgresql"
check_command "pg_isready" "pg_isready" "false" "Viene con PostgreSQL"

# Verificar Git
echo -e "\n${BLUE}Control de Versiones${NC}"
check_command "git" "Git" "true" "Instala desde: https://git-scm.com/"

# Verificar herramientas opcionales
echo -e "\n${BLUE}Herramientas Opcionales${NC}"
check_command "redis-cli" "Redis" "false" "macOS: brew install redis | Ubuntu: sudo apt install redis"
check_command "curl" "curl" "false" "macOS: brew install curl"
check_command "jq" "jq" "false" "macOS: brew install jq (útil para JSON)"

# Verificar archivos de configuración
echo -e "\n${BLUE}Archivos de Configuración${NC}"

if [ -f "backend/.env" ]; then
  echo -e "${GREEN}✓${NC} backend/.env existe"
else
  echo -e "${YELLOW}⚠${NC} backend/.env NO existe"
  echo -e "  ${YELLOW}→${NC} Copia backend/.env.example a backend/.env"
  ((WARNINGS++))
fi

if [ -f "frontend/.env.local" ]; then
  echo -e "${GREEN}✓${NC} frontend/.env.local existe"
else
  echo -e "${YELLOW}⚠${NC} frontend/.env.local NO existe"
  echo -e "  ${YELLOW}→${NC} Copia frontend/.env.local.example a frontend/.env.local"
  ((WARNINGS++))
fi

# Verificar dependencias instaladas
echo -e "\n${BLUE}Dependencias Node${NC}"

if [ -d "backend/node_modules" ]; then
  echo -e "${GREEN}✓${NC} Dependencias de backend instaladas"
else
  echo -e "${YELLOW}⚠${NC} Dependencias de backend NO instaladas"
  echo -e "  ${YELLOW}→${NC} Se instalarán automáticamente al ejecutar ./start.sh"
  ((WARNINGS++))
fi

if [ -d "frontend/node_modules" ]; then
  echo -e "${GREEN}✓${NC} Dependencias de frontend instaladas"
else
  echo -e "${YELLOW}⚠${NC} Dependencias de frontend NO instaladas"
  echo -e "  ${YELLOW}→${NC} Se instalarán automáticamente al ejecutar ./start.sh"
  ((WARNINGS++))
fi

# Verificar Prisma Client
if [ -d "backend/node_modules/@prisma/client" ]; then
  echo -e "${GREEN}✓${NC} Prisma Client generado"
else
  echo -e "${YELLOW}⚠${NC} Prisma Client NO generado"
  echo -e "  ${YELLOW}→${NC} Se generará automáticamente al ejecutar ./start.sh"
  ((WARNINGS++))
fi

# Verificar conexión a PostgreSQL
echo -e "\n${BLUE}Conectividad${NC}"

if [ -f "backend/.env" ]; then
  source backend/.env
  if command -v pg_isready >/dev/null 2>&1; then
    if pg_isready -q 2>/dev/null; then
      echo -e "${GREEN}✓${NC} PostgreSQL está corriendo"
    else
      echo -e "${RED}✗${NC} PostgreSQL NO está respondiendo"
      echo -e "  ${YELLOW}→${NC} Inicia PostgreSQL: pg_ctl start (o brew services start postgresql)"
      ((ERRORS++))
    fi
  fi
fi

# Resumen
echo -e "\n${BLUE}═══════════════════════════════════════${NC}"
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
  echo -e "${GREEN}✅ Todo listo! Puedes ejecutar ./start.sh${NC}"
  exit 0
elif [ $ERRORS -eq 0 ]; then
  echo -e "${YELLOW}⚠️  $WARNINGS advertencias encontradas${NC}"
  echo -e "${GREEN}Puedes continuar ejecutando ./start.sh${NC}"
  echo -e "${YELLOW}Las advertencias se resolverán automáticamente${NC}"
  exit 0
else
  echo -e "${RED}❌ $ERRORS errores encontrados${NC}"
  if [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}⚠️  $WARNINGS advertencias${NC}"
  fi
  echo -e "${YELLOW}Resuelve los errores antes de continuar${NC}"
  exit 1
fi
