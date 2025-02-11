/*
  Warnings:

  - Added the required column `statut` to the `membre` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "membre" ADD COLUMN     "statut" TEXT NOT NULL;
