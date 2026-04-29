-- CreateEnum
CREATE TYPE "RentalType" AS ENUM ('ANY', 'PER_DAY', 'PER_HOUR');

-- Add rental type to cars
ALTER TABLE "Car"
ADD COLUMN "rentalType" "RentalType" NOT NULL DEFAULT 'ANY';

-- Backfill existing rows and keep a helpful index for filtering
UPDATE "Car"
SET "rentalType" = 'ANY'
WHERE "rentalType" IS NULL;

CREATE INDEX "Car_rentalType_idx" ON "Car"("rentalType");
