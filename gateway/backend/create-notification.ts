import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.findUnique({ where: { email: 'admin@portal.com' } });
    if (!user) throw new Error('User not found');

    await prisma.notification.create({
        data: {
            userId: user.id,
            type: 'INFO',
            title: 'Prueba Manual Script',
            message: 'Notificación creada directamente via script prisma',
            priority: 'HIGH',
            isRead: false,
        },
    });
    console.log('Notification created');
}

main()
    .catch((e) => {
        throw e;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
