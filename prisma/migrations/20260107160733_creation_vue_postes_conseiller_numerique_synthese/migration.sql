-- Vue de synthèse des postes Conseiller Numérique
-- Il existe une documentation technique dans le fichier docs/postes-conseiller-numerique.md qui décrit la vue et les données en base.
-- Cette vue agrège les données des postes et subventions avec la logique métier suivante :
-- - Une ligne par tuple (poste_conum_id, structure_id) pour gérer les transferts de poste
-- - Pour chaque tuple, sélection de l'occupant actuel (priorité au contrat actif)
-- - Subventions jointes via main.poste pour résoudre poste_id → (poste_conum_id, structure_id)
-- - Détail par enveloppe : subvention, bonification, versement
-- - Nombre de contrats de travail en cours pour la personne sélectionnée

DROP VIEW IF EXISTS min.postes_conseiller_numerique_synthese;

CREATE VIEW min.postes_conseiller_numerique_synthese AS
WITH poste_par_structure AS (
  -- Pour chaque tuple (poste_conum_id, structure_id), sélectionner l'occupant actuel
  -- Priorité : personne avec contrat actif > date_attribution récente > created_at récent
  SELECT DISTINCT ON (p.poste_conum_id, p.structure_id)
    p.id,
    p.poste_conum_id,
    p.structure_id,
    p.personne_id,
    p.etat,
    p.typologie
  FROM main.poste p
  LEFT JOIN main.contrat c
    ON c.personne_id = p.personne_id
    AND c.structure_id = p.structure_id
    AND c.date_rupture IS NULL
  ORDER BY p.poste_conum_id, p.structure_id,
    (c.id IS NOT NULL) DESC,            -- priorité au contrat actif
    p.date_attribution DESC NULLS LAST,  -- puis date d'attribution la plus récente
    p.created_at DESC                    -- fallback
),
contrats_en_cours_par_poste AS (
  -- Pour chaque tuple (poste_conum_id, structure_id), compter les contrats de travail en cours
  -- de la personne sélectionnée dans poste_par_structure
  SELECT
    pp.poste_conum_id,
    pp.structure_id,
    COUNT(DISTINCT c.id) AS nb_contrats_en_cours
  FROM poste_par_structure pp
  JOIN main.contrat c
    ON c.personne_id = pp.personne_id AND c.structure_id = pp.structure_id
  WHERE c.date_rupture IS NULL
  GROUP BY pp.poste_conum_id, pp.structure_id
),
subventions_par_enveloppe AS (
  -- Avec le nouveau modèle, il y a une seule ligne par poste avec toutes les données
  -- On calcule les totaux par enveloppe (V1 = DGCL, V2 = DITP + DGE)
  -- On joint via main.poste pour résoudre poste_id → (poste_conum_id, structure_id)
  -- car la subvention peut être liée à un main.poste.id différent de celui sélectionné
  -- dans poste_par_structure (personne historique vs occupant actuel)
  SELECT
    p.poste_conum_id,
    p.structure_id,
    -- Déterminer quelles enveloppes sont présentes
    CASE
      WHEN s.montant_subvention_v1 IS NOT NULL AND s.montant_subvention_v2 IS NOT NULL THEN 'V1, V2'
      WHEN s.montant_subvention_v1 IS NOT NULL THEN 'V1'
      WHEN s.montant_subvention_v2 IS NOT NULL THEN 'V2'
      ELSE NULL
    END as enveloppes,
    -- Date fin convention : prendre la plus tardive parmi toutes les sources
    GREATEST(
      s.date_fin_convention_dgcl,
      s.date_fin_convention_ditp,
      s.date_fin_convention_dge
    ) as date_fin_convention,
    -- Territoire prioritaire : déductible de la bonification V2
    COALESCE(s.montant_bonification_v2, 0) > 0 as is_territoire_prioritaire,
    -- Montants par enveloppe
    COALESCE(s.montant_subvention_v1, 0) as montant_subvention_v1,
    0 as montant_bonification_v1,  -- Pas de bonification en V1
    -- montant_subvention_v2 dans la table contient le TOTAL, on soustrait les bonifications pour exposer la base
    COALESCE(s.montant_subvention_v2, 0) - COALESCE(s.montant_bonification_v2, 0) as montant_subvention_v2,
    COALESCE(s.montant_bonification_v2, 0) as montant_bonification_v2,
    -- Total cumulé (subvention_v2 contient déjà les bonifications, donc on ne les ajoute pas)
    COALESCE(s.montant_subvention_v1, 0) + COALESCE(s.montant_subvention_v2, 0) as montant_subvention_cumule
  FROM main.subvention s
  JOIN main.poste p ON p.id = s.poste_id
),
versements_cumules AS (
  -- Cumuler les versements par enveloppe
  -- Même logique : joindre via main.poste pour résoudre vers (poste_conum_id, structure_id)
  SELECT
    p.poste_conum_id,
    p.structure_id,
    -- Total cumulé
    COALESCE(s.montant_versement_v1, 0) +
    COALESCE(s.versement_1_v2, 0) + COALESCE(s.versement_2_v2, 0) + COALESCE(s.versement_3_v2, 0) as montant_versement_cumule,
    -- Détail V1
    COALESCE(s.montant_versement_v1, 0) as versement_cumule_v1,
    -- Détail V2
    COALESCE(s.versement_1_v2, 0) + COALESCE(s.versement_2_v2, 0) + COALESCE(s.versement_3_v2, 0) as versement_cumule_v2
  FROM main.subvention s
  JOIN main.poste p ON p.id = s.poste_id
),
dernier_contrat AS (
  -- Dernier contrat de la personne sélectionnée dans poste_par_structure
  SELECT DISTINCT ON (pp.poste_conum_id, pp.structure_id)
    pp.poste_conum_id,
    pp.structure_id,
    c.date_fin
  FROM poste_par_structure pp
  JOIN main.contrat c
    ON c.personne_id = pp.personne_id AND c.structure_id = pp.structure_id
  ORDER BY pp.poste_conum_id, pp.structure_id, c.date_fin DESC NULLS LAST
)
SELECT
  pp.poste_conum_id,
  pp.id as poste_id,
  pp.structure_id,
  pp.personne_id,
  pp.etat,
  pp.typologie,
  pp.typologie = 'coordo' as est_coordinateur,
  sc.enveloppes,
  sc.date_fin_convention,
  dc.date_fin as date_fin_contrat,
  COALESCE(sc.is_territoire_prioritaire, false) as bonification,
  -- Totaux
  COALESCE(sc.montant_subvention_cumule, 0) as montant_subvention_cumule,
  COALESCE(vc.montant_versement_cumule, 0) as montant_versement_cumule,
  -- Détail V1
  COALESCE(sc.montant_subvention_v1, 0) as subvention_v1,
  COALESCE(sc.montant_bonification_v1, 0) as bonification_v1,
  COALESCE(vc.versement_cumule_v1, 0) as versement_cumule_v1,
  -- Détail V2
  COALESCE(sc.montant_subvention_v2, 0) as subvention_v2,
  COALESCE(sc.montant_bonification_v2, 0) as bonification_v2,
  COALESCE(vc.versement_cumule_v2, 0) as versement_cumule_v2,
  -- Indicateur
  COALESCE(cc.nb_contrats_en_cours, 0) as nb_contrats_en_cours
FROM poste_par_structure pp
LEFT JOIN subventions_par_enveloppe sc ON sc.poste_conum_id = pp.poste_conum_id AND sc.structure_id = pp.structure_id
LEFT JOIN versements_cumules vc ON vc.poste_conum_id = pp.poste_conum_id AND vc.structure_id = pp.structure_id
LEFT JOIN dernier_contrat dc ON dc.poste_conum_id = pp.poste_conum_id AND dc.structure_id = pp.structure_id
LEFT JOIN contrats_en_cours_par_poste cc ON cc.poste_conum_id = pp.poste_conum_id AND cc.structure_id = pp.structure_id;

COMMENT ON VIEW min.postes_conseiller_numerique_synthese IS 'Vue de synthèse des postes Conseiller Numérique avec subventions V1/V2. Une ligne par tuple (poste_conum_id, structure_id).';
