-- CreateEnum
CREATE TYPE "TripType" AS ENUM ('ONE_WAY', 'ROUND_TRIP');

-- AlterTable
ALTER TABLE "Booking"
ALTER COLUMN "endDate" DROP NOT NULL,
ALTER COLUMN "tripType" TYPE "TripType" USING "tripType"::"TripType",
ALTER COLUMN "tripType" SET NOT NULL;
