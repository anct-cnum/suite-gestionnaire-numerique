/*
  Warnings:

  - Added the required column `porteur_id` to the `feuille_de_route` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "feuille_de_route" ADD COLUMN     "porteur_id" TEXT;

-- AddForeignKey
ALTER TABLE "feuille_de_route" ADD CONSTRAINT "feuille_de_route_porteur_id_fkey" FOREIGN KEY ("porteur_id") REFERENCES "membre"("id") ON DELETE SET NULL ON UPDATE CASCADE;
