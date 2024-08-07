-- CreateEnum
CREATE TYPE "Role" AS ENUM ('administrateur_dispositif', 'gestionnaire_departement', 'gestionnaire_groupement', 'gestionnaire_region', 'gestionnaire_structure', 'instructeur', 'pilote_politique_publique', 'support_animation');

-- CreateTable
CREATE TABLE "utilisateur" (
    "id" SERIAL NOT NULL,
    "dateDeCreation" TIMESTAMP(3) NOT NULL,
    "derniereConnexion" TIMESTAMP(3),
    "email" TEXT NOT NULL,
    "inviteLe" TIMESTAMP(3) NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "sub" TEXT NOT NULL DEFAULT '',
    "telephone" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "utilisateur_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "utilisateur_email_key" ON "utilisateur"("email");

-- CreateIndex
CREATE UNIQUE INDEX "utilisateur_sub_key" ON "utilisateur"("sub");
