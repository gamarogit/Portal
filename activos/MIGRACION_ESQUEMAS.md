# 🔄 Sistema de Migración Automática de Esquemas

## Descripción

El sistema ahora detecta automáticamente cuando agregas nuevos campos en los formularios dinámicos y crea las columnas correspondientes en la base de datos PostgreSQL.

## ✨ Características

- ✅ Detección automática de campos nuevos
- ✅ Creación automática de columnas en la base de datos
- ✅ Mapeo inteligente de tipos de campos a tipos SQL
- ✅ Validación de nombres de columnas
- ✅ No afecta campos existentes
- ✅ Logs detallados del proceso

## 🚀 Uso Automático

Cuando editas un formulario desde la **Vista de Configuración** y agregas un nuevo campo:

1. El sistema detecta el campo nuevo
2. Determina la tabla correspondiente (AssetForm → Asset, UserForm → User, etc.)
3. Crea automáticamente la columna en PostgreSQL
4. Guarda la configuración del formulario

**¡No necesitas hacer nada adicional!**

## 📋 Mapeo de Tablas

| Formulario | Tabla en BD |
|-----------|-------------|
| AssetForm | Asset |
| UserForm | User |
| RoleForm | Role |
| LicensesView | License |
| MovementView | Movement |
| MaintenanceView | Maintenance |
| VendorsView | Vendor |

## 🎯 Tipos de Campos Soportados

| Tipo de Campo | Tipo SQL | Ejemplo |
|--------------|----------|---------|
| text | VARCHAR(255) | Texto corto |
| textarea | TEXT | Texto largo |
| number | NUMERIC | Números decimales |
| date | TIMESTAMP | Fechas |
| datetime | TIMESTAMP | Fecha y hora |
| email | VARCHAR(255) | Correos |
| tel | VARCHAR(50) | Teléfonos |
| url | VARCHAR(500) | URLs |
| select | VARCHAR(100) | Listas desplegables |
| checkbox | BOOLEAN | Casillas |
| radio | VARCHAR(100) | Opciones |
| file | VARCHAR(500) | Rutas de archivos |

## 📡 API Endpoints

### Verificar si una columna existe

```bash
GET /schema-migration/check/:tableName/:columnName

# Ejemplo
curl http://localhost:3000/schema-migration/check/Asset/customField
```

**Respuesta:**
```json
{
  "exists": false,
  "tableName": "Asset",
  "columnName": "customField"
}
```

### Agregar una columna manualmente

```bash
POST /schema-migration/add-column
Content-Type: application/json

{
  "tableName": "Asset",
  "columnName": "customField",
  "fieldType": "text",
  "nullable": true,
  "defaultValue": null
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "✅ Columna customField agregada exitosamente a Asset"
}
```

### Sincronizar formulario completo

```bash
POST /schema-migration/sync-form
Content-Type: application/json

{
  "formName": "AssetForm",
  "fields": [
    {
      "name": "serialNumber",
      "type": "text",
      "required": true
    },
    {
      "name": "customField1",
      "type": "textarea"
    }
  ]
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "✅ Sincronización completada para AssetForm → Asset",
  "details": [
    {
      "field": "serialNumber",
      "message": "Campo serialNumber ya existe"
    },
    {
      "field": "customField1",
      "message": "✅ Columna customField1 agregada exitosamente a Asset"
    }
  ]
}
```

### Listar tablas disponibles

```bash
GET /schema-migration/tables
```

**Respuesta:**
```json
{
  "tables": [
    "Asset",
    "User",
    "Role",
    "Movement",
    "Maintenance",
    "License",
    "Vendor",
    ...
  ]
}
```

### Ver columnas de una tabla

```bash
GET /schema-migration/tables/:tableName/columns

# Ejemplo
curl http://localhost:3000/schema-migration/tables/Asset/columns
```

**Respuesta:**
```json
{
  "tableName": "Asset",
  "columns": [
    {
      "name": "id",
      "type": "uuid",
      "nullable": false,
      "default": "uuid_generate_v4()"
    },
    {
      "name": "code",
      "type": "character varying",
      "nullable": false,
      "default": null
    },
    ...
  ]
}
```

## 🔒 Seguridad

- ✅ Todos los endpoints requieren autenticación JWT
- ✅ Validación de nombres de columnas (solo letras, números y guión bajo)
- ✅ Prevención de inyección SQL con consultas parametrizadas
- ✅ Verificación de existencia antes de crear columnas

## ⚠️ Consideraciones

1. **Nombres de columnas**: Usa solo letras, números y guión bajo. No espacios ni caracteres especiales.
   - ✅ Correcto: `custom_field`, `field1`, `myCustomField`
   - ❌ Incorrecto: `campo con espacios`, `campo-con-guiones`, `#campo`

2. **Campos opcionales**: Por defecto, las columnas nuevas permiten valores NULL. Si necesitas que sea obligatorio, márcalo como `required: true`.

3. **No se eliminan columnas**: El sistema solo agrega columnas nuevas, nunca elimina ni modifica columnas existentes.

4. **Prisma Schema**: Después de agregar columnas, considera actualizar `prisma/schema.prisma` manualmente para mantener la sincronización.

## 🎓 Ejemplo Completo

### Caso de Uso: Agregar campo "Número de Serie" a Activos

1. **Ve a Configuración** → Selecciona "AssetForm"

2. **Agrega un nuevo campo**:
   - Nombre: `serialNumber`
   - Tipo: `text`
   - Etiqueta: `Número de Serie`

3. **Guarda la configuración**

4. **El sistema automáticamente**:
   ```sql
   -- Ejecuta en PostgreSQL:
   ALTER TABLE "Asset" 
   ADD COLUMN "serialNumber" VARCHAR(255) NULL;
   ```

5. **Verifica en PostgreSQL**:
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'Asset' 
   AND column_name = 'serialNumber';
   ```

6. **El campo ahora está disponible** en el formulario y se guarda en la base de datos.

## 🐛 Troubleshooting

### Error: "Nombre de columna inválido"
**Solución**: Usa solo letras, números y guión bajo en el nombre del campo.

### Error: "La columna ya existe"
**Solución**: El campo ya fue creado. Verifica con:
```bash
GET /schema-migration/tables/Asset/columns
```

### El campo no aparece en Prisma
**Solución**: Actualiza manualmente el `schema.prisma`:
```prisma
model Asset {
  // ... campos existentes
  serialNumber String?
}
```

Luego ejecuta:
```bash
cd backend
npx prisma generate
```

## 📚 Recursos

- Logs del backend: `tail -f /tmp/backend.log`
- Consola de PostgreSQL: `psql -U postgres -d activos`
- Prisma Studio: `cd backend && npx prisma studio`

## 🎯 Próximas Mejoras

- [ ] Generación automática de actualizaciones en `schema.prisma`
- [ ] Soporte para relaciones entre tablas
- [ ] Migración de datos existentes
- [ ] Validaciones personalizadas por campo
- [ ] Historial de migraciones
