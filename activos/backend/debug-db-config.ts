
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Listando TODAS las configuraciones en FormConfig:');
    const configs = await prisma.formConfig.findMany();

    if (configs.length === 0) {
        console.log('No hay registros en FormConfig.');
    }

    configs.forEach(c => {
        console.log(`\n[${c.formName}] (ID: ${c.id})`);
        // Mostrar solo los primeros 3 campos para no saturar
        const conf = c.config as any;
        if (conf && conf.fields) {
            console.log('Campos:', conf.fields.slice(0, 3).map((f: any) => `${f.name} (${f.order})`));
            console.log(`Total campos: ${conf.fields.length}`);
        } else {
            console.log('Config raw:', JSON.stringify(conf).substring(0, 100));
        }
    });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
