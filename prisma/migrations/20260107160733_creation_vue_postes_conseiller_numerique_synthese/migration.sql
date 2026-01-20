-- Création de la vue de synthèse des postes Conseiller Numérique
-- Il existe une documentation technique dans le fichier docs/postes-conseiller-numerique.md qui décrit la vue et les données en base.
-- Cette vue agrège les données des postes et subventions avec la logique métier suivante :
-- - Une ligne par tuple (poste_conum_id, structure_id) pour gérer les transferts de poste
-- - Pour chaque tuple, sélection de la ligne la plus récente (created_at DESC)
-- - Cumul des subventions par enveloppe de financement (V1=DGCL, V2=DGE/DITP) sans doublon intra-enveloppe
-- - Détail par enveloppe : subvention, bonification, versement
-- - Nombre de contrats de travail en cours pour les personnes associées au poste
-- Note : subvention.poste_id correspond à poste.id (la clé technique)

DROP VIEW IF EXISTS min.postes_conseiller_numerique_synthese;

CREATE VIEW min.postes_conseiller_numerique_synthese AS
WITH poste_par_structure AS (
  -- Pour chaque tuple (poste_conum_id, structure_id), sélectionner la ligne la plus récente
  -- Cela permet d'avoir plusieurs lignes si un poste a été transféré entre structures
  SELECT DISTINCT ON (p.poste_conum_id, p.structure_id)
    p.id,
    p.poste_conum_id,
    p.structure_id,
    p.personne_id,
    p.etat,
    p.typologie
  FROM main.poste p
  ORDER BY p.poste_conum_id, p.structure_id, p.created_at DESC
),
contrats_en_cours_par_poste AS (
  -- Pour chaque tuple (poste_conum_id, structure_id), compter les contrats de travail en cours
  -- Un contrat est en cours si : date_debut <= aujourd'hui, date_fin >= aujourd'hui (ou null), date_rupture IS NULL
  SELECT
    p.poste_conum_id,
    p.structure_id,
    COUNT(DISTINCT c.id) as nb_contrats_en_cours
  FROM main.poste p
  INNER JOIN main.contrat c ON c.personne_id = p.personne_id AND c.structure_id = p.structure_id
  WHERE c.date_debut <= CURRENT_DATE
    AND (c.date_fin IS NULL OR c.date_fin >= CURRENT_DATE)
    AND c.date_rupture IS NULL
  GROUP BY p.poste_conum_id, p.structure_id
),
subventions_par_enveloppe AS (
  -- Pour chaque poste et enveloppe, prendre UN SEUL montant (pas de cumul intra-enveloppe)
  -- Enveloppe V1 = DGCL (Initial - Plan France Relance)
  -- Enveloppe V2 = DGE ou DITP (Renouvellement)
  -- Note : s.poste_id = poste.id
  SELECT DISTINCT ON (s.poste_id, CASE WHEN s.source_financement = 'DGCL' THEN 'V1' ELSE 'V2' END)
    s.poste_id,
    CASE WHEN s.source_financement = 'DGCL' THEN 'V1' ELSE 'V2' END as enveloppe,
    s.source_financement,
    s.date_fin_convention,
    s.is_territoire_prioritaire,
    COALESCE(s.montant_subvention, 0) as montant_subvention,
    COALESCE(s.montant_bonification, 0) as montant_bonification
  FROM main.subvention s
  ORDER BY s.poste_id,
           CASE WHEN s.source_financement = 'DGCL' THEN 'V1' ELSE 'V2' END,
           s.date_fin_convention DESC NULLS LAST
),
subventions_cumulees AS (
  -- Agréger les montants par poste avec détail par enveloppe (pivot V1/V2)
  SELECT
    poste_id,
    array_to_string(array_agg(DISTINCT enveloppe ORDER BY enveloppe), ', ') as enveloppes,
    MAX(date_fin_convention) as date_fin_convention,
    BOOL_OR(COALESCE(is_territoire_prioritaire, false)) as is_territoire_prioritaire,
    SUM(montant_subvention + montant_bonification) as montant_subvention_cumule,
    -- Détail V1
    COALESCE(SUM(montant_subvention) FILTER (WHERE enveloppe = 'V1'), 0) as subvention_v1,
    COALESCE(SUM(montant_bonification) FILTER (WHERE enveloppe = 'V1'), 0) as bonification_v1,
    -- Détail V2
    COALESCE(SUM(montant_subvention) FILTER (WHERE enveloppe = 'V2'), 0) as subvention_v2,
    COALESCE(SUM(montant_bonification) FILTER (WHERE enveloppe = 'V2'), 0) as bonification_v2
  FROM subventions_par_enveloppe
  GROUP BY poste_id
),
versements_cumules AS (
  -- Cumuler les versements par enveloppe (V1/V2)
  -- Note : s.poste_id = poste.id
  SELECT
    poste_id,
    SUM(COALESCE(versement_1, 0) + COALESCE(versement_2, 0) + COALESCE(versement_3, 0)) as montant_versement_cumule,
    -- Détail V1 (DGCL)
    COALESCE(SUM(COALESCE(versement_1, 0) + COALESCE(versement_2, 0) + COALESCE(versement_3, 0))
      FILTER (WHERE source_financement = 'DGCL'), 0) as versement_cumule_v1,
    -- Détail V2 (DGE, DITP)
    COALESCE(SUM(COALESCE(versement_1, 0) + COALESCE(versement_2, 0) + COALESCE(versement_3, 0))
      FILTER (WHERE source_financement IN ('DGE', 'DITP')), 0) as versement_cumule_v2
  FROM main.subvention
  GROUP BY poste_id
),
dernier_contrat AS (
  -- Dernier contrat par personne et structure
  SELECT DISTINCT ON (c.personne_id, c.structure_id)
    c.personne_id,
    c.structure_id,
    c.date_fin
  FROM main.contrat c
  ORDER BY c.personne_id, c.structure_id, c.date_fin DESC NULLS LAST
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
  COALESCE(sc.subvention_v1, 0) as subvention_v1,
  COALESCE(sc.bonification_v1, 0) as bonification_v1,
  COALESCE(vc.versement_cumule_v1, 0) as versement_cumule_v1,
  -- Détail V2
  COALESCE(sc.subvention_v2, 0) as subvention_v2,
  COALESCE(sc.bonification_v2, 0) as bonification_v2,
  COALESCE(vc.versement_cumule_v2, 0) as versement_cumule_v2,
  -- Indicateur
  COALESCE(cc.nb_contrats_en_cours, 0) as nb_contrats_en_cours
FROM poste_par_structure pp
LEFT JOIN subventions_cumulees sc ON sc.poste_id = pp.id
LEFT JOIN versements_cumules vc ON vc.poste_id = pp.id
LEFT JOIN dernier_contrat dc ON dc.personne_id = pp.personne_id AND dc.structure_id = pp.structure_id
LEFT JOIN contrats_en_cours_par_poste cc ON cc.poste_conum_id = pp.poste_conum_id AND cc.structure_id = pp.structure_id;
