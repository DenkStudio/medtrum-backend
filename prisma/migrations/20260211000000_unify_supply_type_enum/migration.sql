-- Unify all supply-related enums into a single SupplyType enum

-- 1) Convert hardware_supplies.type from HardwareType to text, then remap values
ALTER TABLE "hardware_supplies" ALTER COLUMN "type" TYPE TEXT;
UPDATE "hardware_supplies" SET "type" = 'BASE_BOMBA_200U' WHERE "type" = 'Bomba_200u';
UPDATE "hardware_supplies" SET "type" = 'BASE_BOMBA_300U' WHERE "type" = 'Bomba_300u';
UPDATE "hardware_supplies" SET "type" = 'TRANSMISOR' WHERE "type" = 'Transmisor';
UPDATE "hardware_supplies" SET "type" = 'CABLE_TRANSMISOR' WHERE "type" = 'Cable_transmisor';
-- PDM stays the same

-- 2) Convert deliveries.item_name display names to SupplyType enum values
UPDATE "deliveries" SET "item_name" = 'SENSOR' WHERE "item_name" = 'Sensor';
UPDATE "deliveries" SET "item_name" = 'PARCHE_200U' WHERE "item_name" = 'Parche 200u';
UPDATE "deliveries" SET "item_name" = 'PARCHE_300U' WHERE "item_name" = 'Parche 300u';
UPDATE "deliveries" SET "item_name" = 'TRANSMISOR' WHERE "item_name" = 'Transmisor';
UPDATE "deliveries" SET "item_name" = 'BASE_BOMBA_200U' WHERE "item_name" = 'Base Bomba 200u';
UPDATE "deliveries" SET "item_name" = 'BASE_BOMBA_300U' WHERE "item_name" = 'Base Bomba 300u';
UPDATE "deliveries" SET "item_name" = 'CABLE_TRANSMISOR' WHERE "item_name" = 'Cable Transmisor';
-- PDM and already-correct values (like PARCHE_300U) stay the same

-- 3) Convert claim_category from ClaimCategory enum to text, then to SupplyType
ALTER TABLE "claims" ALTER COLUMN "claim_category" TYPE TEXT;
ALTER TABLE "claims" ALTER COLUMN "claim_category" TYPE "SupplyType" USING "claim_category"::"SupplyType";

-- 4) Convert hardware_supplies.type from text to SupplyType enum
ALTER TABLE "hardware_supplies" ALTER COLUMN "type" TYPE "SupplyType" USING "type"::"SupplyType";

-- 5) Convert deliveries.item_name from text to SupplyType enum
ALTER TABLE "deliveries" ALTER COLUMN "item_name" TYPE "SupplyType" USING "item_name"::"SupplyType";

-- 6) Drop unused enums
DROP TYPE "ClaimCategory";
DROP TYPE "HardwareType";
