import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Creando usuario Admin...');

  // Hash de la contraseña
  const hashedPassword = await bcrypt.hash('Admin', 10);

  // Buscar o crear rol Admin
  let adminRole = await prisma.role.findUnique({
    where: { name: 'ADMIN' },
  });

  if (!adminRole) {
    adminRole = await prisma.role.create({
      data: {
        name: 'ADMIN',
        description: 'Administrador del sistema',
      },
    });
    console.log('✓ Rol ADMIN creado');
  }

  // Buscar usuario Admin existente
  const existingAdmin = await prisma.user.findFirst({
    where: { name: 'Admin' },
  });

  if (existingAdmin) {
    // Actualizar contraseña
    await prisma.user.update({
      where: { id: existingAdmin.id },
      data: {
        password: hashedPassword,
        roleId: adminRole.id,
      },
    });
    console.log('✓ Usuario Admin actualizado');
  } else {
    // Crear usuario Admin
    await prisma.user.create({
      data: {
        email: 'admin@activos.local',
        name: 'Admin',
        password: hashedPassword,
        roleId: adminRole.id,
      },
    });
    console.log('✓ Usuario Admin creado');
  }

  console.log('\n=== Credenciales ===');
  console.log('Usuario: Admin');
  console.log('Contraseña: Admin');
  console.log('===================\n');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
