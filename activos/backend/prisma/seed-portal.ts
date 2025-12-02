import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Creando sistemas por defecto del portal...');

  const defaultSystems = [
    {
      name: 'Activos',
      description: 'Gestión completa del inventario de activos tecnológicos',
      icon: '💼',
      route: '/assets',
      color: '#667eea',
      enabled: true,
      order: 1,
    },
    {
      name: 'Usuarios',
      description: 'Administración de usuarios del sistema',
      icon: '👥',
      route: '/users',
      color: '#764ba2',
      enabled: true,
      order: 2,
    },
    {
      name: 'Reportes',
      description: 'Generación y visualización de reportes',
      icon: '📊',
      route: '/reports',
      color: '#4facfe',
      enabled: true,
      order: 3,
    },
    {
      name: 'Mantenimiento',
      description: 'Control de mantenimientos preventivos y correctivos',
      icon: '🔧',
      route: '/maintenance',
      color: '#43e97b',
      enabled: true,
      order: 4,
    },
    {
      name: 'Licencias',
      description: 'Gestión de licencias de software',
      icon: '📜',
      route: '/licenses',
      color: '#fa709a',
      enabled: true,
      order: 5,
    },
    {
      name: 'Configuración',
      description: 'Configuración del sistema y formularios dinámicos',
      icon: '⚙️',
      route: '/configuration',
      color: '#30cfd0',
      enabled: true,
      order: 6,
    },
  ];

  for (const system of defaultSystems) {
    // Verificar si ya existe por nombre
    const existing = await prisma.portalSystem.findFirst({
      where: { name: system.name },
    });

    if (!existing) {
      await prisma.portalSystem.create({
        data: system,
      });
      console.log(`✓ Creado: ${system.name}`);
    } else {
      console.log(`⊗ Ya existe: ${system.name}`);
    }
  }

  console.log('✅ Seed completado');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
