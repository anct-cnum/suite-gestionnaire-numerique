-- AlterTable
ALTER TABLE "utilisateur" RENAME "sub" TO "ssoId";

-- AlterIndex
ALTER INDEX "utilisateur_sub_key" RENAME TO "utilisateur_ssoId_key";
