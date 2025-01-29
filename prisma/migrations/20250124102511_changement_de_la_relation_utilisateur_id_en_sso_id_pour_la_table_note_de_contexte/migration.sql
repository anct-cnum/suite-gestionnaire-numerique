-- DropForeignKey
ALTER TABLE "note_de_contexte" DROP CONSTRAINT "note_de_contexte_editeurId_fkey";

-- AlterTable
ALTER TABLE "note_de_contexte" ALTER COLUMN "editeurId" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "note_de_contexte" ADD CONSTRAINT "note_de_contexte_editeurId_fkey" FOREIGN KEY ("editeurId") REFERENCES "utilisateur"("ssoId") ON DELETE RESTRICT ON UPDATE CASCADE;
