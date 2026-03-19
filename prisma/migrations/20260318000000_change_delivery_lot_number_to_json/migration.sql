-- AlterTable: Change lot_number from text to jsonb, preserving existing string values
ALTER TABLE "deliveries" ALTER COLUMN "lot_number" TYPE jsonb USING CASE WHEN lot_number IS NOT NULL THEN to_jsonb(lot_number) ELSE NULL END;
