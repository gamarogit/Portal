# Arquitectura Multi-repo con Micro-frontends

## Visión General

Sistema empresarial modular basado en microservicios y micro-frontends, con un portal centralizado que orquesta el acceso a múltiples sistemas independientes.

```
┌─────────────────────────────────────────────────────────────────┐
│                         Usuario Final                            │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              Portal Frontend (Shell) :5173                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  • Vista de Sistemas (Grid de tarjetas)                  │  │
│  │  • Autenticación (Login)                                 │  │
│  │  • Navegación a Micro-frontends                          │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP/REST
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                API Gateway :3000                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Auth Module    │  Portal Module  │  Proxy Module         │  │
│  │  • JWT central  │  • CRUD systems │  • Route to services  │  │
│  │  • Login/Profile│  • Config DB    │  • Health checks      │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────┬──────────────────┬──────────────────┬─────────────────────┘
      │                  │                  │
      │ Proxy            │ Proxy            │ Proxy
      ▼                  ▼                  ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│   Activos    │   │Entrenamiento │   │    Gastos    │
│              │   │              │   │              │
│ Backend:3001 │   │ Backend:3002 │   │ Backend:3003 │
│Frontend:3101 │   │Frontend:3102 │   │Frontend:3103 │
└──────────────┘   └──────────────┘   └──────────────┘
```

## Repositorios

### 1. **activos-portal** (Este repositorio)
**Propósito**: Portal centralizado + API Gateway

**Componentes**:
- **Gateway (Backend)**: NestJS con Prisma
  - Autenticación JWT centralizada
  - Gestión de sistemas (PortalSystem CRUD)
  - Proxy dinámico a microservicios
  - Health checks de todos los sistemas
  
- **Shell (Frontend)**: React + Vite
  - Vista de portal con grid de sistemas
  - Login centralizado
  - Navegación a micro-frontends
  - Admin de sistemas

**Base de Datos**: PostgreSQL `:5432`
- Tablas: `User`, `Role`, `PortalSystem`

**Puertos**:
- Gateway: `:3000`
- Frontend: `:5173`

---

### 2. **activos-sistema** (Renombrar repo actual)
**Propósito**: Sistema de gestión de activos TI

**Componentes**:
- **Backend**: NestJS con Prisma (`:3001`)
  - Módulos: Asset, Movement, Maintenance, Depreciation
  - Base de datos: `activos` (PostgreSQL)
  
- **Frontend**: React + Vite (`:3101`)
  - Vistas: Assets, Movements, Maintenance, Reports

**Configuración**:
```env
PORT=3001
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/activos
CORS_ORIGINS=http://localhost:5173
```

---

### 3. **entrenamiento-sistema** (Nuevo)
**Propósito**: Sistema de capacitación y cursos

**Componentes**:
- **Backend**: NestJS (`:3002`)
  - Módulos: Course, Enrollment, Certificate, Instructor
  
- **Frontend**: React (`:3102`)
  - Vistas: Courses, MyEnrollments, Certificates

**Configuración**:
```env
PORT=3002
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/entrenamiento
```

---

### 4. **gastos-sistema** (Nuevo)
**Propósito**: Sistema de control de gastos

**Componentes**:
- **Backend**: NestJS (`:3003`)
  - Módulos: Expense, Approval, Reimbursement, Budget
  
- **Frontend**: React (`:3103`)
  - Vistas: Expenses, Approvals, Reports

**Configuración**:
```env
PORT=3003
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/gastos
```

---

## Flujo de Datos

### 1. Autenticación
```
Usuario → Portal Frontend
         ↓
     POST /api/auth/login
         ↓
     API Gateway (Auth Module)
         ↓
     Valida contra DB (User table)
         ↓
     Genera JWT
         ↓
     Retorna token + user data
         ↓
     Portal guarda en localStorage
```

### 2. Navegación a Sistema
```
Usuario hace clic en tarjeta "Activos"
         ↓
     Portal lee PortalSystem.route
         ↓
Si es URL externa (http://localhost:3101)
     → Abre en iframe o nueva ventana
         ↓
Si es ruta interna (/assets)
     → React Router navega
```

### 3. Request a Microservicio
```
Frontend de sistema (ej: Activos)
         ↓
     GET http://localhost:3001/api/assets
         ↓
     Microservicio responde directamente
     (NO pasa por gateway en este flujo)

O vía Gateway:
         ↓
     GET http://localhost:3000/api/proxy/activos/assets
         ↓
     Gateway consulta PortalSystem por "activos"
         ↓
     Proxy a http://localhost:3001/api/assets
         ↓
     Retorna respuesta
```

## Configuración de Sistemas en el Portal

### Agregar Sistema Nuevo

