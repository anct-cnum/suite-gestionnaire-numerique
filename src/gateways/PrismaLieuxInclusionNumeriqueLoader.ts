import { Prisma } from '@prisma/client'

import prisma from '../../prisma/prismaClient'

export interface LieuxInclusionNumeriqueReadModel {
  nombreStructuresAvecConseillersNumeriques: Array<{ count: number }>
  nombreStructuresAvecFranceServices: Array<{ count: number }>
  nombreStructuresAvecProgrammeNational: Array<{ count: number }>
  nombreStructuresFRR: Array<{ nb_structures: number }>
  nombreStructuresQPV: Array<{ nb_structures: number }>
  nombreStructuresZonesPrioritaires: Array<{ nb_structures: number }>
  totalLieuxInclusionNumerique: Array<{ nb_lieux_inclusion_numerique: number }>
}

// Refonte 2026 : la source est main.lieu_inclusion (alias `l`). La répartition
// par catégorie juridique et le décompte « secteur public » ont été retirés
// (#1711) : ils dérivaient de la structure administrative via l'asso lieu ↔ SA,
// désormais supprimée.
const JOIN_ADRESSE = Prisma.sql`LEFT JOIN main.adresse a ON a.id = l.adresse_id`

export class PrismaLieuxInclusionNumeriqueLoader {
  async getDepartemental(codeDepartement: string): Promise<LieuxInclusionNumeriqueReadModel> {
    return this.getStats({ codeDepartement })
  }

  async getDepartementaux(codesDepartements: ReadonlyArray<string>): Promise<LieuxInclusionNumeriqueReadModel> {
    return this.getStats({ codesDepartements })
  }

  async getNational(): Promise<LieuxInclusionNumeriqueReadModel> {
    return this.getStats({})
  }

  async getStats(params: {
    codeDepartement?: string
    codesDepartements?: ReadonlyArray<string>
  }): Promise<LieuxInclusionNumeriqueReadModel> {
    const { codeDepartement, codesDepartements } = params

    let deptFilter: Prisma.Sql
    if (codeDepartement !== undefined) {
      deptFilter = Prisma.sql`AND a.departement = ${codeDepartement}`
    } else if (codesDepartements !== undefined && codesDepartements.length > 0) {
      deptFilter = Prisma.sql`AND a.departement = ANY(${[...codesDepartements]})`
    } else {
      deptFilter = Prisma.sql`AND a.departement != 'zzz'`
    }

    const totalLieuxInclusionNumerique = await prisma.$queryRaw<
      Array<{ nb_lieux_inclusion_numerique: number }>
    >(Prisma.sql`
      SELECT COUNT(*)::int AS nb_lieux_inclusion_numerique
      FROM main.lieu_inclusion l
      ${JOIN_ADRESSE}
      WHERE l.structure_cartographie_nationale_id IS NOT NULL
        ${deptFilter};
    `)

    const nombreStructuresZonesPrioritaires = await prisma.$queryRaw<Array<{ nb_structures: number }>>(Prisma.sql`
      SELECT COUNT(*)::int AS nb_structures
      FROM main.lieu_inclusion l
        ${JOIN_ADRESSE}
        INNER JOIN admin.zonage z
          ON (z.type = 'FRR' AND a.code_insee = z.code_insee)
          OR (z.type = 'QPV' AND public.st_contains(z.geom, a.geom))
      WHERE l.structure_cartographie_nationale_id IS NOT NULL
        ${deptFilter};
    `)

    const nombreStructuresQPV = await prisma.$queryRaw<Array<{ nb_structures: number }>>(Prisma.sql`
      SELECT COUNT(*)::int AS nb_structures
      FROM main.lieu_inclusion l
        ${JOIN_ADRESSE}
        INNER JOIN admin.zonage z
          ON (z.type = 'QPV' AND public.st_contains(z.geom, a.geom))
      WHERE l.structure_cartographie_nationale_id IS NOT NULL
        ${deptFilter};
    `)

    const nombreStructuresFRR = await prisma.$queryRaw<Array<{ nb_structures: number }>>(Prisma.sql`
      SELECT COUNT(*)::int AS nb_structures
      FROM main.lieu_inclusion l
        ${JOIN_ADRESSE}
        INNER JOIN admin.zonage z
          ON (z.type = 'FRR' AND a.code_insee = z.code_insee)
      WHERE l.structure_cartographie_nationale_id IS NOT NULL
        ${deptFilter};
    `)

    const nombreStructuresAvecProgrammeNational = await prisma.$queryRaw<Array<{ count: number }>>(Prisma.sql`
      SELECT COUNT(*)::int AS count
      FROM main.lieu_inclusion l
        ${JOIN_ADRESSE}
      WHERE l.dispositif_programmes_nationaux IS NOT NULL
        ${deptFilter};
    `)

    const nombreStructuresAvecConseillersNumeriques = await prisma.$queryRaw<Array<{ count: number }>>(Prisma.sql`
      SELECT COUNT(*)::int AS count
      FROM main.lieu_inclusion l
        ${JOIN_ADRESSE}
      WHERE 'Conseillers numériques' = ANY(l.dispositif_programmes_nationaux)
        ${deptFilter};
    `)

    const nombreStructuresAvecFranceServices = await prisma.$queryRaw<Array<{ count: number }>>(Prisma.sql`
      SELECT COUNT(*)::int AS count
      FROM main.lieu_inclusion l
        ${JOIN_ADRESSE}
      WHERE 'France Services' = ANY(l.dispositif_programmes_nationaux)
        ${deptFilter};
    `)

    return {
      nombreStructuresAvecConseillersNumeriques,
      nombreStructuresAvecFranceServices,
      nombreStructuresAvecProgrammeNational,
      nombreStructuresFRR,
      nombreStructuresQPV,
      nombreStructuresZonesPrioritaires,
      totalLieuxInclusionNumerique,
    }
  }
}
