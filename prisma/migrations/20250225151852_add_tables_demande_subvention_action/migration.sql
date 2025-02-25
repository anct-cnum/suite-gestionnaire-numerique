-- AlterTable
ALTER TABLE "feuille_de_route" ADD COLUMN     "piece_jointe" TEXT;

-- CreateTable
CREATE TABLE "action" (
    "id" SERIAL NOT NULL,
    "besions" TEXT[],
    "createur_id" INTEGER NOT NULL,
    "nom" CITEXT NOT NULL,
    "contexte" CITEXT NOT NULL,
    "description" CITEXT NOT NULL,
    "budget_global" DOUBLE PRECISION NOT NULL,
    "piece_jointe_budget_key" TEXT NOT NULL,
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
    "status_id" INTEGER NOT NULL,
    "subvention_demandee" DOUBLE PRECISION NOT NULL,
    "subvention_etp" DOUBLE PRECISION NOT NULL,
    "subvention_prestation" DOUBLE PRECISION NOT NULL,
    "date_modification" TIMESTAMP(3) NOT NULL,
    "fk_action_id" INTEGER NOT NULL,

    CONSTRAINT "demande_de_subvention_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "status_demande_subvention" (
    "id" SERIAL NOT NULL,
    "status" CITEXT NOT NULL,

    CONSTRAINT "status_demande_subvention_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "status_demande_subvention_status_key" ON "status_demande_subvention"("status");

-- AddForeignKey
ALTER TABLE "action" ADD CONSTRAINT "action_createur_id_fkey" FOREIGN KEY ("createur_id") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "action" ADD CONSTRAINT "action_feuille_de_route_id_fkey" FOREIGN KEY ("feuille_de_route_id") REFERENCES "feuille_de_route"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demande_de_subvention" ADD CONSTRAINT "demande_de_subvention_createur_id_fkey" FOREIGN KEY ("createur_id") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demande_de_subvention" ADD CONSTRAINT "demande_de_subvention_fk_action_id_fkey" FOREIGN KEY ("fk_action_id") REFERENCES "action"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demande_de_subvention" ADD CONSTRAINT "demande_de_subvention_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "status_demande_subvention"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
