-- CreateTable
CREATE TABLE "ThemeConfig" (
    "id" TEXT NOT NULL,
    "primaryColor" TEXT NOT NULL DEFAULT '#003b4d',
    "secondaryColor" TEXT NOT NULL DEFAULT '#00afaa',
    "accentColor" TEXT NOT NULL DEFAULT '#d9c79e',
    "backgroundColor" TEXT NOT NULL DEFAULT '#f0f2f5',
    "logoUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ThemeConfig_pkey" PRIMARY KEY ("id")
);
