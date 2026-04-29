-- AlterTable: add new columns with temporary default for required basePrice
ALTER TABLE "Booking"
    ADD COLUMN "basePrice"      DOUBLE PRECISION,
    ADD COLUMN "serviceFee"     DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    ADD COLUMN "tripType"       TEXT,
    ADD COLUMN "contactNumber"  TEXT,
    ADD COLUMN "specialRequest" TEXT;

-- Backfill basePrice from existing totalPrice for existing rows
UPDATE "Booking" SET "basePrice" = "totalPrice" WHERE "basePrice" IS NULL;

-- Enforce NOT NULL on basePrice
ALTER TABLE "Booking" ALTER COLUMN "basePrice" SET NOT NULL;
