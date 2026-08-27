import { reportLoaderError } from './shared/sentryErrorReporter'
import { Prisma } from '../../prisma/generated/client'
import prisma from '../../prisma/prismaClient'
import departements from '../../ressources/departements.json'
import {
  FiltreLabellisationStructures,
  FiltresListeStructures,
  ListeStructuresLoader,
  ListeStructuresReadModel,
  StructureListeReadModel,
} from '@/use-cases/queries/RecupererListeStructures'
import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'

export class PrismaListeStructuresLoader implements ListeStructuresLoader {
  async get(filtres: FiltresListeStructures): Promise<ErrorReadModel | ListeStructuresReadModel> {
    try {
      const { pagination } = filtres
      const safePage = Math.max(1, pagination.page)
      const offset = (safePage - 1) * pagination.limite
      const limitOffset = Prisma.sql`LIMIT ${pagination.limite} OFFSET ${offset}`

      const [structures, stats, total] = await Promise.all([
        this.queryStructures(filtres, limitOffset),
        this.getStatistiques(filtres),
        this.queryTotal(filtres),
      ])

      return {
        displayPagination: total > pagination.limite,
        limite: pagination.limite,
        page: pagination.page,
        structures: structures.map((structure) => this.mapToStructure(structure)),
        total,
        totalHabiliteesAidantsConnect: stats.totalHabiliteesAidantsConnect,
        totalLabelliseesConseillerNumerique: stats.totalLabelliseesConseillerNumerique,
        totalPages: Math.ceil(total / pagination.limite),
        totalStructures: stats.totalStructures,
      }
    } catch (error) {
      reportLoaderError(error, 'PrismaListeStructuresLoader', { filtres, operation: 'get' })
      return {
        message: 'Impossible de récupérer la liste des structures',
        type: 'error',
      }
    }
  }

  async getForExport(filtres: FiltresListeStructures): Promise<Array<StructureListeReadModel> | ErrorReadModel> {
    try {
      const structures = await this.queryStructures(filtres, Prisma.empty)
      return structures.map((structure) => this.mapToStructure(structure))
    } catch (error) {
      reportLoaderError(error, 'PrismaListeStructuresLoader', { filtres, operation: 'getForExport' })
      return {
        message: "Impossible de récupérer la liste des structures pour l'export",
        type: 'error',
      }
    }
  }

  // Étape 1 — Périmètre d'accès : "quelles structures ai-je le droit de voir ?"
  // Le filtre géographique explicite (UI, réservé au scope national) prend le pas sur le scope.
  private buildScopeCte(filtres: FiltresListeStructures): Prisma.Sql {
    const { geographique, scopeFiltre } = filtres

    if (geographique) {
      if (geographique.type === 'epci') {
        return Prisma.sql`structures_dans_scope AS (
          SELECT sa.id
          FROM main.structure_administrative sa
          LEFT JOIN main.adresse a ON a.id = sa.adresse_id
          WHERE sa.deleted_at IS NULL
            AND a.code_insee IN (
              SELECT c.code_insee
              FROM admin.commune c
              JOIN admin.commune_epci ce ON ce.commune_id = c.id
              JOIN admin.epci e ON e.id = ce.epci_id
              WHERE e.code = ${geographique.code}
            )
        )`
      }
      const codesDepartements =
        geographique.type === 'region'
          ? departements.filter((dept) => dept.regionCode === geographique.code).map((dept) => dept.code)
          : [geographique.code]
      return Prisma.sql`structures_dans_scope AS (
        SELECT sa.id
        FROM main.structure_administrative sa
        LEFT JOIN main.adresse a ON a.id = sa.adresse_id
        WHERE sa.deleted_at IS NULL
          AND a.departement = ANY(${codesDepartements})
      )`
    }

    if (scopeFiltre.type === 'departemental') {
      const codesDepartements = [...scopeFiltre.codes]
      return Prisma.sql`structures_dans_scope AS (
        SELECT sa.id
        FROM main.structure_administrative sa
        LEFT JOIN main.adresse a ON a.id = sa.adresse_id
        WHERE sa.deleted_at IS NULL
          AND a.departement = ANY(${codesDepartements})
      )`
    }

    if (scopeFiltre.type === 'structure') {
      return Prisma.sql`structures_dans_scope AS (
        SELECT sa.id
        FROM main.structure_administrative sa
        WHERE sa.deleted_at IS NULL
          AND sa.id = ${scopeFiltre.id}
      )`
    }

    // Scope national : aucune restriction d'accès, hors département fictif zzz
    return Prisma.sql`structures_dans_scope AS (
      SELECT sa.id
      FROM main.structure_administrative sa
      LEFT JOIN main.adresse a ON a.id = sa.adresse_id
      WHERE sa.deleted_at IS NULL
        AND (a.departement IS NULL OR a.departement != 'zzz')
    )`
  }

  // Étape 2 — Filtres UI : "parmi les structures accessibles, lesquelles correspondent à la recherche ?"
  private buildWhereConditions(labellisation?: FiltreLabellisationStructures, recherche?: string): Prisma.Sql {
    const conditions: Array<Prisma.Sql> = []

    // Recherche libre sur le nom / la raison sociale et le SIRET
    if (recherche !== undefined && recherche !== '') {
      const motif = motifRecherche(recherche)
      conditions.push(Prisma.sql`(
        sa.denomination_sirene ILIKE ${motif}
        OR sa.denomination_antenne ILIKE ${motif}
        OR sa.siret ILIKE ${motif}
      )`)
    }

    // Label conseiller numérique actif (durée 1 an, cf. estLabelConumActif) OU poste conum actif (non rendu)
    if (labellisation === 'conseiller-numerique') {
      conditions.push(Prisma.sql`(
        EXISTS (
          SELECT 1 FROM main.conum_labellisation cl
          WHERE cl.structure_id = sa.id AND cl.date_attestation > now() - interval '1 year'
        )
        OR EXISTS (SELECT 1 FROM main.poste p WHERE p.structure_id = sa.id AND p.etat <> 'rendu')
      )`)
    }

    if (labellisation === 'aidants-connect') {
      conditions.push(Prisma.sql`sa.structure_ac_id IS NOT NULL`)
    }

    return conditions.length > 0 ? Prisma.sql`AND ${Prisma.join(conditions, ' AND ')}` : Prisma.empty
  }

