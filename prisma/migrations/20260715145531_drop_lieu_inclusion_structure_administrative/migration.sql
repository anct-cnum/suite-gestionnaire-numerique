/*
  Warnings:

  - You are about to drop the `lieu_inclusion_structure_administrative` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE IF EXISTS "main"."lieu_inclusion_structure_administrative" DROP CONSTRAINT IF EXISTS "lieu_inclusion_structure_administrative_admin_fkey";

-- DropForeignKey
ALTER TABLE IF EXISTS "main"."lieu_inclusion_structure_administrative" DROP CONSTRAINT IF EXISTS "lieu_inclusion_structure_administrative_lieu_fkey";

-- DropTable
DROP TABLE IF EXISTS "main"."lieu_inclusion_structure_administrative";
