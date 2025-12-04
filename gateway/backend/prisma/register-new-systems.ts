import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Iniciando registro de nuevos sistemas...');

    const systems = [
        {
            name: 'Entrenamiento',
            description: 'Plataforma de capacitación y cursos',
            icon: '🎓',
            route: 'http://localhost:3102',
            apiUrl: 'http://localhost:3002',
            color: '#f6ad55',
            enabled: true,
            order: 7,
        },
        {
            name: 'Gastos',
            description: 'Control de gastos y presupuestos',
            icon: '💰',
            route: 'http://localhost:3103',
            apiUrl: 'http://localhost:3003',
            color: '#68d391',
            enabled: true,
            order: 8,
        },
    ];

    for (const system of systems) {
        const existing = await prisma.portalSystem.findUnique({
            where: { name: system.name },
        });

        if (existing) {
            console.log(`⚠️  El sistema "${system.name}" ya existe. Actualizando...`);
            await prisma.portalSystem.update({
                where: { id: existing.id },
                data: system,
            });
            console.log(`✅ Sistema "${system.name}" actualizado.`);
        } else {
            await prisma.portalSystem.create({
                data: system,
            });
            console.log(`✅ Sistema "${system.name}" creado.`);
        }
    }

    console.log('✨ Registro completado exitosamente.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
