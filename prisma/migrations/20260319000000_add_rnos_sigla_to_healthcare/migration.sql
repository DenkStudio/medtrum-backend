-- AlterTable: Make cuit optional, add rnos and sigla to healthcares
ALTER TABLE "healthcares" ALTER COLUMN "cuit" DROP NOT NULL;

ALTER TABLE "healthcares" ADD COLUMN "rnos" TEXT;
ALTER TABLE "healthcares" ADD COLUMN "sigla" TEXT;

CREATE UNIQUE INDEX "healthcares_rnos_key" ON "healthcares"("rnos");
