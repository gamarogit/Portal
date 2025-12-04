import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const systems = await prisma.portalSystem.findMany();
    console.log('Sistemas encontrados:', systems.length);
    systems.forEach(s => console.log(`- ${s.name} (${s.enabled ? 'Activo' : 'Inactivo'}) -> ${s.route}`));
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
