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
        : await prisma.$queryRaw<Array<{ categorie: string; nb: bigint; nb_distinctes: bigint }>>`
            WITH thematiques AS (
              SELECT unnest(ac.thematiques) AS thematique, SUM(ac.accompagnements) AS nb_accompagnements
              FROM main.activites_coop ac
              JOIN main.structure s ON ac.structure_id = s.id
              JOIN main.adresse a ON s.adresse_id = a.id
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

      const totalThematiques = thematiquesResult.reduce((sum, thematique) => sum + Number(thematique.nb), 0)
      const thematiques = thematiquesResult.map(thematique => ({
        nom: thematique.categorie,
        pourcentage: Math.round(Number(thematique.nb) / totalThematiques * 100),
        ...thematique.categorie === 'Autres thématiques' && Number(thematique.nb_distinctes) > 0 ? { nombreThematiquesRestantes: Number(thematique.nb_distinctes) } : {},
      }))

      // Nombre de médiateurs numériques (actuellement en poste)
      const mediateursResult = territoire === 'France'
        ? await prisma.$queryRaw<Array<{ total_mediateurs_numeriques: bigint }>>`
            SELECT COUNT(*) AS total_mediateurs_numeriques
            FROM min.personne_enrichie
            WHERE est_actuellement_mediateur_en_poste = true
          `
        : await prisma.$queryRaw<Array<{ total_mediateurs_numeriques: bigint }>>`
            SELECT COUNT(*) AS total_mediateurs_numeriques
            FROM min.personne_enrichie
            WHERE est_actuellement_mediateur_en_poste = true
              AND departement_employeur = ${territoire}
          `
      const mediateursNumeriques = Number(mediateursResult[0]?.total_mediateurs_numeriques || 0)

      // Nombre de conseillers numériques (actuellement en poste avec financement état)
      const conseillersResult = territoire === 'France'
        ? await prisma.$queryRaw<Array<{ total_conseillers_numeriques: bigint }>>`
            SELECT COUNT(*) AS total_conseillers_numeriques
            FROM min.personne_enrichie
            WHERE est_actuellement_conseiller_numerique = true
          `
        : await prisma.$queryRaw<Array<{ total_conseillers_numeriques: bigint }>>`
            SELECT COUNT(*) AS total_conseillers_numeriques
            FROM min.personne_enrichie
            WHERE est_actuellement_conseiller_numerique = true
              AND departement_employeur = ${territoire}
          `
      const conseillerNumeriques = Number(conseillersResult[0]?.total_conseillers_numeriques || 0)

      // Nombre de médiateurs numériques formés (en poste avec au moins 1 formation)
      const mediateursFormesResult = territoire === 'France'
        ? await prisma.$queryRaw<Array<{ total_mediateurs_numeriques_formes: bigint }>>`
            SELECT COUNT(DISTINCT pe.id) AS total_mediateurs_numeriques_formes
            FROM min.personne_enrichie pe
            JOIN main.formation f ON pe.id = f.personne_id
            WHERE pe.est_actuellement_mediateur_en_poste = true
          `
        : await prisma.$queryRaw<Array<{ total_mediateurs_numeriques_formes: bigint }>>`
            SELECT COUNT(DISTINCT pe.id) AS total_mediateurs_numeriques_formes
            FROM min.personne_enrichie pe
            JOIN main.formation f ON pe.id = f.personne_id
            WHERE pe.est_actuellement_mediateur_en_poste = true
              AND pe.departement_employeur = ${territoire}
          `
      const mediateursFormes = Number(mediateursFormesResult[0]?.total_mediateurs_numeriques_formes || 0)

      // Habilités Aidants Connect (médiateurs ou aidants numériques en poste + labellisés AC)
      const aidantsConnectResult = territoire === 'France'
        ? await prisma.$queryRaw<Array<{ total_aidants_connect: bigint }>>`
            SELECT COUNT(*) AS total_aidants_connect
            FROM min.personne_enrichie
            WHERE (est_actuellement_aidant_numerique_en_poste = true OR est_actuellement_mediateur_en_poste = true)
              AND labellisation_aidant_connect = true
          `
        : await prisma.$queryRaw<Array<{ total_aidants_connect: bigint }>>`
            SELECT COUNT(*) AS total_aidants_connect
            FROM min.personne_enrichie
            WHERE (est_actuellement_aidant_numerique_en_poste = true OR est_actuellement_mediateur_en_poste = true)
              AND labellisation_aidant_connect = true
              AND departement_employeur = ${territoire}
          `
      const habilitesAidantsConnect = Number(aidantsConnectResult[0]?.total_aidants_connect || 0)

      // Nombre de structures habilitées (estimation basée sur les aidants)
      const structuresHabilitees = -1   

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