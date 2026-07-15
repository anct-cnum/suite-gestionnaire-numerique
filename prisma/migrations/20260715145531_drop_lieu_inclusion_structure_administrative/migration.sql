/*
  Warnings:

  - You are about to drop the `lieu_inclusion_structure_administrative` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "main"."lieu_inclusion_structure_administrative" DROP CONSTRAINT "lieu_inclusion_structure_administrative_admin_fkey";

-- DropForeignKey
ALTER TABLE "main"."lieu_inclusion_structure_administrative" DROP CONSTRAINT "lieu_inclusion_structure_administrative_lieu_fkey";

-- DropTable
DROP TABLE "main"."lieu_inclusion_structure_administrative";
