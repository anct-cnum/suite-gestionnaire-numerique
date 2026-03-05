-- Migration: Refonte de la table subvention
-- Synchronisation avec Dataspace V048
-- Transformation d'un modèle normalisé (plusieurs lignes par poste avec source_financement)
-- vers un modèle dénormalisé (une ligne par poste avec colonnes spécifiques par source)
--
-- IMPORTANT: Cette migration supprime source_financement avec CASCADE
-- ce qui va automatiquement supprimer les vues dépendantes :
-- - min.postes_conseiller_numerique_synthese
-- La migration suivante (20260302000000) va recréer cette vue avec la nouvelle structure

-- Supprimer la contrainte CHECK sur source_financement si elle existe
ALTER TABLE main.subvention DROP CONSTRAINT IF EXISTS subvention_source_check;

-- Supprimer les colonnes obsolètes (CASCADE supprime les vues dépendantes)
ALTER TABLE main.subvention
DROP COLUMN IF EXISTS source_financement CASCADE,
DROP COLUMN IF EXISTS date_debut_convention,
DROP COLUMN IF EXISTS date_debut_financement,
DROP COLUMN IF EXISTS date_fin_convention,
DROP COLUMN IF EXISTS date_fin_financement,
DROP COLUMN IF EXISTS montant_subvention,
DROP COLUMN IF EXISTS montant_bonification,
DROP COLUMN IF EXISTS versement_1,
DROP COLUMN IF EXISTS versement_2,
DROP COLUMN IF EXISTS versement_3,
DROP COLUMN IF EXISTS date_versement_1,
DROP COLUMN IF EXISTS date_versement_2,
DROP COLUMN IF EXISTS date_versement_3,
DROP COLUMN IF EXISTS is_territoire_prioritaire,
DROP COLUMN IF EXISTS mois_utilises_periode_financement,
DROP COLUMN IF EXISTS mois_utilises_poste,
DROP COLUMN IF EXISTS avoir,
DROP COLUMN IF EXISTS cp_a_date;

-- Ajouter les nouvelles colonnes spécifiques à DGCL (V1)
ALTER TABLE main.subvention
ADD COLUMN date_debut_convention_dgcl DATE,
ADD COLUMN date_debut_financement_dgcl DATE,
ADD COLUMN date_fin_convention_dgcl DATE,
ADD COLUMN date_fin_financement_dgcl DATE,
ADD COLUMN mois_utilises_periode_financement_dgcl SMALLINT;

-- Ajouter les nouvelles colonnes spécifiques à DITP (V2)
ALTER TABLE main.subvention
ADD COLUMN date_debut_convention_ditp DATE,
ADD COLUMN date_debut_financement_ditp DATE,
ADD COLUMN date_fin_convention_ditp DATE,
ADD COLUMN date_fin_financement_ditp DATE,
ADD COLUMN mois_utilises_periode_financement_ditp SMALLINT;

-- Ajouter les nouvelles colonnes spécifiques à DGE (V2)
ALTER TABLE main.subvention
ADD COLUMN date_debut_convention_dge DATE,
ADD COLUMN date_debut_financement_dge DATE,
ADD COLUMN date_fin_convention_dge DATE,
ADD COLUMN date_fin_financement_dge DATE,
ADD COLUMN mois_utilises_periode_financement_dge SMALLINT;

-- Ajouter les colonnes de montants V1
ALTER TABLE main.subvention
ADD COLUMN montant_subvention_v1 BIGINT,
ADD COLUMN montant_versement_v1 BIGINT,
ADD COLUMN montant_avoir_v1 BIGINT;

-- Ajouter les colonnes de montants V2
ALTER TABLE main.subvention
ADD COLUMN montant_bonification_v2 BIGINT,
ADD COLUMN montant_subvention_v2 BIGINT,
ADD COLUMN montant_avoir_v2 BIGINT;

-- Ajouter les colonnes de versements V2
ALTER TABLE main.subvention
ADD COLUMN versement_1_v2 BIGINT,
ADD COLUMN versement_2_v2 BIGINT,
ADD COLUMN versement_3_v2 BIGINT,
ADD COLUMN date_versement_1_v2 DATE,
ADD COLUMN date_versement_2_v2 DATE,
ADD COLUMN date_versement_3_v2 DATE;

-- Ajouter un commentaire sur la table
COMMENT ON TABLE main.subvention IS 'Table des subventions par poste. Une ligne par poste avec colonnes spécifiques pour DGCL (V1), DITP (V2) et DGE (V2). Synchronisée avec Dataspace.';
