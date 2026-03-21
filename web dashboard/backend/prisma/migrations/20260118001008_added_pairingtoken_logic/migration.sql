-- AlterTable
ALTER TABLE "User" ADD COLUMN     "phoneNumber" TEXT;

-- CreateTable
CREATE TABLE "CareRelation" (
    "id" SERIAL NOT NULL,
    "caregiverId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CareRelation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PairingToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiryAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "caregiverId" TEXT NOT NULL,

    CONSTRAINT "PairingToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CareRelation_caregiverId_userId_key" ON "CareRelation"("caregiverId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "PairingToken_token_key" ON "PairingToken"("token");

-- CreateIndex
CREATE INDEX "PairingToken_expiryAt_idx" ON "PairingToken"("expiryAt");

-- AddForeignKey
ALTER TABLE "CareRelation" ADD CONSTRAINT "CareRelation_caregiverId_fkey" FOREIGN KEY ("caregiverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareRelation" ADD CONSTRAINT "CareRelation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PairingToken" ADD CONSTRAINT "PairingToken_caregiverId_fkey" FOREIGN KEY ("caregiverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
