import { Prisma } from '@prisma/client'

import prisma from '../../prisma/prismaClient'

export interface LieuxInclusionNumeriqueReadModel {
  lieuxInclusionNumeriqueSecteurPublic: Array<{ nb_lieux_inclusion_numerique_public: number }>
  nombreStructuresAvecConseillersNumeriques: Array<{ count: number }>
  nombreStructuresAvecFranceServices: Array<{ count: number }>
  nombreStructuresAvecProgrammeNational: Array<{ count: number }>
  nombreStructuresFRR: Array<{ nb_structures: number }>
  nombreStructuresQPV: Array<{ nb_structures: number }>
  nombreStructuresZonesPrioritaires: Array<{ nb_structures: number }>
  repartitionLieuxParCategorieJuridique: Array<{ categorie_finale: string; nb_lieux_inclusion_numerique: number }>
  totalLieuxInclusionNumerique: Array<{ nb_lieux_inclusion_numerique: number }>
}

const CJ_CASE = Prisma.sql`
  CASE
    WHEN cj.nom = 'Commune et commune nouvelle' THEN cj.nom
    WHEN cj.nom = 'Centre communal d''action sociale' THEN cj.nom
    WHEN cj.nom ILIKE '%association%' THEN 'association'
    WHEN cj.nom = 'Département' THEN cj.nom
    WHEN cj.nom = 'Communauté d''agglomération' THEN cj.nom
    WHEN cj.nom ILIKE '%Pôle d''équilibre territorial et rural%' THEN cj.nom
    WHEN cj.nom = 'Métropole' THEN cj.nom
    WHEN cj.nom = 'Région' THEN cj.nom
    WHEN cj.nom = 'Ministère' THEN cj.nom
    WHEN cj.code NOT LIKE '7%' THEN 'Acteur privé'
    WHEN cj.code IS NULL THEN 'Inconnue'
    ELSE 'Autres'
  END
`

/** Clause WHERE commune à toutes les requêtes : filtre département optionnel. */
function whereAvecFiltreDept(codeDepartement?: string) : Prisma.Sql {
  return codeDepartement
    ? Prisma.sql`AND a.departement = ${codeDepartement}`
    : Prisma.sql``
}

/** Join adresse: LEFT partout pour cohérence. */
const JOIN_ADRESSE = Prisma.sql`LEFT JOIN main.adresse a ON a.id = s.adresse_id`

export class PrismaLieuxInclusionNumeriqueLoader {
  // Wrappers compatibles avec ton API actuelle :
  async getDepartemental(codeDepartement: string) : Promise<LieuxInclusionNumeriqueReadModel> {
    return this.getStats({ codeDepartement })
  }

  async getNational(): Promise<LieuxInclusionNumeriqueReadModel> {
    return this.getStats({})
  }

