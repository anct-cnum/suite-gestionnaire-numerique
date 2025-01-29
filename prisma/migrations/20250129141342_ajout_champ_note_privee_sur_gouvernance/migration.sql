-- AlterTable
ALTER TABLE "gouvernance" ADD COLUMN     "editeur_note_privee_id" TEXT,
ADD COLUMN     "note_privee" JSONB;

-- AddForeignKey
ALTER TABLE "gouvernance" ADD CONSTRAINT "gouvernance_editeur_note_privee_id_fkey" FOREIGN KEY ("editeur_note_privee_id") REFERENCES "utilisateur"("ssoId") ON DELETE SET NULL ON UPDATE CASCADE;
