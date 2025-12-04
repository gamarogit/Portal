import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Crear o verificar que existe el rol ADMIN
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: {
      name: 'ADMIN',
      description: 'Administrador del sistema con acceso completo',
    },
  });

  console.log('Rol ADMIN:', adminRole);

  // Hash de la contraseña
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  // Crear o actualizar el usuario administrador
  const admin = await prisma.user.upsert({
    where: { email: 'admin@activos.com' },
    update: {
      password: hashedPassword, // Actualiza la contraseña si el usuario existe
    },
    create: {
      email: 'admin@activos.com',
      password: hashedPassword,
      name: 'Administrador',
      roleId: adminRole.id,
    },
  });

  console.log('\n✅ Usuario administrador creado/actualizado:');
  console.log('   Email:', admin.email);
  console.log('   Nombre:', admin.name);
  console.log('   Contraseña: admin123');
  console.log('\n🔐 Usa estas credenciales para iniciar sesión en el sistema.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
