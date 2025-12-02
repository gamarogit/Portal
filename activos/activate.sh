#!/bin/bash

# Script de activación completa - Sistema de Gestión de Activos
# Ejecuta todas las configuraciones pendientes para activar los 8 módulos nuevos

set -e  # Exit on error

echo "========================================="
echo "  Activación de Módulos Implementados"
echo "========================================="
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Verificar ubicación
echo -e "${YELLOW}[1/6] Verificando ubicación...${NC}"
if [ ! -f "backend/package.json" ]; then
    echo -e "${RED}Error: Ejecutar desde la raíz del proyecto (donde está backend/)${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Ubicación correcta${NC}"
echo ""

# 2. Instalar dependencias faltantes
echo -e "${YELLOW}[2/6] Instalando dependencias...${NC}"
cd backend

if ! npm list qrcode &> /dev/null; then
    echo "Instalando qrcode y @types/qrcode..."
    npm install qrcode @types/qrcode
    echo -e "${GREEN}✓ Paquetes instalados${NC}"
else
    echo -e "${GREEN}✓ Paquetes ya instalados${NC}"
fi

echo ""

# 3. Verificar base de datos
echo -e "${YELLOW}[3/6] Verificando base de datos PostgreSQL...${NC}"
if ! command -v psql &> /dev/null; then
    echo -e "${RED}Error: psql no encontrado. Instalar PostgreSQL client.${NC}"
    exit 1
fi

# Verificar conexión a DB usando las variables de .env
if [ -f ".env" ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

echo "Intentando conectar a la base de datos..."
if psql "$DATABASE_URL" -c '\dt' &> /dev/null; then
    echo -e "${GREEN}✓ Conexión exitosa a PostgreSQL${NC}"
else
    echo -e "${RED}Error: No se pudo conectar a PostgreSQL. Verificar DATABASE_URL en backend/.env${NC}"
    echo "DATABASE_URL actual: $DATABASE_URL"
    exit 1
fi

echo ""

# 4. Ejecutar migración SQL
echo -e "${YELLOW}[4/6] Ejecutando migración SQL manual...${NC}"
if [ -f "manual-migration.sql" ]; then
    echo "Aplicando cambios de schema..."
    
    # Intentar ejecutar migración
    if psql "$DATABASE_URL" -f manual-migration.sql &> /tmp/migration-output.txt; then
        echo -e "${GREEN}✓ Migración ejecutada${NC}"
        
        # Mostrar tablas creadas
        echo "Verificando tablas nuevas..."
        psql "$DATABASE_URL" -c "\dt License* Vendor* Maintenance*" 2>/dev/null || true
    else
        echo -e "${YELLOW}⚠ Advertencia: Algunas tablas/columnas ya pueden existir${NC}"
        echo "Ver detalles en /tmp/migration-output.txt"
    fi
else
    echo -e "${RED}Error: No se encontró manual-migration.sql${NC}"
    exit 1
fi

echo ""

# 5. Regenerar cliente Prisma
echo -e "${YELLOW}[5/6] Regenerando cliente Prisma...${NC}"
npx prisma generate > /dev/null 2>&1
echo -e "${GREEN}✓ Cliente Prisma actualizado${NC}"
echo ""

# 6. Verificar compilación TypeScript
echo -e "${YELLOW}[6/6] Verificando compilación...${NC}"
npm run build > /tmp/build-output.txt 2>&1 || {
    echo -e "${RED}Error en compilación. Ver /tmp/build-output.txt${NC}"
    tail -20 /tmp/build-output.txt
    exit 1
}
echo -e "${GREEN}✓ Compilación exitosa${NC}"
echo ""

# Resumen
echo "========================================="
echo -e "${GREEN}  ✓ Activación Completada${NC}"
echo "========================================="
echo ""
echo "Módulos activados:"
echo "  ✓ NotificationModule - Alertas automáticas"
echo "  ✓ LicenseModule - Gestión de licencias"
echo "  ✓ DashboardModule - Métricas ejecutivas"
echo "  ✓ AttachmentModule - Adjuntos (local storage)"
echo "  ✓ HistoryModule - Timeline de activos"
echo "  ✓ VendorModule - Gestión de proveedores"
echo "  ✓ QrModule - Códigos QR"
echo "  ✓ AssetModule - Búsqueda avanzada"
echo ""
echo "Siguiente paso:"
echo "  cd .. && bash scripts/dev-all.sh"
echo ""
echo "Endpoints disponibles:"
echo "  GET  /dashboard"
echo "  GET  /notifications"
echo "  GET  /assets/search"
echo "  GET  /history/asset/:id"
echo "  GET  /licenses"
echo "  GET  /vendors"
echo "  GET  /qr/asset/:id"
echo "  POST /attachments/upload/:assetId"
echo ""
echo "Documentación:"
echo "  - IMPLEMENTACION.md"
echo "  - RESUMEN_EJECUTIVO.md"
echo "  - README.md"
echo ""
