import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedProducts() {
    console.log('🌱 Seeding inventory products...');

    const products = [
        {
            sku: 'LAP-001',
            name: 'Laptop Dell XPS 15',
            description: 'Laptop profesional con procesador Intel i7',
            category: 'Electrónica',
            unit: 'unidad',
            currentStock: 25,
            minStock: 10,
            maxStock: 50,
            unitCost: 1200.00,
            location: 'Almacén A - Estante 1',
        },
        {
            sku: 'MOU-001',
            name: 'Mouse Logitech MX Master 3',
            description: 'Mouse inalámbrico ergonómico',
            category: 'Periféricos',
            unit: 'unidad',
            currentStock: 5,
            minStock: 10,
            maxStock: 30,
            unitCost: 99.99,
            location: 'Almacén A - Estante 2',
        },
        {
            sku: 'TEC-001',
            name: 'Teclado Mecánico Keychron K2',
            description: 'Teclado mecánico inalámbrico',
            category: 'Periféricos',
            unit: 'unidad',
            currentStock: 0,
            minStock: 5,
            maxStock: 20,
            unitCost: 89.99,
            location: 'Almacén A - Estante 2',
        },
        {
            sku: 'MON-001',
            name: 'Monitor LG 27" 4K',
            description: 'Monitor 4K UHD de 27 pulgadas',
            category: 'Electrónica',
            unit: 'unidad',
            currentStock: 15,
            minStock: 8,
            maxStock: 25,
            unitCost: 450.00,
            location: 'Almacén B - Estante 1',
        },
        {
            sku: 'CAB-001',
            name: 'Cable HDMI 2.1',
            description: 'Cable HDMI 2.1 de 2 metros',
            category: 'Accesorios',
            unit: 'unidad',
            currentStock: 50,
            minStock: 20,
            maxStock: 100,
            unitCost: 15.99,
            location: 'Almacén C - Cajón 1',
        },
    ];

    for (const product of products) {
        await prisma.product.upsert({
            where: { sku: product.sku },
            update: product,
            create: product,
        });
        console.log(`✅ Created/Updated: ${product.name}`);
    }

    console.log(`\n✅ Seeded ${products.length} products!`);
}

seedProducts()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error('❌ Error:', e);
        await prisma.$disconnect();
        process.exit(1);
    });
