/*
  Warnings:

  - You are about to drop the column `montant_subvention` on the `beneficiaire_subvention` table. All the data in the column will be lost.
  - You are about to drop the column `libelle` on the `co_financement` table. All the data in the column will be lost.
  - You are about to drop the column `old_uuid` on the `demande_de_subvention` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "beneficiaire_subvention" DROP COLUMN "montant_subvention";

-- AlterTable
ALTER TABLE "co_financement" DROP COLUMN "libelle";

-- AlterTable
ALTER TABLE "demande_de_subvention" DROP COLUMN "old_uuid";

-- CreateTable
CREATE TABLE "departement_enveloppe" (
    "departement_code" TEXT NOT NULL,
    "enveloppe_id" INTEGER NOT NULL,
    "plafond" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "departement_enveloppe_pkey" PRIMARY KEY ("departement_code")
);

-- AddForeignKey
ALTER TABLE "departement_enveloppe" ADD CONSTRAINT "departement_enveloppe_departement_code_fkey" FOREIGN KEY ("departement_code") REFERENCES "departement"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departement_enveloppe" ADD CONSTRAINT "departement_enveloppe_enveloppe_id_fkey" FOREIGN KEY ("enveloppe_id") REFERENCES "enveloppe_financement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
