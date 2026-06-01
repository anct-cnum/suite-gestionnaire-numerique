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
        a.nom_commune,
        NULLIF(TRIM(CONCAT_WS(' ', a.numero_voie, a.nom_voie, a.code_postal, a.nom_commune)), '') AS adresse,
        (SELECT COUNT(*) FROM min.utilisateur u WHERE u.structure_id = sa.id)::int AS nb_utilisateurs_min,
        (SELECT COUNT(*) FROM min.membre m WHERE m.structure_id = sa.id)::int AS nb_membres_min,
        (SELECT COUNT(*) FROM main.poste p WHERE p.structure_id = sa.id)::int AS nb_postes,
        (SELECT COUNT(*) FROM main.contrat ct WHERE ct.structure_id = sa.id)::int AS nb_contrats,
        (SELECT COUNT(*) FROM main.personne_affectations_emploi pae
         WHERE pae.structure_administrative_id = sa.id)::int AS nb_affectations_emploi,
        (SELECT COUNT(*) FROM main.contact_structure_administrative cs
         WHERE cs.structure_administrative_id = sa.id)::int AS nb_contacts,
        (SELECT COUNT(*) FROM main.lieu_inclusion_structure_administrative li
         WHERE li.structure_administrative_id = sa.id)::int AS nb_associations_lieux
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
  denomination_antenne: null | string
  denomination_sirene: null | string
  etat_administratif: null | string
  id: number
  nb_affectations_emploi: number
  nb_associations_lieux: number
  nb_contacts: number
  nb_contrats: number
  nb_membres_min: number
  nb_postes: number
  nb_utilisateurs_min: number
  nom_commune: null | string
  ridet: null | string
  rna: null | string
  siret: null | string
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
    denominationAntenne: ligne.denomination_antenne,
    denominationSirene: ligne.denomination_sirene,
    etatAdministratif: ligne.etat_administratif,
    id: ligne.id,
    rattachements: {
      affectationsEmploi: ligne.nb_affectations_emploi,
      associationsLieux: ligne.nb_associations_lieux,
      contacts: ligne.nb_contacts,
      contrats: ligne.nb_contrats,
      membresMin: ligne.nb_membres_min,
      postes: ligne.nb_postes,
      total,
      utilisateursMin: ligne.nb_utilisateurs_min,
    },
    ridet: ligne.ridet,
    rna: ligne.rna,
    siret: ligne.siret,
  }
}
