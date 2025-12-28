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
  TypeConvention,
} from '@/use-cases/queries/RecupererLesPostesConseillerNumerique'
import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'

export class PrismaPostesConseillerNumeriqueLoader implements PostesConseillerNumeriqueLoader {
  private static readonly sourceFinancementMapping: Record<string, TypeConvention> = {
    DGCL: 'DGCL',
    DGE: 'DGE',
    DITP: 'DITP',
  }

  private static getTypeConvention(sourceFinancement: null | string): null | TypeConvention {
    if (sourceFinancement === null) {
      return null
    }
    return PrismaPostesConseillerNumeriqueLoader.sourceFinancementMapping[sourceFinancement] ?? null
  }

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
      WITH poste_principal AS (
        -- Pour chaque poste_conum_id, sélectionner la ligne avec la subvention la plus récente
        -- Si pas de subvention, prendre la ligne avec etat='occupe' en priorité, sinon la plus récente
        SELECT DISTINCT ON (p.poste_conum_id)
          p.id,
          p.poste_conum_id,
          p.structure_id,
          p.personne_id,
          p.etat,
          p.typologie
        FROM main.poste p
        LEFT JOIN main.subvention s ON s.poste_id = p.id
        INNER JOIN main.structure st ON st.id = p.structure_id
        LEFT JOIN main.adresse a ON a.id = st.adresse_id
        WHERE p.etat IN ('occupe', 'vacant', 'rendu')
          ${departementFilter}
        ORDER BY p.poste_conum_id,
                 s.date_fin_convention DESC NULLS LAST,
                 (CASE WHEN p.etat = 'occupe' THEN 0 WHEN p.etat = 'vacant' THEN 1 ELSE 2 END),
                 p.created_at DESC
      ),
      derniere_subvention AS (
        SELECT DISTINCT ON (s.poste_id)
          s.poste_id,
          s.source_financement,
          s.date_fin_convention,
          s.is_territoire_prioritaire,
          COALESCE(s.montant_subvention, 0) + COALESCE(s.montant_bonification, 0) AS total_conventionne,
          COALESCE(s.versement_1, 0) + COALESCE(s.versement_2, 0) + COALESCE(s.versement_3, 0) AS total_verse
        FROM main.subvention s
        ORDER BY s.poste_id, s.date_fin_convention DESC NULLS LAST
      ),
      dernier_contrat AS (
        SELECT DISTINCT ON (c.personne_id, c.structure_id)
          c.personne_id,
          c.structure_id,
          c.date_fin
        FROM main.contrat c
        ORDER BY c.personne_id, c.structure_id, c.date_fin DESC NULLS LAST
      )
      SELECT
        pp.id AS id_poste,
        pp.poste_conum_id,
        st.nom AS nom_structure,
        a.departement AS code_departement,
        pp.etat AS statut,
        pp.typologie = 'coordo' AS est_coordinateur,
        ds.source_financement,
        ds.date_fin_convention,
        dc.date_fin AS date_fin_contrat,
        COALESCE(ds.is_territoire_prioritaire, false) AS bonification,
        COALESCE(ds.total_conventionne, 0) AS total_conventionne,
        COALESCE(ds.total_verse, 0) AS total_verse
      FROM poste_principal pp
      INNER JOIN main.structure st ON st.id = pp.structure_id
      LEFT JOIN main.adresse a ON a.id = st.adresse_id
      LEFT JOIN derniere_subvention ds ON ds.poste_id = pp.id
      LEFT JOIN dernier_contrat dc ON dc.personne_id = pp.personne_id AND dc.structure_id = pp.structure_id
      ORDER BY st.nom, pp.poste_conum_id
      LIMIT ${limite} OFFSET ${offset}
    `

    return result.map((poste) => this.mapPosteResult(poste))
  }

  private async getStatistiques(territoire: string): Promise<PostesConseillerNumeriqueStatistiquesReadModel> {
    const departementFilter = territoire === 'France'
      ? Prisma.empty
      : Prisma.sql`AND a.departement = ${territoire}`

    const result = await prisma.$queryRaw<Array<StatistiquesQueryResult>>`
      WITH poste_principal AS (
        -- Pour chaque poste_conum_id, sélectionner la ligne avec la subvention la plus récente
        SELECT DISTINCT ON (p.poste_conum_id)
          p.id,
          p.poste_conum_id,
          p.structure_id,
          p.etat
        FROM main.poste p
        LEFT JOIN main.subvention s ON s.poste_id = p.id
        INNER JOIN main.structure st ON st.id = p.structure_id
        LEFT JOIN main.adresse a ON a.id = st.adresse_id
        WHERE p.etat IN ('occupe', 'vacant', 'rendu')
          ${departementFilter}
        ORDER BY p.poste_conum_id,
                 s.date_fin_convention DESC NULLS LAST,
                 (CASE WHEN p.etat = 'occupe' THEN 0 WHEN p.etat = 'vacant' THEN 1 ELSE 2 END),
                 p.created_at DESC
      ),
      derniere_subvention AS (
        SELECT DISTINCT ON (s.poste_id)
          s.poste_id,
          COALESCE(s.montant_subvention, 0) + COALESCE(s.montant_bonification, 0) AS total_conventionne,
          COALESCE(s.versement_1, 0) + COALESCE(s.versement_2, 0) + COALESCE(s.versement_3, 0) AS total_verse
        FROM main.subvention s
        INNER JOIN poste_principal pp ON pp.id = s.poste_id
        ORDER BY s.poste_id, s.date_fin_convention DESC NULLS LAST
      )
      SELECT
        COUNT(*) AS total_postes_pour_pagination,
        COUNT(*) FILTER (WHERE pp.etat IN ('occupe', 'vacant')) AS nombre_de_postes,
        COUNT(*) FILTER (WHERE pp.etat = 'occupe') AS nombre_de_postes_occupes,
        COUNT(DISTINCT pp.structure_id) FILTER (WHERE pp.etat IN ('occupe', 'vacant')) AS nombre_de_structures_conventionnees,
        COALESCE(SUM(ds.total_conventionne), 0) AS budget_total_conventionne,
        COALESCE(SUM(ds.total_verse), 0) AS budget_total_verse
      FROM poste_principal pp
      LEFT JOIN derniere_subvention ds ON ds.poste_id = pp.id
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
    const typeConvention = PrismaPostesConseillerNumeriqueLoader.getTypeConvention(poste.source_financement)

    return {
      bonification: poste.bonification,
      codeDepartement: poste.code_departement,
      dateFinContrat: poste.date_fin_contrat,
      dateFinConvention: poste.date_fin_convention,
      estCoordinateur: poste.est_coordinateur,
      idPoste: poste.id_poste,
      nomStructure: poste.nom_structure,
      posteConumId: poste.poste_conum_id,
      statut: poste.statut as EtatPoste,
      totalConventionne: Number(poste.total_conventionne),
      totalVerse: Number(poste.total_verse),
      typeConvention,
    }
  }
}

interface PosteQueryResult {
  bonification: boolean
  code_departement: string
  date_fin_contrat: Date | null
  date_fin_convention: Date | null
  est_coordinateur: boolean
  id_poste: number
  nom_structure: string
  poste_conum_id: number
  source_financement: null | string
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
