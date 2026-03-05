-- Adaptation de la vue de synthèse des postes Conseiller Numérique
-- Suite à la refonte de la table subvention (V048)
--
-- Changements principaux :
-- - Plus de source_financement (données directement dans colonnes spécifiques)
-- - Plus de is_territoire_prioritaire (déductible de montant_bonification_v2)
-- - Nouvelles colonnes avec suffixes _v1, _v2, _dgcl, _ditp, _dge

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
  -- Un contrat est en cours si date_rupture IS NULL (même logique que le tableau de pilotage CoNum)
  SELECT
    p.poste_conum_id,
    p.structure_id,
    COUNT(DISTINCT c.id) as nb_contrats_en_cours
  FROM main.poste p
  INNER JOIN main.contrat c ON c.personne_id = p.personne_id AND c.structure_id = p.structure_id
  WHERE c.date_rupture IS NULL
  GROUP BY p.poste_conum_id, p.structure_id
),
subventions_par_enveloppe AS (
  -- Avec le nouveau modèle, il y a une seule ligne par poste avec toutes les données
  -- On calcule les totaux par enveloppe (V1 = DGCL, V2 = DITP + DGE)
  SELECT
    s.poste_id,
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
),
versements_cumules AS (
  -- Cumuler les versements par enveloppe
  SELECT
    s.poste_id,
    -- Total cumulé
    COALESCE(s.montant_versement_v1, 0) +
    COALESCE(s.versement_1_v2, 0) + COALESCE(s.versement_2_v2, 0) + COALESCE(s.versement_3_v2, 0) as montant_versement_cumule,
    -- Détail V1
    COALESCE(s.montant_versement_v1, 0) as versement_cumule_v1,
    -- Détail V2
    COALESCE(s.versement_1_v2, 0) + COALESCE(s.versement_2_v2, 0) + COALESCE(s.versement_3_v2, 0) as versement_cumule_v2
  FROM main.subvention s
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
LEFT JOIN subventions_par_enveloppe sc ON sc.poste_id = pp.id
LEFT JOIN versements_cumules vc ON vc.poste_id = pp.id
LEFT JOIN dernier_contrat dc ON dc.personne_id = pp.personne_id AND dc.structure_id = pp.structure_id
LEFT JOIN contrats_en_cours_par_poste cc ON cc.poste_conum_id = pp.poste_conum_id AND cc.structure_id = pp.structure_id;
