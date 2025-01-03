/*
  Warnings:

  - You are about to drop the column `departementPorteurCode` on the `gouvernance` table. All the data in the column will be lost.
  - You are about to drop the column `epciPorteur` on the `gouvernance` table. All the data in the column will be lost.
  - You are about to drop the column `sgarPorteurCode` on the `gouvernance` table. All the data in the column will be lost.
  - You are about to drop the column `siretPorteur` on the `gouvernance` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "gouvernance" DROP CONSTRAINT "gouvernance_departementPorteurCode_fkey";

-- DropForeignKey
ALTER TABLE "gouvernance" DROP CONSTRAINT "gouvernance_sgarPorteurCode_fkey";

-- AlterTable
ALTER TABLE "gouvernance" DROP COLUMN "departementPorteurCode",
DROP COLUMN "epciPorteur",
DROP COLUMN "sgarPorteurCode",
DROP COLUMN "siretPorteur";
