-- CreateTable
CREATE TABLE "SystemPermission" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "systemId" TEXT NOT NULL,
    "canAccess" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemPermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemFeature" (
    "id" TEXT NOT NULL,
    "systemId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemFeature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeaturePermission" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "featureId" TEXT NOT NULL,
    "granted" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeaturePermission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SystemPermission_userId_systemId_key" ON "SystemPermission"("userId", "systemId");

-- CreateIndex
CREATE UNIQUE INDEX "SystemFeature_systemId_key_key" ON "SystemFeature"("systemId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "FeaturePermission_userId_featureId_key" ON "FeaturePermission"("userId", "featureId");

-- AddForeignKey
ALTER TABLE "SystemPermission" ADD CONSTRAINT "SystemPermission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SystemPermission" ADD CONSTRAINT "SystemPermission_systemId_fkey" FOREIGN KEY ("systemId") REFERENCES "PortalSystem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SystemFeature" ADD CONSTRAINT "SystemFeature_systemId_fkey" FOREIGN KEY ("systemId") REFERENCES "PortalSystem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeaturePermission" ADD CONSTRAINT "FeaturePermission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeaturePermission" ADD CONSTRAINT "FeaturePermission_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "SystemFeature"("id") ON DELETE CASCADE ON UPDATE CASCADE;
