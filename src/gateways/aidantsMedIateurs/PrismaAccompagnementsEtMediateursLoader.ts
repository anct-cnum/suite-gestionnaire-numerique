import prisma from '../../../prisma/prismaClient'
import { reportLoaderError } from '../shared/sentryErrorReporter'
import {
  AccompagnementsEtMediateursLoader,
  AccompagnementsEtMediateursReadModel,
} from '@/use-cases/queries/RecupererAccompagnementsEtMediateurs'
import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'

export class PrismaAccompagnementsEtMediateursLoader implements AccompagnementsEtMediateursLoader {
  async get(territoire = 'France'): Promise<AccompagnementsEtMediateursReadModel | ErrorReadModel> {
    try {
      // Phase 1 : lancer les requêtes indépendantes en parallèle
      const [thematiquesResult, personnes] = await Promise.all([
        this.#recupererThematiques(territoire),
        // Une seule requête pour toutes les personnes (médiateurs, conseillers, aidants connect)
        prisma.personneEnrichieView.findMany({
          select: {
            est_actuellement_conseiller_numerique: true,
            est_actuellement_mediateur_en_poste: true,
            id: true,
            labellisation_aidant_connect: true,
            structure_employeuse_id: true,
          },
          where: {
            OR: [{ est_actuellement_mediateur_en_poste: true }, { est_actuellement_conseiller_numerique: true }],
          },
        }),
      ])

      const totalThematiques = thematiquesResult.reduce((sum, thematique) => sum + Number(thematique.nb), 0)
      const thematiques = thematiquesResult.map((thematique) => ({
        nom: thematique.categorie,
        pourcentage: Math.round((Number(thematique.nb) / totalThematiques) * 100),
        ...(thematique.categorie === 'Autres thématiques' && Number(thematique.nb_distinctes) > 0
          ? { nombreThematiquesRestantes: Number(thematique.nb_distinctes) }
          : {}),
      }))

      // Filtrage territoire en un seul appel (au lieu de 3 séparés)
      const structuresInTerritoire = await this.#recupererStructuresInTerritoire(personnes, territoire)

      // Répartition par catégorie à partir de la liste unique
      const mediateursData: Array<{ personneId: number; structureId: null | number }> = []
      const conseillersData: Array<{ personneId: number; structureId: null | number }> = []
      const aidantsConnectData: Array<{ personneId: number; structureId: null | number }> = []

      for (const personne of personnes) {
        const estDansTerritoire =
          territoire === 'France' ||
          (personne.structure_employeuse_id !== null && structuresInTerritoire.has(personne.structure_employeuse_id))

        if (!estDansTerritoire) {
          continue
        }

        const mapped = { personneId: personne.id, structureId: personne.structure_employeuse_id }

        if (personne.est_actuellement_mediateur_en_poste) {
          mediateursData.push(mapped)
          if (personne.labellisation_aidant_connect === true) {
            aidantsConnectData.push(mapped)
          }
        }
        if (personne.est_actuellement_conseiller_numerique) {
          conseillersData.push(mapped)
        }
      }

      const mediateursIds = mediateursData.map((mediateur) => mediateur.personneId)
      const mediateursNumeriques = mediateursData.length
      const conseillerNumeriques = conseillersData.length
      const habilitesAidantsConnect = aidantsConnectData.length

      // Phase 2 : formations et structures habilitées en parallèle
      const structureEmployeuseIds = [
        ...new Set(aidantsConnectData.map((aidant) => aidant.structureId).filter((id): id is number => id !== null)),
      ]

      const [formations, structuresHabiliteesList] = await Promise.all([
        prisma.formation.findMany({
          distinct: ['personne_id'],
          select: { personne_id: true },
          where: { personne_id: { in: mediateursIds } },
        }),
        structureEmployeuseIds.length > 0
          ? prisma.$queryRaw<Array<{ count: bigint }>>`
            -- Refonte 2026 : structure_employeuse_id pointe sur SA (V092),
            -- on compte les SA habilitees AC.
            SELECT COUNT(DISTINCT s.id) AS count
            FROM main.structure_administrative s
            WHERE s.structure_ac_id IS NOT NULL
              AND s.id = ANY(${structureEmployeuseIds}::bigint[])
          `
          : Promise.resolve([{ count: 0n }]),
      ])

      const mediateursFormes = formations.length
      const structuresHabilitees = Number(structuresHabiliteesList[0]?.count || 0)

      const pourcentageMediateursFormes =
        mediateursNumeriques > 0 ? Math.round((mediateursFormes / mediateursNumeriques) * 100) : 0

      return {
        conseillerNumeriques,
        habilitesAidantsConnect,
        mediateursFormes,
        mediateursNumeriques,
        pourcentageMediateursFormes,
        structuresHabilitees,
        thematiques,
      }
    } catch (error) {
      reportLoaderError(error, 'PrismaAccompagnementsEtMediateursLoader', {
        operation: 'get',
        territoire,
      })
      return {
        message: 'Impossible de récupérer les données des accompagnements et médiateurs',
        type: 'error',
      }
    }
  }

