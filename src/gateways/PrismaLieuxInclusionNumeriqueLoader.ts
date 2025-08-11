import prisma from '../../prisma/prismaClient'

export class PrismaLieuxInclusionNumeriqueLoader {
  async getDepartemental(codeDepartement: string) : Promise<LieuxInclusionNumeriqueReadModel> {
    const totalLieuxInclusionNumerique: Array<{ nb_lieux_inclusion_numerique: number }> = await prisma.$queryRaw`
      SELECT COUNT(*)::int AS nb_lieux_inclusion_numerique
      FROM main.structure
             INNER JOIN main.adresse ON main.adresse.id = main.structure.adresse_id
      WHERE main.adresse.departement = ${codeDepartement} AND
            structure_cartographie_nationale_id IS NOT NULL;
    `

    const lieuxInclusionNumeriqueSecteurPublic:Array<{ nb_lieux_inclusion_numerique_public: number }>
      = await prisma.$queryRaw`
      SELECT COUNT(*)::int AS nb_lieux_inclusion_numerique_public
      FROM main.structure
             INNER JOIN main.adresse ON main.adresse.id = main.structure.adresse_id
      WHERE (structure_cartographie_nationale_id IS NOT NULL)
        AND categorie_juridique LIKE ('7%');
    `

    const repartitionLieuxParCategorieJuridique: Array<{
      categorie_finale: string
      nb_lieux_inclusion_numerique: number
    }> = await prisma.$queryRaw`
      SELECT
        CASE
          WHEN cj.nom = 'Commune et commune nouvelle' THEN cj.nom
          WHEN cj.nom = 'Centre communal d''action sociale' THEN cj.nom
          WHEN cj.nom ILIKE '%association%' THEN cj.nom
          WHEN cj.nom = 'Département' THEN cj.nom
          WHEN cj.nom = 'Communauté d''agglomération' THEN cj.nom
          WHEN cj.nom ILIKE '%Pôle d''équilibre territorial et rural%' THEN cj.nom
          WHEN cj.nom = 'Métropole' THEN cj.nom
          WHEN cj.nom = 'Région' THEN cj.nom
          WHEN cj.nom = 'Ministère' THEN cj.nom
          WHEN cj.code NOT LIKE '7%' THEN 'Acteur privé'
          ELSE 'Autres'
          END AS categorie_finale,
        COUNT(*)::int AS nb_lieux_inclusion_numerique
      FROM main.structure s
             INNER JOIN main.adresse ON main.adresse.id = s.adresse_id
             INNER JOIN reference.categories_juridiques cj ON s.categorie_juridique = cj.code
      WHERE s.structure_cartographie_nationale_id IS NOT NULL
      GROUP BY categorie_finale
      ORDER BY nb_lieux_inclusion_numerique DESC;
    `

    const nombreStructuresZonesPrioritaires: Array<{ nb_structures: number }> = await prisma.$queryRaw`
      SELECT COUNT(*)::int AS nb_structures
      FROM main.structure
             INNER JOIN main.adresse ON structure.adresse_id = adresse.id
             INNER JOIN admin.zonage ON
        (type = 'FRR' AND adresse.code_insee = zonage.code_insee)
          OR (type = 'QPV' AND public.st_contains(zonage.geom, adresse.geom))
      WHERE structure_cartographie_nationale_id IS NOT NULL;
    `

    const nombreStructuresQPV: Array<{ nb_structures: number }> = await prisma.$queryRaw`
      SELECT COUNT(*)::int AS nb_structures
      FROM main.structure
             INNER JOIN main.adresse ON structure.adresse_id = adresse.id
             INNER JOIN admin.zonage ON
        (type = 'QPV' AND public.st_contains(zonage.geom, adresse.geom))
      WHERE structure_cartographie_nationale_id IS NOT NULL;
    `

    const nombreStructuresFRR: Array<{ nb_structures: number }> = await prisma.$queryRaw`
      SELECT COUNT(*)::int AS nb_structures
      FROM main.structure
             INNER JOIN main.adresse ON structure.adresse_id = adresse.id
             INNER JOIN admin.zonage ON
        (type = 'FRR' AND adresse.code_insee = zonage.code_insee)
      WHERE structure_cartographie_nationale_id IS NOT NULL;
    `

    const nombreStructuresAvecProgrammeNational: Array<{ count: number }> = await prisma.$queryRaw`
      SELECT COUNT(*)::int
      FROM main.structure
             INNER JOIN main.adresse ON main.adresse.id = main.structure.adresse_id
      WHERE dispositif_programmes_nationaux IS NOT NULL;
    `

    const nombreStructuresAvecConseillersNumeriques: Array<{ count: number }> = await prisma.$queryRaw`
      SELECT COUNT(*)::int
      FROM main.structure
             INNER JOIN main.adresse ON main.adresse.id = main.structure.adresse_id
      WHERE 'Conseillers numériques' = ANY(dispositif_programmes_nationaux);
    `

    const nombreStructuresAvecFranceServices: Array<{ count: number }> = await prisma.$queryRaw`
      SELECT COUNT(*)::int
      FROM main.structure
             INNER JOIN main.adresse ON main.adresse.id = main.structure.adresse_id
      WHERE 'France Services' = ANY(dispositif_programmes_nationaux);
    `

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

  async getNational() : Promise<LieuxInclusionNumeriqueReadModel> {
    const totalLieuxInclusionNumerique: Array<{ nb_lieux_inclusion_numerique: number }> = await prisma.$queryRaw`
      SELECT COUNT(*)::int AS nb_lieux_inclusion_numerique
      FROM main.structure
      WHERE structure_cartographie_nationale_id IS NOT NULL;
    `

    const lieuxInclusionNumeriqueSecteurPublic:Array<{ nb_lieux_inclusion_numerique_public: number }>
      = await prisma.$queryRaw`
      SELECT COUNT(*)::int AS nb_lieux_inclusion_numerique_public
      FROM main.structure
      WHERE (structure_cartographie_nationale_id IS NOT NULL)
        AND categorie_juridique LIKE ('7%');
    `

    const repartitionLieuxParCategorieJuridique: Array<{
      categorie_finale: string
      nb_lieux_inclusion_numerique: number
    }> = await prisma.$queryRaw`
      SELECT
        CASE
          WHEN cj.nom = 'Commune et commune nouvelle' THEN cj.nom
          WHEN cj.nom = 'Centre communal d''action sociale' THEN cj.nom
          WHEN cj.nom ILIKE '%association%' THEN cj.nom
          WHEN cj.nom = 'Département' THEN cj.nom
          WHEN cj.nom = 'Communauté d''agglomération' THEN cj.nom
          WHEN cj.nom ILIKE '%Pôle d''équilibre territorial et rural%' THEN cj.nom
          WHEN cj.nom = 'Métropole' THEN cj.nom
          WHEN cj.nom = 'Région' THEN cj.nom
          WHEN cj.nom = 'Ministère' THEN cj.nom
          WHEN cj.code NOT LIKE '7%' THEN 'Acteur privé'
          ELSE 'Autres'
          END AS categorie_finale,
        COUNT(*)::int AS nb_lieux_inclusion_numerique
      FROM main.structure s
             INNER JOIN reference.categories_juridiques cj ON s.categorie_juridique = cj.code
      WHERE s.structure_cartographie_nationale_id IS NOT NULL
      GROUP BY categorie_finale
      ORDER BY nb_lieux_inclusion_numerique DESC;
    `

    const nombreStructuresZonesPrioritaires: Array<{ nb_structures: number }> = await prisma.$queryRaw`
      SELECT COUNT(*)::int AS nb_structures
      FROM main.structure
             INNER JOIN main.adresse ON structure.adresse_id = adresse.id
             INNER JOIN admin.zonage ON
        (type = 'FRR' AND adresse.code_insee = zonage.code_insee)
          OR (type = 'QPV' AND public.st_contains(zonage.geom, adresse.geom))
      WHERE structure_cartographie_nationale_id IS NOT NULL;
    `

    const nombreStructuresQPV: Array<{ nb_structures: number }> = await prisma.$queryRaw`
      SELECT COUNT(*)::int AS nb_structures
      FROM main.structure
             INNER JOIN main.adresse ON structure.adresse_id = adresse.id
             INNER JOIN admin.zonage ON
        (type = 'QPV' AND public.st_contains(zonage.geom, adresse.geom))
      WHERE structure_cartographie_nationale_id IS NOT NULL;
    `

    const nombreStructuresFRR: Array<{ nb_structures: number }> = await prisma.$queryRaw`
      SELECT COUNT(*)::int AS nb_structures
      FROM main.structure
             INNER JOIN main.adresse ON structure.adresse_id = adresse.id
             INNER JOIN admin.zonage ON
        (type = 'FRR' AND adresse.code_insee = zonage.code_insee)
      WHERE structure_cartographie_nationale_id IS NOT NULL;
    `

    const nombreStructuresAvecProgrammeNational: Array<{ count: number }> = await prisma.$queryRaw`
      SELECT COUNT(*)::int
      FROM main.structure
      WHERE dispositif_programmes_nationaux IS NOT NULL;
    `

    const nombreStructuresAvecConseillersNumeriques: Array<{ count: number }> = await prisma.$queryRaw`
      SELECT COUNT(*)::int
      FROM main.structure
      WHERE 'Conseillers numériques' = ANY(dispositif_programmes_nationaux);
    `

    const nombreStructuresAvecFranceServices: Array<{ count: number }> = await prisma.$queryRaw`
      SELECT COUNT(*)::int
      FROM main.structure
      WHERE 'France Services' = ANY(dispositif_programmes_nationaux);
    `

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
export interface LieuxInclusionNumeriqueReadModel {
  lieuxInclusionNumeriqueSecteurPublic: Array<{ nb_lieux_inclusion_numerique_public: number }>
  nombreStructuresAvecConseillersNumeriques: Array<{ count: number }>
  nombreStructuresAvecFranceServices: Array<{ count: number }>
  nombreStructuresAvecProgrammeNational: Array<{ count: number }> // ou { count: string }[] selon le type SQL
  nombreStructuresFRR: Array<{ nb_structures: number }>
  nombreStructuresQPV: Array<{ nb_structures: number }>
  nombreStructuresZonesPrioritaires: Array<{ nb_structures: number }>
  repartitionLieuxParCategorieJuridique: Array<{
    categorie_finale: string
    nb_lieux_inclusion_numerique: number
  }>
  totalLieuxInclusionNumerique: Array<{ nb_lieux_inclusion_numerique: number }>
}
