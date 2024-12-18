-- AlterTable
ALTER TABLE "comite" ADD COLUMN     "editeur_utilisateur_id" TEXT;

-- AddForeignKey
ALTER TABLE "comite" ADD CONSTRAINT "comite_editeur_utilisateur_id_fkey" FOREIGN KEY ("editeur_utilisateur_id") REFERENCES "utilisateur"("ssoId") ON DELETE SET NULL ON UPDATE CASCADE;
