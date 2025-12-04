# Activos - Plan de implementación

Breve plan para construir el sistema de gestión de activos sobre PostgreSQL. Usa la lista de verificación para marcar avance.

## Estructura de carpetas propuesta

- `backend/`: código del API, módulos, configuraciones y migraciones de PostgreSQL.
- `frontend/`: SPA (React/Vue) con componentes, servicios y vistas.
- `scripts/`: comandos/pipelines compartidos (lint, tests, despliegues).

Para crear rápidamente esta estructura:

```sh
mkdir -p backend/src/modules backend/src/config backend/database/migrations backend/tests frontend/src/components frontend/src/services frontend/src/views frontend/public scripts
```

## Plan y checklist (orden recomendado)

### General

1. [x] Definir alcance con roles, flujos (altas/bajas, traslados, depreciación), SLAs y catálogos iniciales.
2. [x] Validar modelo en PostgreSQL (activos, ubicaciones, responsables, movimientos, mantenimiento, adjuntos, depreciación, auditoría) y soportar migraciones.
3. [~] Seguridad/compliance: TLS, cifrado sensible, saneamiento de archivos y retención/borrado lógico coordinado con RBAC/MFA.
4. [x] Observabilidad completa: logs estructurados, métricas Prometheus, trazas OpenTelemetry y health checks.
5. [x] DevOps firmes: CI/CD con migraciones, contenedores, despliegues blue/green o canary, backups/PITR.
6. [~] Integraciones críticas: ERP financiero, LDAP/AD, CMDB/monitoring, webhooks/eventos y sincronizaciones periódicas.

### Backend

1. [x] Mantener Prisma al día con catálogos (tipos, ubicaciones, usuarios, activos, movimientos, mantenimiento, depreciaciones, auditorías) y exponer `PrismaService`.
2. [x] Crear endpoints protegidos (`/assets`, `/movements`, `/maintenance`, `/reports`, `/depreciations`, `/integrations/*`, `/metrics`) con NestJS + JWT/RBAC.
3. [x] Orquestar mensajería (Redis/Bull) para eventos de inventario, auditorías y despachos programados.
4. [x] Añadir rutas helper para desarrollo (`/dev/*`) que sólo funcionan con `DEV_ALLOW_PUBLIC_ASSETS=1` y generan catálogos/UUIDs públicos.
5. [x] Documentar y ejecutar pruebas unitarias/integración (Jest) junto con métricas Prometheus y protección de observabilidad.

### Frontend

1. [x] Interfaces React/Vite por sección (Activos, Movimientos, Mantenimientos, Reportes, Integraciones) consumiendo el API proxy `/api`.
2. [x] Formulario de activos con sistema operativo, serial, costo y campos de IDs (assetTypeId, locationId, responsibleId) y validaciones que muestran errores del backend.
3. [x] Helpers dev visibles: "Catálogos rápidos", generación de UUIDs, CSVs de ejemplo y aviso sobre `DEV_ALLOW_PUBLIC_ASSETS` / `VITE_ENABLE_DEV_HELPERS`.
4. [x] Inclusión de campo JWT en el layout y comunicación clara de errores (`Unauthorized`, `Request failed`, etc.).
5. [x] Pruebas frontales (Vitest) para componentes clave (`AssetList`) y documentación de cómo arrancar los tests.

## Entorno de desarrollo y helpers

- **IMPORTANTE - Seguridad de credenciales:** Antes de comenzar, copia `backend/.env.example` a `backend/.env` y actualiza las credenciales:
  - Cambia la contraseña de PostgreSQL por una segura
  - El JWT_SECRET ya viene generado con `openssl rand -base64 32`, pero puedes generar uno nuevo con el mismo comando
  - NUNCA commitees el archivo `.env` al repositorio (ya está excluido en `.gitignore`)
  - Para rotar credenciales en producción: genera un nuevo JWT_SECRET, actualiza la base de datos y reinicia el servicio
