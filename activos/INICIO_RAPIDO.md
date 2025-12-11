# 🚀 Inicio Rápido - Activos TI

## Cambio de Computadora / Primera Vez

Este documento explica cómo iniciar el proyecto en una computadora nueva o después de clonar el repositorio.

## Prerrequisitos

Antes de iniciar, asegúrate de tener instalado:

1. **Node.js** (v18 o superior)
   ```bash
   node -v  # Verificar versión
   ```
   Descargar desde: https://nodejs.org/

2. **PostgreSQL** (v14 o superior)
   ```bash
   psql --version  # Verificar versión
   ```
   - **macOS**: `brew install postgresql`
   - **Ubuntu**: `sudo apt install postgresql`
   - **Windows**: Descargar desde https://www.postgresql.org/

3. **Git**
   ```bash
   git --version
   ```

## Configuración Inicial

### 1. Clonar el Repositorio (si es necesario)

```bash
git clone <url-repositorio>
cd Activos
```

### 2. Configurar Base de Datos

Crea la base de datos PostgreSQL:

```bash
# Conectar a PostgreSQL
psql -U postgres

# Crear base de datos
CREATE DATABASE activos;

# Salir
\q
```

### 3. Configurar Variables de Entorno

#### Backend

```bash
cd backend
cp .env.example .env  # Si existe, sino crear el archivo
```

Edita `backend/.env` con tus configuraciones:

```env
DATABASE_URL="postgresql://usuario:password@localhost:5432/activos"
JWT_SECRET="tu-secreto-aqui"  # Genera uno: openssl rand -base64 32
NODE_ENV="development"
DEV_ALLOW_PUBLIC_ASSETS=1
ENABLE_DEV_ROUTES=1
```

#### Frontend (Opcional)

```bash
cd frontend
cp .env.example .env.local  # Si existe
```

Edita `frontend/.env.local`:

```env
VITE_API_URL=http://localhost:3000
VITE_ENABLE_DEV_HELPERS=1
```

## Inicio Automático

El script `start.sh` ahora detecta automáticamente si es necesario instalar dependencias:

```bash
./start.sh
```

**El script automáticamente:**
- ✅ Verifica Node.js y npm
- ✅ Instala dependencias de backend y frontend si no existen
- ✅ Actualiza dependencias si package.json cambió
- ✅ Genera Prisma Client
- ✅ Sincroniza el esquema de la base de datos
- ✅ Inicia backend en puerto 3000
- ✅ Inicia frontend en puerto 5173

## Inicio Manual (Desarrollo)

Si prefieres iniciar manualmente con hot-reload y dev helpers:

```bash
bash scripts/dev-all.sh
```

Este modo incluye:
- Hot reload completo
- Dev helpers en frontend
- Logs en tiempo real
- Auto-apertura del navegador

## Verificación

Una vez iniciado, verifica que todo funcione:

1. **Backend**: http://localhost:3000/health
   ```bash
   curl http://localhost:3000/health
   # Debe responder: {"status":"ok"}
   ```

2. **Frontend**: http://localhost:5173

3. **Base de datos**:
   ```bash
   cd backend
   npx prisma studio  # Abre GUI de la base de datos
   ```

## Problemas Comunes

### Error: "Cannot find module"

```bash
cd backend
rm -rf node_modules package-lock.json
npm install
npx prisma generate
cd ../frontend
rm -rf node_modules package-lock.json
npm install
```

### Error: "Port already in use"

```bash
./stop.sh  # Detiene servicios
./start.sh  # Reinicia
```

### Error: Base de datos no sincronizada

```bash
cd backend
npx prisma db push --accept-data-loss
npx prisma generate
```

### Resetear base de datos completamente

```bash
cd backend
npx prisma migrate reset  # ⚠️ BORRA TODOS LOS DATOS
```

## Comandos Útiles

```bash
# Detener servicios
./stop.sh

# Ver logs en tiempo real
./logs.sh

# Verificar estado de salud
./health.sh

# Activar environment (si usas virtualenv para scripts Python)
source activate.sh
```

## Estructura de Scripts

- `start.sh` - Inicio en modo producción-like (con verificación de dependencias)
- `scripts/dev-all.sh` - Modo desarrollo completo con hot-reload
- `stop.sh` - Detiene todos los servicios
- `logs.sh` - Monitorea logs
- `health.sh` - Verifica estado del sistema

## Siguiente Paso

Una vez que el sistema esté corriendo, consulta:
- `README.md` - Documentación completa del proyecto
- `IMPLEMENTACION.md` - Detalles de implementación
- `.github/copilot-instructions.md` - Guía técnica para desarrollo

## Soporte

Si encuentras problemas:
1. Revisa los logs: `tail -f /tmp/backend.log` y `tail -f /tmp/frontend.log`
2. Verifica que PostgreSQL esté corriendo: `pg_isready`
3. Consulta `README.md` para troubleshooting avanzado
