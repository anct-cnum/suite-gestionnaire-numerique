-- Supprimer le champ nom de la table membre car le nom est maintenant récupéré via la relation avec structure
-- Rendre structure_id obligatoire car tous les membres sont liés à une structure

-- Rendre structure_id NOT NULL
ALTER TABLE "min"."membre" ALTER COLUMN "structure_id" SET NOT NULL;

-- Supprimer le champ nom
ALTER TABLE "min"."membre" DROP COLUMN "nom";
