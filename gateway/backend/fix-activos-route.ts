import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔧 Corrigiendo ruta del sistema Activos...');

    const system = await prisma.portalSystem.findUnique({
        where: { name: 'Activos' },
    });

    if (!system) {
        console.error('❌ El sistema Activos no existe.');
        return;
    }

    console.log(`   Ruta actual: ${system.route}`);

    const updated = await prisma.portalSystem.update({
        where: { name: 'Activos' },
        data: {
            route: 'http://localhost:3101',
            apiUrl: 'http://localhost:3001',
        },
    });

    console.log(`✅ Ruta actualizada a: ${updated.route}`);
    console.log(`✅ API URL actualizada a: ${updated.apiUrl}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
