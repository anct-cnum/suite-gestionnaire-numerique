/*
  Warnings:

  - Added the required column `adresse` to the `structure` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contact` to the `structure` table without a default value. This is not possible if the table is not empty.
  - Added the required column `departementCode` to the `structure` table without a default value. This is not possible if the table is not empty.
  - Added the required column `identifiantEtablissement` to the `structure` table without a default value. This is not possible if the table is not empty.
  - Added the required column `regionCode` to the `structure` table without a default value. This is not possible if the table is not empty.
  - Added the required column `statut` to the `structure` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `structure` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "structure" ADD COLUMN     "adresse" JSONB NOT NULL,
ADD COLUMN     "contact" JSONB NOT NULL,
ADD COLUMN     "departementCode" TEXT NOT NULL,
ADD COLUMN     "identifiantEtablissement" TEXT NOT NULL,
ADD COLUMN     "regionCode" TEXT NOT NULL,
ADD COLUMN     "statut" TEXT NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "structure" ADD CONSTRAINT "structure_departementCode_fkey" FOREIGN KEY ("departementCode") REFERENCES "departement"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "structure" ADD CONSTRAINT "structure_regionCode_fkey" FOREIGN KEY ("regionCode") REFERENCES "region"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
