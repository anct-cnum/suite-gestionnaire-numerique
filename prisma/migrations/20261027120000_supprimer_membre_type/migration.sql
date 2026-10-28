-- Miroir de la migration Flyway dataspace V188 (2026-10-27, SEPT #2178) :
-- suppression de min.membre.type, typologie saisie des membres de gouvernance.
-- Depuis la PR #2179, la typologie d'un membre est la catégorie juridique de
-- sa structure ; plus aucun lecteur ni écrivain dans src/. En prod, c'est V188
-- qui s'applique (MIN ne joue pas ses migrations) ; IF EXISTS pour rester
-- rejouable sur les bases locales / de test.
DROP VIEW IF EXISTS llm.membre;
ALTER TABLE "min"."membre" DROP COLUMN IF EXISTS "type";
