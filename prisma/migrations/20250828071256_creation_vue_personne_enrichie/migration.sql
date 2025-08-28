-- Supprimer la vue existante si elle existe
DROP VIEW IF EXISTS min.personne_enrichie;

-- Créer la nouvelle vue avec CTE pour éviter la duplication de logique
CREATE VIEW min.personne_enrichie AS
WITH personne_avec_status AS (
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
    END AS est_actuellement_aidant_numerique_en_poste
    
  FROM main.personne p
)
SELECT 
  *,
  -- Est actuellement conseiller numérique (médiateur en poste avec financement état)
  CASE
    WHEN type_accompagnateur = 'mediateur'
      AND est_actuellement_mediateur_en_poste = true
      AND (conseiller_numerique_id IS NOT NULL OR cn_pg_id IS NOT NULL)
    THEN true
    ELSE false
  END AS est_actuellement_conseiller_numerique,
  
  -- Est actuellement coordinateur actif (utilise les colonnes déjà calculées)
  CASE
    WHEN is_coordinateur = true 
      AND (est_actuellement_mediateur_en_poste = true OR est_actuellement_aidant_numerique_en_poste = true)
    THEN true
    ELSE false
  END AS est_actuellement_coordo_actif,
  
  -- Département de l'employeur (basé sur le type)
  CASE
    -- Pour un médiateur, prendre le département de la structure dans personne_affectations
    WHEN type_accompagnateur = 'mediateur' THEN (
      SELECT a.departement
      FROM main.personne_affectations pa
      JOIN main.structure s ON s.id = pa.structure_id
      LEFT JOIN main.adresse a ON a.id = s.adresse_id
      WHERE pa.personne_id = personne_avec_status.id 
      AND pa.type = 'structure_emploi'
      AND pa.suppression IS NULL
      LIMIT 1
    )
    -- Pour un aidant numérique, prendre le département de la structure directe
    WHEN type_accompagnateur = 'aidant_numerique' AND personne_avec_status.structure_id IS NOT NULL THEN (
      SELECT a.departement
      FROM main.structure s
      LEFT JOIN main.adresse a ON a.id = s.adresse_id
      WHERE s.id = personne_avec_status.structure_id
    )
    ELSE NULL
  END AS departement_employeur
FROM personne_avec_status;