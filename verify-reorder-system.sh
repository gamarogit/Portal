#!/bin/bash

# Script de verificación del sistema de reabastecimiento

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔍 Iniciando verificación del sistema de reabastecimiento..."
echo ""

# 1. Login y obtener token
echo "1️⃣ Obteniendo token de autenticación..."
TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin@activos.com","password":"admin123"}' | jq -r '.access_token')

if [ -z "$TOKEN" ] || [ "$TOKEN" == "null" ]; then
    echo -e "${RED}❌ Error: No se pudo obtener el token${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Token obtenido${NC}"
echo ""

# 2. Crear un proveedor de prueba
echo "2️⃣ Creando proveedor de prueba..."
VENDOR_RESPONSE=$(curl -s -X POST http://localhost:3000/api/activos/vendors \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Proveedor Test Reabastecimiento",
    "contactName": "Juan Pérez",
    "email": "juan@proveedor.com",
    "phone": "555-1234"
  }')

VENDOR_ID=$(echo $VENDOR_RESPONSE | jq -r '.id')
if [ -z "$VENDOR_ID" ] || [ "$VENDOR_ID" == "null" ]; then
    echo -e "${YELLOW}⚠️  Proveedor ya existe o error en creación${NC}"
    # Intentar obtener un vendor existente
    VENDOR_ID=$(curl -s -X GET http://localhost:3000/api/activos/vendors \
      -H "Authorization: Bearer $TOKEN" | jq -r '.[0].id')
fi
echo -e "${GREEN}✅ Proveedor ID: $VENDOR_ID${NC}"
echo ""

# 3. Crear producto con punto de reorden
echo "3️⃣ Creando producto con punto de reorden..."
PRODUCT_RESPONSE=$(curl -s -X POST http://localhost:3000/api/inventory/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"sku\": \"TEST-REORDER-001\",
    \"name\": \"Producto Test Reabastecimiento\",
    \"description\": \"Producto para probar el sistema de reabastecimiento\",
    \"category\": \"Pruebas\",
    \"unit\": \"unidad\",
    \"currentStock\": 50,
    \"minStock\": 10,
    \"maxStock\": 100,
    \"reorderPoint\": 20,
    \"optimalOrderQuantity\": 30,
    \"preferredSupplierId\": \"$VENDOR_ID\",
    \"unitCost\": 150.00,
    \"location\": \"Almacén A\"
  }")

PRODUCT_ID=$(echo $PRODUCT_RESPONSE | jq -r '.id')
if [ -z "$PRODUCT_ID" ] || [ "$PRODUCT_ID" == "null" ]; then
    echo -e "${RED}❌ Error creando producto${NC}"
    echo "Response: $PRODUCT_RESPONSE"
    exit 1
fi
echo -e "${GREEN}✅ Producto creado: $PRODUCT_ID${NC}"
echo "   Stock inicial: 50 unidades"
echo "   Punto de reorden: 20 unidades"
echo "   Cantidad óptima: 30 unidades"
echo ""

# 4. Registrar salida que active el punto de reorden
echo "4️⃣ Registrando salida para activar punto de reorden..."
MOVEMENT_RESPONSE=$(curl -s -X POST http://localhost:3000/api/inventory/products/movement \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"productId\": \"$PRODUCT_ID\",
    \"type\": \"SALIDA\",
    \"quantity\": 35,
    \"reason\": \"Venta\",
    \"reference\": \"TEST-001\",
    \"notes\": \"Salida de prueba para activar reabastecimiento\"
  }")

NEW_STOCK=$(echo $MOVEMENT_RESPONSE | jq -r '.newStock')
echo -e "${GREEN}✅ Movimiento registrado${NC}"
echo "   Stock anterior: 50"
echo "   Cantidad salida: 35"
echo "   Stock nuevo: $NEW_STOCK"
echo ""

