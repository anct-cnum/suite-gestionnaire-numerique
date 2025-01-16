/*
  Warnings:

  - You are about to drop the column `dateProchainComite` on the `comite` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "comite" DROP COLUMN "dateProchainComite",
ADD COLUMN     "date" TIMESTAMP(3);
