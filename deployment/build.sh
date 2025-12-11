#!/bin/bash
set -e

# Obtener la ruta absoluta del directorio del script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &>/dev/null && pwd)"
PORTAL_ROOT="$(dirname "$SCRIPT_DIR")"

echo "📦 Building all projects for production..."
echo "Portal root is: $PORTAL_ROOT"
echo ""

# Gateway Backend
echo "-> Building Gateway Backend..."
cd "$PORTAL_ROOT/gateway/backend"
npm install
npm run build
echo "✅ Gateway Backend built."
echo ""

# Gateway Frontend
echo "-> Building Gateway Frontend..."
cd "$PORTAL_ROOT/gateway/frontend"
npm install
npm run build
echo "✅ Gateway Frontend built."
echo ""

# Activos Backend
echo "-> Building Activos Backend..."
cd "$PORTAL_ROOT/activos/backend"
npm install
npm run build
echo "✅ Activos Backend built."
echo ""

# Activos Frontend
echo "-> Building Activos Frontend..."
cd "$PORTAL_ROOT/activos/frontend"
npm install
npm run build
echo "✅ Activos Frontend built."
echo ""

echo "🎉 All projects have been built successfully!"