  async #recupererStructuresInTerritoire(
    personnes: ReadonlyArray<{ structure_employeuse_id: null | number }>,
    territoire: string
  ): Promise<Set<number>> {
    if (territoire === 'France') {
      return new Set()
    }

    const structureIds = [
      ...new Set(
        personnes
          .filter(
            (personne): personne is { structure_employeuse_id: number } & typeof personne =>
              personne.structure_employeuse_id !== null
          )
          .map((personne) => personne.structure_employeuse_id)
      ),
    ]

    const structures = await prisma.main_structure_administrative.findMany({
      select: { id: true },
      where: {
        adresse: {
          departement: territoire,
        },
        id: { in: structureIds },
      },
    })

    return new Set(structures.map((structure) => structure.id))
  }

  async #recupererThematiques(
    territoire: string
  ): Promise<Array<{ categorie: string; nb: bigint; nb_distinctes: bigint }>> {
    if (territoire === 'France') {
      return prisma.$queryRaw<Array<{ categorie: string; nb: bigint; nb_distinctes: bigint }>>`
        WITH thematiques AS (
          SELECT unnest(thematiques) AS thematique, SUM(accompagnements) AS nb_accompagnements
          FROM main.activites_coop
          GROUP BY thematique
        )
        SELECT CASE
          WHEN thematique ILIKE '%internet%' THEN 'Internet'
          WHEN thematique ILIKE ANY (ARRAY['%courriel%','%email%','%mail%']) THEN 'Courriel'
          WHEN thematique ILIKE ANY (ARRAY['%materiel%','%équipement%','%equipement%']) THEN 'Équipement informatique'
          WHEN thematique ILIKE ANY (ARRAY['%démarche%','%demarche%','%en ligne%']) THEN 'Démarches en ligne'
          ELSE 'Autres thématiques'
        END AS categorie,
        SUM(nb_accompagnements) AS nb,
        COUNT(DISTINCT thematique) AS nb_distinctes
        FROM thematiques
        GROUP BY categorie
        ORDER BY nb DESC
      `
    }

    return prisma.$queryRaw<Array<{ categorie: string; nb: bigint; nb_distinctes: bigint }>>`
      WITH thematiques AS (
        SELECT unnest(ac.thematiques) AS thematique, SUM(ac.accompagnements) AS nb_accompagnements
        -- Refonte 2026 : activites_coop est indexe par lieu_id (V084),
        -- l'adresse vient du lieu_inclusion.
        FROM main.activites_coop ac
        JOIN main.lieu_inclusion l ON ac.lieu_id = l.id
        JOIN main.adresse a ON l.adresse_id = a.id
        WHERE ac.accompagnements > 0 AND a.departement = ${territoire}
        GROUP BY thematique
      )
      SELECT CASE
        WHEN thematique ILIKE '%internet%' THEN 'Internet'
        WHEN thematique ILIKE ANY (ARRAY['%courriel%','%email%','%mail%']) THEN 'Courriel'
        WHEN thematique ILIKE ANY (ARRAY['%materiel%','%équipement%','%equipement%']) THEN 'Équipement informatique'
        WHEN thematique ILIKE ANY (ARRAY['%démarche%','%demarche%','%en ligne%']) THEN 'Démarches en ligne'
        ELSE 'Autres thématiques'
      END AS categorie,
      SUM(nb_accompagnements) AS nb,
      COUNT(DISTINCT thematique) AS nb_distinctes
      FROM thematiques
      GROUP BY categorie
      ORDER BY nb DESC
    `
  }
}
