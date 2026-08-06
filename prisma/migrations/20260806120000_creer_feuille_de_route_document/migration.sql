-- Étape 1 de la refonte des documents PDF de feuille de route (strangler fig) :
-- table dédiée aux documents, en 1-N (décision PO : pas de versionnage mais la table
-- reste 1-N, coût nul et flexibilité future). L'ancienne colonne piece_jointe reste
-- alimentée (double écriture) jusqu'à la bascule des lecteurs (étape 2).
-- L'éditeur référence min.utilisateur.id (clé interne) — jamais de FK sur sso_id
-- qui est un identifiant du système externe ProConnect.

CREATE TABLE "min"."feuille_de_route_document" (
    "id" SERIAL NOT NULL,
    "feuille_de_route_id" INTEGER NOT NULL,
    "chemin" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "creation" TIMESTAMP(3) NOT NULL,
    "editeur_utilisateur_id" INTEGER NOT NULL,

    CONSTRAINT "feuille_de_route_document_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "feuille_de_route_document_chemin_key" ON "min"."feuille_de_route_document"("chemin");

ALTER TABLE "min"."feuille_de_route_document" ADD CONSTRAINT "feuille_de_route_document_feuille_de_route_id_fkey" FOREIGN KEY ("feuille_de_route_id") REFERENCES "min"."feuille_de_route"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "min"."feuille_de_route_document" ADD CONSTRAINT "feuille_de_route_document_editeur_utilisateur_id_fkey" FOREIGN KEY ("editeur_utilisateur_id") REFERENCES "min"."utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Backfill depuis piece_jointe : le nom est dérivé du chemin (dernier segment),
-- la date de création est approximée par la dernière édition de la feuille de route.
-- L'éditeur est résolu en cascade :
--   1. l'éditeur de la feuille de route (sso_id → utilisateur.id) ;
--   2. sinon un utilisateur actif de la structure du membre porteur
--      (gestionnaire de département en priorité, puis le plus ancien) ;
--   3. sinon le plus ancien gestionnaire du département de la gouvernance.
-- Si aucune branche ne résout, le NOT NULL fait échouer la migration : signal
-- volontairement bruyant plutôt qu'une donnée inventée.
INSERT INTO "min"."feuille_de_route_document" ("feuille_de_route_id", "chemin", "nom", "creation", "editeur_utilisateur_id")
SELECT
    fdr."id",
    fdr."piece_jointe",
    COALESCE(NULLIF(REGEXP_REPLACE(fdr."piece_jointe", '^.*/', ''), ''), 'document'),
    COALESCE(fdr."derniere_edition", fdr."creation"),
    COALESCE(
        (SELECT u."id" FROM "min"."utilisateur" u
         WHERE u."sso_id" = fdr."editeur_utilisateur_id"),
        (SELECT u."id" FROM "min"."membre" m
         JOIN "min"."utilisateur" u ON u."structure_id" = m."structure_id"
         WHERE m."id" = fdr."porteur_id" AND NOT u."is_supprime" AND u."sso_id" <> ''
         ORDER BY (u."role" = 'gestionnaire_departement') DESC, u."id" ASC
         LIMIT 1),
        (SELECT u."id" FROM "min"."utilisateur" u
         WHERE u."departement_code" = fdr."gouvernance_departement_code"
           AND u."role" = 'gestionnaire_departement'
           AND NOT u."is_supprime" AND u."sso_id" <> ''
         ORDER BY u."id" ASC
         LIMIT 1)
    )
FROM "min"."feuille_de_route" fdr
WHERE fdr."piece_jointe" IS NOT NULL;
