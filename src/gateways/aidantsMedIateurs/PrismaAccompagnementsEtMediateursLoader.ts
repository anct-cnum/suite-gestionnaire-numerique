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
      // Nombre total d'accompagnements réalisés
      const accompagnementsResult = territoire === 'France'
        ? await prisma.$queryRaw<Array<{ total_accompagnements_realises: bigint }>>`
            SELECT SUM(accompagnements) AS total_accompagnements_realises
            FROM main.activites_coop
          `
        : await prisma.$queryRaw<Array<{ total_accompagnements_realises: bigint }>>`
            SELECT SUM(ac.accompagnements) AS total_accompagnements_realises
            FROM main.activites_coop ac
            JOIN main.structure s ON ac.structure_id = s.id
            JOIN main.adresse a ON s.adresse_id = a.id
            WHERE a.departement = ${territoire}
          `
      const accompagnementsRealises = Number(accompagnementsResult[0]?.total_accompagnements_realises || 0)

      // Thématiques des accompagnements avec comptage des thématiques distinctes
      const thematiquesResult = territoire === 'France'
        ? await prisma.$queryRaw<Array<{ categorie: string; nb: bigint; nb_distinctes: bigint }>>`
            WITH base AS (
              SELECT ac.id, ac.accompagnements, unnest(ac.thematiques) AS th
              FROM main.activites_coop ac
            ),
            norm AS (
              SELECT
                CASE
                  WHEN th ILIKE '%internet%' THEN 'Internet'
                  WHEN th ILIKE ANY (ARRAY['%courriel%','%email%','%mail%']) THEN 'Courriel'
                  WHEN th ILIKE ANY (ARRAY['%materiel%','%équipement%','%equipement%']) THEN 'Équipement informatique'
                  WHEN th ILIKE ANY (ARRAY['%démarche%','%demarche%','%en ligne%']) THEN 'Démarches en ligne'
                  ELSE 'Autres thématiques'
                END AS categorie,
                accompagnements::bigint AS nb,
                th AS thematique_originale
              FROM base
            )
            SELECT 
              categorie, 
              SUM(nb) AS nb,
              COUNT(DISTINCT thematique_originale) AS nb_distinctes
            FROM norm
            GROUP BY categorie
            ORDER BY nb DESC
          `
        : await prisma.$queryRaw<Array<{ categorie: string; nb: bigint; nb_distinctes: bigint }>>`
            WITH base AS (
              SELECT ac.id, ac.accompagnements, unnest(ac.thematiques) AS th
              FROM main.activites_coop ac
              JOIN main.structure s ON ac.structure_id = s.id
              JOIN main.adresse a ON s.adresse_id = a.id
              WHERE ac.accompagnements > 0 AND a.departement = ${territoire}
            ),
            norm AS (
              SELECT
                CASE
                  WHEN th ILIKE '%internet%' THEN 'Internet'
                  WHEN th ILIKE ANY (ARRAY['%courriel%','%email%','%mail%']) THEN 'Courriel'
                  WHEN th ILIKE ANY (ARRAY['%materiel%','%équipement%','%equipement%']) THEN 'Équipement informatique'
                  WHEN th ILIKE ANY (ARRAY['%démarche%','%demarche%','%en ligne%']) THEN 'Démarches en ligne'
                  ELSE 'Autres thématiques'
                END AS categorie,
                accompagnements::bigint AS nb,
                th AS thematique_originale
              FROM base
            )
            SELECT 
              categorie, 
              SUM(nb) AS nb,
              COUNT(DISTINCT thematique_originale) AS nb_distinctes
            FROM norm
            GROUP BY categorie
            ORDER BY nb DESC
          `

      const totalThematiques = thematiquesResult.reduce((sum, thematique) => sum + Number(thematique.nb), 0)
      const thematiques = thematiquesResult.map(thematique => ({
        nom: thematique.categorie,
        pourcentage: Math.round(Number(thematique.nb) / totalThematiques * 100),
        ...thematique.categorie === 'Autres thématiques' && Number(thematique.nb_distinctes) > 0 ? { nombreThematiquesRestantes: Number(thematique.nb_distinctes) } : {},
      }))

      // Nombre de médiateurs numériques
      const mediateursResult = territoire === 'France'
        ? await prisma.$queryRaw<Array<{ total_mediateurs_numeriques: bigint }>>`
            SELECT COUNT(*) AS total_mediateurs_numeriques
            FROM main.personne
            WHERE is_mediateur
          `
        : await prisma.$queryRaw<Array<{ total_mediateurs_numeriques: bigint }>>`
            SELECT COUNT(*) AS total_mediateurs_numeriques
            FROM main.personne p
            JOIN main.personne_structures_emplois pl ON p.id = pl.personne_id
            JOIN main.structure s ON s.id = pl.structure_id
            JOIN main.adresse a ON s.adresse_id = a.id
            WHERE p.is_mediateur AND a.departement = ${territoire}
          `
      const mediateursNumeriques = Number(mediateursResult[0]?.total_mediateurs_numeriques || 0)

      // Nombre de conseillers numériques
      const conseillersResult = territoire === 'France'
        ? await prisma.$queryRaw<Array<{ total_conseillers_numeriques: bigint }>>`
            SELECT COUNT(*) AS total_conseillers_numeriques
            FROM main.personne
            WHERE is_mediateur AND (conseiller_numerique_id IS NOT NULL OR cn_pg_id IS NOT NULL)
          `
        : await prisma.$queryRaw<Array<{ total_conseillers_numeriques: bigint }>>`
            SELECT COUNT(*) AS total_conseillers_numeriques
            FROM main.personne p
            JOIN main.personne_structures_emplois pl ON p.id = pl.personne_id
            JOIN main.structure s ON s.id = pl.structure_id
            JOIN main.adresse a ON s.adresse_id = a.id
            WHERE p.is_mediateur AND (p.conseiller_numerique_id IS NOT NULL OR p.cn_pg_id IS NOT NULL)
              AND a.departement = ${territoire}
          `
      const conseillerNumeriques = Number(conseillersResult[0]?.total_conseillers_numeriques || 0)

      // Nombre de médiateurs formés
      const mediateursFormesResult = territoire === 'France'
        ? await prisma.$queryRaw<Array<{ total_mediateurs_numeriques_formes: bigint }>>`
            SELECT COUNT(*) AS total_mediateurs_numeriques_formes
            FROM main.personne
            JOIN main.formation ON personne.id = formation.personne_id
            WHERE is_mediateur AND (conseiller_numerique_id IS NOT NULL OR cn_pg_id IS NOT NULL)
          `
        : await prisma.$queryRaw<Array<{ total_mediateurs_numeriques_formes: bigint }>>`
            SELECT COUNT(*) AS total_mediateurs_numeriques_formes
            FROM main.personne p
            JOIN main.formation ON p.id = formation.personne_id
            JOIN main.personne_structures_emplois pl ON p.id = pl.personne_id
            JOIN main.structure s ON s.id = pl.structure_id
            JOIN main.adresse a ON s.adresse_id = a.id
            WHERE p.is_mediateur AND (p.conseiller_numerique_id IS NOT NULL OR p.cn_pg_id IS NOT NULL)
              AND a.departement = ${territoire}
          `
      const mediateursFormes = Number(mediateursFormesResult[0]?.total_mediateurs_numeriques_formes || 0)

      // Nombre d'Aidants Connect actifs
      const aidantsConnectResult = territoire === 'France'
        ? await prisma.$queryRaw<Array<{ total_aidants_connect: bigint }>>`
            SELECT COUNT(*) AS total_aidants_connect
            FROM main.personne
            WHERE aidant_connect_id IS NOT NULL AND is_active_ac
          `
        : await prisma.$queryRaw<Array<{ total_aidants_connect: bigint }>>`
            SELECT COUNT(*) AS total_aidants_connect
            FROM main.personne p
            JOIN main.structure s ON p.structure_id = s.id
            JOIN main.adresse a ON s.adresse_id = a.id
            WHERE p.aidant_connect_id IS NOT NULL AND p.is_active_ac
              AND a.departement = ${territoire}
          `
      const habilitesAidantsConnect = Number(aidantsConnectResult[0]?.total_aidants_connect || 0)

      // Nombre de structures habilitées (estimation basée sur les aidants)
      const structuresHabilitees = Math.round(habilitesAidantsConnect / 2.5)

      // Calcul du pourcentage de médiateurs formés
      const pourcentageMediateursFormes = mediateursNumeriques > 0 
        ? Math.round(mediateursFormes / mediateursNumeriques * 100) 
        : 0

      return {
        accompagnementsRealises,
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
}