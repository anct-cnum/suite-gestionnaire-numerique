/*
  Warnings:

  - The primary key for the `gouvernance` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `departementCode` on the `gouvernance` table. All the data in the column will be lost.
  - You are about to drop the column `goupement_id` on the `utilisateur` table. All the data in the column will be lost.
  - Added the required column `departement_code` to the `gouvernance` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "comite" DROP CONSTRAINT "comite_gouvernance_departement_code_fkey";

-- DropForeignKey
ALTER TABLE "feuille_de_route" DROP CONSTRAINT "feuille_de_route_gouvernance_departement_code_fkey";

-- DropForeignKey
ALTER TABLE "gouvernance" DROP CONSTRAINT "gouvernance_departementCode_fkey";

-- DropForeignKey
ALTER TABLE "membre" DROP CONSTRAINT "membre_gouvernance_departement_code_fkey";

-- DropForeignKey
ALTER TABLE "utilisateur" DROP CONSTRAINT "utilisateur_goupement_id_fkey";

-- AlterTable
ALTER TABLE "gouvernance" DROP CONSTRAINT "gouvernance_pkey",
DROP COLUMN "departementCode",
ADD COLUMN     "departement_code" TEXT NOT NULL,
ADD CONSTRAINT "gouvernance_pkey" PRIMARY KEY ("departement_code");

-- AlterTable
ALTER TABLE "utilisateur" DROP COLUMN "goupement_id",
ADD COLUMN     "groupement_id" INTEGER;

-- AddForeignKey
ALTER TABLE "utilisateur" ADD CONSTRAINT "utilisateur_groupement_id_fkey" FOREIGN KEY ("groupement_id") REFERENCES "groupement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gouvernance" ADD CONSTRAINT "gouvernance_departement_code_fkey" FOREIGN KEY ("departement_code") REFERENCES "departement"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comite" ADD CONSTRAINT "comite_gouvernance_departement_code_fkey" FOREIGN KEY ("gouvernance_departement_code") REFERENCES "gouvernance"("departement_code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feuille_de_route" ADD CONSTRAINT "feuille_de_route_gouvernance_departement_code_fkey" FOREIGN KEY ("gouvernance_departement_code") REFERENCES "gouvernance"("departement_code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membre" ADD CONSTRAINT "membre_gouvernance_departement_code_fkey" FOREIGN KEY ("gouvernance_departement_code") REFERENCES "gouvernance"("departement_code") ON DELETE RESTRICT ON UPDATE CASCADE;
