-- Migrate existing data: update claims with old supply values (default to 200U)
UPDATE "claims" SET "supply" = 'PARCHE_200U' WHERE "supply" = 'PARCHE';
UPDATE "claims" SET "supply" = 'BASE_BOMBA_200U' WHERE "supply" = 'BASE_BOMBA';

-- Migrate existing data: update claims with old claim_category values
UPDATE "claims" SET "claim_category" = 'PARCHE_200U' WHERE "claim_category" = 'PARCHE';
UPDATE "claims" SET "claim_category" = 'BASE_BOMBA_200U' WHERE "claim_category" = 'BASE_BOMBA';

-- Migrate existing data: update deliveries with old itemName values
UPDATE "deliveries" SET "item_name" = 'PARCHE_200U' WHERE "item_name" = 'PARCHE';
UPDATE "deliveries" SET "item_name" = 'BASE_BOMBA_200U' WHERE "item_name" = 'BASE_BOMBA';
