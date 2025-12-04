import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const types = [
        { name: 'Computadora', description: 'Equipo de escritorio' },
        { name: 'Laptop', description: 'Equipo portátil' },
        { name: 'Celular', description: 'Teléfono móvil' },
        { name: 'Tablet', description: 'Tableta' },
        { name: 'Monitor', description: 'Pantalla externa' },
        { name: 'Impresora', description: 'Dispositivo de impresión' },
        { name: 'Servidor', description: 'Equipo de servidor' },
        { name: 'Accesorio', description: 'Teclados, mouses, etc.' },
        // Redes
        { name: 'Router', description: 'Enrutador de red' },
        { name: 'Switch', description: 'Conmutador de red' },
        { name: 'Access Point', description: 'Punto de acceso inalámbrico' },
        { name: 'Firewall', description: 'Dispositivo de seguridad' },
        // Audiovisual
        { name: 'Proyector', description: 'Proyector de video' },
        { name: 'Pantalla', description: 'TV o Pantalla informativa' },
        { name: 'Videoconferencia', description: 'Equipo de sala de reuniones' },
        // Mobiliario
        { name: 'Silla', description: 'Silla de oficina' },
        { name: 'Escritorio', description: 'Mesa de trabajo' },
        // Vehículos
        { name: 'Automóvil', description: 'Vehículo utilitario o asignado' },
        // Lógico
        { name: 'VPN', description: 'Acceso a red privada virtual' },
    ];

    console.log('Seeding asset types...');

    for (const type of types) {
        const exists = await prisma.assetType.findUnique({
            where: { name: type.name },
        });

        if (!exists) {
            await prisma.assetType.create({
                data: type,
            });
            console.log(`Created: ${type.name}`);
        } else {
            console.log(`Exists: ${type.name}`);
        }
    }

    console.log('Done.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
