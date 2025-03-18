-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "citext";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('administrateur_dispositif', 'gestionnaire_departement', 'gestionnaire_groupement', 'gestionnaire_region', 'gestionnaire_structure', 'instructeur', 'pilote_politique_publique', 'support_animation');

-- CreateTable
CREATE TABLE "groupement" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,

    CONSTRAINT "groupement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departement" (
    "code" TEXT NOT NULL,
    "region_code" TEXT NOT NULL,
    "nom" TEXT NOT NULL,

    CONSTRAINT "departement_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "region" (
    "code" TEXT NOT NULL,
    "nom" TEXT NOT NULL,

    CONSTRAINT "region_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "structure" (
    "id" SERIAL NOT NULL,
    "adresse" TEXT NOT NULL,
    "code_postal" TEXT NOT NULL,
    "commune" TEXT NOT NULL,
    "contact" JSONB NOT NULL,
    "departement_code" TEXT NOT NULL,
    "identifiant_etablissement" TEXT NOT NULL,
    "id_mongo" TEXT NOT NULL,
    "nom" CITEXT NOT NULL,
    "statut" TEXT NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "structure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "utilisateur" (
    "id" SERIAL NOT NULL,
    "date_de_creation" TIMESTAMP(3) NOT NULL,
    "departement_code" TEXT,
    "derniere_connexion" TIMESTAMP(3),
    "email_de_contact" TEXT NOT NULL,
    "groupement_id" INTEGER,
    "invite_le" TIMESTAMP(3) NOT NULL,
    "is_super_admin" BOOLEAN NOT NULL DEFAULT false,
    "is_supprime" BOOLEAN NOT NULL DEFAULT false,
    "nom" CITEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "region_code" TEXT,
    "role" "Role" NOT NULL,
    "structure_id" INTEGER,
    "sso_id" TEXT NOT NULL DEFAULT '',
    "sso_email" TEXT NOT NULL,
    "telephone" VARCHAR(13) NOT NULL,

    CONSTRAINT "utilisateur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gouvernance" (
    "departement_code" TEXT NOT NULL,
    "note_privee" JSONB,
    "editeur_note_privee_id" TEXT,
    "note_de_contexte" TEXT,
    "editeur_note_de_contexte_id" TEXT,
    "derniere_edition_note_de_contexte" TIMESTAMP(3),

    CONSTRAINT "gouvernance_pkey" PRIMARY KEY ("departement_code")
);

-- CreateTable
CREATE TABLE "comite" (
    "id" SERIAL NOT NULL,
    "gouvernance_departement_code" TEXT NOT NULL,
    "creation" TIMESTAMP(3) NOT NULL,
    "derniere_edition" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "frequence" TEXT NOT NULL,
    "commentaire" TEXT,
    "date" TIMESTAMP(3),
    "editeur_utilisateur_id" TEXT NOT NULL,

    CONSTRAINT "comite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feuille_de_route" (
    "id" SERIAL NOT NULL,
    "gouvernance_departement_code" TEXT NOT NULL,
    "creation" TIMESTAMP(3) NOT NULL,
    "nom" TEXT NOT NULL,
    "piece_jointe" TEXT,
    "porteur_id" TEXT,
    "old_uuid" UUID NOT NULL,

    CONSTRAINT "feuille_de_route_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_membre_gouvernance" (
    "email" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "fonction" TEXT NOT NULL,

    CONSTRAINT "contact_membre_gouvernance_pkey" PRIMARY KEY ("email")
);

-- CreateTable
CREATE TABLE "membre" (
    "id" TEXT NOT NULL,
    "gouvernance_departement_code" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "contact_technique" TEXT,
    "type" TEXT,
    "statut" TEXT NOT NULL,
    "old_uuid" UUID NOT NULL,

    CONSTRAINT "membre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "membre_gouvernance_departement" (
    "departement_code" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "membre_id" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "membre_gouvernance_sgar" (
    "sgar_code" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "membre_id" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "membre_gouvernance_epci" (
    "epci" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "membre_id" TEXT NOT NULL,

    CONSTRAINT "membre_gouvernance_epci_pkey" PRIMARY KEY ("epci","membre_id","role")
);

-- CreateTable
CREATE TABLE "membre_gouvernance_commune" (
    "commune" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "membre_id" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "membre_gouvernance_structure" (
    "structure" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "membre_id" TEXT NOT NULL
);

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
    "creation" TIMESTAMP(3) NOT NULL,
    "derniere_modification" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "action_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "demande_de_subvention" (
    "id" SERIAL NOT NULL,
    "createur_id" INTEGER NOT NULL,
    "statut" TEXT NOT NULL,
    "subvention_demandee" DOUBLE PRECISION NOT NULL,
    "subvention_etp" DOUBLE PRECISION,
    "subvention_prestation" DOUBLE PRECISION,
    "action_id" INTEGER NOT NULL,
    "enveloppe_financement_id" INTEGER NOT NULL,
    "creation" TIMESTAMP(3) NOT NULL,
    "derniere_modification" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "demande_de_subvention_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "beneficiaire_subvention" (
    "demande_de_subvention_id" INTEGER NOT NULL,
    "membre_id" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "porteur_action" (
    "action_id" INTEGER NOT NULL,
    "membre_id" TEXT NOT NULL
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
    "id_action" INTEGER NOT NULL,
    "id_membre" TEXT NOT NULL,
    "montant" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "co_financement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departement_enveloppe" (
    "departement_code" TEXT NOT NULL,
    "enveloppe_id" INTEGER NOT NULL,
    "plafond" DOUBLE PRECISION NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "utilisateur_sso_id_key" ON "utilisateur"("sso_id");

-- CreateIndex
CREATE UNIQUE INDEX "utilisateur_sso_email_key" ON "utilisateur"("sso_email");

-- CreateIndex
CREATE UNIQUE INDEX "membre_gouvernance_departement_departement_code_membre_id_r_key" ON "membre_gouvernance_departement"("departement_code", "membre_id", "role");

-- CreateIndex
CREATE UNIQUE INDEX "membre_gouvernance_sgar_sgar_code_membre_id_role_key" ON "membre_gouvernance_sgar"("sgar_code", "membre_id", "role");

-- CreateIndex
CREATE UNIQUE INDEX "membre_gouvernance_commune_commune_membre_id_role_key" ON "membre_gouvernance_commune"("commune", "membre_id", "role");

-- CreateIndex
CREATE UNIQUE INDEX "membre_gouvernance_structure_structure_membre_id_role_key" ON "membre_gouvernance_structure"("structure", "membre_id", "role");

-- CreateIndex
CREATE UNIQUE INDEX "demande_de_subvention_action_id_key" ON "demande_de_subvention"("action_id");

-- CreateIndex
CREATE UNIQUE INDEX "beneficiaire_subvention_demande_de_subvention_id_membre_id_key" ON "beneficiaire_subvention"("demande_de_subvention_id", "membre_id");

-- CreateIndex
CREATE UNIQUE INDEX "porteur_action_action_id_membre_id_key" ON "porteur_action"("action_id", "membre_id");

-- CreateIndex
CREATE UNIQUE INDEX "departement_enveloppe_departement_code_enveloppe_id_key" ON "departement_enveloppe"("departement_code", "enveloppe_id");

-- AddForeignKey
ALTER TABLE "departement" ADD CONSTRAINT "departement_region_code_fkey" FOREIGN KEY ("region_code") REFERENCES "region"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "structure" ADD CONSTRAINT "structure_departement_code_fkey" FOREIGN KEY ("departement_code") REFERENCES "departement"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "utilisateur" ADD CONSTRAINT "utilisateur_structure_id_fkey" FOREIGN KEY ("structure_id") REFERENCES "structure"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "utilisateur" ADD CONSTRAINT "utilisateur_groupement_id_fkey" FOREIGN KEY ("groupement_id") REFERENCES "groupement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "utilisateur" ADD CONSTRAINT "utilisateur_departement_code_fkey" FOREIGN KEY ("departement_code") REFERENCES "departement"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "utilisateur" ADD CONSTRAINT "utilisateur_region_code_fkey" FOREIGN KEY ("region_code") REFERENCES "region"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gouvernance" ADD CONSTRAINT "gouvernance_departement_code_fkey" FOREIGN KEY ("departement_code") REFERENCES "departement"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gouvernance" ADD CONSTRAINT "gouvernance_editeur_note_privee_id_fkey" FOREIGN KEY ("editeur_note_privee_id") REFERENCES "utilisateur"("sso_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gouvernance" ADD CONSTRAINT "gouvernance_editeur_note_de_contexte_id_fkey" FOREIGN KEY ("editeur_note_de_contexte_id") REFERENCES "utilisateur"("sso_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comite" ADD CONSTRAINT "comite_editeur_utilisateur_id_fkey" FOREIGN KEY ("editeur_utilisateur_id") REFERENCES "utilisateur"("sso_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comite" ADD CONSTRAINT "comite_gouvernance_departement_code_fkey" FOREIGN KEY ("gouvernance_departement_code") REFERENCES "gouvernance"("departement_code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feuille_de_route" ADD CONSTRAINT "feuille_de_route_gouvernance_departement_code_fkey" FOREIGN KEY ("gouvernance_departement_code") REFERENCES "gouvernance"("departement_code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feuille_de_route" ADD CONSTRAINT "feuille_de_route_porteur_id_fkey" FOREIGN KEY ("porteur_id") REFERENCES "membre"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membre" ADD CONSTRAINT "membre_gouvernance_departement_code_fkey" FOREIGN KEY ("gouvernance_departement_code") REFERENCES "gouvernance"("departement_code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membre" ADD CONSTRAINT "membre_contact_fkey" FOREIGN KEY ("contact") REFERENCES "contact_membre_gouvernance"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membre" ADD CONSTRAINT "membre_contact_technique_fkey" FOREIGN KEY ("contact_technique") REFERENCES "contact_membre_gouvernance"("email") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membre_gouvernance_departement" ADD CONSTRAINT "membre_gouvernance_departement_departement_code_fkey" FOREIGN KEY ("departement_code") REFERENCES "departement"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membre_gouvernance_departement" ADD CONSTRAINT "membre_gouvernance_departement_membre_id_fkey" FOREIGN KEY ("membre_id") REFERENCES "membre"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membre_gouvernance_sgar" ADD CONSTRAINT "membre_gouvernance_sgar_sgar_code_fkey" FOREIGN KEY ("sgar_code") REFERENCES "region"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membre_gouvernance_sgar" ADD CONSTRAINT "membre_gouvernance_sgar_membre_id_fkey" FOREIGN KEY ("membre_id") REFERENCES "membre"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membre_gouvernance_epci" ADD CONSTRAINT "membre_gouvernance_epci_membre_id_fkey" FOREIGN KEY ("membre_id") REFERENCES "membre"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membre_gouvernance_commune" ADD CONSTRAINT "membre_gouvernance_commune_membre_id_fkey" FOREIGN KEY ("membre_id") REFERENCES "membre"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membre_gouvernance_structure" ADD CONSTRAINT "membre_gouvernance_structure_membre_id_fkey" FOREIGN KEY ("membre_id") REFERENCES "membre"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "action" ADD CONSTRAINT "action_createur_id_fkey" FOREIGN KEY ("createur_id") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "action" ADD CONSTRAINT "action_feuille_de_route_id_fkey" FOREIGN KEY ("feuille_de_route_id") REFERENCES "feuille_de_route"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demande_de_subvention" ADD CONSTRAINT "demande_de_subvention_createur_id_fkey" FOREIGN KEY ("createur_id") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demande_de_subvention" ADD CONSTRAINT "demande_de_subvention_action_id_fkey" FOREIGN KEY ("action_id") REFERENCES "action"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demande_de_subvention" ADD CONSTRAINT "demande_de_subvention_enveloppe_financement_id_fkey" FOREIGN KEY ("enveloppe_financement_id") REFERENCES "enveloppe_financement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "beneficiaire_subvention" ADD CONSTRAINT "beneficiaire_subvention_demande_de_subvention_id_fkey" FOREIGN KEY ("demande_de_subvention_id") REFERENCES "demande_de_subvention"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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

-- AddForeignKey
ALTER TABLE "departement_enveloppe" ADD CONSTRAINT "departement_enveloppe_departement_code_fkey" FOREIGN KEY ("departement_code") REFERENCES "departement"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departement_enveloppe" ADD CONSTRAINT "departement_enveloppe_enveloppe_id_fkey" FOREIGN KEY ("enveloppe_id") REFERENCES "enveloppe_financement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
