import { reportLoaderError } from './shared/sentryErrorReporter'
import prisma from '../../prisma/prismaClient'
import {
  EtatPoste,
  PosteConseillerNumeriqueDetailLoader,
  PosteConseillerNumeriqueDetailReadModel,
} from '@/use-cases/queries/RecupererUnPosteConseillerNumerique'
import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'

export class PrismaPosteConseillerNumeriqueDetailLoader implements PosteConseillerNumeriqueDetailLoader {
  async get(
    posteConumId: number,
    structureId: number
  ): Promise<ErrorReadModel | PosteConseillerNumeriqueDetailReadModel> {
    try {
      // Récupérer les données du poste depuis la vue synthèse
      const posteResult = await prisma.$queryRaw<Array<PosteVueResult>>`
        SELECT
          v.poste_conum_id,
          v.poste_id,
          v.structure_id,
          v.personne_id,
          v.etat,
          v.est_coordinateur,
          v.bonification,
          v.enveloppes,
          v.date_fin_convention,
          v.montant_subvention_cumule,
          v.montant_versement_cumule,
          v.subvention_v1,
          v.bonification_v1,
          v.versement_cumule_v1,
          v.subvention_v2,
          v.bonification_v2,
          v.versement_cumule_v2
        FROM min.postes_conseiller_numerique_synthese v
        WHERE v.poste_conum_id = ${posteConumId}
          AND v.structure_id = ${structureId}
      `

      if (posteResult.length === 0) {
        return {
          message: 'Poste non trouvé',
          type: 'error',
        }
      }

      const poste = posteResult[0]

      // Récupérer les infos de la structure
      const structureResult = await prisma.$queryRaw<Array<StructureResult>>`
        SELECT
          st.id as structure_id,
          st.nom as nom_structure,
          st.siret,
          cj.nom as categorie_juridique_nom,
          a.numero_voie,
          a.repetition,
          a.nom_voie,
          a.code_postal,
          a.nom_commune,
          a.departement as code_departement,
          d.nom as departement_nom,
          r.nom as region_nom
        FROM main.structure st
        LEFT JOIN main.adresse a ON a.id = st.adresse_id
        LEFT JOIN admin.departement d ON d.code = a.departement
        LEFT JOIN admin.region r ON r.id = d.region_id
        LEFT JOIN reference.categories_juridiques cj ON cj.code = st.categorie_juridique
        WHERE st.id = ${poste.structure_id}
      `

      if (structureResult.length === 0) {
        return {
          message: 'Structure non trouvée',
          type: 'error',
        }
      }

      const structure = structureResult[0]

      // Récupérer les dates des conventions
      const datesConventions = await this.recupererDatesConventions(poste.poste_conum_id, poste.structure_id)

      // Récupérer tous les contrats rattachés au poste (toutes personnes historiques)
      const contrats = await this.recupererContrats(poste.poste_conum_id, poste.structure_id)

      // Récupérer les contacts de la structure
      const contacts = await this.recupererContacts(poste.structure_id)

      return {
        contrats,
        conventions: {
          creditsEngagesParLEtat: Number(poste.montant_subvention_cumule),
          v1: this.buildConventionV1(poste, datesConventions),
          v2: this.buildConventionV2(poste, datesConventions),
        },
        estBonifie: poste.bonification,
        estCoordinateur: poste.est_coordinateur,
        posteConumId: poste.poste_conum_id,
        posteId: poste.poste_id,
        statut: poste.etat as EtatPoste,
        structure: {
          adresse: this.formatAdresse(structure),
          contacts,
          departement:
            structure.departement_nom !== null && structure.departement_nom !== ''
              ? `(${structure.code_departement}) ${structure.departement_nom}`
              : (structure.code_departement ?? ''),
          nom: structure.nom_structure,
          region: structure.region_nom ?? '',
          siret: structure.siret ?? '',
          structureId: structure.structure_id,
          typologie: structure.categorie_juridique_nom ?? '',
        },
      }
    } catch (error) {
      reportLoaderError(error, 'PrismaPosteConseillerNumeriqueDetailLoader', {
        operation: 'get',
        posteConumId,
        structureId,
      })
      return {
        message: 'Impossible de récupérer les détails du poste',
        type: 'error',
      }
    }
  }

