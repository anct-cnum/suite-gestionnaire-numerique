-- Contexte « Mesure d'impact » (ADR-007) : schéma dédié. Seul lien avec le back-office : la
-- campagne appartient à une structure (FK vers main.structure_administrative).
--
-- Ne sert qu'aux bases locales et de test : en production, le schéma et ses droits sont posés par
-- la migration Flyway miroir du dataspace.
CREATE SCHEMA IF NOT EXISTS "mesure_impact";

-- CreateEnum
CREATE TYPE "mesure_impact"."canal" AS ENUM ('en_ligne', 'papier', 'telephone');

-- CreateTable
CREATE TABLE "mesure_impact"."campagne" (
    "id" SERIAL NOT NULL,
    "identifiant_public" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "libelle_territoire" TEXT NOT NULL,
    "structure_id" INTEGER NOT NULL,
    "questionnaire_version" TEXT NOT NULL,
    "ouverture" TIMESTAMPTZ(3) NOT NULL,
    "fermeture" TIMESTAMPTZ(3),
    "creation" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campagne_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mesure_impact"."reponse" (
    "id" SERIAL NOT NULL,
    "campagne_id" INTEGER NOT NULL,
    "questionnaire_version" TEXT NOT NULL,
    "canal" "mesure_impact"."canal" NOT NULL,
    "contenu" JSONB NOT NULL,
    "depot" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "reponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mesure_impact"."defi_consomme" (
    "signature" TEXT NOT NULL,
    "expiration" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "defi_consomme_pkey" PRIMARY KEY ("signature")
);

-- CreateIndex
CREATE UNIQUE INDEX "campagne_identifiant_public_key" ON "mesure_impact"."campagne"("identifiant_public");

-- CreateIndex
CREATE INDEX "campagne_structure_id_idx" ON "mesure_impact"."campagne"("structure_id");

-- CreateIndex
CREATE INDEX "reponse_campagne_id_depot_idx" ON "mesure_impact"."reponse"("campagne_id", "depot");

-- CreateIndex
CREATE INDEX "defi_consomme_expiration_idx" ON "mesure_impact"."defi_consomme"("expiration");

-- AddForeignKey
ALTER TABLE "mesure_impact"."campagne" ADD CONSTRAINT "campagne_structure_id_fkey" FOREIGN KEY ("structure_id") REFERENCES "main"."structure_administrative"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mesure_impact"."reponse" ADD CONSTRAINT "reponse_campagne_id_fkey" FOREIGN KEY ("campagne_id") REFERENCES "mesure_impact"."campagne"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Droits, identiques à la migration Flyway miroir (V199 du dataspace) : l'application et l'équipe
-- MIN lisent et écrivent, le dataspace (app_python) lit.
GRANT USAGE ON SCHEMA "mesure_impact" TO min_scalingo, min_dev, app_python;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA "mesure_impact" TO min_scalingo, min_dev;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA "mesure_impact" TO min_scalingo, min_dev;
GRANT SELECT ON ALL TABLES IN SCHEMA "mesure_impact" TO app_python;
