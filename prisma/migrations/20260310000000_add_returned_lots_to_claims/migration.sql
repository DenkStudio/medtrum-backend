-- AlterTable
ALTER TABLE "claims" ADD COLUMN "returned_lots" JSONB;

-- AlterTable
ALTER TABLE "deliveries" ADD COLUMN "lot_number" TEXT;
