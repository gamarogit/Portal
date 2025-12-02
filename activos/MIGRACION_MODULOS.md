# Migración a Arquitectura Multi-repo

## ⚠️ IMPORTANTE: Este repositorio ha sido reestructurado

Los siguientes módulos han sido **movidos** al nuevo repositorio `activos-portal`:

### Backend - Módulos Migrados ✅

**Auth Module** → `activos-portal/backend/src/modules/auth/`
- ✅ `auth.controller.ts`
- ✅ `auth.service.ts`
- ✅ `auth.module.ts`
- ✅ `strategies/jwt.strategy.ts`
- ✅ `guards/jwt-auth.guard.ts`
- ✅ `guards/roles.guard.ts`
- ✅ `decorators/roles.decorator.ts`

**Portal Module** → `activos-portal/backend/src/modules/portal/`
- ✅ `portal.controller.ts`
- ✅ `portal.service.ts`
- ✅ `portal.module.ts`

### Frontend - Vistas Migradas ✅

**Portal Views** → `activos-portal/frontend/src/views/`
- ✅ `PortalView.tsx` - Vista principal del portal
- ✅ `PortalAdminView.tsx` - Admin de sistemas
- ✅ `LoginView.tsx` - Login centralizado

**Contexts** → `activos-portal/frontend/src/contexts/`
- ✅ `AuthContext.tsx` - Contexto de autenticación

### Scripts Migrados ✅

- ✅ `backend/prisma/seed-portal.ts` → Seed de sistemas por defecto
- ✅ `backend/create-admin.ts` → Creación de usuario admin

---

## 🎯 Nuevo Repositorio: activos-portal

**Ubicación**: `/Users/gamaro/Git/activos-portal/`

**Propósito**: Portal centralizado + API Gateway

**Componentes**:
- Gateway (Backend) - Puerto 3000
- Shell (Frontend) - Puerto 5173
- Autenticación centralizada (JWT)
- Gestión de sistemas del portal
- Proxy a microservicios

---

## 📋 Próximos Pasos para Este Repositorio

Este repositorio se convertirá en el microservicio **"Activos"**.

### 1. Remover Módulos Duplicados

```bash
# Backend
rm -rf backend/src/modules/portal
rm -rf backend/src/modules/auth  # Si se usa auth del gateway

# Frontend
rm frontend/src/views/PortalView.tsx
rm frontend/src/views/PortalAdminView.tsx
# Conservar LoginView.tsx si se usa localmente

# Documentación de portal
rm PORTAL*.md
```

### 2. Actualizar Configuración

**`backend/.env`**:
```env
PORT=3001  # Cambiar de 3000 → 3001
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/activos
CORS_ORIGINS=http://localhost:5173,http://localhost:3101
JWT_SECRET=<mismo que activos-portal>
```

**`backend/src/main.ts`**:
```typescript
const port = process.env.PORT || 3001;
app.enableCors({
  origin: ['http://localhost:5173', 'http://localhost:3101'],
});
```

**`frontend/vite.config.ts`**:
```typescript
server: {
  port: 3101,  # Cambiar de 5173 → 3101
}
```

### 3. Actualizar app.module.ts

Remover imports de módulos migrados:
```typescript
@Module({
  imports: [
    // AuthModule,     ← REMOVER
    // PortalModule,   ← REMOVER
    AssetModule,       // ← CONSERVAR
    MovementModule,    // ← CONSERVAR
    MaintenanceModule, // ← CONSERVAR
    // ...resto de módulos de activos
  ],
})
```

### 4. Agregar Health Check

```typescript
// backend/src/health/health.controller.ts
@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      status: 'healthy',
      service: 'activos-backend',
      timestamp: new Date(),
    };
  }
}
```

### 5. Renombrar Repositorio

**Opción A - GitHub**: Settings → Repository name → `activos-sistema`

**Opción B - Local**:
```bash
cd /Users/gamaro/Git
mv Activos activos-sistema
cd activos-sistema
git remote set-url origin git@github.com:gamarogit/activos-sistema.git
```

---

## 📚 Documentación Completa

Ver el nuevo repositorio para documentación detallada:

- `activos-portal/README.md` - Guía general
- `activos-portal/ARQUITECTURA.md` - Arquitectura técnica
- `activos-portal/MIGRACION.md` - Guía de migración paso a paso

---

## 🔗 Arquitectura Final

```
Portal (:5173) → Gateway (:3000)
                    ↓
         ┌──────────┼──────────┐
         ↓          ↓          ↓
    Activos   Entrena    Gastos
    :3001     :3002      :3003  (Backends)
    :3101     :3102      :3103  (Frontends)
```

---

**Fecha de migración**: 2025-12-01  
**Estado**: ✅ Módulos migrados a `activos-portal`  
**Acción requerida**: Adaptar este repo como microservicio (ver pasos arriba)
