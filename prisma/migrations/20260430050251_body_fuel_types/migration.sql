/*
  Warnings:

  - You are about to drop the column `bodyType` on the `Car` table. All the data in the column will be lost.
  - You are about to drop the column `fuelType` on the `Car` table. All the data in the column will be lost.
  - Added the required column `bodyTypeId` to the `Car` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fuelTypeId` to the `Car` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX IF EXISTS "CarModel_brandId_idx";

-- AlterTable
ALTER TABLE "Car" DROP COLUMN "bodyType",
DROP COLUMN "fuelType",
ADD COLUMN     "bodyTypeId" TEXT NOT NULL,
ADD COLUMN     "fuelTypeId" TEXT NOT NULL;

-- DropEnum
DROP TYPE "BodyType";

-- DropEnum
DROP TYPE "FuelType";

-- CreateTable
CREATE TABLE "BodyType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT,

    CONSTRAINT "BodyType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FuelType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT,

    CONSTRAINT "FuelType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BodyType_name_key" ON "BodyType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "FuelType_name_key" ON "FuelType"("name");

-- CreateIndex
CREATE INDEX "Car_bodyTypeId_idx" ON "Car"("bodyTypeId");

-- CreateIndex
CREATE INDEX "Car_fuelTypeId_idx" ON "Car"("fuelTypeId");

-- AddForeignKey
ALTER TABLE "Car" ADD CONSTRAINT "Car_bodyTypeId_fkey" FOREIGN KEY ("bodyTypeId") REFERENCES "BodyType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Car" ADD CONSTRAINT "Car_fuelTypeId_fkey" FOREIGN KEY ("fuelTypeId") REFERENCES "FuelType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
