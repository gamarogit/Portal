import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Crear rol Admin
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: {
      name: 'ADMIN',
      description: 'Administrador del portal',
    },
  });

  // Hash de la contraseña
  const hashedPassword = await bcrypt.hash('admin123', 10);

  // Crear usuario admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@portal.com' },
    update: {},
    create: {
      email: 'admin@portal.com',
      password: hashedPassword,
      name: 'Administrador Portal',
      roleId: adminRole.id,
    },
  });

  console.log('✅ Usuario admin creado:', admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
