
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const count = await prisma.location.count();
    console.log(`Total locations: ${count}`);
    const locations = await prisma.location.findMany();
    console.log('Locations:', locations);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
