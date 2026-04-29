-- Clean up any partial state from a failed earlier run
DROP TABLE IF EXISTS "CarModel" CASCADE;
DROP TABLE IF EXISTS "Brand" CASCADE;

-- CreateTable
CREATE TABLE "Brand" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logo" TEXT,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CarModel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,

    CONSTRAINT "CarModel_pkey" PRIMARY KEY ("id")
);

-- Populate Brand table from existing car brand values
INSERT INTO "Brand" ("id", "name")
SELECT DISTINCT
    concat('brand_', regexp_replace(lower(c."brand"), '[^a-z0-9]+', '_', 'g')) AS "id",
    c."brand" AS "name"
FROM "Car" c
;

-- Populate CarModel table from existing car brand/model pairs
INSERT INTO "CarModel" ("id", "name", "brandId")
SELECT DISTINCT
    concat(
        'model_',
        regexp_replace(lower(c."brand"), '[^a-z0-9]+', '_', 'g'),
        '_',
        regexp_replace(lower(c."model"), '[^a-z0-9]+', '_', 'g')
    ) AS "id",
    c."model" AS "name",
    b."id" AS "brandId"
FROM "Car" c
JOIN "Brand" b ON b."name" = c."brand";

-- Add relation columns to Car
ALTER TABLE "Car"
DROP COLUMN IF EXISTS "brandId",
DROP COLUMN IF EXISTS "modelId";

ALTER TABLE "Car"
ADD COLUMN "brandId" TEXT,
ADD COLUMN "modelId" TEXT;

-- Backfill Car relation columns
UPDATE "Car" c
SET "brandId" = b."id",
    "modelId" = m."id"
FROM "Brand" b,
         "CarModel" m
WHERE b."name" = c."brand"
    AND m."brandId" = b."id"
    AND m."name" = c."model";

-- Make the new relations required
ALTER TABLE "Car"
ALTER COLUMN "brandId" SET NOT NULL,
ALTER COLUMN "modelId" SET NOT NULL;

-- Preserve query performance
CREATE UNIQUE INDEX "Brand_name_key" ON "Brand"("name");
CREATE INDEX "CarModel_brandId_idx" ON "CarModel"("brandId");
CREATE INDEX "Car_brandId_idx" ON "Car"("brandId");
CREATE INDEX "Car_modelId_idx" ON "Car"("modelId");

-- Add foreign keys
ALTER TABLE "CarModel"
ADD CONSTRAINT "CarModel_brandId_fkey"
FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Car"
ADD CONSTRAINT "Car_brandId_fkey"
FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Car"
ADD CONSTRAINT "Car_modelId_fkey"
FOREIGN KEY ("modelId") REFERENCES "CarModel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Drop old denormalized columns
ALTER TABLE "Car"
DROP COLUMN "brand",
DROP COLUMN "model";