- Asegurate de tener PostgreSQL en `localhost:5432` y la base `activos` creada; el backend usa `DATABASE_URL` para conectar y `DEV_ALLOW_PUBLIC_ASSETS=1` activa los helper endpoints (`/dev/asset-type`, `/dev/location`, `/dev/user`, `/dev/uuid`, `/dev/csv`) que permiten crear catálogos, generar UUIDs y descargar muestras sin autenticación. Si no tenés `pg_isready` o `psql` instalados, podés obtenerlos con Homebrew (`brew install postgresql`), usar `psql` dentro del contenedor de PostgreSQL o instalar el cliente oficial del sistema operativo; el script `scripts/dev-all.sh` avisará si no logra verificar la base de datos y la migración manual `backend/prisma/migrations/20251128030000_add_operating_system/migration.sql` puede ejecutarse con `psql -U postgres -d activos < ...` cuando tengas acceso.
- En el front, `VITE_ENABLE_DEV_HELPERS=1` habilita los botones de “Catálogos rápidos”; si falta la variable los helpers siguen visibles pero deshabilitados. En ambientes de desarrollo el backend omite la validación de `DEV_ALLOW_PUBLIC_ASSETS` (`NODE_ENV!==production`), por lo que el script principal solo necesita copiar `.env.local` y arrancar los servicios para que los helpers funcionen sin errores. También se explica que la vista de Activos pide el sistema operativo y advierte cuando los IDs no son UUIDs válidos.
- Para evitar iniciar manualmente backend y frontend, ejecutá el script compartido `bash scripts/dev-all.sh`: primero verifica que PostgreSQL esté disponible según la URL definida en `backend/.env`, luego selecciona automáticamente un puerto libre (3000 o el siguiente disponible) para el backend con `DEV_ALLOW_PUBLIC_ASSETS=1`, copia `frontend/.env.local.example` si falta para fijar `VITE_ENABLE_DEV_HELPERS=1`, inicia Vite con `VITE_API_URL` apuntando al backend en ese puerto, espera que el backend esté listo, crea catálogos de ejemplo (Laptop, Main Core, Gil) y abre `http://localhost:5173`. Si necesitás fijar el backend en 3001 manualmente para evitar conflictos podés arrancarlo con `PORT=3001 npm --prefix backend run start:dev` y luego redirigir el frontend apuntando al mismo puerto.
- El helper de catálogos rápidos puede poblar los campos `assetTypeId`, `locationId` y `responsibleId` con UUIDs generados o con los IDs guardados desde el modal/CSV para que el formulario pueda enviar la petición sin errores “must be a UUID”. Como el pool de `pg` corre un `ALTER TABLE ... SET DEFAULT gen_random_uuid()` sobre las tablas que se crean dinámicamente (Asset, AssetType, Location, User) y fija `type = 'general'` para nuevas ubicaciones, las inserciones a través del CRUD tienen valores automáticos aunque no especifiques un `id` ni un tipo.
- Copiá `frontend/.env.local.example` a `frontend/.env.local` (o creá uno propio) para que `VITE_ENABLE_DEV_HELPERS=1` esté definido de forma permanente cuando abras Vite; así el helper ya aparece habilitado la primera vez que entres a la vista de activos sin tener que exportar la variable manualmente.
- El script `bash scripts/dev-all.sh` intenta arrancar el backend en puerto 3000 y, si ya está ocupado, busca el siguiente disponible; también pasa la URL correspondiente mediante `VITE_API_URL`, así el frontend apunta siempre al backend que quedó en ejecución sin necesidad de configurar proxies manualmente. Además, el pool de `pg` ejecuta un `ALTER TABLE ... ADD COLUMN IF NOT EXISTS "operatingSystem"` cuando arranca, así la columna se crea automáticamente aunque la migración no haya podido ejecutarse manualmente.
- El módulo `DatabaseModule` crea un `pg.Pool` global (`PG_POOL`) y el `AssetService` utiliza SQL directo sobre ese pool en vez de Prisma para evitar errores de la capa generada, por lo que si agregás nuevas consultas puedes usar el mismo pool y seguir el patrón de `mapRow`.

## Especificaciones de requisitos (empresa TI)

