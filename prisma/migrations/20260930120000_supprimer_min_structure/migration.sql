-- Miroir de la migration Flyway dataspace V177 (2026-09-30, SEPT #2013) :
-- suppression de min.structure (ancien référentiel de structures MIN, remplacé
-- par main.structure_administrative depuis la refonte) et des colonnes
-- old_structure_id de min.membre / min.utilisateur qui y renvoyaient. Plus
-- aucun lecteur dans src/. En prod, c'est V177 qui s'applique (MIN ne joue pas
-- ses migrations) ; IF EXISTS pour rester rejouable sur les bases locales /
-- de test.
DROP VIEW IF EXISTS llm.structure;
DROP VIEW IF EXISTS llm.membre;
DROP VIEW IF EXISTS llm.utilisateur;
ALTER TABLE "min"."membre" DROP COLUMN IF EXISTS "old_structure_id";
ALTER TABLE "min"."utilisateur" DROP COLUMN IF EXISTS "old_structure_id";
DROP TABLE IF EXISTS "min"."structure";