  async getStats(params: { codeDepartement?: string }): Promise<LieuxInclusionNumeriqueReadModel> {
    const { codeDepartement } = params

    // 1) Total des lieux
    const totalLieuxInclusionNumerique = await prisma.$queryRaw<
      Array<{ nb_lieux_inclusion_numerique: number }>
    >(Prisma.sql`
      SELECT COUNT(*)::int AS nb_lieux_inclusion_numerique
      FROM main.structure s
      ${JOIN_ADRESSE}
      WHERE s.structure_cartographie_nationale_id IS NOT NULL
      ${whereAvecFiltreDept(codeDepartement)};
    `)

    // 2) Lieux secteur public (code catégorie '7%')
    const lieuxInclusionNumeriqueSecteurPublic = await prisma.$queryRaw<
      Array<{ nb_lieux_inclusion_numerique_public: number }>
    >(Prisma.sql`
      SELECT COUNT(*)::int AS nb_lieux_inclusion_numerique_public
      FROM main.structure s
      ${JOIN_ADRESSE}
      WHERE s.structure_cartographie_nationale_id IS NOT NULL
        AND s.categorie_juridique LIKE '7%'
        ${whereAvecFiltreDept(codeDepartement)};
    `)

    // 3) Répartition par catégorie (CASE unifié + LEFT JOIN CJ pour inclure NULL)
    const repartitionLieuxParCategorieJuridique = await prisma.$queryRaw<
      Array<{ categorie_finale: string; nb_lieux_inclusion_numerique: number }>
    >(Prisma.sql`
      SELECT
        ${CJ_CASE} AS categorie_finale,
        COUNT(*)::int AS nb_lieux_inclusion_numerique
      FROM main.structure s
        ${JOIN_ADRESSE}
        LEFT JOIN reference.categories_juridiques cj ON s.categorie_juridique = cj.code
      WHERE s.structure_cartographie_nationale_id IS NOT NULL
      ${whereAvecFiltreDept(codeDepartement)}
      GROUP BY categorie_finale
      ORDER BY nb_lieux_inclusion_numerique DESC;
    `)

    // 4) Zones prioritaires (FRR ∪ QPV)
    const nombreStructuresZonesPrioritaires = await prisma.$queryRaw<
      Array<{ nb_structures: number }>
    >(Prisma.sql`
      SELECT COUNT(*)::int AS nb_structures
      FROM main.structure s
        ${JOIN_ADRESSE}
        LEFT JOIN admin.zonage z
          ON (z.type = 'FRR' AND a.code_insee = z.code_insee)
          OR (z.type = 'QPV' AND public.st_contains(z.geom, a.geom))
      WHERE s.structure_cartographie_nationale_id IS NOT NULL
      ${whereAvecFiltreDept(codeDepartement)};
    `)

    // 5) QPV uniquement
    const nombreStructuresQPV = await prisma.$queryRaw<Array<{ nb_structures: number }>>(Prisma.sql`
      SELECT COUNT(*)::int AS nb_structures
      FROM main.structure s
        ${JOIN_ADRESSE}
        LEFT JOIN admin.zonage z
          ON (z.type = 'QPV' AND public.st_contains(z.geom, a.geom))
      WHERE s.structure_cartographie_nationale_id IS NOT NULL
      ${whereAvecFiltreDept(codeDepartement)};
    `)

    // 6) FRR uniquement
    const nombreStructuresFRR = await prisma.$queryRaw<Array<{ nb_structures: number }>>(Prisma.sql`
      SELECT COUNT(*)::int AS nb_structures
      FROM main.structure s
        ${JOIN_ADRESSE}
        LEFT JOIN admin.zonage z
          ON (z.type = 'FRR' AND a.code_insee = z.code_insee)
      WHERE s.structure_cartographie_nationale_id IS NOT NULL
      ${whereAvecFiltreDept(codeDepartement)};
    `)

    // 7) Programmes nationaux (avec alias AS count partout)
    const nombreStructuresAvecProgrammeNational = await prisma.$queryRaw<Array<{ count: number }>>(Prisma.sql`
      SELECT COUNT(*)::int AS count
      FROM main.structure s
        ${JOIN_ADRESSE}
      WHERE s.dispositif_programmes_nationaux IS NOT NULL
      ${whereAvecFiltreDept(codeDepartement)};
    `)

    const nombreStructuresAvecConseillersNumeriques = await prisma.$queryRaw<Array<{ count: number }>>(Prisma.sql`
      SELECT COUNT(*)::int AS count
      FROM main.structure s
        ${JOIN_ADRESSE}
      WHERE 'Conseillers numériques' = ANY(s.dispositif_programmes_nationaux)
      ${whereAvecFiltreDept(codeDepartement)};
    `)

    const nombreStructuresAvecFranceServices = await prisma.$queryRaw<Array<{ count: number }>>(Prisma.sql`
      SELECT COUNT(*)::int AS count
      FROM main.structure s
        ${JOIN_ADRESSE}
      WHERE 'France Services' = ANY(s.dispositif_programmes_nationaux)
      ${whereAvecFiltreDept(codeDepartement)};
    `)

    return {
      lieuxInclusionNumeriqueSecteurPublic,
      nombreStructuresAvecConseillersNumeriques,
      nombreStructuresAvecFranceServices,
      nombreStructuresAvecProgrammeNational,
      nombreStructuresFRR,
      nombreStructuresQPV,
      nombreStructuresZonesPrioritaires,
      repartitionLieuxParCategorieJuridique,
      totalLieuxInclusionNumerique,
    }
  }
}
