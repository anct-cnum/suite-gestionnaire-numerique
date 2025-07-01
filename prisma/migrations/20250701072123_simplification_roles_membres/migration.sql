/*
  Warnings:

  - You are about to drop the `membre_gouvernance_commune` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `membre_gouvernance_departement` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `membre_gouvernance_epci` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `membre_gouvernance_sgar` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `membre_gouvernance_structure` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "min"."membre_gouvernance_commune" DROP CONSTRAINT "membre_gouvernance_commune_membre_id_fkey";

-- DropForeignKey
ALTER TABLE "min"."membre_gouvernance_departement" DROP CONSTRAINT "membre_gouvernance_departement_departement_code_fkey";

-- DropForeignKey
ALTER TABLE "min"."membre_gouvernance_departement" DROP CONSTRAINT "membre_gouvernance_departement_membre_id_fkey";

-- DropForeignKey
ALTER TABLE "min"."membre_gouvernance_epci" DROP CONSTRAINT "membre_gouvernance_epci_membre_id_fkey";

-- DropForeignKey
ALTER TABLE "min"."membre_gouvernance_sgar" DROP CONSTRAINT "membre_gouvernance_sgar_membre_id_fkey";

-- DropForeignKey
ALTER TABLE "min"."membre_gouvernance_sgar" DROP CONSTRAINT "membre_gouvernance_sgar_sgar_code_fkey";

-- DropForeignKey
ALTER TABLE "min"."membre_gouvernance_structure" DROP CONSTRAINT "membre_gouvernance_structure_membre_id_fkey";

-- AlterTable
ALTER TABLE "min"."membre" ADD COLUMN     "is_coporteur" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "min"."membre" ADD COLUMN     "categorie_membre" TEXT;
ALTER TABLE "min"."membre" ADD COLUMN     "nom" TEXT;

-- Migration des coporteurs : Mettre is_coporteur à true pour les membres présents dans les tables de rôles
UPDATE "min"."membre" 
SET "is_coporteur" = true
WHERE id IN (
  -- Coporteurs département
  SELECT DISTINCT membre_id 
  FROM "min"."membre_gouvernance_departement" 
  WHERE role = 'coporteur'
  
  UNION
  
  -- Coporteurs SGAR
  SELECT DISTINCT membre_id 
  FROM "min"."membre_gouvernance_sgar" 
  WHERE role = 'coporteur'
  
  UNION
  
  -- Coporteurs EPCI
  SELECT DISTINCT membre_id 
  FROM "min"."membre_gouvernance_epci" 
  WHERE role = 'coporteur'
  
  UNION
  
  -- Coporteurs commune
  SELECT DISTINCT membre_id 
  FROM "min"."membre_gouvernance_commune" 
  WHERE role = 'coporteur'
  
  UNION
  
  -- Coporteurs structure
  SELECT DISTINCT membre_id 
  FROM "min"."membre_gouvernance_structure" 
  WHERE role = 'coporteur'
);

-- Récupération des noms depuis les anciennes tables de rôles
-- Commune
UPDATE "min"."membre" 
SET "nom" = mgc.commune
FROM "min"."membre_gouvernance_commune" mgc
WHERE "min"."membre".id = mgc.membre_id
AND "min"."membre".nom IS NULL;

-- Département
UPDATE "min"."membre" 
SET "nom" = d.nom
FROM "min"."membre_gouvernance_departement" mgd
JOIN "min"."departement" d ON mgd.departement_code = d.code
WHERE "min"."membre".id = mgd.membre_id
AND "min"."membre".nom IS NULL;

-- EPCI
UPDATE "min"."membre" 
SET "nom" = mge.epci
FROM "min"."membre_gouvernance_epci" mge
WHERE "min"."membre".id = mge.membre_id
AND "min"."membre".nom IS NULL;

-- SGAR (Région)
UPDATE "min"."membre" 
SET "nom" = r.nom
FROM "min"."membre_gouvernance_sgar" mgs
JOIN "min"."region" r ON mgs.sgar_code = r.code
WHERE "min"."membre".id = mgs.membre_id
AND "min"."membre".nom IS NULL;

-- Structure
UPDATE "min"."membre" 
SET "nom" = mgs.structure
FROM "min"."membre_gouvernance_structure" mgs
WHERE "min"."membre".id = mgs.membre_id
AND "min"."membre".nom IS NULL;

-- Définir le type pour tous les membres à partir de l'ID
UPDATE "min"."membre" 
SET "categorie_membre" = CASE 
  WHEN id LIKE 'commune-%' THEN 'commune'
  WHEN id LIKE 'departement-%' THEN 'departement'
  WHEN id LIKE 'epci-%' THEN 'epci'
  WHEN id LIKE 'region-%' THEN 'sgar'
  WHEN id LIKE 'structure-%' THEN 'structure'
  ELSE 'structure' -- valeur par défaut
END;

-- DropTable
DROP TABLE "min"."membre_gouvernance_commune";

-- DropTable
DROP TABLE "min"."membre_gouvernance_departement";

-- DropTable
DROP TABLE "min"."membre_gouvernance_epci";

-- DropTable
DROP TABLE "min"."membre_gouvernance_sgar";

-- DropTable
DROP TABLE "min"."membre_gouvernance_structure";
