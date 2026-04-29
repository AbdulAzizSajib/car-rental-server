-- Add missing primary-image flag used by the car service
ALTER TABLE "CarImage"
ADD COLUMN "isPrimary" BOOLEAN NOT NULL DEFAULT false;

-- If there are already images in the database, mark the first image per car as primary
WITH first_images AS (
    SELECT DISTINCT ON ("carId") "id"
    FROM "CarImage"
    ORDER BY "carId", "id"
)
UPDATE "CarImage"
SET "isPrimary" = true
WHERE "id" IN (SELECT "id" FROM first_images);
