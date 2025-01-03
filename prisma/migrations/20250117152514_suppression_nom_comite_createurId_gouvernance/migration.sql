/*
  Warnings:

  - You are about to drop the column `nom` on the `comite` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "comite" DROP COLUMN "nom";

-- DropForeignKey
ALTER TABLE "gouvernance" DROP CONSTRAINT "gouvernance_createurId_fkey";

-- AlterTable
ALTER TABLE "gouvernance" DROP COLUMN "createurId";

-- DropIndex
DROP INDEX "gouvernance_idFNE_key";

-- AlterTable
ALTER TABLE "gouvernance" DROP COLUMN "idFNE";

-- CreateIndex
CREATE UNIQUE INDEX "gouvernance_departementCode_key" ON "gouvernance"("departementCode");

-- DropForeignKey
ALTER TABLE "comite" DROP CONSTRAINT "comite_editeur_utilisateur_id_fkey";

-- AlterTable
ALTER TABLE "comite" ALTER COLUMN "editeur_utilisateur_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "comite" ADD CONSTRAINT "comite_editeur_utilisateur_id_fkey" FOREIGN KEY ("editeur_utilisateur_id") REFERENCES "utilisateur"("ssoId") ON DELETE RESTRICT ON UPDATE CASCADE;
