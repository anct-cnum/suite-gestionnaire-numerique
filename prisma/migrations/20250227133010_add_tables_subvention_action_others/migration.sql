/*
  Warnings:

  - Added the required column `membre_id` to the `feuille_de_route` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "feuille_de_route" ADD COLUMN     "membre_id" TEXT NOT NULL,
ADD COLUMN     "piece_jointe" TEXT;

-- CreateTable
CREATE TABLE "action" (
    "id" SERIAL NOT NULL,
    "besoins" TEXT[],
    "createur_id" INTEGER NOT NULL,
    "nom" TEXT NOT NULL,
    "contexte" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "budget_global" DOUBLE PRECISION NOT NULL,
    "feuille_de_route_id" INTEGER NOT NULL,
    "date_de_debut" TIMESTAMP(3) NOT NULL,
    "date_de_fin" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "action_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "demande_de_subvention" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createur_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "subvention_demandee" DOUBLE PRECISION NOT NULL,
    "subvention_etp" DOUBLE PRECISION,
    "subvention_prestation" DOUBLE PRECISION,
    "date_de_modification" TIMESTAMP(3),
    "action_id" INTEGER NOT NULL,

    CONSTRAINT "demande_de_subvention_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "beneficiaire_subvention" (
    "id" SERIAL NOT NULL,
    "action_id" INTEGER NOT NULL,
    "membre_id" TEXT NOT NULL,
    "montant_subvention" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "beneficiaire_subvention_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "porteur_action" (
    "id" SERIAL NOT NULL,
    "action_id" INTEGER NOT NULL,
    "membre_id" TEXT NOT NULL,

    CONSTRAINT "porteur_action_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enveloppe_financement" (
    "id" SERIAL NOT NULL,
    "libelle" TEXT NOT NULL,
    "date_debut" TIMESTAMP(3) NOT NULL,
    "date_fin" TIMESTAMP(3) NOT NULL,
    "montant" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "enveloppe_financement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "co_financement" (
    "id" SERIAL NOT NULL,
    "libelle" TEXT NOT NULL,
    "id_action" INTEGER NOT NULL,
    "id_membre" TEXT NOT NULL,
    "montant" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "co_financement_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "feuille_de_route" ADD CONSTRAINT "feuille_de_route_membre_id_fkey" FOREIGN KEY ("membre_id") REFERENCES "membre"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "action" ADD CONSTRAINT "action_createur_id_fkey" FOREIGN KEY ("createur_id") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "action" ADD CONSTRAINT "action_feuille_de_route_id_fkey" FOREIGN KEY ("feuille_de_route_id") REFERENCES "feuille_de_route"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demande_de_subvention" ADD CONSTRAINT "demande_de_subvention_createur_id_fkey" FOREIGN KEY ("createur_id") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demande_de_subvention" ADD CONSTRAINT "demande_de_subvention_action_id_fkey" FOREIGN KEY ("action_id") REFERENCES "action"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "beneficiaire_subvention" ADD CONSTRAINT "beneficiaire_subvention_action_id_fkey" FOREIGN KEY ("action_id") REFERENCES "action"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "beneficiaire_subvention" ADD CONSTRAINT "beneficiaire_subvention_membre_id_fkey" FOREIGN KEY ("membre_id") REFERENCES "membre"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "porteur_action" ADD CONSTRAINT "porteur_action_action_id_fkey" FOREIGN KEY ("action_id") REFERENCES "action"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "porteur_action" ADD CONSTRAINT "porteur_action_membre_id_fkey" FOREIGN KEY ("membre_id") REFERENCES "membre"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "co_financement" ADD CONSTRAINT "co_financement_id_action_fkey" FOREIGN KEY ("id_action") REFERENCES "action"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "co_financement" ADD CONSTRAINT "co_financement_id_membre_fkey" FOREIGN KEY ("id_membre") REFERENCES "membre"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
