-- Migración manual: agregar campos nuevos a modelos existentes
-- EJECUTAR DESDE: psql -U postgres -d activos < este_archivo.sql

-- 1. Agregar campos a Movement
ALTER TABLE "Movement" ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT 'PENDIENTE';
ALTER TABLE "Movement" ADD COLUMN IF NOT EXISTS "reason" TEXT;

-- 2. Agregar campos a Maintenance
ALTER TABLE "Maintenance" ADD COLUMN IF NOT EXISTS "maintenanceType" TEXT;
ALTER TABLE "Maintenance" ADD COLUMN IF NOT EXISTS "description" TEXT;
ALTER TABLE "Maintenance" ADD COLUMN IF NOT EXISTS "completedAt" TIMESTAMP(3);
ALTER TABLE "Maintenance" ADD COLUMN IF NOT EXISTS "cost" DECIMAL(12,2);
ALTER TABLE "Maintenance" ADD COLUMN IF NOT EXISTS "contractId" TEXT;

-- 3. Agregar campos a Asset (si no existen)
ALTER TABLE "Asset" ADD COLUMN IF NOT EXISTS "vendorId" TEXT;
ALTER TABLE "Asset" ADD COLUMN IF NOT EXISTS "contractId" TEXT;
-- Eliminar unique constraint si existe, luego agregar code sin unique
DO $$ BEGIN
    ALTER TABLE "Asset" DROP CONSTRAINT IF EXISTS "Asset_code_key";
EXCEPTION WHEN undefined_object THEN
    NULL;
END $$;

ALTER TABLE "Asset" ADD COLUMN IF NOT EXISTS "code" TEXT;

-- 4. Agregar campo a User
-- Ya existe licenseAssignments como relación, no requiere columna

-- 5. Crear enum LicenseStatus
DO $$ BEGIN
    CREATE TYPE "LicenseStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELLED', 'SUSPENDED');
EXCEPTION WHEN duplicate_object THEN
    NULL;
END $$;

-- 6. Crear tabla License
CREATE TABLE IF NOT EXISTS "License" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "name" TEXT NOT NULL,
    "vendor" TEXT NOT NULL,
    "licenseKey" TEXT,
    "purchaseDate" TIMESTAMP(3) NOT NULL,
    "expirationDate" TIMESTAMP(3),
    "totalSeats" INTEGER NOT NULL DEFAULT 1,
    "usedSeats" INTEGER NOT NULL DEFAULT 0,
    "cost" DECIMAL(12,2),
    "contractNumber" TEXT,
    "status" "LicenseStatus" NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 7. Crear tabla LicenseAssignment
CREATE TABLE IF NOT EXISTS "LicenseAssignment" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "licenseId" TEXT NOT NULL,
    "userId" TEXT,
    "assetId" TEXT,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("licenseId") REFERENCES "License"("id") ON DELETE CASCADE,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL,
    FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE SET NULL
);

-- 8. Crear tabla Vendor
CREATE TABLE IF NOT EXISTS "Vendor" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "name" TEXT NOT NULL UNIQUE,
    "contactName" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "address" TEXT,
    "rating" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 9. Crear tabla MaintenanceContract
CREATE TABLE IF NOT EXISTS "MaintenanceContract" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "vendorId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "cost" DECIMAL(12,2) NOT NULL,
    "scope" TEXT,
    "sla" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE RESTRICT
);

-- 10. Agregar foreign keys a Asset
DO $$ BEGIN
    ALTER TABLE "Asset" ADD CONSTRAINT "Asset_vendorId_fkey" 
        FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN
    NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "Asset" ADD CONSTRAINT "Asset_contractId_fkey" 
        FOREIGN KEY ("contractId") REFERENCES "MaintenanceContract"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN
    NULL;
END $$;

-- 11. Agregar foreign key a Maintenance
DO $$ BEGIN
    ALTER TABLE "Maintenance" ADD CONSTRAINT "Maintenance_contractId_fkey" 
        FOREIGN KEY ("contractId") REFERENCES "MaintenanceContract"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN
    NULL;
END $$;

-- 12. Crear índices
CREATE INDEX IF NOT EXISTS "idx_license_status" ON "License"("status");
CREATE INDEX IF NOT EXISTS "idx_license_expiration" ON "License"("expirationDate");
CREATE INDEX IF NOT EXISTS "idx_asset_vendor" ON "Asset"("vendorId");
CREATE INDEX IF NOT EXISTS "idx_asset_contract" ON "Asset"("contractId");
CREATE INDEX IF NOT EXISTS "idx_maintenance_contract" ON "Maintenance"("contractId");

COMMIT;
