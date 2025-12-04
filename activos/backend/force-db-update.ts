
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Forzando actualización de AssetForm en DB...');

    // Configuración con orden invertido manual (Estado primero)
    const newConfig = {
        fields: [
            { name: 'state', label: 'Estado (FORZADO)', order: 0, type: 'text', required: false },
            { name: 'name', label: 'Nombre', order: 1, type: 'text', required: true },
            { name: 'serialNumber', label: 'No. Serie', order: 2, type: 'text', required: false },
            { name: 'assetTypeId', label: 'Tipo', order: 3, type: 'text', required: true },
            // Resto de campos no importan tanto para la prueba
        ]
    };

    const result = await prisma.formConfig.upsert({
        where: { formName: 'AssetForm' },
        update: { config: newConfig },
        create: { formName: 'AssetForm', config: newConfig },
    });

    console.log('Actualización completada. ID:', result.id);
    console.log('Config guardada:', JSON.stringify(result.config, null, 2));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
