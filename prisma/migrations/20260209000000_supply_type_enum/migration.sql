-- CreateEnum
CREATE TYPE "SupplyType" AS ENUM ('SENSOR', 'PARCHE', 'TRANSMISOR', 'BASE_BOMBA', 'CABLE_TRANSMISOR', 'PDM');

-- Add new column
ALTER TABLE "claims" ADD COLUMN "supply_new" "SupplyType";

-- Convert existing string data to enum values
UPDATE "claims" SET "supply_new" = 'SENSOR' WHERE LOWER("supply") LIKE '%sensor%';
UPDATE "claims" SET "supply_new" = 'PARCHE' WHERE LOWER("supply") LIKE '%parche%';
UPDATE "claims" SET "supply_new" = 'TRANSMISOR' WHERE LOWER("supply") LIKE '%transmisor%';
UPDATE "claims" SET "supply_new" = 'BASE_BOMBA' WHERE LOWER("supply") LIKE '%bomba%';
UPDATE "claims" SET "supply_new" = 'CABLE_TRANSMISOR' WHERE LOWER("supply") LIKE '%cable%';
UPDATE "claims" SET "supply_new" = 'PDM' WHERE LOWER("supply") LIKE '%pdm%';

-- Drop old column and rename new one
ALTER TABLE "claims" DROP COLUMN "supply";
ALTER TABLE "claims" RENAME COLUMN "supply_new" TO "supply";
