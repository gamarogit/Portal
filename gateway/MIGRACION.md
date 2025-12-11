# Guía de Migración: Monolito → Multi-repo

## Estado Actual vs Estado Objetivo

### Antes (Monolito)
```
/Users/gamaro/Git/Activos/
├── backend/     # Todo en un solo backend
│   ├── auth, portal, asset, movement, etc.
├── frontend/    # Todo en un solo frontend
```

### Después (Multi-repo)
```
/Users/gamaro/Git/
├── activos-portal/          # ← NUEVO (Gateway + Shell)
│   ├── backend/             # Auth, Portal, Proxy
│   └── frontend/            # Vista de portal + login
│
├── activos-sistema/         # ← RENOMBRAR de "Activos"
│   ├── backend/             # Asset, Movement, Maintenance
│   └── frontend/            # Vistas de activos
│
├── entrenamiento-sistema/   # ← NUEVO
│   ├── backend/
│   └── frontend/
│
└── gastos-sistema/          # ← NUEVO
    ├── backend/
    └── frontend/
```

## Paso a Paso

### Fase 1: Crear Portal (✅ Completado)

El nuevo repositorio `activos-portal` ya está creado con:
- Gateway con Auth, Portal, Proxy
- Frontend con login y vista de sistemas
- Docker Compose configurado
- Documentación completa

**Ubicación**: `/Users/gamaro/Git/activos-portal/`

---

### Fase 2: Migrar Repositorio Actual

#### 2.1. Backup
```bash
cd /Users/gamaro/Git/Activos
git checkout -b backup-monolito
git push origin backup-monolito
```

#### 2.2. Remover Módulos Migrados al Gateway

**Archivos a ELIMINAR** (ya están en activos-portal):
```bash
cd /Users/gamaro/Git/Activos

# Backend
rm -rf backend/src/modules/portal
rm -rf backend/src/modules/auth  # Si usas auth del gateway

# Frontend
rm frontend/src/views/PortalView.tsx
rm frontend/src/views/PortalAdminView.tsx

# Documentación de portal
rm PORTAL*.md
```

**Archivos a CONSERVAR**:
- `backend/src/modules/asset/`
- `backend/src/modules/movement/`
- `backend/src/modules/maintenance/`
- `backend/src/modules/depreciation/`
- `frontend/src/views/AssetsView.tsx`
- etc.

#### 2.3. Actualizar Configuración

**`backend/.env`**:
```env
PORT=3001  # Cambiar de 3000 → 3001
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/activos  # Cambiar DB
CORS_ORIGINS=http://localhost:5173,http://localhost:3101
JWT_SECRET=<mismo que activos-portal/backend/.env>
```

**`backend/src/main.ts`**:
```typescript
const port = process.env.PORT || 3001;  // Cambiar puerto

app.enableCors({
  origin: ['http://localhost:5173', 'http://localhost:3101'],
  credentials: true,
});
```

**`frontend/vite.config.ts`**:
```typescript
server: {
  port: 3101,  // Cambiar de 5173 → 3101
  proxy: {
    '/api': {
      target: 'http://localhost:3001',  // Apuntar al backend 3001
    },
  },
},
```

**`frontend/.env.local`**:
```env
VITE_API_URL=http://localhost:3001/api
```

#### 2.4. Actualizar app.module.ts

**Remover** imports de módulos migrados:
```typescript
// ANTES
@Module({
  imports: [
    AuthModule,      // ← Remover (ahora en gateway)
    PortalModule,    // ← Remover (ahora en gateway)
    AssetModule,     // ← Conservar
    MovementModule,  // ← Conservar
    // ...
  ],
})
```

**DESPUÉS**:
```typescript
@Module({
  imports: [
    AssetModule,
    MovementModule,
    MaintenanceModule,
    DepreciationModule,
    ReportsModule,
    // Ya NO incluir Auth ni Portal
  ],
})
```

#### 2.5. Agregar Health Check

**`backend/src/health/health.controller.ts`** (nuevo):
```typescript
import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      status: 'healthy',
      timestamp: new Date(),
      service: 'activos-backend',
      version: '1.0.0',
    };
  }
}
```

Registrar en `app.module.ts`:
```typescript
import { HealthController } from './health/health.controller';

@Module({
  controllers: [HealthController],
  // ...
})
```

#### 2.6. Renombrar Repositorio

**Opción A: Renombrar en GitHub**
1. Ve a Settings del repositorio "Activos"
2. Repository name → `activos-sistema`
3. Rename

**Opción B: Mover localmente**
```bash
cd /Users/gamaro/Git
mv Activos activos-sistema
cd activos-sistema
git remote set-url origin git@github.com:gamarogit/activos-sistema.git
```

---

### Fase 3: Crear Sistemas Nuevos

#### 3.1. Entrenamiento

