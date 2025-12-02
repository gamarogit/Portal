"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Iniciando seed de datos...');
    const user1 = await prisma.user.upsert({
        where: { email: 'juan.perez@empresa.com' },
        update: {},
        create: {
            email: 'juan.perez@empresa.com',
            name: 'Juan Pérez',
        },
    });
    const user2 = await prisma.user.upsert({
        where: { email: 'maria.lopez@empresa.com' },
        update: {},
        create: {
            email: 'maria.lopez@empresa.com',
            name: 'María López',
        },
    });
    console.log('✓ Usuarios creados');
    const laptopType = await prisma.assetType.upsert({
        where: { name: 'Laptop' },
        update: {},
        create: { name: 'Laptop' },
    });
    const desktopType = await prisma.assetType.upsert({
        where: { name: 'Desktop' },
        update: {},
        create: { name: 'Desktop' },
    });
    const monitorType = await prisma.assetType.upsert({
        where: { name: 'Monitor' },
        update: {},
        create: { name: 'Monitor' },
    });
    console.log('✓ Tipos de activos creados');
    const oficina1 = await prisma.location.findFirst({ where: { name: 'Oficina Central' } }) ||
        await prisma.location.create({
            data: { name: 'Oficina Central', type: 'Oficina' },
        });
    const oficina2 = await prisma.location.findFirst({ where: { name: 'Sucursal Norte' } }) ||
        await prisma.location.create({
            data: { name: 'Sucursal Norte', type: 'Sucursal' },
        });
    console.log('✓ Ubicaciones creadas');
    const activos = [
        {
            name: 'Laptop Dell Latitude 5520',
            serialNumber: 'DL5520-001',
            state: 'ACTIVO',
            operatingSystem: 'Windows 11 Pro',
            cost: 25000,
            assetTypeId: laptopType.id,
            locationId: oficina1.id,
            responsibleId: user1.id,
        },
        {
            name: 'MacBook Pro 14"',
            serialNumber: 'MBP14-002',
            state: 'ACTIVO',
            operatingSystem: 'macOS Sonoma',
            cost: 45000,
            assetTypeId: laptopType.id,
            locationId: oficina1.id,
            responsibleId: user2.id,
        },
        {
            name: 'Desktop HP ProDesk',
            serialNumber: 'HP-PD-003',
            state: 'ACTIVO',
            operatingSystem: 'Windows 11 Pro',
            cost: 18000,
            assetTypeId: desktopType.id,
            locationId: oficina2.id,
            responsibleId: user1.id,
        },
        {
            name: 'Monitor LG UltraWide 34"',
            serialNumber: 'LG-UW-004',
            state: 'ACTIVO',
            cost: 8000,
            assetTypeId: monitorType.id,
            locationId: oficina1.id,
            responsibleId: user2.id,
        },
        {
            name: 'Laptop Lenovo ThinkPad',
            serialNumber: 'TP-X1-005',
            state: 'MANTENIMIENTO',
            operatingSystem: 'Windows 11 Pro',
            cost: 28000,
            assetTypeId: laptopType.id,
            locationId: oficina2.id,
        },
    ];
    for (const activo of activos) {
        const existing = await prisma.asset.findUnique({
            where: { serialNumber: activo.serialNumber },
        });
        if (!existing) {
            await prisma.asset.create({ data: activo });
        }
    }
    console.log('✓ Activos de ejemplo creados');
    console.log('\n✅ Seed completado exitosamente!');
    console.log(`   - ${activos.length} activos`);
    console.log(`   - 2 usuarios`);
    console.log(`   - 3 tipos de activos`);
    console.log(`   - 2 ubicaciones\n`);
}
main()
    .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
