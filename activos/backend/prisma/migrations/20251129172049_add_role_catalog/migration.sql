-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- Migrar roles existentes de User.role a la tabla Role
INSERT INTO "Role" ("id", "name", "description", "createdAt", "updatedAt")
SELECT 
    gen_random_uuid(),
    DISTINCT "role",
    'Migrado automáticamente',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "User"
WHERE "role" IS NOT NULL AND "role" != '';

-- Agregar columna roleId a User
ALTER TABLE "User" ADD COLUMN "roleId" TEXT;

-- Actualizar roleId basado en el nombre del rol
UPDATE "User"
SET "roleId" = (
    SELECT "id" 
    FROM "Role" 
    WHERE "Role"."name" = "User"."role"
)
WHERE "role" IS NOT NULL AND "role" != '';

-- Eliminar la columna role antigua
ALTER TABLE "User" DROP COLUMN "role";

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;
