# Activos TI - Sistema de Gestión de Activos

## Arquitectura General

Monorepo fullstack: **NestJS backend** + **React/Vite frontend** sobre PostgreSQL, diseñado para gestionar inventario de activos TI (servidores, laptops, licencias) con flujos de altas/bajas, traslados, mantenimiento y depreciación.

### Estructura de Carpetas

- `backend/`: API NestJS con Prisma ORM, Redis/Bull para eventos, módulos por dominio
- `frontend/`: React SPA con Vite, routing basado en vistas (no file-based)
- `scripts/`: Scripts de desarrollo compartidos (`dev-all.sh` arranca todo)

## Configuración y Desarrollo

### Inicio Rápido

```bash
# Desarrollo con dev helpers habilitados
bash scripts/dev-all.sh  # Backend (puerto auto) + Frontend (5173)

# O manualmente
./start.sh               # Producción-like con logs en /tmp/
./stop.sh                # Detiene todos los servicios
./logs.sh                # Monitorea logs
```

### Variables de Entorno Críticas

- **Backend** (`backend/.env`): `DATABASE_URL`, `JWT_SECRET` (generado con `openssl rand -base64 32`), `DEV_ALLOW_PUBLIC_ASSETS=1` (dev only)
- **Frontend** (`frontend/.env.local`): `VITE_ENABLE_DEV_HELPERS=1`, `VITE_API_URL` (autoconfigurado por `dev-all.sh`)
- **Seguridad**: NUNCA commitear `.env`, credenciales ya están en `.gitignore`

### Prisma Workflow

```bash
cd backend
npx prisma migrate dev --name descripcion  # Crear migraciones
npx prisma generate                         # Regenerar cliente
npx prisma studio                           # GUI para DB
```

Migraciones viven en `backend/prisma/migrations/`. Si falla `migrate dev`, aplicar SQL manualmente con `psql -U postgres -d activos < migration.sql`.

## Patrones Backend (NestJS)

### Módulos por Dominio

Cada módulo (`asset`, `movement`, `maintenance`, `depreciation`, etc.) sigue: **Controller → Service → Prisma**.

```typescript
// Ejemplo: backend/src/modules/asset/asset.controller.ts
@Controller("assets")
@UseGuards(JwtAuthGuard, RolesGuard) // ⚠️ Todos los endpoints protegidos por JWT + RBAC
export class AssetController {
  @Post()
  create(@Body() dto: CreateAssetDto) {
    return this.assetService.create(dto);
  }
}
```

### Autenticación y Seguridad

- **JWT obligatorio**: Todos los endpoints (excepto `/dev/*` en desarrollo) requieren `@UseGuards(JwtAuthGuard)`
- **RBAC**: `RolesGuard` valida roles del usuario (`ADMIN`, `TI`, etc.)
- **DevModule**: Endpoints `/dev/asset-type`, `/dev/location`, `/dev/uuid` solo disponibles si `ENABLE_DEV_ROUTES=1` o `NODE_ENV !== production`

### Servicios y Prisma

- Uso directo de **Prisma** para queries complejas: `this.prisma.asset.findMany({ include: { assetType, location, responsible } })`
- **Convención**: Mapear respuestas para exponer solo campos necesarios (ej. `assetType: { name }` en lugar del objeto completo)
- **Catálogos**: `AssetType`, `Location`, `User` se auto-generan UUIDs con `@default(uuid())` en schema

### Mensajería Asíncrona

```typescript
// backend/src/shared/messaging/messaging.service.ts
@Injectable()
export class MessagingService {
  async publish(queue: string, event: string, data: any) {
    await this.inventoryQueue.add(event, data);
  }
}
```

**Bull + Redis** para eventos de inventario (`inventory-events`). Los servicios publican eventos sin esperar respuesta (ej. `movement.service.ts` notifica cambios).

## Patrones Frontend (React + Vite)

### Routing y Vistas

No hay file-based routing. Vistas en `frontend/src/views/` + layout en `MainLayout.tsx`:

```tsx
// frontend/src/App.tsx
<Routes>
  <Route path="/assets" element={<AssetsView />} />
  <Route path="/movements" element={<MovementView />} />
  {/* ... */}
</Routes>
```

### API Client Pattern

```typescript
// frontend/src/services/api.ts
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
});

export const setAuthToken = (token: string) => {
  api.defaults.headers.common.Authorization = `Bearer ${token}`;
};

export const assetService = {
  list: () => api.get<AssetSummary[]>("/assets"),
  create: (payload) => api.post("/assets", payload),
};
```

**Proxy Vite**: `/api` → `http://localhost:3000` (ver `vite.config.ts`). En producción, configurar `VITE_API_URL`.