1. **Crear entrada en `PortalSystem`**:
```sql
INSERT INTO "PortalSystem" (id, name, description, icon, route, apiUrl, color, enabled, "order")
VALUES (
  gen_random_uuid(),
  'Entrenamiento',
  'Gestión de cursos y capacitaciones',
  '📚',
  'http://localhost:3102',  -- URL del frontend
  'http://localhost:3002',  -- URL del backend (para proxy)
  '#43e97b',
  true,
  2
);
```

2. **O desde la interfaz**: `/portal/admin` → Nuevo Sistema

3. **O vía seed**: Modificar `/backend/prisma/seed-portal.ts`

### Patrones de `route` y `apiUrl`

| Tipo | `route` | `apiUrl` | Comportamiento |
|------|---------|----------|----------------|
| **Micro-frontend externo** | `http://localhost:3101` | `http://localhost:3001` | Abre en iframe/ventana |
| **Ruta interna** | `/assets` | `http://localhost:3001` | React Router + Proxy opcional |
| **URL externa** | `https://github.com/org` | `null` | Abre en nueva pestaña |

## Comunicación Entre Sistemas

### Opción 1: Directa (Recomendada para desarrollo)
Cada frontend llama directamente a su backend:
```typescript
// En activos-sistema/frontend
const response = await fetch('http://localhost:3001/api/assets');
```

**Pros**: Simple, rápido  
**Contras**: CORS, múltiples origins

---

### Opción 2: Vía Gateway Proxy
Todos los requests pasan por el gateway:
```typescript
// En cualquier frontend
const response = await fetch('http://localhost:3000/api/proxy/activos/assets');
```

**Pros**: CORS centralizado, monitoreo único  
**Contras**: Latencia adicional

---

### Opción 3: Server-to-Server
Gateway llama a otros microservicios:
```typescript
// En gateway (backend)
const activosData = await this.httpService.get('http://localhost:3001/api/assets');
```

**Pros**: Seguro, no expone APIs  
**Contras**: Más complejo

## Desarrollo Local

### Setup Inicial

1. **Clonar repositorios**:
```bash
cd /Users/gamaro/Git
git clone git@github.com:org/activos-portal.git
git clone git@github.com:org/activos-sistema.git
git clone git@github.com:org/entrenamiento-sistema.git
git clone git@github.com:org/gastos-sistema.git
```

2. **Configurar portal**:
```bash
cd activos-portal/backend
cp .env.example .env
# Editar .env con credenciales
npm install
npx prisma migrate dev
npx prisma generate

cd ../frontend
npm install
```

3. **Configurar cada sistema** (repetir para Activos, Entrenamiento, Gastos):
```bash
cd activos-sistema/backend
cp .env.example .env
# Cambiar PORT=3001, DATABASE_URL, CORS_ORIGINS
npm install
npx prisma migrate dev

cd ../frontend
npm install
# Configurar VITE_API_URL=http://localhost:3001
```

### Arrancar Todo con Docker

```bash
cd activos-portal
docker-compose up -d
```

Esto levanta:
- PostgreSQL (`:5432`)
- Redis (`:6379`)
- Gateway (`:3000`)
- Portal Frontend (`:5173`)

Luego arrancar cada sistema manualmente o agregar al `docker-compose.yml`.

### Arrancar Manualmente (Desarrollo)

```bash
# Terminal 1: Gateway
cd activos-portal/backend
npm run start:dev

# Terminal 2: Portal Frontend
cd activos-portal/frontend
npm run dev

# Terminal 3: Activos Backend
cd activos-sistema/backend
npm run start:dev

# Terminal 4: Activos Frontend
cd activos-sistema/frontend
npm run dev

# Repetir para Entrenamiento y Gastos...
```

## Despliegue a Producción

### Estrategia: Independiente por Repositorio

Cada sistema se despliega de forma autónoma:

```bash
# activos-portal
docker build -t activos-portal-gateway:latest ./backend
docker build -t activos-portal-frontend:latest ./frontend

# activos-sistema
docker build -t activos-backend:latest ./backend
docker build -t activos-frontend:latest ./frontend

# etc...
```

### Kubernetes (Opcional)

Cada sistema tiene su propio Deployment:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: activos-backend
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: activos-backend
        image: activos-backend:latest
        ports:
        - containerPort: 3001
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: activos-secret
              key: database-url
