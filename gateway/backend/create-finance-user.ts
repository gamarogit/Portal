import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createFinanceUser() {
    console.log('🏦 Creating Finance role and user...');

    // 1. Crear rol de Finanzas
    const financeRole = await prisma.role.upsert({
        where: { name: 'FINANZAS' },
        update: {},
        create: {
            name: 'FINANZAS',
            description: 'Rol de finanzas con acceso completo a Gastos',
        },
    });
    console.log('✅ Finance role created:', financeRole);

    // 2. Crear usuario de finanzas
    const hashedPassword = await bcrypt.hash('finanzas123', 10);

    const financeUser = await prisma.user.upsert({
        where: { email: 'finanzas@portal.com' },
        update: {
            password: hashedPassword,
            roleId: financeRole.id,
        },
        create: {
            email: 'finanzas@portal.com',
            password: hashedPassword,
            name: 'Usuario Finanzas',
            roleId: financeRole.id,
        },
    });
    console.log('✅ Finance user created:', financeUser.email);

    // 3. Obtener todos los sistemas
    const systems = await prisma.portalSystem.findMany();
    console.log(`📦 Found ${systems.length} systems`);

    // 4. Dar acceso a todos los micrositios
    for (const system of systems) {
        await prisma.systemPermission.upsert({
            where: {
                userId_systemId: {
                    userId: financeUser.id,
                    systemId: system.id,
                },
            },
            update: { canAccess: true },
            create: {
                userId: financeUser.id,
                systemId: system.id,
                canAccess: true,
            },
        });
        console.log(`✅ Access granted to: ${system.name}`);
    }

    // 5. Obtener sistema de Gastos y sus funcionalidades
    const gastosSystem = systems.find(s => s.name === 'Gastos');

    if (gastosSystem) {
        const gastosFeatures = await prisma.systemFeature.findMany({
            where: { systemId: gastosSystem.id },
        });

        console.log(`💰 Found ${gastosFeatures.length} features for Gastos`);

        // 6. Dar todos los permisos de Gastos
        for (const feature of gastosFeatures) {
            await prisma.featurePermission.upsert({
                where: {
                    userId_featureId: {
                        userId: financeUser.id,
                        featureId: feature.id,
                    },
                },
                update: { granted: true },
                create: {
                    userId: financeUser.id,
                    featureId: feature.id,
                    granted: true,
                },
            });
            console.log(`  ✅ ${feature.name}`);
        }
    }

    console.log('\n🎉 Finance user setup completed!');
    console.log('📧 Email: finanzas@portal.com');
    console.log('🔑 Password: finanzas123');
    console.log('🔐 Permissions:');
    console.log('   - Access to ALL systems (Activos, Entrenamiento, Gastos)');
    console.log('   - Full permissions ONLY in Gastos');
}

createFinanceUser()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error('❌ Error:', e);
        await prisma.$disconnect();
        process.exit(1);
    });
