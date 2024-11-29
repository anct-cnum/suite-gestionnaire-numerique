/*
  Warnings:

  - A unique constraint covering the columns `[ssoEmail]` on the table `utilisateur` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "utilisateur" ADD COLUMN     "ssoEmail" TEXT NOT NULL DEFAULT '';

-- CreateIndex
CREATE UNIQUE INDEX "utilisateur_ssoEmail_key" ON "utilisateur"("ssoEmail");
