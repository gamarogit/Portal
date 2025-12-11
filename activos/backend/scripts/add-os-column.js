const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  try {
    await prisma.$executeRawUnsafe('ALTER TABLE "Asset" ADD COLUMN IF NOT EXISTS "operatingSystem" TEXT;');
    console.log('Columna operatingSystem creada');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error('No se pudo crear la columna:', error);
  process.exit(1);
});
