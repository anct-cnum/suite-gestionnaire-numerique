-- Supprimer la vue existante
DROP VIEW IF EXISTS min.personne_enrichie;

-- Recréer la vue avec structure_employeuse_id au lieu de id_adresse_employeuse et departement_employeur
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
    EXISTS (
      SELECT 1 FROM main.personne_affectations pa
      WHERE pa.personne_id = p.id
        AND pa.source = 'aidants-connect'
        AND pa.est_active = TRUE
        AND pa.type = 'structure_emploi'
    ) AS labellisation_aidant_connect,

    -- Est actuellement en poste en tant que médiateur (idposte ou coop actif)
    CASE
      WHEN p.is_mediateur = true
        AND EXISTS (
          SELECT 1 FROM main.personne_affectations pa
          WHERE pa.personne_id = p.id
            AND pa.type = 'structure_emploi'
            AND pa.est_active = TRUE
            AND pa.source IN ('idposte', 'coop')
        )
        THEN true
      ELSE false
      END AS est_actuellement_mediateur_en_poste,

    -- Est actuellement en poste en tant qu'aidant numérique exclusif
    CASE
      WHEN (p.is_mediateur = false OR p.is_mediateur IS NULL)
        AND EXISTS (
          SELECT 1 FROM main.personne_affectations pa
          WHERE pa.personne_id = p.id
            AND pa.source = 'aidants-connect'
            AND pa.est_active = TRUE
            AND pa.type = 'structure_emploi'
        )
        THEN true
      ELSE false
      END AS est_actuellement_aidant_numerique_en_poste

  FROM main.personne p
)
SELECT
  *,
  -- Est actuellement conseiller numérique (affectation idposte active)
  CASE
    WHEN EXISTS (
      SELECT 1 FROM main.personne_affectations pa
      WHERE pa.personne_id = personne_avec_status.id
        AND pa.source = 'idposte'
        AND pa.est_active = TRUE
        AND pa.type = 'structure_emploi'
    )
      THEN true
    ELSE false
    END AS est_actuellement_conseiller_numerique,

  -- Est actuellement coordinateur actif
  CASE
    WHEN is_coordinateur = true
      AND (est_actuellement_mediateur_en_poste = true OR est_actuellement_aidant_numerique_en_poste = true)
    THEN true
    ELSE false
  END AS est_actuellement_coordo_actif,

  -- ID de la structure employeuse (depuis personne_affectations)
  (
    SELECT pa.structure_id
    FROM main.personne_affectations pa
    WHERE pa.personne_id = personne_avec_status.id
      AND pa.type = 'structure_emploi'
      AND pa.est_active = TRUE
    ORDER BY pa.structure_id ASC
           LIMIT 1
  ) AS structure_employeuse_id

FROM personne_avec_status;
