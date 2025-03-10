/*
  Warnings:

  - A unique constraint covering the columns `[demande_de_subvention_id,membre_id]` on the table `beneficiaire_subvention` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "beneficiaire_subvention_demande_de_subvention_id_key";

-- CreateIndex
CREATE UNIQUE INDEX "beneficiaire_subvention_demande_de_subvention_id_membre_id_key" ON "beneficiaire_subvention"("demande_de_subvention_id", "membre_id");
