WITH personne_avec_status AS (
  SELECT
    p.id,
    p.prenom,
    p.nom,
    p.contact,
    p.aidant_connect_id,
    p.conseiller_numerique_id,
    p.cn_pg_id,
    p.coop_id,
    p.is_coordinateur,
    p.is_mediateur,
    p.formation_fne_ac,
    p.profession_ac,
    p.nb_accompagnements_ac,
    p.created_at,
    p.updated_at,
    p.edited_by,
    p.deleted_at,
    p.deleted_by,
    CASE
      WHEN (p.is_mediateur = TRUE) THEN 'mediateur' :: text
      WHEN (
        (p.is_mediateur = false)
        OR (p.is_mediateur IS NULL)
      ) THEN 'aidant_numerique' :: text
      ELSE NULL :: text
    END AS type_accompagnateur,
    (
      EXISTS (
        SELECT
          1
        FROM
          main.personne_affectations pa
        WHERE
          (
            (pa.personne_id = p.id)
            AND ((pa.source) :: text = 'aidants-connect' :: text)
            AND (pa.est_active = TRUE)
            AND ((pa.type) :: text = 'structure_emploi' :: text)
          )
      )
    ) AS labellisation_aidant_connect,
    CASE
      WHEN (
        (p.is_mediateur = TRUE)
        AND (
          EXISTS (
            SELECT
              1
            FROM
              main.personne_affectations pa
            WHERE
              (
                (pa.personne_id = p.id)
                AND ((pa.type) :: text = 'structure_emploi' :: text)
                AND (pa.est_active = TRUE)
                AND (
                  (pa.source) :: text = ANY (
                    ARRAY [('idposte'::character varying)::text, ('coop'::character varying)::text]
                  )
                )
              )
          )
        )
      ) THEN TRUE
      ELSE false
    END AS est_actuellement_mediateur_en_poste,
    CASE
      WHEN (
        (
          (p.is_mediateur = false)
          OR (p.is_mediateur IS NULL)
        )
        AND (
          EXISTS (
            SELECT
              1
            FROM
              main.personne_affectations pa
            WHERE
              (
                (pa.personne_id = p.id)
                AND ((pa.source) :: text = 'aidants-connect' :: text)
                AND (pa.est_active = TRUE)
                AND ((pa.type) :: text = 'structure_emploi' :: text)
              )
          )
        )
      ) THEN TRUE
      ELSE false
    END AS est_actuellement_aidant_numerique_en_poste
  FROM
    main.personne p
)
SELECT
  id,
  prenom,
  nom,
  contact,
  aidant_connect_id,
  conseiller_numerique_id,
  cn_pg_id,
  coop_id,
  is_coordinateur,
  is_mediateur,
  formation_fne_ac,
  profession_ac,
  nb_accompagnements_ac,
  created_at,
  updated_at,
  edited_by,
  deleted_at,
  deleted_by,
  type_accompagnateur,
  labellisation_aidant_connect,
  est_actuellement_mediateur_en_poste,
  est_actuellement_aidant_numerique_en_poste,
  CASE
    WHEN (
      EXISTS (
        SELECT
          1
        FROM
          main.personne_affectations pa
        WHERE
          (
            (pa.personne_id = personne_avec_status.id)
            AND ((pa.source) :: text = 'idposte' :: text)
            AND (pa.est_active = TRUE)
            AND ((pa.type) :: text = 'structure_emploi' :: text)
          )
      )
    ) THEN TRUE
    ELSE false
  END AS est_actuellement_conseiller_numerique,
  CASE
    WHEN (
      (is_coordinateur = TRUE)
      AND (
        (est_actuellement_mediateur_en_poste = TRUE)
        OR (
          est_actuellement_aidant_numerique_en_poste = TRUE
        )
      )
    ) THEN TRUE
    ELSE false
  END AS est_actuellement_coordo_actif,
  (
    SELECT
      pa.structure_id
    FROM
      main.personne_affectations pa
    WHERE
      (
        (pa.personne_id = personne_avec_status.id)
        AND ((pa.type) :: text = 'structure_emploi' :: text)
        AND (pa.est_active = TRUE)
      )
    ORDER BY
      pa.structure_id
    LIMIT
      1
  ) AS structure_employeuse_id
FROM
  personne_avec_status;