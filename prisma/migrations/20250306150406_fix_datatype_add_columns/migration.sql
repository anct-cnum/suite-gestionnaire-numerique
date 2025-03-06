/*
  Warnings:

  - The primary key for the `beneficiaire_subvention` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `beneficiaire_subvention` table. All the data in the column will be lost.
  - You are about to drop the column `date_de_modification` on the `demande_de_subvention` table. All the data in the column will be lost.
  - The primary key for the `porteur_action` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `porteur_action` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[demande_de_subvention_id]` on the table `beneficiaire_subvention` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[action_id,membre_id]` on the table `porteur_action` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `creation` to the `action` table without a default value. This is not possible if the table is not empty.
  - Added the required column `derniere_modification` to the `action` table without a default value. This is not possible if the table is not empty.
  - Added the required column `creation` to the `demande_de_subvention` table without a default value. This is not possible if the table is not empty.
  - Added the required column `derniere_modification` to the `demande_de_subvention` table without a default value. This is not possible if the table is not empty.
  - Added the required column `old_uuid` to the `demande_de_subvention` table without a default value. This is not possible if the table is not empty.
  - Added the required column `old_uuid` to the `membre` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "action" ADD COLUMN     "creation" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "derniere_modification" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "beneficiaire_subvention" DROP CONSTRAINT "beneficiaire_subvention_pkey",
DROP COLUMN "id";

-- AlterTable
ALTER TABLE "demande_de_subvention" DROP COLUMN "date_de_modification",
ADD COLUMN     "creation" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "derniere_modification" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "old_uuid" UUID NOT NULL;

-- AlterTable
ALTER TABLE "membre" ADD COLUMN     "old_uuid" UUID NOT NULL;

-- AlterTable
ALTER TABLE "porteur_action" DROP CONSTRAINT "porteur_action_pkey",
DROP COLUMN "id";

-- CreateIndex
CREATE UNIQUE INDEX "beneficiaire_subvention_demande_de_subvention_id_key" ON "beneficiaire_subvention"("demande_de_subvention_id");

-- CreateIndex
CREATE UNIQUE INDEX "porteur_action_action_id_membre_id_key" ON "porteur_action"("action_id", "membre_id");