  async getFirstStructureId(posteConumId: number): Promise<null | number> {
    const result = await prisma.$queryRaw<Array<{ structure_id: number }>>`
      SELECT structure_id
      FROM min.postes_conseiller_numerique_synthese
      WHERE poste_conum_id = ${posteConumId}
      LIMIT 1
    `
    return result.length > 0 ? result[0].structure_id : null
  }

  private buildConventionV1(
    poste: PosteVueResult,
    dates: DatesConventions
  ): PosteConseillerNumeriqueDetailReadModel['conventions']['v1'] {
    const subvention = Number(poste.subvention_v1)
    const bonification = Number(poste.bonification_v1)

    if (subvention === 0 && bonification === 0) {
      return null
    }

    return {
      bonification,
      dateDebut: dates.v1?.dateDebut ?? null,
      dateFin: dates.v1?.dateFin ?? poste.date_fin_convention,
      subvention,
      versement: Number(poste.versement_cumule_v1),
    }
  }

  private buildConventionV2(
    poste: PosteVueResult,
    dates: DatesConventions
  ): PosteConseillerNumeriqueDetailReadModel['conventions']['v2'] {
    const subvention = Number(poste.subvention_v2)
    const bonification = Number(poste.bonification_v2)

    if (subvention === 0 && bonification === 0) {
      return null
    }

    return {
      bonification,
      dateDebut: dates.v2?.dateDebut ?? null,
      dateFin: dates.v2?.dateFin ?? poste.date_fin_convention,
      subvention,
      versement: Number(poste.versement_cumule_v2),
    }
  }

  private determinerRole(isCoordinateur: boolean | null, isMediateur: boolean | null): string {
    if (isCoordinateur === true) {
      return 'Coordinateur'
    }
    if (isMediateur === true) {
      return 'Médiateur'
    }
    return 'Conseiller'
  }

  private formatAdresse(structure: StructureResult): string {
    const parts: Array<string> = []

    if (structure.numero_voie !== null && structure.numero_voie !== 0) {
      parts.push(String(structure.numero_voie))
    }
    if (structure.repetition !== null && structure.repetition !== '') {
      parts.push(structure.repetition)
    }
    if (structure.nom_voie !== null && structure.nom_voie !== '') {
      parts.push(structure.nom_voie)
    }

    const rue = parts.join(' ')
    const codePostal = structure.code_postal ?? ''
    const commune = structure.nom_commune ?? ''

    if (rue === '' && codePostal === '' && commune === '') {
      return ''
    }

    return `${rue}, ${codePostal} ${commune}`.trim()
  }

  private async recupererContacts(
    structureId: number
  ): Promise<PosteConseillerNumeriqueDetailReadModel['structure']['contacts']> {
    const contactStructures = await prisma.contact_structure.findMany({
      include: {
        contact: true,
      },
      orderBy: [{ contact: { est_referent_fne: 'desc' } }, { contact: { nom: 'asc' } }, { contact: { prenom: 'asc' } }],
      where: {
        structure_id: structureId,
      },
    })

    return contactStructures.map((cs) => ({
      email: cs.contact.email,
      estReferentFNE: cs.contact.est_referent_fne,
      fonction: cs.contact.fonction,
      id: cs.contact.id,
      nom: cs.contact.nom,
      prenom: cs.contact.prenom,
      telephone: cs.contact.telephone,
    }))
  }

