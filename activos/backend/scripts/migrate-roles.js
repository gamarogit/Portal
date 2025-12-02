"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function migrate() {
    console.log('Iniciando migración de roles...');
    await prisma.$executeRaw `
    CREATE TABLE IF NOT EXISTS "Role" (
      "id" TEXT NOT NULL,
      "name" TEXT NOT NULL UNIQUE,
      "description" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
    )
  `;
    console.log('✓ Tabla Role creada o ya existe');
    const users = await prisma.$queryRaw `
    SELECT DISTINCT role FROM "User" WHERE role IS NOT NULL AND role != ''
  `;
    console.log(`Encontrados ${users.length} roles únicos:`, users.map(u => u.role));
    for (const user of users) {
        await prisma.$executeRaw `
      INSERT INTO "Role" (id, name, description, "createdAt", "updatedAt")
      SELECT gen_random_uuid(), ${user.role}, 'Migrado automáticamente', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      WHERE NOT EXISTS (SELECT 1 FROM "Role" WHERE name = ${user.role})
    `;
    }
    await prisma.$executeRaw `
    ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "roleId" TEXT
  `;
    await prisma.$executeRaw `
    UPDATE "User"
    SET "roleId" = (SELECT id FROM "Role" WHERE "Role".name = "User".role)
    WHERE role IS NOT NULL AND role != ''
  `;
    const usersWithoutRoleId = await prisma.$queryRaw `
    SELECT COUNT(*) as count FROM "User" WHERE role IS NOT NULL AND role != '' AND "roleId" IS NULL
  `;
    if (Number(usersWithoutRoleId[0].count) > 0) {
        throw new Error(`${usersWithoutRoleId[0].count} usuarios no tienen roleId asignado`);
    }
    await prisma.$executeRaw `ALTER TABLE "User" DROP COLUMN IF EXISTS role`;
    try {
        await prisma.$executeRaw `
      ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" 
      FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE
    `;
    }
    catch (e) {
        if (!e.message?.includes('already exists')) {
            throw e;
        }
    }
    console.log('✓ Migración completada');
}
migrate()
    .catch((e) => {
    console.error('Error en migración:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
