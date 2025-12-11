# Portal Multi-Sistema

Monorepo que integra 3 sistemas empresariales a través de un API Gateway centralizado.

## Estructura

```
portal/
├── gateway/        # API Gateway + Shell Frontend (puertos 3000/5174)
├── activos/        # Sistema de Gestión de Activos TI (puertos 3001/3101)
├── entrenamiento/  # Sistema de Capacitaciones (puertos 3002/3102)
└── gastos/         # Sistema de Control de Gastos (puertos 3003/3103)
```

## Inicio Rápido

```bash
# Terminal 1: Gateway Backend
cd gateway/backend && npm run start:dev

# Terminal 2: Gateway Frontend (Shell)
cd gateway/frontend && npm run dev

# Terminal 3: Activos Backend
cd activos/backend && npm run start:dev

# Terminal 4: Activos Frontend
cd activos/frontend && npm run dev
```

## Acceso

- **Portal**: http://localhost:5174
  - Login: `admin@activos.com` / `admin123`
- **Activos**: http://localhost:3101

## Documentación

- `gateway/ARQUITECTURA.md`: Arquitectura completa del sistema
- `gateway/MIGRACION.md`: Guía de migración
- `activos/PASOS_COMPLETADOS.md`: Configuración aplicada
