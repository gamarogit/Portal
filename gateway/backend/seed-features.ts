import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedFeatures() {
    console.log('🌱 Seeding system features...');

    // Obtener los sistemas
    const systems = await prisma.portalSystem.findMany();

    const activosSystem = systems.find(s => s.name === 'Activos');
    const entrenamientoSystem = systems.find(s => s.name === 'Entrenamiento');
    const gastosSystem = systems.find(s => s.name === 'Gastos');

    // Funcionalidades de Activos
    if (activosSystem) {
        const activosFeatures = [
            { key: 'assets.view', name: 'Ver activos', category: 'Activos', description: 'Permite ver la lista de activos' },
            { key: 'assets.create', name: 'Crear activos', category: 'Activos', description: 'Permite crear nuevos activos' },
            { key: 'assets.edit', name: 'Editar activos', category: 'Activos', description: 'Permite editar activos existentes' },
            { key: 'assets.delete', name: 'Eliminar activos', category: 'Activos', description: 'Permite eliminar activos' },
            { key: 'movements.view', name: 'Ver movimientos', category: 'Movimientos', description: 'Permite ver movimientos de activos' },
            { key: 'movements.create', name: 'Crear movimientos', category: 'Movimientos', description: 'Permite crear movimientos de activos' },
            { key: 'movements.approve', name: 'Aprobar movimientos', category: 'Movimientos', description: 'Permite aprobar movimientos pendientes' },
            { key: 'maintenance.view', name: 'Ver mantenimientos', category: 'Mantenimiento', description: 'Permite ver mantenimientos' },
            { key: 'maintenance.create', name: 'Crear mantenimientos', category: 'Mantenimiento', description: 'Permite programar mantenimientos' },
            { key: 'reports.view', name: 'Ver reportes', category: 'Reportes', description: 'Permite ver reportes' },
            { key: 'reports.export', name: 'Exportar reportes', category: 'Reportes', description: 'Permite exportar reportes' },
        ];

        for (const feature of activosFeatures) {
            await prisma.systemFeature.upsert({
                where: {
                    systemId_key: {
                        systemId: activosSystem.id,
                        key: feature.key,
                    },
                },
                update: feature,
                create: {
                    ...feature,
                    systemId: activosSystem.id,
                },
            });
        }
        console.log(`✅ Created ${activosFeatures.length} features for Activos`);
    }

    // Funcionalidades de Entrenamiento
    if (entrenamientoSystem) {
        const entrenamientoFeatures = [
            { key: 'courses.view', name: 'Ver cursos', category: 'Cursos', description: 'Permite ver la lista de cursos' },
            { key: 'courses.create', name: 'Crear cursos', category: 'Cursos', description: 'Permite crear nuevos cursos' },
            { key: 'courses.edit', name: 'Editar cursos', category: 'Cursos', description: 'Permite editar cursos existentes' },
            { key: 'courses.delete', name: 'Eliminar cursos', category: 'Cursos', description: 'Permite eliminar cursos' },
            { key: 'enrollments.view', name: 'Ver inscripciones', category: 'Inscripciones', description: 'Permite ver inscripciones' },
            { key: 'enrollments.manage', name: 'Gestionar inscripciones', category: 'Inscripciones', description: 'Permite inscribir y desinscribir usuarios' },
        ];

        for (const feature of entrenamientoFeatures) {
            await prisma.systemFeature.upsert({
                where: {
                    systemId_key: {
                        systemId: entrenamientoSystem.id,
                        key: feature.key,
                    },
                },
                update: feature,
                create: {
                    ...feature,
                    systemId: entrenamientoSystem.id,
                },
            });
        }
        console.log(`✅ Created ${entrenamientoFeatures.length} features for Entrenamiento`);
    }

    // Funcionalidades de Gastos
    if (gastosSystem) {
        const gastosFeatures = [
            { key: 'expenses.view', name: 'Ver gastos', category: 'Gastos', description: 'Permite ver la lista de gastos' },
            { key: 'expenses.create', name: 'Crear gastos', category: 'Gastos', description: 'Permite crear nuevos gastos' },
            { key: 'expenses.edit', name: 'Editar gastos', category: 'Gastos', description: 'Permite editar gastos existentes' },
            { key: 'expenses.delete', name: 'Eliminar gastos', category: 'Gastos', description: 'Permite eliminar gastos' },
            { key: 'expenses.approve', name: 'Aprobar gastos', category: 'Gastos', description: 'Permite aprobar gastos pendientes' },
            { key: 'budgets.view', name: 'Ver presupuestos', category: 'Presupuestos', description: 'Permite ver presupuestos' },
            { key: 'budgets.manage', name: 'Gestionar presupuestos', category: 'Presupuestos', description: 'Permite crear y editar presupuestos' },
        ];

        for (const feature of gastosFeatures) {
            await prisma.systemFeature.upsert({
                where: {
                    systemId_key: {
                        systemId: gastosSystem.id,
                        key: feature.key,
                    },
                },
                update: feature,
                create: {
                    ...feature,
                    systemId: gastosSystem.id,
                },
            });
        }
        console.log(`✅ Created ${gastosFeatures.length} features for Gastos`);
    }

    console.log('✅ Feature seeding completed!');
}

seedFeatures()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error('❌ Error:', e);
        await prisma.$disconnect();
        process.exit(1);
    });