- **Catálogos de activos:** servidores físicos, instancias virtuales, estaciones/laptops, dispositivos de red, licencias y cuentas cloud, equipos móviles. Cada activo tiene marca/modelo, ubicación, proveedor, fecha de adquisición, costo y estado.
- **Ubicaciones y estados:** oficinas centrales, sedes remotas, datacenters, “en tránsito”, “remoto”; estados: activo, mantenimiento, dado de baja, transferido, cuarentena.
- **Roles y flujos:** administradores de inventario (altas/bajas), responsables de mantenimiento (programación), usuarios que solicitan traslados/asignaciones y auditoría que captura cada movimiento con evidencia adjunta.
- **SLAs/reportes:** inventario mensual por ubicación/tipo, resumen trimestral de depreciación, cumplimiento de licencias y mantenimientos, auditorías filtrables por responsable/fecha.
- **Seguridad & retención:** cifrado en tránsito/reposo para datos sensibles (licencias, credenciales), retención de auditorías ≥ 1 año, borrado lógico previo a eliminación física, RBAC + MFA en operaciones críticas.
- **Integraciones prioritarias:** directorio corporativo (LDAP/AD) para usuarios/responsables, ERP financiero para costos y depreciación, CMDB/monitoring para estados; notificaciones por eventos/webhooks.

## Prisma schema y migraciones

- El modelo Prisma vive en `backend/prisma/schema.prisma` y refleja los catálogos (activos, ubicaciones, tipos, usuarios, roles, movimientos, mantenimiento, depreciación, auditoría, adjuntos e integración de eventos).
- Define `DATABASE_URL` (p. ej. `postgresql://user:pass@host:port/dbname`) en `backend/.env` o la raíz antes de ejecutar migraciones.
- Genera migraciones y el cliente con:
  Si `prisma migrate dev` no llega a ejecutarse porque el motor no está conectado al server, ya existe un fichero `backend/prisma/migrations/20251128030000_add_operating_system/migration.sql` que agrega la columna `operatingSystem` a la tabla `Asset`; podés aplicarlo manualmente antes de volver a ejecutar `prisma migrate dev`.

  ```sh
  cd backend
  npx prisma migrate dev --name init
  npx prisma generate
  ```

- Las nuevas migraciones van a `backend/prisma/migrations` y pueden versionarse para CI/CD.
- `backend/package.json` gestiona dependencias (`@nestjs/*`, Prisma, `class-validator`, `ts-node-dev`) y scripts de prueba.
- Usa `backend/.env.example` para definir `DATABASE_URL`, `PORT`, JWT y Redis (cache/cola).
- El backend expone módulos protegidos (Auth, Asset, Movement, Maintenance, Reports) y usa Prisma + Redis/Bull para cumplir los flujos.
- `AppModule` registra cache (Redis), Bull para eventos, y carga `AuthModule`, `AssetModule`, `MovementModule`, `MaintenanceModule` y `ReportModule`.
- Los endpoints principales:

  | Ruta                             | Descripción                                       |
  | -------------------------------- | ------------------------------------------------- |
  | `POST /assets`                   | Crea activos (ADMIN/TI).                          |
  | `GET /assets`, `GET /assets/:id` | Lista y detalles (con JWT).                       |
  | `POST /movements`                | Registra traslados/asignaciones y publica evento. |
  | `POST /maintenance`              | Programa mantenimientos.                          |
  | `GET /reports/inventory`         | Conteo por estado.                                |
  | `GET /reports/depreciation`      | Resumen por método.                               |
  | `GET /auth/me`                   | Perfil del token OIDC/JWT.                        |

- La carpeta `backend/src/shared/messaging` encapsula el cliente Bull (`inventory-events`) y los servicios usan `publish` para desacoplar notificaciones.
- Flujo de desarrollo:

  ```sh
  cd backend
  npm install
  npm run prisma:generate
  npm run start:dev
  ```

- Ahora también podés lanzar backend+frontend juntos con `bash scripts/dev-all.sh`, que arranca Nest (con dev helpers habilitados) y Vite en paralelo sin tener que exportar variables manualmente.
- Ese script además espera a que el backend esté listo, crea catálogos de ejemplo (tipo/ubicación/usuario) y abre automáticamente `http://localhost:5173` en el navegador si el sistema lo permite.

