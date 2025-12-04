-- CreateEnum
CREATE TYPE "MovementStatus" AS ENUM ('PENDIENTE', 'EN_CURSO', 'REALIZADO', 'CANCELADO');

-- AlterTable
ALTER TABLE "Movement" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Movement" ALTER COLUMN "status" TYPE "MovementStatus" USING (status::"MovementStatus");
ALTER TABLE "Movement" ALTER COLUMN "status" SET DEFAULT 'PENDIENTE'::"MovementStatus";
