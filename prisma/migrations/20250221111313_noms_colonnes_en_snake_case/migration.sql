/*
  Warnings:

  - You are about to drop the column `derniereEdition` on the `comite` table. All the data in the column will be lost.
  - You are about to drop the column `gouvernanceDepartementCode` on the `comite` table. All the data in the column will be lost.
  - You are about to drop the column `regionCode` on the `departement` table. All the data in the column will be lost.
  - You are about to drop the column `gouvernanceDepartementCode` on the `feuille_de_route` table. All the data in the column will be lost.
  - You are about to drop the column `contactTechnique` on the `membre` table. All the data in the column will be lost.
  - You are about to drop the column `gouvernanceDepartementCode` on the `membre` table. All the data in the column will be lost.
  - You are about to drop the column `membreId` on the `membre_gouvernance_commune` table. All the data in the column will be lost.
  - You are about to drop the column `departementCode` on the `membre_gouvernance_departement` table. All the data in the column will be lost.
  - You are about to drop the column `membreId` on the `membre_gouvernance_departement` table. All the data in the column will be lost.
  - The primary key for the `membre_gouvernance_epci` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `membreId` on the `membre_gouvernance_epci` table. All the data in the column will be lost.
  - You are about to drop the column `membreId` on the `membre_gouvernance_sgar` table. All the data in the column will be lost.
  - You are about to drop the column `sgarCode` on the `membre_gouvernance_sgar` table. All the data in the column will be lost.
  - You are about to drop the column `membreId` on the `membre_gouvernance_structure` table. All the data in the column will be lost.
  - You are about to drop the column `codePostal` on the `structure` table. All the data in the column will be lost.
  - You are about to drop the column `departementCode` on the `structure` table. All the data in the column will be lost.
  - You are about to drop the column `idMongo` on the `structure` table. All the data in the column will be lost.
  - You are about to drop the column `identifiantEtablissement` on the `structure` table. All the data in the column will be lost.
  - You are about to drop the column `dateDeCreation` on the `utilisateur` table. All the data in the column will be lost.
  - You are about to drop the column `departementCode` on the `utilisateur` table. All the data in the column will be lost.
  - You are about to drop the column `derniereConnexion` on the `utilisateur` table. All the data in the column will be lost.
  - You are about to drop the column `emailDeContact` on the `utilisateur` table. All the data in the column will be lost.
  - You are about to drop the column `groupementId` on the `utilisateur` table. All the data in the column will be lost.
  - You are about to drop the column `inviteLe` on the `utilisateur` table. All the data in the column will be lost.
  - You are about to drop the column `isSuperAdmin` on the `utilisateur` table. All the data in the column will be lost.
  - You are about to drop the column `isSupprime` on the `utilisateur` table. All the data in the column will be lost.
  - You are about to drop the column `regionCode` on the `utilisateur` table. All the data in the column will be lost.
  - You are about to drop the column `ssoEmail` on the `utilisateur` table. All the data in the column will be lost.
  - You are about to drop the column `ssoId` on the `utilisateur` table. All the data in the column will be lost.
  - You are about to drop the column `structureId` on the `utilisateur` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[commune,membre_id,role]` on the table `membre_gouvernance_commune` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[departement_code,membre_id,role]` on the table `membre_gouvernance_departement` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[sgar_code,membre_id,role]` on the table `membre_gouvernance_sgar` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[structure,membre_id,role]` on the table `membre_gouvernance_structure` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[sso_id]` on the table `utilisateur` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[sso_email]` on the table `utilisateur` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `derniere_edition` to the `comite` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gouvernance_departement_code` to the `comite` table without a default value. This is not possible if the table is not empty.
  - Added the required column `region_code` to the `departement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gouvernance_departement_code` to the `feuille_de_route` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gouvernance_departement_code` to the `membre` table without a default value. This is not possible if the table is not empty.
  - Added the required column `membre_id` to the `membre_gouvernance_commune` table without a default value. This is not possible if the table is not empty.
  - Added the required column `departement_code` to the `membre_gouvernance_departement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `membre_id` to the `membre_gouvernance_departement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `membre_id` to the `membre_gouvernance_epci` table without a default value. This is not possible if the table is not empty.
  - Added the required column `membre_id` to the `membre_gouvernance_sgar` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sgar_code` to the `membre_gouvernance_sgar` table without a default value. This is not possible if the table is not empty.
  - Added the required column `membre_id` to the `membre_gouvernance_structure` table without a default value. This is not possible if the table is not empty.
  - Added the required column `code_postal` to the `structure` table without a default value. This is not possible if the table is not empty.
  - Added the required column `departement_code` to the `structure` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_mongo` to the `structure` table without a default value. This is not possible if the table is not empty.
  - Added the required column `identifiant_etablissement` to the `structure` table without a default value. This is not possible if the table is not empty.
  - Added the required column `date_de_creation` to the `utilisateur` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email_de_contact` to the `utilisateur` table without a default value. This is not possible if the table is not empty.
  - Added the required column `invite_le` to the `utilisateur` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sso_email` to the `utilisateur` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "comite" DROP CONSTRAINT "comite_editeur_utilisateur_id_fkey";

-- DropForeignKey
ALTER TABLE "comite" DROP CONSTRAINT "comite_gouvernanceDepartementCode_fkey";

-- DropForeignKey
ALTER TABLE "departement" DROP CONSTRAINT "departement_regionCode_fkey";

-- DropForeignKey
ALTER TABLE "feuille_de_route" DROP CONSTRAINT "feuille_de_route_gouvernanceDepartementCode_fkey";

-- DropForeignKey
ALTER TABLE "gouvernance" DROP CONSTRAINT "gouvernance_editeur_note_de_contexte_id_fkey";

-- DropForeignKey
ALTER TABLE "gouvernance" DROP CONSTRAINT "gouvernance_editeur_note_privee_id_fkey";

-- DropForeignKey
ALTER TABLE "membre" DROP CONSTRAINT "membre_contactTechnique_fkey";

-- DropForeignKey
ALTER TABLE "membre" DROP CONSTRAINT "membre_gouvernanceDepartementCode_fkey";

-- DropForeignKey
ALTER TABLE "membre_gouvernance_commune" DROP CONSTRAINT "membre_gouvernance_commune_membreId_fkey";

-- DropForeignKey
ALTER TABLE "membre_gouvernance_departement" DROP CONSTRAINT "membre_gouvernance_departement_departementCode_fkey";

-- DropForeignKey
ALTER TABLE "membre_gouvernance_departement" DROP CONSTRAINT "membre_gouvernance_departement_membreId_fkey";

-- DropForeignKey
ALTER TABLE "membre_gouvernance_epci" DROP CONSTRAINT "membre_gouvernance_epci_membreId_fkey";

-- DropForeignKey
ALTER TABLE "membre_gouvernance_sgar" DROP CONSTRAINT "membre_gouvernance_sgar_membreId_fkey";

-- DropForeignKey
ALTER TABLE "membre_gouvernance_sgar" DROP CONSTRAINT "membre_gouvernance_sgar_sgarCode_fkey";

-- DropForeignKey
ALTER TABLE "membre_gouvernance_structure" DROP CONSTRAINT "membre_gouvernance_structure_membreId_fkey";

-- DropForeignKey
ALTER TABLE "structure" DROP CONSTRAINT "structure_departementCode_fkey";

-- DropForeignKey
ALTER TABLE "utilisateur" DROP CONSTRAINT "utilisateur_departementCode_fkey";

-- DropForeignKey
ALTER TABLE "utilisateur" DROP CONSTRAINT "utilisateur_groupementId_fkey";

-- DropForeignKey
ALTER TABLE "utilisateur" DROP CONSTRAINT "utilisateur_regionCode_fkey";

-- DropForeignKey
ALTER TABLE "utilisateur" DROP CONSTRAINT "utilisateur_structureId_fkey";

-- DropIndex
DROP INDEX "membre_gouvernance_commune_commune_membreId_role_key";

-- DropIndex
DROP INDEX "membre_gouvernance_departement_departementCode_membreId_rol_key";

-- DropIndex
DROP INDEX "membre_gouvernance_sgar_sgarCode_membreId_role_key";

-- DropIndex
DROP INDEX "membre_gouvernance_structure_structure_membreId_role_key";

-- DropIndex
DROP INDEX "utilisateur_ssoEmail_key";

-- DropIndex
DROP INDEX "utilisateur_ssoId_key";

-- AlterTable
ALTER TABLE "comite" DROP COLUMN "derniereEdition",
DROP COLUMN "gouvernanceDepartementCode",
ADD COLUMN     "derniere_edition" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "gouvernance_departement_code" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "departement" DROP COLUMN "regionCode",
ADD COLUMN     "region_code" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "feuille_de_route" DROP COLUMN "gouvernanceDepartementCode",
ADD COLUMN     "gouvernance_departement_code" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "membre" DROP COLUMN "contactTechnique",
DROP COLUMN "gouvernanceDepartementCode",
ADD COLUMN     "contact_technique" TEXT,
ADD COLUMN     "gouvernance_departement_code" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "membre_gouvernance_commune" DROP COLUMN "membreId",
ADD COLUMN     "membre_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "membre_gouvernance_departement" DROP COLUMN "departementCode",
DROP COLUMN "membreId",
ADD COLUMN     "departement_code" TEXT NOT NULL,
ADD COLUMN     "membre_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "membre_gouvernance_epci" DROP CONSTRAINT "membre_gouvernance_epci_pkey",
DROP COLUMN "membreId",
ADD COLUMN     "membre_id" TEXT NOT NULL,
ADD CONSTRAINT "membre_gouvernance_epci_pkey" PRIMARY KEY ("epci", "membre_id", "role");

-- AlterTable
ALTER TABLE "membre_gouvernance_sgar" DROP COLUMN "membreId",
DROP COLUMN "sgarCode",
ADD COLUMN     "membre_id" TEXT NOT NULL,
ADD COLUMN     "sgar_code" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "membre_gouvernance_structure" DROP COLUMN "membreId",
ADD COLUMN     "membre_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "structure" DROP COLUMN "codePostal",
DROP COLUMN "departementCode",
DROP COLUMN "idMongo",
DROP COLUMN "identifiantEtablissement",
ADD COLUMN     "code_postal" TEXT NOT NULL,
ADD COLUMN     "departement_code" TEXT NOT NULL,
ADD COLUMN     "id_mongo" TEXT NOT NULL,
ADD COLUMN     "identifiant_etablissement" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "utilisateur" DROP COLUMN "dateDeCreation",
DROP COLUMN "departementCode",
DROP COLUMN "derniereConnexion",
DROP COLUMN "emailDeContact",
DROP COLUMN "groupementId",
DROP COLUMN "inviteLe",
DROP COLUMN "isSuperAdmin",
DROP COLUMN "isSupprime",
DROP COLUMN "regionCode",
DROP COLUMN "ssoEmail",
DROP COLUMN "ssoId",
DROP COLUMN "structureId",
ADD COLUMN     "date_de_creation" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "departement_code" TEXT,
ADD COLUMN     "derniere_connexion" TIMESTAMP(3),
ADD COLUMN     "email_de_contact" TEXT NOT NULL,
ADD COLUMN     "goupement_id" INTEGER,
ADD COLUMN     "invite_le" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "is_super_admin" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_supprime" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "region_code" TEXT,
ADD COLUMN     "sso_email" TEXT NOT NULL,
ADD COLUMN     "sso_id" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "structure_id" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "membre_gouvernance_commune_commune_membre_id_role_key" ON "membre_gouvernance_commune"("commune", "membre_id", "role");

-- CreateIndex
CREATE UNIQUE INDEX "membre_gouvernance_departement_departement_code_membre_id_r_key" ON "membre_gouvernance_departement"("departement_code", "membre_id", "role");

-- CreateIndex
CREATE UNIQUE INDEX "membre_gouvernance_sgar_sgar_code_membre_id_role_key" ON "membre_gouvernance_sgar"("sgar_code", "membre_id", "role");

-- CreateIndex
CREATE UNIQUE INDEX "membre_gouvernance_structure_structure_membre_id_role_key" ON "membre_gouvernance_structure"("structure", "membre_id", "role");

-- CreateIndex
CREATE UNIQUE INDEX "utilisateur_sso_id_key" ON "utilisateur"("sso_id");

-- CreateIndex
CREATE UNIQUE INDEX "utilisateur_sso_email_key" ON "utilisateur"("sso_email");

-- AddForeignKey
ALTER TABLE "departement" ADD CONSTRAINT "departement_region_code_fkey" FOREIGN KEY ("region_code") REFERENCES "region"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "structure" ADD CONSTRAINT "structure_departement_code_fkey" FOREIGN KEY ("departement_code") REFERENCES "departement"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "utilisateur" ADD CONSTRAINT "utilisateur_structure_id_fkey" FOREIGN KEY ("structure_id") REFERENCES "structure"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "utilisateur" ADD CONSTRAINT "utilisateur_goupement_id_fkey" FOREIGN KEY ("goupement_id") REFERENCES "groupement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "utilisateur" ADD CONSTRAINT "utilisateur_departement_code_fkey" FOREIGN KEY ("departement_code") REFERENCES "departement"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "utilisateur" ADD CONSTRAINT "utilisateur_region_code_fkey" FOREIGN KEY ("region_code") REFERENCES "region"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gouvernance" ADD CONSTRAINT "gouvernance_editeur_note_privee_id_fkey" FOREIGN KEY ("editeur_note_privee_id") REFERENCES "utilisateur"("sso_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gouvernance" ADD CONSTRAINT "gouvernance_editeur_note_de_contexte_id_fkey" FOREIGN KEY ("editeur_note_de_contexte_id") REFERENCES "utilisateur"("sso_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comite" ADD CONSTRAINT "comite_editeur_utilisateur_id_fkey" FOREIGN KEY ("editeur_utilisateur_id") REFERENCES "utilisateur"("sso_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comite" ADD CONSTRAINT "comite_gouvernance_departement_code_fkey" FOREIGN KEY ("gouvernance_departement_code") REFERENCES "gouvernance"("departementCode") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feuille_de_route" ADD CONSTRAINT "feuille_de_route_gouvernance_departement_code_fkey" FOREIGN KEY ("gouvernance_departement_code") REFERENCES "gouvernance"("departementCode") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membre" ADD CONSTRAINT "membre_gouvernance_departement_code_fkey" FOREIGN KEY ("gouvernance_departement_code") REFERENCES "gouvernance"("departementCode") ON DELETE RESTRICT ON UPDATE CASCADE;

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