- El módulo `AssetModule` expone `/assets` (`GET` general, `GET /:id`, `POST`) usando `AssetService` y Prisma para que el frontend lo consuma.
- El `PrismaModule` es global; los servicios pueden inyectar `PrismaService` para acceder a los modelos.
- Pruebas backend: `npm run test` ejecuta Jest (`backend/tests` con unitarios y e2e que cubren servicios y controladores).
- Nuevos endpoints backend:
  - `GET /audits/asset/:assetId` para leer auditorías de activos.
  - `POST /depreciations` y `GET /depreciations/asset/:assetId` para registrar y consultar depreciaciones.
  - Movimientos/mantenimientos ahora generan registros de auditoría automáticamente (ya sea desde el servicio o el messaging).

## Frontend (React + Vite)

- `frontend/package.json` usa Vite, React y `react-router-dom`; `frontend/vite.config.ts` proxifica `/api` al backend para facilitar el desarrollo local.
- `frontend/src/services/api.ts` expone `assetService` y `reportService` (axios) y puede extenderse con headers JWT antes de que el frontend esté listo.
- Hay un layout base (`MainLayout`), vistas para activos/movimientos/mantenimientos/reportes y componentes reutilizados (`AssetList`) para consumir los endpoints.
- Ejecuta:

  ```sh
  cd frontend
  npm install
  npm run dev
  ```

- Pruebas frontend: `npm run test` corre Vitest (tests unitarios de `AssetList` con mocks de servicios); activa `npm run test:watch` para iterar.
- El layout ahora incluye un campo para ingresar un token JWT y se exponen formularios que llaman a los endpoints `/movements`, `/maintenance`, `/audits/asset/:id` y `/depreciations` para crear registros y visualizar auditorías desde el navegador.
- La vista “Activos” incluye un formulario inline para crear registros con nombre, serial, sistema operativo y referencias a tipo/ubicación/usuario; los IDs se pueden dejar vacíos si aún no existen. El helper “Catálogos rápidos” siempre se muestra pero sus botones solo se habilitan cuando `DEV_ALLOW_PUBLIC_ASSETS=1` y `VITE_ENABLE_DEV_HELPERS=1`, y podés generar UUIDs o descargar CSV de ejemplo para los catálogos desde el modal.
- Ahora el helper incluye un botón “Generar UUIDs aleatorios” que rellena los campos con valores válidos si no tenés catálogos aún, evitando el error “must be a UUID”.
- El formulario advierte al guardar si la API devuelve un error (por ejemplo porque los `assetTypeId`/`locationId`/`responsibleId` deben ser UUIDs existentes); si estás usando nombres, déjalos vacíos y luego crea los catálogos correspondientes o rellena con los IDs reales.
- Hay una nueva vista `Integraciones` que permite crear eventos manuales, despachar pendientes y visualizar el estado/historial de `IntegrationEvent` (PENDING/SENT/FAILED), enlazada con los endpoints `/integrations/*`.

## Integración continua

- `.github/workflows/ci.yml` se dispara en pushes y PR de `master/main`, arranca Postgres 15 + Redis 7 y configura `DATABASE_URL`, JWT y caché para que el backend pueda conectar.
- El flujo oficial:

- Variables adicionales para integraciones externas:
  - `ERP_ENDPOINT` apunta al webhook del ERP financiero (si está configurado, los eventos se disparan tras cada emit).
  - `CMDB_ENDPOINT` para sincronizar el estado de infraestructura con la CMDB/monitoring.
  - Los eventos también se guardan en `IntegrationEvent` y puedes dispararlos manualmente con `POST /integrations/dispatch`.
  - `POST /integrations/event` agrega y encola un evento manualmente; `GET /integrations/events` devuelve el historial (filtrable por estado `PENDING|SENT|FAILED`).
  - `IntegrationScheduler` (cron cada minuto) invoca `dispatchPending()` para procesar eventos encolados automáticamente; puedes desactivar los envíos limpiando `ERP_ENDPOINT` y `CMDB_ENDPOINT`.
  - Métricas Prometheus expuestas en `GET /metrics` (exporta los contadores `activos_integration_*` y la latencia de despacho).
  - Para tareas locales de mantenimiento puedes habilitar `ENABLE_DEV_ROUTES=1` y visitar `GET /dev/add-os` para ejecutar scripts ad-hoc como agregar columnas/índices durante el desarrollo.