```

### Variables de Entorno en Producción

**Gateway**:
```env
DATABASE_URL=postgresql://user:pass@prod-db:5432/activos_portal
JWT_SECRET=<generado con openssl rand -base64 32>
ACTIVOS_API=https://activos-api.empresa.com
ENTRENAMIENTO_API=https://entrenamiento-api.empresa.com
GASTOS_API=https://gastos-api.empresa.com
CORS_ORIGINS=https://portal.empresa.com,https://activos.empresa.com
NODE_ENV=production
```

**Cada Microservicio**:
```env
PORT=3001
DATABASE_URL=postgresql://user:pass@prod-db:5432/activos
JWT_SECRET=<mismo que gateway>
CORS_ORIGINS=https://portal.empresa.com
```

## Seguridad

### JWT Compartido
Todos los sistemas usan el **mismo `JWT_SECRET`** para validar tokens:
```typescript
// En cada microservicio
@UseGuards(JwtAuthGuard)
async getAssets(@Request() req) {
  // req.user.sub = userId del token generado por gateway
}
```

### CORS
Configurar origins permitidos en cada backend:
```typescript
app.enableCors({
  origin: [
    'http://localhost:5173',  // Portal dev
    'https://portal.empresa.com', // Portal prod
  ],
  credentials: true,
});
```

### HTTPS
En producción, usar certificados SSL/TLS:
- **nginx/Caddy** como reverse proxy
- **Let's Encrypt** para certificados gratuitos
- Redirigir HTTP → HTTPS

## Monitoreo y Observabilidad

### Health Checks
Cada backend debe exponer `/health`:
```typescript
@Get('health')
healthCheck() {
  return {
    status: 'healthy',
    timestamp: new Date(),
    service: 'activos-backend',
  };
}
```

Gateway consulta todos:
```bash
GET /api/proxy/health
```

### Logs Centralizados
Usar **ELK Stack** o **Loki**:
```yaml
# docker-compose.yml
services:
  loki:
    image: grafana/loki:latest
    ports:
      - "3100:3100"
  
  promtail:
    image: grafana/promtail:latest
    volumes:
      - /var/log:/var/log
```

### Métricas
Prometheus endpoints en cada servicio:
```typescript
@Get('metrics')
getMetrics() {
  return prometheusRegistry.metrics();
}
```

## Guía para Agregar Nuevo Sistema

### 1. Crear Repositorio
```bash
cd /Users/gamaro/Git
mkdir nuevo-sistema && cd nuevo-sistema
npm init -y
```

### 2. Configurar Backend (NestJS)
```bash
npm i @nestjs/cli -g
nest new backend
cd backend
npm i @prisma/client @nestjs/jwt @nestjs/passport passport-jwt bcrypt
npm i -D prisma @types/passport-jwt @types/bcrypt
```

**Configurar puerto único**:
```env
PORT=3004  # Siguiente disponible
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/nuevo_sistema
```

### 3. Configurar Frontend (React)
```bash
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install react-router-dom axios
```

**Configurar puerto único**:
```javascript
// vite.config.ts
export default defineConfig({
  server: {
    port: 3104,  // Siguiente disponible
  },
});
```

### 4. Registrar en Portal
```bash
cd activos-portal
```

Ejecutar:
```sql
INSERT INTO "PortalSystem" (id, name, description, icon, route, apiUrl, color, enabled, "order")
VALUES (
  gen_random_uuid(),
  'Nuevo Sistema',
  'Descripción del sistema',
  '🚀',
  'http://localhost:3104',
  'http://localhost:3004',
  '#4facfe',
  true,
  10
);
```

O usar `/portal/admin`.

### 5. Agregar a docker-compose (Opcional)
```yaml
nuevo-backend:
  build: ../nuevo-sistema/backend
  ports:
    - "3004:3004"
  environment:
    DATABASE_URL: postgresql://postgres:postgres@postgres:5432/nuevo_sistema
    PORT: 3004
```

## Troubleshooting

### "Cannot connect to microservice"
1. Verificar que el servicio esté corriendo: `curl http://localhost:3001/health`
2. Verificar firewall/CORS
3. Revisar logs del gateway: `docker logs activos-gateway`

### "JWT invalid"
1. Verificar que `JWT_SECRET` sea el mismo en gateway y microservicio
2. Verificar que el token no haya expirado (24h por defecto)
3. Limpiar localStorage y volver a hacer login

### "System not found in portal"
1. Verificar que existe en `PortalSystem`: `SELECT * FROM "PortalSystem";`
2. Verificar que `enabled = true`
3. Reiniciar gateway para recargar configuración

## Mejores Prácticas

1. **Versionar APIs**: `/api/v1/assets`, `/api/v2/assets`
2. **Feature flags**: Habilitar/deshabilitar sistemas sin despliegue
3. **Rate limiting**: Proteger endpoints con throttling
4. **Caching**: Redis para respuestas frecuentes
5. **Testing**: E2E tests para flujos críticos
6. **Documentation**: OpenAPI/Swagger en cada backend
7. **Backup**: Snapshots automáticos de bases de datos

---

**Última actualización**: 2025-12-01  
**Versión arquitectura**: 1.0.0
