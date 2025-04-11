-- AlterTable
ALTER TABLE "feuille_de_route" ADD COLUMN     "derniere_edition" TIMESTAMP(3),
ADD COLUMN     "editeur_utilisateur_id" TEXT,
ADD COLUMN     "perimetre_geographique" TEXT,
ALTER COLUMN "old_uuid" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "feuille_de_route" ADD CONSTRAINT "feuille_de_route_editeur_utilisateur_id_fkey" FOREIGN KEY ("editeur_utilisateur_id") REFERENCES "utilisateur"("sso_id") ON DELETE SET NULL ON UPDATE CASCADE;