## Portal de Sistemas 🏠

**NUEVO**: Sistema unificado de acceso a todos los módulos desde una interfaz centralizada.

### Características Principales
- **Vista de Usuario** (`/portal`): Grid de tarjetas visuales con todos los sistemas disponibles
- **Panel de Administración** (`/portal/admin`): Gestión completa de sistemas sin tocar código
- **Navegación Inteligente**: Diferencia entre rutas internas (SPA) y externas (nueva pestaña)
- **Sistemas Por Defecto**: 6 sistemas base incluidos (Activos, Usuarios, Reportes, Mantenimiento, Licencias, Configuración)

### Acceso Rápido
```
Portal de Usuarios:    http://localhost:5173/portal
Panel de Admin:        http://localhost:5173/portal/admin
```

### Documentación Detallada
- **`PORTAL.md`**: Documentación técnica completa (arquitectura, API, troubleshooting)
- **`PORTAL_GUIA_RAPIDA.md`**: Guía práctica para usuarios y administradores
- **`PORTAL_CHECKLIST.md`**: Lista de verificación de implementación
- **`PORTAL_RESUMEN.md`**: Resumen ejecutivo de la implementación

### Crear Sistemas Por Defecto
```sh
cd backend
npx tsx prisma/seed-portal.ts
```

O desde la interfaz web: ir a `/portal/admin` y clic en "Crear Sistemas Por Defecto"

### Endpoints API
| Ruta | Descripción |
|------|-------------|
| `GET /portal/systems` | Lista sistemas habilitados (usuarios) |
| `GET /portal/systems/all` | Lista todos los sistemas (admin) |
| `POST /portal/systems` | Crea un nuevo sistema |
| `PUT /portal/systems/:id` | Actualiza un sistema |
| `DELETE /portal/systems/:id` | Elimina un sistema |
| `POST /portal/systems/seed` | Crea sistemas por defecto |

**Estado**: ✅ PRODUCCIÓN-READY (Versión 1.0.0)

---

1. `npm ci`, `npx prisma generate`, `npx prisma migrate status` y `npm run test` en `backend/`.
2. `npm ci` y `npm run test` en `frontend/` (Vitest).

## Nuevas funcionalidades implementadas (Nov 2025)

### Observabilidad y Health Checks

- **Health endpoints**: `GET /health`, `/health/ready`, `/health/live` para monitoreo de Kubernetes/Docker
- **Logger estructurado**: JSON logs en producción, formato legible en desarrollo (`LoggerService`)
- **Request logging**: Middleware que registra todas las peticiones HTTP con duración, status code, IP y user-agent
- **Métricas Prometheus**: Endpoint `/metrics` expone contadores de integraciones y latencias

### Containerización y DevOps

- **Docker**: Dockerfiles multi-stage para backend (Node 20 Alpine) y frontend (Nginx Alpine)
- **Docker Compose**: Configuración completa con PostgreSQL 15, Redis 7, health checks y volúmenes persistentes
- **CI/CD Pipeline**: GitHub Actions con tests automáticos, coverage reports y build de imágenes Docker
- **Nginx**: Configuración optimizada con gzip, cache de assets, security headers y proxy reverso

### Scripts de deployment

```bash
# Desarrollo local
npm run dev                    # Backend + Frontend con concurrently
bash scripts/dev-all.sh        # Script completo con verificaciones

# Docker (producción)
docker-compose up -d           # Levantar todo el stack
docker-compose logs -f backend # Ver logs del backend
docker-compose down            # Detener servicios

# CI/CD
git push origin master         # Dispara pipeline automático
```

### Próximos pasos sugeridos

1. **Seguridad**: Implementar HTTPS/TLS con cert-manager o Let's Encrypt
2. **MFA**: Agregar autenticación multi-factor con TOTP (Google Authenticator)
3. **LDAP/AD**: Integrar directorio corporativo para gestión de usuarios
4. **Backups**: Configurar pg_dump automático con retención de 30 días
5. **Monitoring**: Integrar Grafana + Prometheus para dashboards visuales
6. **Alertas**: Configurar AlertManager para notificaciones críticas
