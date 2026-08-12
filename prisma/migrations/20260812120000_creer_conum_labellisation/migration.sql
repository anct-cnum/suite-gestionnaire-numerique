-- Labellisation conseiller numérique (#1776) : l'attestation sur l'honneur
-- cliquée à la fin du parcours de labellisation crée une ligne — une ligne par
-- attestation, table append-only (jamais d'UPDATE). Le renouvellement insère
-- une nouvelle ligne ; « label actif » = date_attestation la plus récente de
-- moins d'un an (durée calculée côté applicatif, non stockée, car non figée
-- métier à ce jour).
-- L'attestant référence min.utilisateur.id (clé interne) — jamais de FK sur
-- sso_id qui est un identifiant du système externe ProConnect.
-- Miroir de la migration Flyway V143 (le schéma main est géré par Flyway côté
-- dataspace) — déployer conjointement.

CREATE TABLE "main"."conum_labellisation" (
    "id" SERIAL NOT NULL,
    "structure_id" INTEGER NOT NULL,
    "utilisateur_id" INTEGER NOT NULL,
    "date_attestation" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conum_labellisation_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "conum_labellisation_structure_id_idx" ON "main"."conum_labellisation"("structure_id");

ALTER TABLE "main"."conum_labellisation" ADD CONSTRAINT "conum_labellisation_structure_id_fkey" FOREIGN KEY ("structure_id") REFERENCES "main"."structure_administrative"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "main"."conum_labellisation" ADD CONSTRAINT "conum_labellisation_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "min"."utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
