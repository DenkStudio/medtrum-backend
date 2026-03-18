-- AlterTable
ALTER TABLE "deliveries" ADD COLUMN "received_by_patient" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "deliveries" ADD COLUMN "received_at" TIMESTAMP(3);

-- Mark existing claim_reimbursement deliveries as already received
UPDATE "deliveries" SET "received_by_patient" = true, "received_at" = "created_at" WHERE "type" = 'claim_reimbursement';
