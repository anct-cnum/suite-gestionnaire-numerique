/*
  Warnings:

  - The primary key for the `membre_gouvernance_commune` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `gouvernanceDepartementCode` on the `membre_gouvernance_commune` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `membre_gouvernance_commune` table. All the data in the column will be lost.
  - The primary key for the `membre_gouvernance_departement` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `gouvernanceDepartementCode` on the `membre_gouvernance_departement` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `membre_gouvernance_departement` table. All the data in the column will be lost.
  - The primary key for the `membre_gouvernance_epci` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `gouvernanceDepartementCode` on the `membre_gouvernance_epci` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `membre_gouvernance_epci` table. All the data in the column will be lost.
  - You are about to drop the column `gouvernanceDepartementCode` on the `membre_gouvernance_sgar` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `membre_gouvernance_sgar` table. All the data in the column will be lost.
  - The primary key for the `membre_gouvernance_structure` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `gouvernanceDepartementCode` on the `membre_gouvernance_structure` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `membre_gouvernance_structure` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[commune,membreId,role]` on the table `membre_gouvernance_commune` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[departementCode,membreId,role]` on the table `membre_gouvernance_departement` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[sgarCode,membreId,role]` on the table `membre_gouvernance_sgar` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[structure,membreId,role]` on the table `membre_gouvernance_structure` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `membreId` to the `membre_gouvernance_commune` table without a default value. This is not possible if the table is not empty.
  - Added the required column `membreId` to the `membre_gouvernance_departement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `membreId` to the `membre_gouvernance_epci` table without a default value. This is not possible if the table is not empty.
  - Added the required column `membreId` to the `membre_gouvernance_sgar` table without a default value. This is not possible if the table is not empty.
  - Added the required column `membreId` to the `membre_gouvernance_structure` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "membre_gouvernance_commune" DROP CONSTRAINT "membre_gouvernance_commune_gouvernanceDepartementCode_fkey";

-- DropForeignKey
ALTER TABLE "membre_gouvernance_departement" DROP CONSTRAINT "membre_gouvernance_departement_gouvernanceDepartementCode_fkey";

-- DropForeignKey
ALTER TABLE "membre_gouvernance_epci" DROP CONSTRAINT "membre_gouvernance_epci_gouvernanceDepartementCode_fkey";

-- DropForeignKey
ALTER TABLE "membre_gouvernance_sgar" DROP CONSTRAINT "membre_gouvernance_sgar_gouvernanceDepartementCode_fkey";

-- DropForeignKey
ALTER TABLE "membre_gouvernance_structure" DROP CONSTRAINT "membre_gouvernance_structure_gouvernanceDepartementCode_fkey";

-- DropIndex
DROP INDEX "membre_gouvernance_sgar_sgarCode_gouvernanceDepartementCode_key";

-- AlterTable
ALTER TABLE "membre_gouvernance_commune" DROP CONSTRAINT "membre_gouvernance_commune_pkey",
DROP COLUMN "gouvernanceDepartementCode",
DROP COLUMN "type",
ADD COLUMN     "membreId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "membre_gouvernance_departement" DROP CONSTRAINT "membre_gouvernance_departement_pkey",
DROP COLUMN "gouvernanceDepartementCode",
DROP COLUMN "type",
ADD COLUMN     "membreId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "membre_gouvernance_epci" DROP CONSTRAINT "membre_gouvernance_epci_pkey",
DROP COLUMN "gouvernanceDepartementCode",
DROP COLUMN "type",
ADD COLUMN     "membreId" TEXT NOT NULL,
ADD CONSTRAINT "membre_gouvernance_epci_pkey" PRIMARY KEY ("epci", "membreId", "role");

-- AlterTable
ALTER TABLE "membre_gouvernance_sgar" DROP COLUMN "gouvernanceDepartementCode",
DROP COLUMN "type",
ADD COLUMN     "membreId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "membre_gouvernance_structure" DROP CONSTRAINT "membre_gouvernance_structure_pkey",
DROP COLUMN "gouvernanceDepartementCode",
DROP COLUMN "type",
ADD COLUMN     "membreId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "membre" (
    "id" TEXT NOT NULL,
    "gouvernanceDepartementCode" TEXT NOT NULL,
    "type" TEXT,

    CONSTRAINT "membre_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "membre_gouvernance_commune_commune_membreId_role_key" ON "membre_gouvernance_commune"("commune", "membreId", "role");

-- CreateIndex
CREATE UNIQUE INDEX "membre_gouvernance_departement_departementCode_membreId_rol_key" ON "membre_gouvernance_departement"("departementCode", "membreId", "role");

-- CreateIndex
CREATE UNIQUE INDEX "membre_gouvernance_sgar_sgarCode_membreId_role_key" ON "membre_gouvernance_sgar"("sgarCode", "membreId", "role");

-- CreateIndex
CREATE UNIQUE INDEX "membre_gouvernance_structure_structure_membreId_role_key" ON "membre_gouvernance_structure"("structure", "membreId", "role");

-- AddForeignKey
ALTER TABLE "membre" ADD CONSTRAINT "membre_gouvernanceDepartementCode_fkey" FOREIGN KEY ("gouvernanceDepartementCode") REFERENCES "gouvernance"("departementCode") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membre_gouvernance_departement" ADD CONSTRAINT "membre_gouvernance_departement_membreId_fkey" FOREIGN KEY ("membreId") REFERENCES "membre"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membre_gouvernance_sgar" ADD CONSTRAINT "membre_gouvernance_sgar_membreId_fkey" FOREIGN KEY ("membreId") REFERENCES "membre"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membre_gouvernance_epci" ADD CONSTRAINT "membre_gouvernance_epci_membreId_fkey" FOREIGN KEY ("membreId") REFERENCES "membre"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membre_gouvernance_commune" ADD CONSTRAINT "membre_gouvernance_commune_membreId_fkey" FOREIGN KEY ("membreId") REFERENCES "membre"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membre_gouvernance_structure" ADD CONSTRAINT "membre_gouvernance_structure_membreId_fkey" FOREIGN KEY ("membreId") REFERENCES "membre"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
