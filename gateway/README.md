# Activos Portal - Gateway & Shell

Portal centralizado y API Gateway para el ecosistema de sistemas empresariales.

## Arquitectura

Este repositorio contiene:
- **Gateway (Backend)**: API Gateway que enruta a microservicios + autenticación centralizada
- **Shell (Frontend)**: Portal React que carga micro-frontends dinámicamente

## Sistemas Integrados

| Sistema | Backend | Frontend | Repositorio |
|---------|---------|----------|-------------|
| Activos | :3001 | :3101 | `activos-sistema` |
| Entrenamiento | :3002 | :3102 | `entrenamiento-sistema` |
| Gastos | :3003 | :3103 | `gastos-sistema` |

## Inicio Rápido

```bash
# Desarrollo - Levantar todo el ecosistema
docker-compose up -d

# O manualmente
cd backend && npm run start:dev
cd frontend && npm run dev
```

## Puertos

- **Gateway**: 3000
- **Portal Frontend**: 5173
- **PostgreSQL**: 5432
- **Redis**: 6379

## Configuración

Copia `.env.example` a `.env` y configura:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/activos_portal
JWT_SECRET=tu_secret_generado
REDIS_URL=redis://localhost:6379

# Microservicios
ACTIVOS_API=http://localhost:3001
ENTRENAMIENTO_API=http://localhost:3002
GASTOS_API=http://localhost:3003
```

## Desarrollo

Ver `ARQUITECTURA.md` para detalles de la arquitectura y guía para agregar nuevos sistemas.
