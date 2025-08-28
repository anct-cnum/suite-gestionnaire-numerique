-- Supprimer la vue existante si elle existe
DROP VIEW IF EXISTS min.personne_enrichie;

-- Créer la nouvelle vue
CREATE VIEW min.personne_enrichie AS
SELECT 
  p.*,
  
  -- Type d'accompagnateur (médiateur ou aidant connect exclusif)
  CASE 
    WHEN p.is_mediateur = true THEN 'mediateur'
    WHEN p.is_mediateur = false OR p.is_mediateur IS NULL THEN 'aidant_connect'
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
  
  -- Est actuellement en poste en tant qu'aidant connect exclusif
  CASE
    WHEN (p.is_mediateur = false OR p.is_mediateur IS NULL) 
      AND p.is_active_ac = true
    THEN true
    ELSE false
  END AS est_actuellement_aidant_connect_en_poste,
  
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
        -- Soit aidant connect exclusif actif
        OR ((p.is_mediateur = false OR p.is_mediateur IS NULL) AND p.is_active_ac = true)
      )
    THEN true
    ELSE false
  END AS est_actuellement_coordo_actif

FROM main.personne p;

-- Requête de vérification
SELECT 
  'Total personnes' AS label,
  COUNT(*) AS valeur
FROM min.personne_enrichie
UNION ALL
SELECT 
  'Médiateurs' AS label,
  COUNT(*) FILTER (WHERE type_accompagnateur = 'mediateur') AS valeur
FROM min.personne_enrichie
UNION ALL
SELECT 
  'Aidants connect exclusifs' AS label,
  COUNT(*) FILTER (WHERE type_accompagnateur = 'aidant_connect') AS valeur
FROM min.personne_enrichie
UNION ALL
SELECT 
  'Labellisés aidant connect' AS label,
  COUNT(*) FILTER (WHERE labellisation_aidant_connect = true) AS valeur
FROM min.personne_enrichie
UNION ALL
SELECT 
  'Médiateurs en poste' AS label,
  COUNT(*) FILTER (WHERE est_actuellement_mediateur_en_poste = true) AS valeur
FROM min.personne_enrichie
UNION ALL
SELECT 
  'Aidants connect en poste' AS label,
  COUNT(*) FILTER (WHERE est_actuellement_aidant_connect_en_poste = true) AS valeur
FROM min.personne_enrichie
UNION ALL
SELECT 
  'Conseillers numériques actifs' AS label,
  COUNT(*) FILTER (WHERE est_actuellement_conseiller_numerique = true) AS valeur
FROM min.personne_enrichie
UNION ALL
SELECT 
  'Coordinateurs actifs' AS label,
  COUNT(*) FILTER (WHERE est_actuellement_coordo_actif = true) AS valeur
FROM min.personne_enrichie;