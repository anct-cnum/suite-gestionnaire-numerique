import { Prisma } from '@prisma/client'

import { reportLoaderError } from './shared/sentryErrorReporter'
import prisma from '../../prisma/prismaClient'
import departements from '../../ressources/departements.json'
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
      const { pagination } = filtres
      const safePage = Math.max(1, pagination.page)
      const offset = (safePage - 1) * pagination.limite

      const postes = await this.getPostesPagines(filtres, pagination.limite, offset)
      const statistiques = await this.getStatistiques(filtres)
      const totalCount = statistiques.totalPostesPourPagination
      const totalPages = Math.ceil(totalCount / pagination.limite)

      return {
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

  private addBonificationFilter(filtres: FiltresPostesConseillerNumerique, conditions: Array<Prisma.Sql>): void {
    if (filtres.bonification === true) {
      conditions.push(Prisma.sql`v.bonification = true`)
    }
  }

  private addCodeRegionFilter(filtres: FiltresPostesConseillerNumerique, conditions: Array<Prisma.Sql>): void {
    if (filtres.codeRegion === undefined) {
      return
    }
    const departementsDeRegion = departements
      .filter((dept) => dept.regionCode === filtres.codeRegion)
      .map((dept) => dept.code)
    if (departementsDeRegion.length > 0) {
      conditions.push(Prisma.sql`a.departement = ANY(${departementsDeRegion})`)
    }
  }

  private addConventionsFilter(filtres: FiltresPostesConseillerNumerique, conditions: Array<Prisma.Sql>): void {
    if (filtres.conventions === undefined || filtres.conventions.length === 0) {
      return
    }
    const conventionConditions: Array<Prisma.Sql> = filtres.conventions.map((convention) => {
      const likePattern = `%${convention}%`
      return Prisma.sql`v.enveloppes LIKE ${likePattern}`
    })
    if (conventionConditions.length > 0) {
      conditions.push(Prisma.sql`(${Prisma.join(conventionConditions, ' OR ')})`)
    }
  }

  private addStatutFilter(filtres: FiltresPostesConseillerNumerique, conditions: Array<Prisma.Sql>): void {
    if (filtres.statut !== undefined) {
      conditions.push(Prisma.sql`v.etat = ${filtres.statut}`)
    }
  }

  private addTerritoireFilter(filtres: FiltresPostesConseillerNumerique, conditions: Array<Prisma.Sql>): void {
    if (filtres.territoire !== 'France') {
      conditions.push(Prisma.sql`a.departement = ${filtres.territoire}`)
    }
  }

  private addTypesEmployeurFilter(filtres: FiltresPostesConseillerNumerique, conditions: Array<Prisma.Sql>): void {
    if (filtres.typesEmployeur === undefined || filtres.typesEmployeur.length === 0) {
      return
    }
    const employeurConditions: Array<Prisma.Sql> = []
    if (filtres.typesEmployeur.includes('public')) {
      employeurConditions.push(Prisma.sql`st.publique = true`)
    }
    if (filtres.typesEmployeur.includes('prive')) {
      employeurConditions.push(Prisma.sql`st.publique = false`)
    }
    if (employeurConditions.length > 0) {
      conditions.push(Prisma.sql`(${Prisma.join(employeurConditions, ' OR ')})`)
    }
  }

  private addTypesPosteFilter(filtres: FiltresPostesConseillerNumerique, conditions: Array<Prisma.Sql>): void {
    if (filtres.typesPoste === undefined || filtres.typesPoste.length === 0) {
      return
    }
    const typeConditions: Array<Prisma.Sql> = []
    if (filtres.typesPoste.includes('coordinateur')) {
      typeConditions.push(Prisma.sql`v.est_coordinateur = true`)
    }
    if (filtres.typesPoste.includes('conseiller')) {
      typeConditions.push(Prisma.sql`v.est_coordinateur = false`)
    }
    if (typeConditions.length > 0) {
      conditions.push(Prisma.sql`(${Prisma.join(typeConditions, ' OR ')})`)
    }
  }

  private buildFiltersSQL(filtres: FiltresPostesConseillerNumerique): Prisma.Sql {
    const conditions: Array<Prisma.Sql> = []

    this.addBonificationFilter(filtres, conditions)
    this.addCodeRegionFilter(filtres, conditions)
    this.addConventionsFilter(filtres, conditions)
    this.addStatutFilter(filtres, conditions)
    this.addTerritoireFilter(filtres, conditions)
    this.addTypesEmployeurFilter(filtres, conditions)
    this.addTypesPosteFilter(filtres, conditions)

    if (conditions.length === 0) {
      return Prisma.empty
    }

    return Prisma.sql`AND ${Prisma.join(conditions, ' AND ')}`
  }

  private async getPostesPagines(
    filtres: FiltresPostesConseillerNumerique,
    limite: number,
    offset: number
  ): Promise<ReadonlyArray<PosteConseillerNumeriqueReadModel>> {
    const filtersSQL = this.buildFiltersSQL(filtres)

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
      LEFT JOIN main.structure st ON st.id = v.structure_id
      LEFT JOIN main.adresse a ON a.id = st.adresse_id
      WHERE 1=1 ${filtersSQL}
      ORDER BY st.nom, v.poste_conum_id
      LIMIT ${limite} OFFSET ${offset}
    `

    return result.map((poste) => this.mapPosteResult(poste))
  }

  private async getStatistiques(
    filtres: FiltresPostesConseillerNumerique
  ): Promise<PostesConseillerNumeriqueStatistiquesReadModel> {
    const filtersSQL = this.buildFiltersSQL(filtres)

    const result = await prisma.$queryRaw<Array<StatistiquesQueryResult>>`
      SELECT
        COUNT(*) AS total_postes_pour_pagination,
        COUNT(DISTINCT v.poste_conum_id) AS nombre_de_postes,
        COUNT(DISTINCT v.poste_conum_id) FILTER (WHERE v.etat = 'occupe') AS nombre_de_postes_occupes,
        COUNT(DISTINCT v.structure_id) AS nombre_de_structures_conventionnees,
        COALESCE(SUM(v.montant_subvention_cumule), 0) AS budget_total_conventionne,
        COALESCE(SUM(v.montant_versement_cumule), 0) AS budget_total_verse
      FROM min.postes_conseiller_numerique_synthese v
      LEFT JOIN main.structure st ON st.id = v.structure_id
      LEFT JOIN main.adresse a ON a.id = st.adresse_id
      WHERE 1=1 ${filtersSQL}
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
