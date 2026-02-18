WITH poste_par_structure AS (
  SELECT
    DISTINCT ON (p.poste_conum_id, p.structure_id) p.id,
    p.poste_conum_id,
    p.structure_id,
    p.personne_id,
    p.etat,
    p.typologie
  FROM
    main.poste p
  ORDER BY
    p.poste_conum_id,
    p.structure_id,
    p.created_at DESC
),
contrats_en_cours_par_poste AS (
  SELECT
    p.poste_conum_id,
    p.structure_id,
    count(DISTINCT c.id) AS nb_contrats_en_cours
  FROM
    (
      main.poste p
      JOIN main.contrat c ON (
        (
          (c.personne_id = p.personne_id)
          AND (c.structure_id = p.structure_id)
        )
      )
    )
  WHERE
    (c.date_rupture IS NULL)
  GROUP BY
    p.poste_conum_id,
    p.structure_id
),
subventions_par_enveloppe AS (
  SELECT
    DISTINCT ON (
      p.poste_conum_id,
      p.structure_id,
      CASE
        WHEN ((s.source_financement) :: text = 'DGCL' :: text) THEN 'V1' :: text
        ELSE 'V2' :: text
      END
    ) p.poste_conum_id,
    p.structure_id,
    CASE
      WHEN ((s.source_financement) :: text = 'DGCL' :: text) THEN 'V1' :: text
      ELSE 'V2' :: text
    END AS enveloppe,
    s.source_financement,
    s.date_fin_convention,
    s.is_territoire_prioritaire,
    COALESCE(s.montant_subvention, (0) :: bigint) AS montant_subvention,
    COALESCE(s.montant_bonification, (0) :: bigint) AS montant_bonification
  FROM
    (
      main.subvention s
      JOIN main.poste p ON ((p.id = s.poste_id))
    )
  ORDER BY
    p.poste_conum_id,
    p.structure_id,
    CASE
      WHEN ((s.source_financement) :: text = 'DGCL' :: text) THEN 'V1' :: text
      ELSE 'V2' :: text
    END,
    s.date_fin_convention DESC NULLS LAST
),
subventions_cumulees AS (
  SELECT
    subventions_par_enveloppe.poste_conum_id,
    subventions_par_enveloppe.structure_id,
    array_to_string(
      array_agg(
        DISTINCT subventions_par_enveloppe.enveloppe
        ORDER BY
          subventions_par_enveloppe.enveloppe
      ),
      ', ' :: text
    ) AS enveloppes,
    max(subventions_par_enveloppe.date_fin_convention) AS date_fin_convention,
    bool_or(
      COALESCE(
        subventions_par_enveloppe.is_territoire_prioritaire,
        false
      )
    ) AS is_territoire_prioritaire,
    sum(
      (
        subventions_par_enveloppe.montant_subvention + subventions_par_enveloppe.montant_bonification
      )
    ) AS montant_subvention_cumule,
    COALESCE(
      sum(subventions_par_enveloppe.montant_subvention) FILTER (
        WHERE
          (subventions_par_enveloppe.enveloppe = 'V1' :: text)
      ),
      (0) :: numeric
    ) AS subvention_v1,
    COALESCE(
      sum(subventions_par_enveloppe.montant_bonification) FILTER (
        WHERE
          (subventions_par_enveloppe.enveloppe = 'V1' :: text)
      ),
      (0) :: numeric
    ) AS bonification_v1,
    COALESCE(
      sum(subventions_par_enveloppe.montant_subvention) FILTER (
        WHERE
          (subventions_par_enveloppe.enveloppe = 'V2' :: text)
      ),
      (0) :: numeric
    ) AS subvention_v2,
    COALESCE(
      sum(subventions_par_enveloppe.montant_bonification) FILTER (
        WHERE
          (subventions_par_enveloppe.enveloppe = 'V2' :: text)
      ),
      (0) :: numeric
    ) AS bonification_v2
  FROM
    subventions_par_enveloppe
  GROUP BY
    subventions_par_enveloppe.poste_conum_id,
    subventions_par_enveloppe.structure_id
),
versements_cumules AS (
  SELECT
    p.poste_conum_id,
    p.structure_id,
    sum(
      (
        (
          COALESCE(s.versement_1, (0) :: bigint) + COALESCE(s.versement_2, (0) :: bigint)
        ) + COALESCE(s.versement_3, (0) :: bigint)
      )
    ) AS montant_versement_cumule,
    COALESCE(
      sum(
        (
          (
            COALESCE(s.versement_1, (0) :: bigint) + COALESCE(s.versement_2, (0) :: bigint)
          ) + COALESCE(s.versement_3, (0) :: bigint)
        )
      ) FILTER (
        WHERE
          ((s.source_financement) :: text = 'DGCL' :: text)
      ),
      (0) :: numeric
    ) AS versement_cumule_v1,
    COALESCE(
      sum(
        (
          (
            COALESCE(s.versement_1, (0) :: bigint) + COALESCE(s.versement_2, (0) :: bigint)
          ) + COALESCE(s.versement_3, (0) :: bigint)
        )
      ) FILTER (
        WHERE
          (
            (s.source_financement) :: text = ANY (
              ARRAY [('DGE'::character varying)::text, ('DITP'::character varying)::text]
            )
          )
      ),
      (0) :: numeric
    ) AS versement_cumule_v2
  FROM
    (
      main.subvention s
      JOIN main.poste p ON ((p.id = s.poste_id))
    )
  GROUP BY
    p.poste_conum_id,
    p.structure_id
),
dernier_contrat AS (
  SELECT
    DISTINCT ON (c.personne_id, c.structure_id) c.personne_id,
    c.structure_id,
    c.date_fin
  FROM
    main.contrat c
  ORDER BY
    c.personne_id,
    c.structure_id,
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
  COALESCE(sc.montant_subvention_cumule, (0) :: numeric) AS montant_subvention_cumule,
  COALESCE(vc.montant_versement_cumule, (0) :: numeric) AS montant_versement_cumule,
  COALESCE(sc.subvention_v1, (0) :: numeric) AS subvention_v1,
  COALESCE(sc.bonification_v1, (0) :: numeric) AS bonification_v1,
  COALESCE(vc.versement_cumule_v1, (0) :: numeric) AS versement_cumule_v1,
  COALESCE(sc.subvention_v2, (0) :: numeric) AS subvention_v2,
  COALESCE(sc.bonification_v2, (0) :: numeric) AS bonification_v2,
  COALESCE(vc.versement_cumule_v2, (0) :: numeric) AS versement_cumule_v2,
  COALESCE(cc.nb_contrats_en_cours, (0) :: bigint) AS nb_contrats_en_cours
FROM
  (
    (
      (
        (
          poste_par_structure pp
          LEFT JOIN subventions_cumulees sc ON (
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
          (dc.personne_id = pp.personne_id)
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