  // Statistiques des blocs résumé : tous les filtres s'appliquent, recherche libre comprise.
  private async getStatistiques(filtres: FiltresListeStructures): Promise<{
    totalHabiliteesAidantsConnect: number
    totalLabelliseesConseillerNumerique: number
    totalStructures: number
  }> {
    const scopeCte = this.buildScopeCte(filtres)
    const whereConditions = this.buildWhereConditions(filtres.labellisation, filtres.recherche)

    // Même règle que le tag et le filtre : label actif (cf. estLabelConumActif) OU poste conum actif (non rendu)
    const result = await prisma.$queryRaw<Array<{ aidants_connect: bigint; conum: bigint; total: bigint }>>`
      WITH ${scopeCte}
      SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE sa.structure_ac_id IS NOT NULL) AS aidants_connect,
        COUNT(*) FILTER (WHERE
          EXISTS (
            SELECT 1 FROM main.conum_labellisation cl
            WHERE cl.structure_id = sa.id AND cl.date_attestation > now() - interval '1 year'
          )
          OR EXISTS (SELECT 1 FROM main.poste p WHERE p.structure_id = sa.id AND p.etat <> 'rendu')
        ) AS conum
      FROM main.structure_administrative sa
      JOIN structures_dans_scope sds ON sds.id = sa.id
      WHERE true
        ${whereConditions}
    `

    return {
      totalHabiliteesAidantsConnect: Number(result[0]?.aidants_connect ?? 0),
      totalLabelliseesConseillerNumerique: Number(result[0]?.conum ?? 0),
      totalStructures: Number(result[0]?.total ?? 0),
    }
  }

  private mapToStructure(structure: StructureQueryResult): StructureListeReadModel {
    return {
      adresse: structure.adresse ?? '',
      codePostal: structure.code_postal ?? '',
      commune: structure.commune ?? '',
      derniereAttestationLabelConum: structure.derniere_attestation,
      estHabiliteeAidantsConnect: structure.aidants_connect,
      id: structure.id,
      nom: structure.nom ?? '',
      possedePosteConumActif: structure.possede_poste_actif,
      siret: structure.siret ?? '',
      typologie: structure.typologie ?? '',
    }
  }

  private async queryStructures(
    filtres: FiltresListeStructures,
    limitOffset: Prisma.Sql
  ): Promise<Array<StructureQueryResult>> {
    const scopeCte = this.buildScopeCte(filtres)
    const whereConditions = this.buildWhereConditions(filtres.labellisation, filtres.recherche)

    return prisma.$queryRaw<Array<StructureQueryResult>>`
      WITH ${scopeCte}
      SELECT
        sa.id,
        COALESCE(sa.denomination_antenne, sa.denomination_sirene) AS nom,
        sa.siret,
        cj.nom AS typologie,
        a.code_postal,
        a.nom_commune AS commune,
        TRIM(CONCAT_WS(' ', a.numero_voie::text, a.repetition, a.nom_voie)) AS adresse,
        sa.structure_ac_id IS NOT NULL AS aidants_connect,
        (
          SELECT MAX(cl.date_attestation) FROM main.conum_labellisation cl
          WHERE cl.structure_id = sa.id
        ) AS derniere_attestation,
        EXISTS (SELECT 1 FROM main.poste p WHERE p.structure_id = sa.id AND p.etat <> 'rendu') AS possede_poste_actif
      FROM main.structure_administrative sa
      JOIN structures_dans_scope sds ON sds.id = sa.id
      LEFT JOIN main.adresse a ON a.id = sa.adresse_id
      LEFT JOIN reference.categories_juridiques cj ON cj.code = sa.categorie_juridique
      WHERE true
        ${whereConditions}
      ORDER BY nom ASC NULLS LAST, sa.id ASC
      ${limitOffset}
    `
  }

  // Total des résultats de la liste (recherche comprise) : sert à la pagination.
  private async queryTotal(filtres: FiltresListeStructures): Promise<number> {
    const scopeCte = this.buildScopeCte(filtres)
    const whereConditions = this.buildWhereConditions(filtres.labellisation, filtres.recherche)

    const result = await prisma.$queryRaw<Array<{ total: bigint }>>`
      WITH ${scopeCte}
      SELECT COUNT(*) AS total
      FROM main.structure_administrative sa
      JOIN structures_dans_scope sds ON sds.id = sa.id
      WHERE true
        ${whereConditions}
    `

    return Number(result[0]?.total ?? 0)
  }
}

// Recherche partielle insensible à la casse : échappe les jokers LIKE (\ % _) de la saisie utilisateur.
function motifRecherche(valeur: string): string {
  return `%${valeur.replaceAll('\\', '\\\\').replaceAll('%', '\\%').replaceAll('_', '\\_')}%`
}

interface StructureQueryResult {
  adresse: null | string
  aidants_connect: boolean
  code_postal: null | string
  commune: null | string
  derniere_attestation: Date | null
  id: number
  nom: null | string
  possede_poste_actif: boolean
  siret: null | string
  typologie: null | string
}
