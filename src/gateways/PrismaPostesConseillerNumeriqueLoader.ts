import { Prisma } from '@prisma/client'

import { reportLoaderError } from './shared/sentryErrorReporter'
import prisma from '../../prisma/prismaClient'
import {
  EtatPoste,
  FiltresPostesConseillerNumerique,
  PosteConseillerNumeriqueReadModel,
  PostesConseillerNumeriqueLoader,
  PostesConseillerNumeriqueReadModel,
  PostesConseillerNumeriqueStatistiquesReadModel,
} from '@/use-cases/queries/RecupererLesPostesConseillerNumerique'
import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'

export class PrismaPostesConseillerNumeriqueLoader implements PostesConseillerNumeriqueLoader {
  async get(filtres: FiltresPostesConseillerNumerique): Promise<ErrorReadModel | PostesConseillerNumeriqueReadModel> {
    try {
      const { pagination, territoire } = filtres
      const safePage = Math.max(1, pagination.page)
      const offset = (safePage - 1) * pagination.limite

      const postes = await this.getPostesPagines(territoire, pagination.limite, offset)
      const statistiques = await this.getStatistiques(territoire)
      const totalCount = statistiques.totalPostesPourPagination
      const totalPages = Math.ceil(totalCount / pagination.limite)

      return {
        afficherColonneDepartement: territoire === 'France',
        displayPagination: totalCount > pagination.limite,
        limite: pagination.limite,
        page: pagination.page,
        postes,
        statistiques,
        total: totalCount,
        totalPages,
      }
    } catch (error) {
      reportLoaderError(error, 'PrismaPostesConseillerNumeriqueLoader', {
        filtres,
        operation: 'get',
      })
      return {
        message: 'Impossible de récupérer la liste des postes de conseiller numérique',
        type: 'error',
      }
    }
  }

  private async getPostesPagines(
    territoire: string,
    limite: number,
    offset: number
  ): Promise<ReadonlyArray<PosteConseillerNumeriqueReadModel>> {
    const departementFilter = territoire === 'France'
      ? Prisma.empty
      : Prisma.sql`AND a.departement = ${territoire}`

    const result = await prisma.$queryRaw<Array<PosteQueryResult>>`
      SELECT
        v.poste_id AS id_poste,
        v.poste_conum_id,
        st.nom AS nom_structure,
        a.departement AS code_departement,
        v.etat AS statut,
        v.est_coordinateur,
        v.enveloppes,
        v.date_fin_convention,
        v.date_fin_contrat,
        v.bonification,
        v.montant_subvention_cumule AS total_conventionne,
        v.montant_versement_cumule AS total_verse
      FROM min.postes_conseiller_numerique_synthese v
      INNER JOIN main.structure st ON st.id = v.structure_id
      LEFT JOIN main.adresse a ON a.id = st.adresse_id
      WHERE 1=1 ${departementFilter}
      ORDER BY st.nom, v.poste_conum_id
      LIMIT ${limite} OFFSET ${offset}
    `

    return result.map((poste) => this.mapPosteResult(poste))
  }

  private async getStatistiques(territoire: string): Promise<PostesConseillerNumeriqueStatistiquesReadModel> {
    const departementFilter = territoire === 'France'
      ? Prisma.empty
      : Prisma.sql`AND a.departement = ${territoire}`

    const result = await prisma.$queryRaw<Array<StatistiquesQueryResult>>`
      SELECT
        COUNT(*) AS total_postes_pour_pagination,
        COUNT(DISTINCT v.poste_conum_id) AS nombre_de_postes,
        COUNT(DISTINCT v.poste_conum_id) FILTER (WHERE v.etat = 'occupe') AS nombre_de_postes_occupes,
        COUNT(DISTINCT v.structure_id) AS nombre_de_structures_conventionnees,
        COALESCE(SUM(v.montant_subvention_cumule), 0) AS budget_total_conventionne,
        COALESCE(SUM(v.montant_versement_cumule), 0) AS budget_total_verse
      FROM min.postes_conseiller_numerique_synthese v
      INNER JOIN main.structure st ON st.id = v.structure_id
      LEFT JOIN main.adresse a ON a.id = st.adresse_id
      WHERE 1=1 ${departementFilter}
    `

    const stats = result[0]
    return {
      budgetTotalConventionne: Number(stats.budget_total_conventionne),
      budgetTotalVerse: Number(stats.budget_total_verse),
      nombreDePostes: Number(stats.nombre_de_postes),
      nombreDePostesOccupes: Number(stats.nombre_de_postes_occupes),
      nombreDeStructuresConventionnees: Number(stats.nombre_de_structures_conventionnees),
      totalPostesPourPagination: Number(stats.total_postes_pour_pagination),
    }
  }

  private mapPosteResult(poste: PosteQueryResult): PosteConseillerNumeriqueReadModel {
    return {
      bonification: poste.bonification,
      codeDepartement: poste.code_departement,
      dateFinContrat: poste.date_fin_contrat,
      dateFinConvention: poste.date_fin_convention,
      estCoordinateur: poste.est_coordinateur,
      idPoste: poste.id_poste,
      nomStructure: poste.nom_structure,
      posteConumId: poste.poste_conum_id,
      sourcesFinancement: poste.enveloppes,
      statut: poste.statut as EtatPoste,
      totalConventionne: Number(poste.total_conventionne),
      totalVerse: Number(poste.total_verse),
    }
  }
}

interface PosteQueryResult {
  bonification: boolean
  code_departement: string
  date_fin_contrat: Date | null
  date_fin_convention: Date | null
  enveloppes: null | string
  est_coordinateur: boolean
  id_poste: number
  nom_structure: string
  poste_conum_id: number
  statut: string
  total_conventionne: bigint
  total_verse: bigint
}

interface StatistiquesQueryResult {
  budget_total_conventionne: bigint
  budget_total_verse: bigint
  nombre_de_postes: bigint
  nombre_de_postes_occupes: bigint
  nombre_de_structures_conventionnees: bigint
  total_postes_pour_pagination: bigint
}
