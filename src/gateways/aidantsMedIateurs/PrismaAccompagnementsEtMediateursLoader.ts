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
      const mediateurs = await prisma.personneEnrichieView.findMany({
        select: { id: true, structure_employeuse_id: true },
        where: { est_actuellement_mediateur_en_poste: true },
      })
      const mediateursIds = await this.getPersonnesInTerritoire(mediateurs, territoire)
      const mediateursNumeriques = mediateursIds.length

      // Nombre de conseillers numériques (actuellement en poste avec financement état)
      const conseillers = await prisma.personneEnrichieView.findMany({
        select: { id: true, structure_employeuse_id: true },
        where: { est_actuellement_conseiller_numerique: true },
      })
      const conseillersIds = await this.getPersonnesInTerritoire(conseillers, territoire)
      const conseillerNumeriques = conseillersIds.length

      // Nombre de médiateurs numériques formés (en poste avec au moins 1 formation)
      const formations = await prisma.formation.findMany({
        distinct: ['personne_id'],
        select: { personne_id: true },
        where: { personne_id: { in: mediateursIds } },
      })
      const mediateursFormes = formations.length

      // Habilités Aidants Connect (médiateurs ou aidants numériques en poste + labellisés AC)
      const aidantsConnect = await prisma.personneEnrichieView.findMany({
        select: { id: true, structure_employeuse_id: true },
        where: {
          AND: [
            { est_actuellement_mediateur_en_poste: true },
            { labellisation_aidant_connect: true },
          ],
        },
      })
      const aidantsConnectIds = await this.getPersonnesInTerritoire(aidantsConnect, territoire)
      const habilitesAidantsConnect = aidantsConnectIds.length

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

  private async getPersonnesInTerritoire(
    personnes: Array<{ id: number; structure_employeuse_id: null | number }>,
    territoire: string
  ): Promise<Array<number>> {
    if (territoire === 'France') {
      return personnes.map(personne => personne.id)
    }

    const structureIds = [...new Set(personnes
      .filter((personne): personne is { structure_employeuse_id: number } & typeof personne => 
        personne.structure_employeuse_id !== null)
      .map(personne => personne.structure_employeuse_id))]
    
    const structures = await prisma.main_structure.findMany({
      select: { id: true },
      where: { 
        adresse: {
          departement: territoire,
        },
        id: { in: structureIds },
      },
    })
    
    const structuresInTerritoire = new Set(structures.map(structure => structure.id))
    
    return personnes
      .filter((personne): personne is { structure_employeuse_id: number } & typeof personne => 
        personne.structure_employeuse_id !== null && 
      structuresInTerritoire.has(personne.structure_employeuse_id))
      .map(personne => personne.id)
  }
}