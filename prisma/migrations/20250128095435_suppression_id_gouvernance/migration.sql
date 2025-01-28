/*
  Warnings:

  - You are about to drop the column `gouvernanceId` on the `comite` table. All the data in the column will be lost.
  - The primary key for the `gouvernance` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `gouvernance` table. All the data in the column will be lost.
  - The primary key for the `membre_gouvernance_commune` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `gouvernanceId` on the `membre_gouvernance_commune` table. All the data in the column will be lost.
  - The primary key for the `membre_gouvernance_departement` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `gouvernanceId` on the `membre_gouvernance_departement` table. All the data in the column will be lost.
  - The primary key for the `membre_gouvernance_epci` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `gouvernanceId` on the `membre_gouvernance_epci` table. All the data in the column will be lost.
  - You are about to drop the column `gouvernanceId` on the `membre_gouvernance_sgar` table. All the data in the column will be lost.
  - The primary key for the `membre_gouvernance_structure` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `gouvernanceId` on the `membre_gouvernance_structure` table. All the data in the column will be lost.
  - The primary key for the `note_de_contexte` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `gouvernanceId` on the `note_de_contexte` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[sgarCode,gouvernanceDepartementCode,role]` on the table `membre_gouvernance_sgar` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `gouvernanceDepartementCode` to the `comite` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gouvernanceDepartementCode` to the `membre_gouvernance_commune` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gouvernanceDepartementCode` to the `membre_gouvernance_departement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gouvernanceDepartementCode` to the `membre_gouvernance_epci` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gouvernanceDepartementCode` to the `membre_gouvernance_sgar` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gouvernanceDepartementCode` to the `membre_gouvernance_structure` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gouvernanceDepartementCode` to the `note_de_contexte` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "comite" DROP CONSTRAINT "comite_gouvernanceId_fkey";

-- DropForeignKey
ALTER TABLE "membre_gouvernance_commune" DROP CONSTRAINT "membre_gouvernance_commune_gouvernanceId_fkey";

-- DropForeignKey
ALTER TABLE "membre_gouvernance_departement" DROP CONSTRAINT "membre_gouvernance_departement_gouvernanceId_fkey";

-- DropForeignKey
ALTER TABLE "membre_gouvernance_epci" DROP CONSTRAINT "membre_gouvernance_epci_gouvernanceId_fkey";

-- DropForeignKey
ALTER TABLE "membre_gouvernance_sgar" DROP CONSTRAINT "membre_gouvernance_sgar_gouvernanceId_fkey";

-- DropForeignKey
ALTER TABLE "membre_gouvernance_structure" DROP CONSTRAINT "membre_gouvernance_structure_gouvernanceId_fkey";

-- DropForeignKey
ALTER TABLE "note_de_contexte" DROP CONSTRAINT "note_de_contexte_gouvernanceId_fkey";

-- DropIndex
DROP INDEX "gouvernance_departementCode_key";

-- DropIndex
DROP INDEX "membre_gouvernance_sgar_sgarCode_gouvernanceId_role_key";

-- AlterTable
ALTER TABLE "comite" DROP COLUMN "gouvernanceId",
ADD COLUMN     "gouvernanceDepartementCode" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "gouvernance" DROP CONSTRAINT "gouvernance_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "gouvernance_pkey" PRIMARY KEY ("departementCode");

-- AlterTable
ALTER TABLE "membre_gouvernance_commune" DROP CONSTRAINT "membre_gouvernance_commune_pkey",
DROP COLUMN "gouvernanceId",
ADD COLUMN     "gouvernanceDepartementCode" TEXT NOT NULL,
ADD CONSTRAINT "membre_gouvernance_commune_pkey" PRIMARY KEY ("commune", "gouvernanceDepartementCode", "role");

-- AlterTable
ALTER TABLE "membre_gouvernance_departement" DROP CONSTRAINT "membre_gouvernance_departement_pkey",
DROP COLUMN "gouvernanceId",
ADD COLUMN     "gouvernanceDepartementCode" TEXT NOT NULL,
ADD CONSTRAINT "membre_gouvernance_departement_pkey" PRIMARY KEY ("departementCode", "gouvernanceDepartementCode", "role");

-- AlterTable
ALTER TABLE "membre_gouvernance_epci" DROP CONSTRAINT "membre_gouvernance_epci_pkey",
DROP COLUMN "gouvernanceId",
ADD COLUMN     "gouvernanceDepartementCode" TEXT NOT NULL,
ADD CONSTRAINT "membre_gouvernance_epci_pkey" PRIMARY KEY ("epci", "gouvernanceDepartementCode", "role");

-- AlterTable
ALTER TABLE "membre_gouvernance_sgar" DROP COLUMN "gouvernanceId",
ADD COLUMN     "gouvernanceDepartementCode" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "membre_gouvernance_structure" DROP CONSTRAINT "membre_gouvernance_structure_pkey",
DROP COLUMN "gouvernanceId",
ADD COLUMN     "gouvernanceDepartementCode" TEXT NOT NULL,
ADD CONSTRAINT "membre_gouvernance_structure_pkey" PRIMARY KEY ("structure", "gouvernanceDepartementCode", "role");

-- AlterTable
ALTER TABLE "note_de_contexte" DROP CONSTRAINT "note_de_contexte_pkey",
DROP COLUMN "gouvernanceId",
ADD COLUMN     "gouvernanceDepartementCode" TEXT NOT NULL,
ADD CONSTRAINT "note_de_contexte_pkey" PRIMARY KEY ("gouvernanceDepartementCode");

-- CreateIndex
CREATE UNIQUE INDEX "membre_gouvernance_sgar_sgarCode_gouvernanceDepartementCode_key" ON "membre_gouvernance_sgar"("sgarCode", "gouvernanceDepartementCode", "role");

-- AddForeignKey
ALTER TABLE "note_de_contexte" ADD CONSTRAINT "note_de_contexte_gouvernanceDepartementCode_fkey" FOREIGN KEY ("gouvernanceDepartementCode") REFERENCES "gouvernance"("departementCode") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comite" ADD CONSTRAINT "comite_gouvernanceDepartementCode_fkey" FOREIGN KEY ("gouvernanceDepartementCode") REFERENCES "gouvernance"("departementCode") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membre_gouvernance_departement" ADD CONSTRAINT "membre_gouvernance_departement_gouvernanceDepartementCode_fkey" FOREIGN KEY ("gouvernanceDepartementCode") REFERENCES "gouvernance"("departementCode") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membre_gouvernance_sgar" ADD CONSTRAINT "membre_gouvernance_sgar_gouvernanceDepartementCode_fkey" FOREIGN KEY ("gouvernanceDepartementCode") REFERENCES "gouvernance"("departementCode") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membre_gouvernance_epci" ADD CONSTRAINT "membre_gouvernance_epci_gouvernanceDepartementCode_fkey" FOREIGN KEY ("gouvernanceDepartementCode") REFERENCES "gouvernance"("departementCode") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membre_gouvernance_commune" ADD CONSTRAINT "membre_gouvernance_commune_gouvernanceDepartementCode_fkey" FOREIGN KEY ("gouvernanceDepartementCode") REFERENCES "gouvernance"("departementCode") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membre_gouvernance_structure" ADD CONSTRAINT "membre_gouvernance_structure_gouvernanceDepartementCode_fkey" FOREIGN KEY ("gouvernanceDepartementCode") REFERENCES "gouvernance"("departementCode") ON DELETE RESTRICT ON UPDATE CASCADE;
