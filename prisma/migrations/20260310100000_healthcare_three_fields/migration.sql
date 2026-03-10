-- Rename name -> trade_name
ALTER TABLE "healthcares" RENAME COLUMN "name" TO "trade_name";

-- Add legal_name column
ALTER TABLE "healthcares" ADD COLUMN "legal_name" TEXT NOT NULL DEFAULT '';

-- Rename code -> cuit
ALTER TABLE "healthcares" RENAME COLUMN "code" TO "cuit";
