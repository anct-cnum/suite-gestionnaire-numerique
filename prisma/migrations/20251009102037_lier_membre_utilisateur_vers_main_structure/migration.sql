-- Migration: Lier min.utilisateur et min.membre vers main.structure au lieu de min.structure

-- Étape 1: Supprimer les contraintes de clé étrangère existantes
ALTER TABLE "min"."utilisateur" DROP CONSTRAINT IF EXISTS "utilisateur_structure_id_fkey";
ALTER TABLE "min"."membre" DROP CONSTRAINT IF EXISTS "membre_structure_id_fkey";

-- Étape 2: Mapper les structure_id existants de min.structure vers main.structure via le SIRET
-- Pour les utilisateurs
UPDATE "min"."utilisateur" u
SET structure_id = ms2.id
FROM "min"."structure" ms
JOIN "main"."structure" ms2 ON ms.identifiant_etablissement = ms2.siret
WHERE u.structure_id = ms.id
  AND u.structure_id IS NOT NULL;

-- Mettre à NULL les utilisateurs dont la structure n'a pas de correspondance dans main.structure
UPDATE "min"."utilisateur" u
SET structure_id = NULL
WHERE u.structure_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM "main"."structure" ms2
    JOIN "min"."structure" ms ON ms.id = u.structure_id
    WHERE ms.identifiant_etablissement = ms2.siret
  );

-- Pour les membres
UPDATE "min"."membre" m
SET structure_id = ms2.id
FROM "min"."structure" ms
JOIN "main"."structure" ms2 ON ms.identifiant_etablissement = ms2.siret
WHERE m.structure_id = ms.id
  AND m.structure_id IS NOT NULL;

-- Mettre à NULL les membres dont la structure n'a pas de correspondance dans main.structure
UPDATE "min"."membre" m
SET structure_id = NULL
WHERE m.structure_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM "main"."structure" ms2
    JOIN "min"."structure" ms ON ms.id = m.structure_id
    WHERE ms.identifiant_etablissement = ms2.siret
  );

-- Étape 3: Recréer les contraintes de clé étrangère vers main.structure
ALTER TABLE "min"."utilisateur"
  ADD CONSTRAINT "utilisateur_structure_id_fkey"
  FOREIGN KEY (structure_id)
  REFERENCES "main"."structure"(id);

ALTER TABLE "min"."membre"
  ADD CONSTRAINT "membre_structure_id_fkey"
  FOREIGN KEY (structure_id)
  REFERENCES "main"."structure"(id);