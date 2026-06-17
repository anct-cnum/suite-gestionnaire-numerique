-- Journal des transferts de membre (qui / quand / quoi) déclenchés depuis l'outil
-- membres-a-consolider. Le transfert re-pointe un membre + ses utilisateurs + ses contacts
-- d'une structure source vers une structure cible, sans suppression de la source.

CREATE TABLE "min"."membre_transfert_log" (
    "id" SERIAL NOT NULL,
    "membre_id" TEXT NOT NULL,
    "structure_source_id" INTEGER NOT NULL,
    "structure_cible_id" INTEGER NOT NULL,
    "utilisateurs_deplaces" INTEGER NOT NULL,
    "contacts_deplaces" INTEGER NOT NULL,
    "contacts_supprimes" INTEGER NOT NULL,
    "par_utilisateur" TEXT NOT NULL,
    "transfere_le" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "membre_transfert_log_pkey" PRIMARY KEY ("id")
);
