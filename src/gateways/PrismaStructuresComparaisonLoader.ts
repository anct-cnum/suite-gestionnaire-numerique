import prisma from '../../prisma/prismaClient'
import {
  ComparaisonDoublonsLoader,
  ComparaisonDoublonsReadModel,
  StructureDetailReadModel,
} from '@/use-cases/queries/ComparerStructuresAFusionner'

export class PrismaStructuresComparaisonLoader implements ComparaisonDoublonsLoader {
  async comparer(ids: ReadonlyArray<number>): Promise<ComparaisonDoublonsReadModel> {
    if (ids.length === 0) {
      return []
    }

    const lignes = await prisma.$queryRaw<Array<LigneDetail>>`
      SELECT
        sa.id,
        sa.siret,
        sa.ridet,
        sa.rna,
        sa.denomination_sirene,
        sa.denomination_antenne,
        sa.etat_administratif,
        sa.code_activite_principale,
        sa.edited_by AS source,
        sa.structure_coop_id,
        sa.structure_tp_id,
        sa.structure_ac_id,
        sa.nb_mandats_ac,
        EXISTS (
          SELECT 1 FROM audit.structure_merge_log ml
          WHERE ml.winner_id = sa.id AND ml.status = 'SUCCESS' AND ml.dag_id = 'min-ui'
        ) AS deja_fusionnee,
        a.nom_commune,
        NULLIF(TRIM(CONCAT_WS(' ', a.numero_voie, a.nom_voie, a.code_postal, a.nom_commune)), '') AS adresse,
        public.ST_Y(a.geom) AS latitude,
        public.ST_X(a.geom) AS longitude,
        (SELECT COUNT(*) FROM min.utilisateur u WHERE u.structure_id = sa.id)::int AS nb_utilisateurs_min,
        (SELECT COUNT(*) FROM min.membre m WHERE m.structure_id = sa.id)::int AS nb_membres_min,
        (SELECT COUNT(*) FROM main.poste p WHERE p.structure_id = sa.id)::int AS nb_postes,
        (SELECT COUNT(*) FROM main.contrat ct WHERE ct.structure_id = sa.id)::int AS nb_contrats,
        (SELECT COUNT(*) FROM main.personne_affectations_emploi pae
         WHERE pae.structure_administrative_id = sa.id)::int AS nb_affectations_emploi,
        (SELECT COUNT(*) FROM main.personne_affectations_emploi pae
         WHERE pae.structure_administrative_id = sa.id AND pae.source = 'coop')::int AS nb_affectations_coop,
        (SELECT COUNT(*) FROM main.personne_affectations_emploi pae
         WHERE pae.structure_administrative_id = sa.id AND pae.source = 'idposte')::int AS nb_affectations_idposte,
        (SELECT COUNT(*) FROM main.personne_affectations_emploi pae
         WHERE pae.structure_administrative_id = sa.id AND pae.source = 'aidants-connect')::int AS nb_affectations_ac,
        (SELECT COUNT(*) FROM main.contact_structure_administrative cs
         WHERE cs.structure_administrative_id = sa.id)::int AS nb_contacts,
        (SELECT COUNT(*) FROM main.lieu_inclusion_structure_administrative li
         WHERE li.structure_administrative_id = sa.id)::int AS nb_associations_lieux,
        (SELECT COUNT(DISTINCT m.gouvernance_departement_code) FROM min.membre m
         WHERE m.structure_id = sa.id)::int AS nb_gouvernances,
        (SELECT COUNT(*) FROM min.feuille_de_route fdr
         JOIN min.membre m ON fdr.porteur_id = m.id
         WHERE m.structure_id = sa.id)::int AS nb_feuilles_de_route,
        EXISTS (
          SELECT 1 FROM min.beneficiaire_subvention bs
          JOIN min.membre m ON bs.membre_id = m.id
          WHERE m.structure_id = sa.id
        ) AS est_beneficiaire
      FROM main.structure_administrative sa
      LEFT JOIN main.adresse a ON a.id = sa.adresse_id
      WHERE sa.id = ANY(${[...ids]})
    `

    return lignes.map(versDetail)
  }
}

interface LigneDetail {
  adresse: null | string
  code_activite_principale: null | string
  deja_fusionnee: boolean
  denomination_antenne: null | string
  denomination_sirene: null | string
  est_beneficiaire: boolean
  etat_administratif: null | string
  id: number
  latitude: null | number
  longitude: null | number
  nb_affectations_ac: number
  nb_affectations_coop: number
  nb_affectations_emploi: number
  nb_affectations_idposte: number
  nb_associations_lieux: number
  nb_contacts: number
  nb_contrats: number
  nb_feuilles_de_route: number
  nb_gouvernances: number
  nb_mandats_ac: null | number
  nb_membres_min: number
  nb_postes: number
  nb_utilisateurs_min: number
  nom_commune: null | string
  ridet: null | string
  rna: null | string
  siret: null | string
  source: null | string
  structure_ac_id: null | string
  structure_coop_id: null | string
  structure_tp_id: null | number
}

function versDetail(ligne: LigneDetail): StructureDetailReadModel {
  const total =
    ligne.nb_utilisateurs_min +
    ligne.nb_membres_min +
    ligne.nb_postes +
    ligne.nb_contrats +
    ligne.nb_affectations_emploi +
    ligne.nb_contacts +
    ligne.nb_associations_lieux

  return {
    adresse: ligne.adresse,
    codeActivitePrincipale: ligne.code_activite_principale,
    commune: ligne.nom_commune,
    dejaFusionnee: ligne.deja_fusionnee,
    denominationAntenne: ligne.denomination_antenne,
    denominationSirene: ligne.denomination_sirene,
    estBeneficiaire: ligne.est_beneficiaire,
    etatAdministratif: ligne.etat_administratif,
    id: ligne.id,
    latitude: ligne.latitude,
    longitude: ligne.longitude,
    nbMandatsAc: ligne.nb_mandats_ac,
    rattachements: {
      affectationsAc: ligne.nb_affectations_ac,
      affectationsCoop: ligne.nb_affectations_coop,
      affectationsEmploi: ligne.nb_affectations_emploi,
      affectationsIdposte: ligne.nb_affectations_idposte,
      associationsLieux: ligne.nb_associations_lieux,
      contacts: ligne.nb_contacts,
      contrats: ligne.nb_contrats,
      feuillesDeRoute: ligne.nb_feuilles_de_route,
      gouvernances: ligne.nb_gouvernances,
      membresMin: ligne.nb_membres_min,
      postes: ligne.nb_postes,
      total,
      utilisateursMin: ligne.nb_utilisateurs_min,
    },
    ridet: ligne.ridet,
    rna: ligne.rna,
    siret: ligne.siret,
    source: ligne.source,
    structureAcId: ligne.structure_ac_id,
    structureCoopId: ligne.structure_coop_id,
    structureTpId: ligne.structure_tp_id,
  }
}
