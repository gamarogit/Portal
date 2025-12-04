import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function testLogin() {
    const user = await prisma.user.findUnique({
        where: { email: 'admin@portal.com' },
        include: { role: true },
    });

    console.log('Usuario encontrado:', user);

    if (user && user.password) {
        const testPassword = 'admin123';
        const isValid = await bcrypt.compare(testPassword, user.password);
        console.log('¿Contraseña válida?:', isValid);
        console.log('Hash almacenado:', user.password);

        // Generar nuevo hash para comparar
        const newHash = await bcrypt.hash(testPassword, 10);
        console.log('Nuevo hash generado:', newHash);
        const newHashValid = await bcrypt.compare(testPassword, newHash);
        console.log('¿Nuevo hash válido?:', newHashValid);
    }

    await prisma.$disconnect();
}

testLogin().catch(console.error);