```bash
cd /Users/gamaro/Git
mkdir entrenamiento-sistema && cd entrenamiento-sistema

# Backend
nest new backend
cd backend
npm i @prisma/client @nestjs/jwt @nestjs/passport passport-jwt bcrypt
npm i -D prisma @types/passport-jwt

# Configurar puerto 3002
echo "PORT=3002" >> .env
echo "DATABASE_URL=postgresql://postgres:postgres@localhost:5432/entrenamiento" >> .env
echo "JWT_SECRET=<copiar de activos-portal>" >> .env

# Frontend
cd ..
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install react-router-dom axios

# Configurar puerto 3102 en vite.config.ts
```

#### 3.2. Gastos

```bash
cd /Users/gamaro/Git
mkdir gastos-sistema && cd gastos-sistema

# Mismo proceso que Entrenamiento pero:
PORT=3003  # Backend
VITE_PORT=3103  # Frontend
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/gastos
```

---

### Fase 4: Registrar Sistemas en Portal

```bash
cd /Users/gamaro/Git/activos-portal

# Iniciar portal
bash start.sh

# Esperar que inicie y visitar:
open http://localhost:5173
```

**Login**: Crear usuario admin:
```bash
cd backend
npx tsx create-admin.ts  # Si existe script, o crear manualmente
```

**Registrar sistemas** en `/portal/admin`:

| Sistema | route | apiUrl | Color |
|---------|-------|--------|-------|
| Activos | `http://localhost:3101` | `http://localhost:3001` | #667eea |
| Entrenamiento | `http://localhost:3102` | `http://localhost:3002` | #43e97b |
| Gastos | `http://localhost:3103` | `http://localhost:3003` | #fa709a |

O ejecutar seed:
```bash
cd backend
npx tsx prisma/seed-portal.ts
```

---

### Fase 5: Testing

#### 5.1. Arrancar Todo

**Terminal 1 - Portal**:
```bash
cd /Users/gamaro/Git/activos-portal
bash start.sh
```

**Terminal 2 - Activos Backend**:
```bash
cd /Users/gamaro/Git/activos-sistema/backend
npm run start:dev
```

**Terminal 3 - Activos Frontend**:
```bash
cd /Users/gamaro/Git/activos-sistema/frontend
npm run dev
```

(Repetir para Entrenamiento y Gastos)

#### 5.2. Verificar

✅ **Portal carga**: http://localhost:5173  
✅ **Login funciona**: Crear usuario y autenticar  
✅ **Sistemas aparecen**: Ver 3 tarjetas  
✅ **Navegación**: Clic en "Activos" abre :3101  
✅ **Health checks**: http://localhost:3000/api/proxy/health  

---

## Checklist de Migración

### Repo `activos-portal` ✅
- [x] Estructura de directorios creada
- [x] Gateway con Auth, Portal, Proxy implementado
- [x] Frontend con login y vista de sistemas
- [x] Docker Compose configurado
- [x] Prisma schema con User, Role, PortalSystem
- [x] Documentación (ARQUITECTURA.md)

### Repo `activos-sistema` (Pendiente)
- [ ] Backup del branch actual
- [ ] Remover módulos Portal y Auth
- [ ] Cambiar puerto backend → 3001
- [ ] Cambiar puerto frontend → 3101
- [ ] Actualizar CORS y configuración
- [ ] Agregar health check
- [ ] Probar arranque independiente
- [ ] Renombrar repositorio

### Repos Nuevos (Pendiente)
- [ ] Crear `entrenamiento-sistema`
- [ ] Crear `gastos-sistema`
- [ ] Configurar puertos (3002/3102, 3003/3103)
- [ ] Implementar funcionalidades base

### Integración (Pendiente)
- [ ] Registrar 3 sistemas en PortalSystem
- [ ] Seed con sistemas por defecto
- [ ] Probar login en portal
- [ ] Probar navegación entre sistemas
- [ ] Probar proxy del gateway

---

## Comandos Rápidos

### Desarrollo

```bash
# Iniciar portal
cd activos-portal && bash start.sh

# Iniciar sistema Activos
cd activos-sistema/backend && npm run start:dev &
cd activos-sistema/frontend && npm run dev

# Ver logs
docker-compose -f activos-portal/docker-compose.yml logs -f
```

### Producción

```bash
# Build de todos los sistemas
cd activos-portal && docker-compose build
cd activos-sistema && docker build -t activos-backend backend/
cd activos-sistema && docker build -t activos-frontend frontend/

# Desplegar
docker-compose -f activos-portal/docker-compose.yml up -d
```

---

## Soporte

Si encuentras problemas durante la migración:

1. **Revisar logs**: `docker-compose logs -f`
2. **Verificar puertos**: `lsof -i :3000,3001,5173,3101`
3. **CORS**: Verificar origins en cada backend
4. **JWT**: Mismo secret en todos los sistemas
5. **DB**: Verificar conexión con `psql`

---

**Siguiente paso recomendado**: Adaptar el repositorio "Activos" como microservicio siguiendo la Fase 2.
