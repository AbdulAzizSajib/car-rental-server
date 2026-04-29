-- CreateEnum
CREATE TYPE "BodyType" AS ENUM ('Sedan', 'Wagon', 'Coupe', 'Hatchback', 'Pickup', 'Sport_coupe', 'Crossover', 'Van');

-- AlterTable: add required columns with temporary defaults for existing rows
ALTER TABLE "Car"
    ADD COLUMN "bodyType" "BodyType",
    ADD COLUMN "engineCapacity" INTEGER,
    ADD COLUMN "color" TEXT,
    ADD COLUMN "registrationNo" TEXT,
    ADD COLUMN "location" TEXT,
    ADD COLUMN "isAC" BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN "isWithDriver" BOOLEAN NOT NULL DEFAULT false;

-- Backfill existing rows with placeholder values
UPDATE "Car" SET "bodyType" = 'Sedan' WHERE "bodyType" IS NULL;
UPDATE "Car" SET "location" = 'Dhaka' WHERE "location" IS NULL;

-- Now enforce NOT NULL on the required columns
ALTER TABLE "Car"
    ALTER COLUMN "bodyType" SET NOT NULL,
    ALTER COLUMN "location" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Car_registrationNo_key" ON "Car"("registrationNo");

-- CreateIndex
CREATE INDEX "Car_location_idx" ON "Car"("location");
