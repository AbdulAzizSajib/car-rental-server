-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('BKASH', 'NAGAD', 'STRIPE', 'CASH_ON_DELIVERY', 'BANK_TRANSFER');

-- AlterEnum: add CANCELLED to PaymentStatus
ALTER TYPE "PaymentStatus" ADD VALUE 'CANCELLED';

-- AlterTable: convert method from TEXT to PaymentMethod enum
ALTER TABLE "Payment"
    ALTER COLUMN "method" TYPE "PaymentMethod" USING "method"::"PaymentMethod";

-- AlterTable: add new columns
ALTER TABLE "Payment"
    ADD COLUMN "gatewayResponse" JSONB,
    ADD COLUMN "currency"        TEXT NOT NULL DEFAULT 'BDT',
    ADD COLUMN "paidAt"          TIMESTAMP(3),
    ADD COLUMN "updatedAt"       TIMESTAMP(3);

-- Backfill updatedAt for existing rows
UPDATE "Payment" SET "updatedAt" = "createdAt" WHERE "updatedAt" IS NULL;

-- Enforce NOT NULL on updatedAt
ALTER TABLE "Payment" ALTER COLUMN "updatedAt" SET NOT NULL;

-- CreateIndex: unique constraint on transactionId
CREATE UNIQUE INDEX "Payment_transactionId_key" ON "Payment"("transactionId");

-- CreateIndex
CREATE INDEX "Payment_transactionId_idx" ON "Payment"("transactionId");
