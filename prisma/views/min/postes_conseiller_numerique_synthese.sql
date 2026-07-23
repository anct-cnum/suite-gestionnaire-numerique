WITH poste_par_structure AS (
  SELECT
    DISTINCT ON (p.poste_conum_id, p.structure_id) p.id,
    p.poste_conum_id,
    p.structure_id,
    p.personne_id,
    p.etat,
    p.typologie
  FROM
    (
      main.poste p
      LEFT JOIN main.contrat c ON (
        (
          (c.personne_id = p.personne_id)
          AND (c.structure_id = p.structure_id)
          AND (c.date_rupture IS NULL)
        )
      )
    )
  ORDER BY
    p.poste_conum_id,
    p.structure_id,
    (c.id IS NOT NULL) DESC,
    p.date_attribution DESC NULLS LAST,
    p.created_at DESC
),
contrats_en_cours_par_poste AS (
  SELECT
    pp_1.poste_conum_id,
    pp_1.structure_id,
    count(DISTINCT c.id) AS nb_contrats_en_cours
  FROM
    (
      poste_par_structure pp_1
      JOIN main.contrat c ON (
        (
          (c.personne_id = pp_1.personne_id)
          AND (c.structure_id = pp_1.structure_id)
        )
      )
    )
  WHERE
    (c.date_rupture IS NULL)
  GROUP BY
    pp_1.poste_conum_id,
    pp_1.structure_id
),
subventions_par_enveloppe AS (
  SELECT
    p.poste_conum_id,
    p.structure_id,
    CASE
      WHEN (
        (s.montant_subvention_v1 IS NOT NULL)
        AND (s.montant_subvention_v2 IS NOT NULL)
      ) THEN 'V1, V2' :: text
      WHEN (s.montant_subvention_v1 IS NOT NULL) THEN 'V1' :: text
      WHEN (s.montant_subvention_v2 IS NOT NULL) THEN 'V2' :: text
      ELSE NULL :: text
    END AS enveloppes,
    GREATEST(
      s.date_fin_convention_dgcl,
      s.date_fin_convention_ditp,
      s.date_fin_convention_dge
    ) AS date_fin_convention,
    (
      COALESCE(s.montant_bonification_v2, (0) :: bigint) > 0
    ) AS is_territoire_prioritaire,
    COALESCE(s.montant_subvention_v1, (0) :: bigint) AS montant_subvention_v1,
    0 AS montant_bonification_v1,
    (
      COALESCE(s.montant_subvention_v2, (0) :: bigint) - COALESCE(s.montant_bonification_v2, (0) :: bigint)
    ) AS montant_subvention_v2,
    COALESCE(s.montant_bonification_v2, (0) :: bigint) AS montant_bonification_v2,
    (
      COALESCE(s.montant_subvention_v1, (0) :: bigint) + COALESCE(s.montant_subvention_v2, (0) :: bigint)
    ) AS montant_subvention_cumule
  FROM
    (
      main.subvention s
      JOIN main.poste p ON ((p.id = s.poste_id))
    )
),
versements_cumules AS (
  SELECT
    p.poste_conum_id,
    p.structure_id,
    (
      (
        (
          COALESCE(s.montant_versement_v1, (0) :: bigint) + COALESCE(s.versement_1_v2, (0) :: bigint)
        ) + COALESCE(s.versement_2_v2, (0) :: bigint)
      ) + COALESCE(s.versement_3_v2, (0) :: bigint)
    ) AS montant_versement_cumule,
    COALESCE(s.montant_versement_v1, (0) :: bigint) AS versement_cumule_v1,
    (
      (
        COALESCE(s.versement_1_v2, (0) :: bigint) + COALESCE(s.versement_2_v2, (0) :: bigint)
      ) + COALESCE(s.versement_3_v2, (0) :: bigint)
    ) AS versement_cumule_v2
  FROM
    (
      main.subvention s
      JOIN main.poste p ON ((p.id = s.poste_id))
    )
),
dernier_contrat AS (
  SELECT
    DISTINCT ON (pp_1.poste_conum_id, pp_1.structure_id) pp_1.poste_conum_id,
    pp_1.structure_id,
    c.date_fin
  FROM
    (
      poste_par_structure pp_1
      JOIN main.contrat c ON (
        (
          (c.personne_id = pp_1.personne_id)
          AND (c.structure_id = pp_1.structure_id)
        )
      )
    )
  ORDER BY
    pp_1.poste_conum_id,
    pp_1.structure_id,
    c.date_fin DESC NULLS LAST
)
SELECT
  pp.poste_conum_id,
  pp.id AS poste_id,
  pp.structure_id,
  pp.personne_id,
  pp.etat,
  pp.typologie,
  ((pp.typologie) :: text = 'coordo' :: text) AS est_coordinateur,
  sc.enveloppes,
  sc.date_fin_convention,
  dc.date_fin AS date_fin_contrat,
  COALESCE(sc.is_territoire_prioritaire, false) AS bonification,
  COALESCE(sc.montant_subvention_cumule, (0) :: bigint) AS montant_subvention_cumule,
  COALESCE(vc.montant_versement_cumule, (0) :: bigint) AS montant_versement_cumule,
  COALESCE(sc.montant_subvention_v1, (0) :: bigint) AS subvention_v1,
  COALESCE(sc.montant_bonification_v1, 0) AS bonification_v1,
  COALESCE(vc.versement_cumule_v1, (0) :: bigint) AS versement_cumule_v1,
  COALESCE(sc.montant_subvention_v2, (0) :: bigint) AS subvention_v2,
  COALESCE(sc.montant_bonification_v2, (0) :: bigint) AS bonification_v2,
  COALESCE(vc.versement_cumule_v2, (0) :: bigint) AS versement_cumule_v2,
  COALESCE(cc.nb_contrats_en_cours, (0) :: bigint) AS nb_contrats_en_cours
FROM
  (
    (
      (
        (
          poste_par_structure pp
          LEFT JOIN subventions_par_enveloppe sc ON (
            (
              (sc.poste_conum_id = pp.poste_conum_id)
              AND (sc.structure_id = pp.structure_id)
            )
          )
        )
        LEFT JOIN versements_cumules vc ON (
          (
            (vc.poste_conum_id = pp.poste_conum_id)
            AND (vc.structure_id = pp.structure_id)
          )
        )
      )
      LEFT JOIN dernier_contrat dc ON (
        (
          (dc.poste_conum_id = pp.poste_conum_id)
          AND (dc.structure_id = pp.structure_id)
        )
      )
    )
    LEFT JOIN contrats_en_cours_par_poste cc ON (
      (
        (cc.poste_conum_id = pp.poste_conum_id)
        AND (cc.structure_id = pp.structure_id)
      )
    )
  );