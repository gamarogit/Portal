import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Creando usuario legacy (admin@activos.com)...');

    // Verificar rol ADMIN
    const adminRole = await prisma.role.findUnique({
        where: { name: 'ADMIN' },
    });

    if (!adminRole) {
        console.error('❌ Error: El rol ADMIN no existe. Ejecuta primero el seed principal.');
        process.exit(1);
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Crear o actualizar usuario
    const user = await prisma.user.upsert({
        where: { email: 'admin@activos.com' },
        update: {
            password: hashedPassword,
            name: 'Administrador Activos (Legacy)',
            roleId: adminRole.id,
        },
        create: {
            email: 'admin@activos.com',
            password: hashedPassword,
            name: 'Administrador Activos (Legacy)',
            roleId: adminRole.id,
        },
    });

    console.log('✅ Usuario creado exitosamente:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Nombre: ${user.name}`);
    console.log(`   Password: admin123`);
}

main()
    .catch((e) => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
