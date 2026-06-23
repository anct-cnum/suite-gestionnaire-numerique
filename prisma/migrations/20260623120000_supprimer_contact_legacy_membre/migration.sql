-- Suppression des colonnes legacy `contact` et `contact_technique` de min.membre.
-- L'ancien modèle de contact (FK vers min.contact_membre_gouvernance) a été remplacé
-- par main.contact + main.contact_structure_administrative. Plus aucun code ne lit
-- ni n'écrit ces colonnes. Miroir de la migration Flyway V112 côté dataspace.

ALTER TABLE "min"."membre" DROP COLUMN "contact";
ALTER TABLE "min"."membre" DROP COLUMN "contact_technique";
