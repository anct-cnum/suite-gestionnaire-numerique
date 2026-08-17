-- Migration: Renommer structure_id en old_structure_id et créer nouveau structure_id
--
-- Objectif: Préserver les anciennes références vers min.structure dans old_structure_id
--           et créer un nouveau champ structure_id qui pointera vers main.structure

-- ============================================================================
-- TABLE: min.utilisateur
-- ============================================================================

-- Étape 1: Supprimer la contrainte de clé étrangère existante
ALTER TABLE "min"."utilisateur" DROP CONSTRAINT IF EXISTS "utilisateur_structure_id_fkey";

-- Étape 2: Renommer la colonne structure_id en old_structure_id
ALTER TABLE "min"."utilisateur" RENAME COLUMN "structure_id" TO "old_structure_id";

-- Étape 3: Créer une nouvelle colonne structure_id (NULL par défaut)
ALTER TABLE "min"."utilisateur" ADD COLUMN "structure_id" INTEGER;

-- Étape 4 (retirée, chantier N11 2026-08) : la FK vers main.structure n'est
-- plus créée — la table legacy est droppée (dataspace V148) et absente du
-- snapshot. La migration 20260525150000 pose la FK définitive vers
-- main.structure_administrative (son DROP CONSTRAINT IF EXISTS reste valide).

-- ============================================================================
-- TABLE: min.membre
-- ============================================================================

-- Étape 1: Supprimer la contrainte de clé étrangère existante
ALTER TABLE "min"."membre" DROP CONSTRAINT IF EXISTS "membre_structure_id_fkey";

-- Étape 2: Renommer la colonne structure_id en old_structure_id
ALTER TABLE "min"."membre" RENAME COLUMN "structure_id" TO "old_structure_id";

-- Étape 3: Créer une nouvelle colonne structure_id (NULL par défaut)
ALTER TABLE "min"."membre" ADD COLUMN "structure_id" INTEGER;

-- Étape 4 (retirée, chantier N11 2026-08) : idem min.utilisateur ci-dessus —
-- pas de FK vers la table legacy droppée ; cf migration 20260525150000.
