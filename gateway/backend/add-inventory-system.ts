import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addInventorySystem() {
    console.log('📦 Adding Inventory system to portal...');

    // Crear sistema de Inventarios
    const inventorySystem = await prisma.portalSystem.upsert({
        where: { name: 'Compras e Inventarios' },
        update: {
            name: 'Compras e Inventarios',
            description: 'Gestión integral de compras, reabastecimiento y control de inventarios'
        },
        create: {
            name: 'Compras e Inventarios',
            description: 'Gestión integral de compras, reabastecimiento y control de inventarios',
            icon: '📦',
            route: '/inventory',
            color: '#10b981',
            enabled: true,
            order: 4,
        },
    });

    console.log('✅ Inventory system created:', inventorySystem);

    // Crear funcionalidades de Inventarios
    const features = [
        { key: 'products.view', name: 'Ver productos', category: 'Productos', description: 'Permite ver la lista de productos' },
        { key: 'products.create', name: 'Crear productos', category: 'Productos', description: 'Permite crear nuevos productos' },
        { key: 'products.edit', name: 'Editar productos', category: 'Productos', description: 'Permite editar productos existentes' },
        { key: 'products.delete', name: 'Eliminar productos', category: 'Productos', description: 'Permite eliminar productos' },
        { key: 'stock.update', name: 'Actualizar stock', category: 'Stock', description: 'Permite registrar movimientos de stock' },
        { key: 'stock.view_movements', name: 'Ver movimientos', category: 'Stock', description: 'Permite ver historial de movimientos' },
        { key: 'alerts.view', name: 'Ver alertas', category: 'Alertas', description: 'Permite ver alertas de stock' },
        { key: 'alerts.resolve', name: 'Resolver alertas', category: 'Alertas', description: 'Permite resolver alertas' },
        { key: 'reports.generate', name: 'Generar reportes', category: 'Reportes', description: 'Permite generar reportes de inventario' },
    ];

    for (const feature of features) {
        await prisma.systemFeature.upsert({
            where: {
                systemId_key: {
                    systemId: inventorySystem.id,
                    key: feature.key,
                },
            },
            update: feature,
            create: {
                ...feature,
                systemId: inventorySystem.id,
            },
        });
    }

    console.log(`✅ Created ${features.length} features for Inventarios`);
    console.log('\n🎉 Inventory system setup completed!');
}

addInventorySystem()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error('❌ Error:', e);
        await prisma.$disconnect();
        process.exit(1);
    });
