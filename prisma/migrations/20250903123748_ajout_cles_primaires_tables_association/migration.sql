-- AlterTable
ALTER TABLE "min"."beneficiaire_subvention" ADD CONSTRAINT "beneficiaire_subvention_pkey" PRIMARY KEY ("demande_de_subvention_id", "membre_id");

-- DropIndex
DROP INDEX "min"."beneficiaire_subvention_demande_de_subvention_id_membre_id_key";

-- AlterTable
ALTER TABLE "min"."departement_enveloppe" ADD CONSTRAINT "departement_enveloppe_pkey" PRIMARY KEY ("departement_code", "enveloppe_id");

-- DropIndex
DROP INDEX "min"."departement_enveloppe_departement_code_enveloppe_id_key";

-- AlterTable
ALTER TABLE "min"."porteur_action" ADD CONSTRAINT "porteur_action_pkey" PRIMARY KEY ("action_id", "membre_id");

-- DropIndex
DROP INDEX "min"."porteur_action_action_id_membre_id_key";
