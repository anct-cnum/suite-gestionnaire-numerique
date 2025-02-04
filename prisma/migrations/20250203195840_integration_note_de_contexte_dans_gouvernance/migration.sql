/*
  Warnings:

  - You are about to drop the `note_de_contexte` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "note_de_contexte" DROP CONSTRAINT "note_de_contexte_editeurId_fkey";

-- DropForeignKey
ALTER TABLE "note_de_contexte" DROP CONSTRAINT "note_de_contexte_gouvernanceDepartementCode_fkey";

-- AlterTable
ALTER TABLE "gouvernance" ADD COLUMN     "derniere_edition_note_de_contexte" TIMESTAMP(3),
ADD COLUMN     "editeur_notes_de_contexte_id" TEXT,
ADD COLUMN     "notes_de_contexte" TEXT;

-- DropTable
DROP TABLE "note_de_contexte";

-- AddForeignKey
ALTER TABLE "gouvernance" ADD CONSTRAINT "gouvernance_editeur_notes_de_contexte_id_fkey" FOREIGN KEY ("editeur_notes_de_contexte_id") REFERENCES "utilisateur"("ssoId") ON DELETE SET NULL ON UPDATE CASCADE;