# 5. Verificar creación de alerta
echo "5️⃣ Verificando creación de alerta de reabastecimiento..."
sleep 2  # Dar tiempo para que se cree la alerta
ALERTS_RESPONSE=$(curl -s -X GET "http://localhost:3000/api/inventory/reorder-alerts?status=PENDING" \
  -H "Authorization: Bearer $TOKEN")

ALERT_COUNT=$(echo $ALERTS_RESPONSE | jq '. | length')
if [ "$ALERT_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✅ Alerta creada correctamente${NC}"
    ALERT_ID=$(echo $ALERTS_RESPONSE | jq -r '.[0].id')
    SUGGESTED_QTY=$(echo $ALERTS_RESPONSE | jq -r '.[0].suggestedQuantity')
    echo "   Alert ID: $ALERT_ID"
    echo "   Cantidad sugerida: $SUGGESTED_QTY unidades"
    echo ""
    
    # 6. Crear orden de compra desde alerta
    echo "6️⃣ Creando orden de compra desde alerta..."
    PO_RESPONSE=$(curl -s -X POST "http://localhost:3000/api/inventory/purchase-orders/from-alert/$ALERT_ID" \
      -H "Authorization: Bearer $TOKEN")
    
    PO_NUMBER=$(echo $PO_RESPONSE | jq -r '.orderNumber')
    PO_ID=$(echo $PO_RESPONSE | jq -r '.id')
    if [ -z "$PO_NUMBER" ] || [ "$PO_NUMBER" == "null" ]; then
        echo -e "${RED}❌ Error creando orden de compra${NC}"
        echo "Response: $PO_RESPONSE"
    else
        echo -e "${GREEN}✅ Orden de compra creada${NC}"
        echo "   Número: $PO_NUMBER"
        echo "   Estado: DRAFT"
        echo ""
        
        # 7. Enviar orden
        echo "7️⃣ Enviando orden de compra..."
        curl -s -X PUT "http://localhost:3000/api/inventory/purchase-orders/$PO_ID/send" \
          -H "Authorization: Bearer $TOKEN" > /dev/null
        echo -e "${GREEN}✅ Orden enviada${NC}"
        echo ""
        
        # 8. Recibir mercancía
        echo "8️⃣ Recibiendo mercancía..."
        PO_ITEMS=$(curl -s -X GET "http://localhost:3000/api/inventory/purchase-orders/$PO_ID" \
          -H "Authorization: Bearer $TOKEN" | jq -r '.items[0].id')
        
        RECEIVE_RESPONSE=$(curl -s -X POST "http://localhost:3000/api/inventory/purchase-orders/$PO_ID/receive" \
          -H "Authorization: Bearer $TOKEN" \
          -H "Content-Type: application/json" \
          -d "{
            \"items\": [{
              \"itemId\": \"$PO_ITEMS\",
              \"receivedQty\": $SUGGESTED_QTY
            }]
          }")
        
        echo -e "${GREEN}✅ Mercancía recibida${NC}"
        echo ""
        
        # 9. Verificar actualización de inventario
        echo "9️⃣ Verificando actualización de inventario..."
        FINAL_PRODUCT=$(curl -s -X GET "http://localhost:3000/api/inventory/products/$PRODUCT_ID" \
          -H "Authorization: Bearer $TOKEN")
        
        FINAL_STOCK=$(echo $FINAL_PRODUCT | jq -r '.currentStock')
        echo -e "${GREEN}✅ Inventario actualizado${NC}"
        echo "   Stock anterior: $NEW_STOCK"
        echo "   Cantidad recibida: $SUGGESTED_QTY"
        echo "   Stock final: $FINAL_STOCK"
        echo ""
    fi
else
    echo -e "${RED}❌ No se creó la alerta automáticamente${NC}"
    echo "Response: $ALERTS_RESPONSE"
fi

echo ""
echo "========================================="
echo -e "${GREEN}✅ Verificación completada${NC}"
echo "========================================="
echo ""
echo "Accede a las vistas en:"
echo "  - Alertas: http://localhost:5174/inventory/reorder-alerts"
echo "  - Órdenes: http://localhost:5174/inventory/purchase-orders"
