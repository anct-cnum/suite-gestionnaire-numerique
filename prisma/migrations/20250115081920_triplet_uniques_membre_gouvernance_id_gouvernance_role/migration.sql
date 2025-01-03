/*
  Warnings:

  - The primary key for the `membre_gouvernance_commune` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `membre_gouvernance_commune` table. All the data in the column will be lost.
  - The primary key for the `membre_gouvernance_departement` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `membre_gouvernance_departement` table. All the data in the column will be lost.
  - The primary key for the `membre_gouvernance_epci` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `membre_gouvernance_epci` table. All the data in the column will be lost.
  - The primary key for the `membre_gouvernance_sgar` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `membre_gouvernance_sgar` table. All the data in the column will be lost.
  - The primary key for the `membre_gouvernance_structure` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `membre_gouvernance_structure` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[sgarCode,gouvernanceId,role]` on the table `membre_gouvernance_sgar` will be added. If there are existing duplicate values, this will fail.
  - Made the column `role` on table `membre_gouvernance_commune` required. This step will fail if there are existing NULL values in that column.
  - Made the column `role` on table `membre_gouvernance_departement` required. This step will fail if there are existing NULL values in that column.
  - Made the column `role` on table `membre_gouvernance_epci` required. This step will fail if there are existing NULL values in that column.
  - Made the column `role` on table `membre_gouvernance_sgar` required. This step will fail if there are existing NULL values in that column.
  - Made the column `role` on table `membre_gouvernance_structure` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "membre_gouvernance_commune_commune_gouvernanceId_key";

-- DropIndex
DROP INDEX "membre_gouvernance_departement_departementCode_gouvernanceI_key";

-- DropIndex
DROP INDEX "membre_gouvernance_epci_epci_gouvernanceId_key";

-- DropIndex
DROP INDEX "membre_gouvernance_sgar_sgarCode_gouvernanceId_key";

-- DropIndex
DROP INDEX "membre_gouvernance_structure_structure_gouvernanceId_key";

-- AlterTable
ALTER TABLE "membre_gouvernance_commune" DROP CONSTRAINT "membre_gouvernance_commune_pkey",
DROP COLUMN "id",
ALTER COLUMN "role" SET NOT NULL,
ADD CONSTRAINT "membre_gouvernance_commune_pkey" PRIMARY KEY ("commune", "gouvernanceId", "role");

-- AlterTable
ALTER TABLE "membre_gouvernance_departement" DROP CONSTRAINT "membre_gouvernance_departement_pkey",
DROP COLUMN "id",
ALTER COLUMN "role" SET NOT NULL,
ADD CONSTRAINT "membre_gouvernance_departement_pkey" PRIMARY KEY ("departementCode", "gouvernanceId", "role");

-- AlterTable
ALTER TABLE "membre_gouvernance_epci" DROP CONSTRAINT "membre_gouvernance_epci_pkey",
DROP COLUMN "id",
ALTER COLUMN "role" SET NOT NULL,
ADD CONSTRAINT "membre_gouvernance_epci_pkey" PRIMARY KEY ("epci", "gouvernanceId", "role");

-- AlterTable
ALTER TABLE "membre_gouvernance_sgar" DROP CONSTRAINT "membre_gouvernance_sgar_pkey",
DROP COLUMN "id",
ALTER COLUMN "role" SET NOT NULL;

-- AlterTable
ALTER TABLE "membre_gouvernance_structure" DROP CONSTRAINT "membre_gouvernance_structure_pkey",
DROP COLUMN "id",
ALTER COLUMN "role" SET NOT NULL,
ADD CONSTRAINT "membre_gouvernance_structure_pkey" PRIMARY KEY ("structure", "gouvernanceId", "role");

-- CreateIndex
CREATE UNIQUE INDEX "membre_gouvernance_sgar_sgarCode_gouvernanceId_role_key" ON "membre_gouvernance_sgar"("sgarCode", "gouvernanceId", "role");