  private async recupererContrats(
    posteConumId: number,
    structureId: number
  ): Promise<
    ReadonlyArray<{
      dateDebut: Date | null
      dateFin: Date | null
      dateRupture: Date | null
      mediateur: string
      role: string
      typeContrat: string
    }>
  > {
    const result = await prisma.$queryRaw<
      Array<{
        date_debut: Date | null
        date_fin: Date | null
        date_rupture: Date | null
        is_coordinateur: boolean | null
        is_mediateur: boolean | null
        nom: null | string
        prenom: null | string
        type_contrat: null | string
      }>
    >`
      SELECT DISTINCT
        c.date_debut,
        c.date_fin,
        c.date_rupture,
        c.type as type_contrat,
        pers.nom,
        pers.prenom,
        pers.is_coordinateur,
        pers.is_mediateur
      FROM main.poste p
      INNER JOIN main.contrat c
        ON c.personne_id = p.personne_id AND c.structure_id = p.structure_id
      INNER JOIN main.personne pers ON pers.id = c.personne_id
      WHERE p.poste_conum_id = ${posteConumId}
        AND p.structure_id = ${structureId}
      ORDER BY c.date_debut DESC
    `

    return result.map((contrat) => ({
      dateDebut: contrat.date_debut,
      dateFin: contrat.date_fin,
      dateRupture: contrat.date_rupture,
      mediateur: `${contrat.prenom ?? ''} ${contrat.nom ?? ''}`.trim(),
      role: this.determinerRole(contrat.is_coordinateur, contrat.is_mediateur),
      typeContrat: contrat.type_contrat ?? 'Non renseigné',
    }))
  }

  private async recupererDatesConventions(posteConumId: number, structureId: number): Promise<DatesConventions> {
    const result = await prisma.$queryRaw<
      Array<{
        date_debut_dgcl: Date | null
        date_debut_dge: Date | null
        date_debut_ditp: Date | null
        date_fin_dgcl: Date | null
        date_fin_dge: Date | null
        date_fin_ditp: Date | null
      }>
    >`
      SELECT
        s.date_debut_convention_dgcl as date_debut_dgcl,
        s.date_fin_convention_dgcl as date_fin_dgcl,
        s.date_debut_convention_ditp as date_debut_ditp,
        s.date_fin_convention_ditp as date_fin_ditp,
        s.date_debut_convention_dge as date_debut_dge,
        s.date_fin_convention_dge as date_fin_dge
      FROM main.subvention s
      JOIN main.poste p ON p.id = s.poste_id
      WHERE p.poste_conum_id = ${posteConumId}
        AND p.structure_id = ${structureId}
    `

    const dates: DatesConventions = {
      v1: null,
      v2: null,
    }

    if (result.length > 0) {
      const row = result[0]

      // V1 : DGCL
      if (row.date_debut_dgcl !== null || row.date_fin_dgcl !== null) {
        dates.v1 = {
          dateDebut: row.date_debut_dgcl,
          dateFin: row.date_fin_dgcl,
        }
      }

      // V2 : DITP ou DGE (prendre DITP en priorité, sinon DGE)
      if (row.date_debut_ditp !== null || row.date_fin_ditp !== null) {
        dates.v2 = {
          dateDebut: row.date_debut_ditp,
          dateFin: row.date_fin_ditp,
        }
      } else if (row.date_debut_dge !== null || row.date_fin_dge !== null) {
        dates.v2 = {
          dateDebut: row.date_debut_dge,
          dateFin: row.date_fin_dge,
        }
      }
    }

    return dates
  }
}

interface PosteVueResult {
  bonification: boolean
  bonification_v1: bigint
  bonification_v2: bigint
  date_fin_convention: Date | null
  enveloppes: null | string
  est_coordinateur: boolean
  etat: string
  montant_subvention_cumule: bigint
  montant_versement_cumule: bigint
  personne_id: null | number
  poste_conum_id: number
  poste_id: number
  structure_id: number
  subvention_v1: bigint
  subvention_v2: bigint
  versement_cumule_v1: bigint
  versement_cumule_v2: bigint
}

interface StructureResult {
  categorie_juridique_nom: null | string
  code_departement: null | string
  code_postal: null | string
  departement_nom: null | string
  nom_commune: null | string
  nom_structure: string
  nom_voie: null | string
  numero_voie: null | number
  region_nom: null | string
  repetition: null | string
  siret: null | string
  structure_id: number
}

interface DatesConventions {
  v1: {
    dateDebut: Date | null
    dateFin: Date | null
  } | null
  v2: {
    dateDebut: Date | null
    dateFin: Date | null
  } | null
}
