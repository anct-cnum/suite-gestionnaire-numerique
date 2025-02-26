/*
  Warnings:

  - Made the column `contact` on table `membre` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "membre" DROP CONSTRAINT "membre_contact_fkey";

-- AlterTable
ALTER TABLE "membre" ALTER COLUMN "contact" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "membre" ADD CONSTRAINT "membre_contact_fkey" FOREIGN KEY ("contact") REFERENCES "contact_membre_gouvernance"("email") ON DELETE RESTRICT ON UPDATE CASCADE;
