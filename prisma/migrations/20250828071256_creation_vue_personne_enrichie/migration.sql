-- Supprimer la vue existante si elle existe
DROP VIEW IF EXISTS min.personne_enrichie;

-- Créer la nouvelle vue
CREATE VIEW min.personne_enrichie AS
SELECT 
  p.*,
  
  -- Type d'accompagnateur (médiateur ou aidant numérique exclusif)
  CASE 
    WHEN p.is_mediateur = true THEN 'mediateur'
    WHEN p.is_mediateur = false OR p.is_mediateur IS NULL THEN 'aidant_numerique'
  END AS type_accompagnateur,
  
  -- Labellisation aidant connect (un médiateur peut être labellisé AC)
  p.is_active_ac AS labellisation_aidant_connect,
  
  -- Est actuellement en poste en tant que médiateur
  CASE
    WHEN p.is_mediateur = true 
      AND EXISTS (
        SELECT 1 FROM main.personne_affectations pa
        WHERE pa.personne_id = p.id 
        AND pa.type = 'structure_emploi'
        AND pa.suppression IS NULL
      )
    THEN true
    ELSE false
  END AS est_actuellement_mediateur_en_poste,
  
  -- Est actuellement en poste en tant qu'aidant numérique exclusif
  CASE
    WHEN (p.is_mediateur = false OR p.is_mediateur IS NULL) 
      AND p.is_active_ac = true
    THEN true
    ELSE false
  END AS est_actuellement_aidant_numerique_en_poste,
  
  -- Est actuellement conseiller numérique (médiateur avec financement état)
  CASE
    WHEN p.is_mediateur = true
      AND (p.conseiller_numerique_id IS NOT NULL OR p.cn_pg_id IS NOT NULL)
      AND EXISTS (
        SELECT 1 FROM main.personne_affectations pa
        WHERE pa.personne_id = p.id 
        AND pa.type = 'structure_emploi'
        AND pa.suppression IS NULL
      )
    THEN true
    ELSE false
  END AS est_actuellement_conseiller_numerique,
  
  -- Est actuellement coordinateur actif
  CASE
    WHEN p.is_coordinateur = true
      AND (
        -- Soit médiateur en poste
        (p.is_mediateur = true AND EXISTS (
          SELECT 1 FROM main.personne_affectations pa
          WHERE pa.personne_id = p.id 
          AND pa.type = 'structure_emploi'
          AND pa.suppression IS NULL
        ))
        -- Soit aidant numérique exclusif actif
        OR ((p.is_mediateur = false OR p.is_mediateur IS NULL) AND p.is_active_ac = true)
      )
    THEN true
    ELSE false
  END AS est_actuellement_coordo_actif

FROM main.personne p;