/*
  Warnings:

  - The primary key for the `note_de_contexte` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `note_de_contexte` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "note_de_contexte" DROP CONSTRAINT "note_de_contexte_editeurId_fkey";

-- DropIndex
DROP INDEX "note_de_contexte_gouvernanceId_key";

-- AlterTable
ALTER TABLE "note_de_contexte" DROP CONSTRAINT "note_de_contexte_pkey",
DROP COLUMN "id",
ALTER COLUMN "editeurId" SET DATA TYPE TEXT,
ADD CONSTRAINT "note_de_contexte_pkey" PRIMARY KEY ("gouvernanceId");

-- AddForeignKey
ALTER TABLE "note_de_contexte" ADD CONSTRAINT "note_de_contexte_editeurId_fkey" FOREIGN KEY ("editeurId") REFERENCES "utilisateur"("ssoId") ON DELETE RESTRICT ON UPDATE CASCADE;