### Aliases de Importación

```typescript
import AssetForm from "@components/AssetForm"; // No ../../components
import api from "@services/api";
```

Configurados en `vite.config.ts` con `resolve.alias`.

## Testing

### Backend (Jest)

```bash
cd backend
npm test              # Todos los tests
npm run test:watch    # Watch mode
```

**Patrón**: Mock de Prisma con `jest.fn()`, tests en `backend/tests/*.spec.ts`:

```typescript
// tests/asset.service.spec.ts
const prismaMock = {
  asset: {
    findMany: jest.fn().mockResolvedValue([mockData]),
  },
};
const service = new AssetService(prismaMock as any);
```

### Frontend (Vitest)

```bash
cd frontend
npm test              # Run once
npm run test:watch    # Watch mode
```

Configurado con `@testing-library/react` y `happy-dom`.

## Base de Datos (PostgreSQL + Prisma)

### Schema Highlights

- **Enums críticos**: `AssetState` (ACTIVO, MANTENIMIENTO, DADO_DE_BAJA, etc.), `MovementType` (ALTA, BAJA, TRASLADO)
- **Relaciones principales**:
  - `Asset` → `AssetType`, `Location`, `User` (responsible)
  - `Movement` → `Asset`, `fromLocation`, `toLocation`, `requestedBy`, `approvedBy`
  - `Maintenance` → `Asset`, `performedBy`
- **UUIDs automáticos**: Todas las entidades usan `@default(uuid())`
- **Auditoría**: Modelo `AuditLog` captura cambios con `performedBy` y `metadata` JSON

### Migraciones Especiales

- `20251128030000_add_operating_system`: Agrega columna `operatingSystem` a `Asset`
- `20251129172049_add_role_catalog`: Introduce modelo `Role` y relación con `User`

## Convenciones del Proyecto

### Nomenclatura

- **Controllers**: `@Controller('assets')` → rutas en plural
- **DTOs**: `CreateAssetDto`, `UpdateAssetDto` con `class-validator`
- **Services**: Métodos CRUD estándar: `findAll()`, `findOne(id)`, `create(dto)`, `update(id, dto)`, `remove(id)`

### Manejo de Errores

```typescript
// Backend lanza excepciones NestJS
throw new NotFoundException(`Activo ${id} no encontrado`);

// Frontend captura en try-catch
try {
  await assetService.create(payload);
} catch (err) {
  if (err.response?.data?.message) alert(err.response.data.message);
}
```

### Dev Helpers (Frontend)

Botones "Catálogos rápidos" en `AssetsView` crean tipos/ubicaciones/usuarios vía `/dev/*` endpoints. Solo visible si `VITE_ENABLE_DEV_HELPERS=1`.

## Scripts Útiles

| Script                                  | Descripción                                                     |
| --------------------------------------- | --------------------------------------------------------------- |
| `bash scripts/dev-all.sh`               | Arranca backend + frontend con dev helpers, auto-abre navegador |
| `./start.sh`                            | Producción-like, logs a `/tmp/activos-{backend,frontend}.log`   |
| `./stop.sh`                             | Mata procesos Node/Vite                                         |
| `cd frontend && npm run clean`          | Limpia caché Vite (problemas de hot reload)                     |
| `cd backend && npm run prisma:generate` | Regenera cliente Prisma tras cambios en schema                  |

## Troubleshooting

### Hot Reload Fallando (Vite)

1. `cd frontend && npm run clean`
2. Verificar que no haya archivos `.js` duplicados (`.gitignore` los excluye)
3. Revisar `vite.config.ts` → `server.watch.usePolling: false`

### Errores "must be a UUID"

Backend valida IDs con `class-validator`. Usar `/dev/uuid` para generar UUIDs válidos o permitir que Prisma auto-genere con `@default(uuid())`.

### Migraciones No Aplican

1. Verificar `DATABASE_URL` en `backend/.env`
2. Aplicar SQL manualmente: `psql -U postgres -d activos < backend/prisma/migrations/.../migration.sql`
3. Re-ejecutar `npx prisma migrate dev`

### Redis/Bull No Conecta

Backend funciona sin Redis (cache opcional). Si `REDIS_HOST` no está definido, NestJS salta la configuración. Para eventos, verificar logs de Bull.

## Referencias Clave

- **Modelo completo**: `backend/prisma/schema.prisma`
- **Configuración módulos**: `backend/src/app.module.ts`
- **API client**: `frontend/src/services/api.ts`
- **Dev endpoints**: `backend/src/modules/dev/dev.controller.ts`
- **README detallado**: `README.md` (plan completo, requisitos empresa TI)
- **MEJORAS.md**: Historial de optimizaciones Vite, comparación con Next.js
