import { reportLoaderError } from './shared/sentryErrorReporter'
import prisma from '../../prisma/prismaClient'
import { AidantMediateurReadModel, ListeAidantsMediateursLoader, ListeAidantsMediateursReadModel } from '@/use-cases/queries/RecupererListeAidantsMediateurs'
import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'

export class PrismaListeAidantsMediateursLoader implements ListeAidantsMediateursLoader {
  async get(territoire: string, page: number, limite: number)
    : Promise<ErrorReadModel | ListeAidantsMediateursReadModel> {
    try {
      const offset = page * limite

      // Monitoring des performances
      const startTotal = Date.now()
      const startAidants = Date.now()
      
      // Récupération des aidants avec pagination
      const aidantsData = await this.getAidantsPagines(territoire, limite, offset)
      const aidantsTime = Date.now() - startAidants
      
      const startStats = Date.now()
      const statsData = await this.getStatistiques(territoire)
      const statsTime = Date.now() - startStats
      
      const totalTime = Date.now() - startTotal
      
      // Log des performances
      console.log(`[PrismaListeAidantsMediateursLoader] Performance:
        - getAidantsPagines: ${aidantsTime}ms
        - getStatistiques: ${statsTime}ms
        - Total: ${totalTime}ms
        - Territoire: ${territoire}, Page: ${page}, Limite: ${limite}`)

      const totalCount = statsData.totalActeursNumerique
      const totalPages = Math.ceil(totalCount / limite)
      return {
        aidants: aidantsData,
        displayPagination: totalCount > limite,
        limite,
        page,
        total: totalCount,
        totalAccompagnements: statsData.totalAccompagnements,
        totalActeursNumerique: statsData.totalActeursNumerique,
        totalConseillersNumerique: statsData.totalConseillersNumerique,
        totalPages,
      }
    } catch (error) {
      reportLoaderError(error, 'PrismaListeAidantsMediateursLoader', {
        limite,
        operation: 'get',
        page,
        territoire,
      })
      return {
        message: 'Impossible de récupérer la liste des aidants et médiateurs numériques',
        type: 'error',
      }
    }
  }

  private async getAidantsPagines(territoire: string, limite: number, offset: number)
    : Promise<Array<AidantMediateurReadModel>> {
    try {
      const queryStart = Date.now()
      const personnes =
        territoire === 'France'
          ? await prisma.$queryRaw<Array<PersonneQueryResult>>`
          SELECT
            pe.id,
            pe.nom,
            pe.prenom,
            pe.is_coordinateur as coordinateur,
            pe.labellisation_aidant_connect as aidants_connect,
            pe.est_actuellement_conseiller_numerique as conseiller_numerique,
            pe.est_actuellement_mediateur_en_poste as est_actuellement_mediateur_en_poste,
            array_agg(DISTINCT f.label) AS formations,
            BOOL_OR(f.pix) AS pix,
            BOOL_OR(f.remn) AS remn,
            COALESCE(SUM(ac.accompagnements), 0) AS accompagnements,
            COALESCE(pe.nb_accompagnements_ac, 0) AS accompagnements_ac
          FROM min.personne_enrichie pe
                 LEFT JOIN main.formation f ON pe.id = f.personne_id
                 LEFT JOIN main.activites_coop ac ON pe.id = ac.personne_id
          WHERE (pe.est_actuellement_mediateur_en_poste = true OR pe.est_actuellement_aidant_numerique_en_poste = true)
          GROUP BY pe.id, pe.nom, pe.prenom, pe.is_mediateur,pe.est_actuellement_mediateur_en_poste, pe.is_coordinateur, pe.labellisation_aidant_connect, pe.est_actuellement_conseiller_numerique, pe.nb_accompagnements_ac
          ORDER BY pe.nom, pe.prenom
          LIMIT ${limite} OFFSET ${offset};
        `
          : await prisma.$queryRaw<Array<PersonneQueryResult>>`
            SELECT
              pe.id,
              pe.nom,
              pe.prenom,
              pe.is_coordinateur as coordinateur,
              pe.labellisation_aidant_connect as aidants_connect,
              pe.est_actuellement_conseiller_numerique as conseiller_numerique,
              pe.est_actuellement_mediateur_en_poste as est_actuellement_mediateur_en_poste,
              array_agg(DISTINCT f.label) AS formations,
              BOOL_OR(f.pix) AS pix,
              BOOL_OR(f.remn) AS remn,
              COALESCE(SUM(ac.accompagnements), 0) AS accompagnements,
              COALESCE(pe.nb_accompagnements_ac, 0) AS accompagnements_ac
            FROM min.personne_enrichie pe
                   LEFT JOIN main.formation f ON pe.id = f.personne_id
                   LEFT JOIN main.activites_coop ac ON pe.id = ac.personne_id
                   LEFT JOIN main.structure s ON s.id = pe.structure_employeuse_id
                   LEFT JOIN main.adresse a ON a.id = s.adresse_id
            WHERE (pe.est_actuellement_mediateur_en_poste = true OR pe.est_actuellement_aidant_numerique_en_poste = true)
              AND a.departement = ${territoire}
            GROUP BY pe.id, pe.nom, pe.prenom, pe.est_actuellement_mediateur_en_poste, pe.is_coordinateur, pe.labellisation_aidant_connect, pe.est_actuellement_conseiller_numerique, pe.nb_accompagnements_ac
            ORDER BY pe.nom, pe.prenom
            LIMIT ${limite} OFFSET ${offset};
          `
      
      const queryTime = Date.now() - queryStart
      const mappingStart = Date.now()
      
      const result = personnes.map(personne => {
        const isCoordinateur = Boolean(personne.coordinateur)
        const isMediateur = Boolean(personne.est_actuellement_mediateur_en_poste)
        const hasAidantConnect = Boolean(personne.aidants_connect)
        const hasConseillerNumerique = Boolean(personne.conseiller_numerique)

        const roles: Array<string> = []
        if (isCoordinateur) {roles.push('Coordinateur')}
        if (isMediateur) {roles.push('Médiateur')}
        else {roles.push('aidant')}
        const labelisations: Array<'aidants connect' | 'conseiller numérique'> = []
        if (hasConseillerNumerique) {
          labelisations.push('conseiller numérique')
        } 
        if (hasAidantConnect) {
          labelisations.push('aidants connect')
        }

        // Construction du tableau des formations avec PIX et REMN
        const formations = [...personne.formations.filter(item => Boolean(item) && item.trim() !== '')]
        if (personne.pix) {
          formations.push('PIX')
        }
        if (personne.remn) {
          formations.push('REMN')
        }

        return {
          formations,
          id: String(personne.id),
          labelisations,
          nbAccompagnements: Number(personne.accompagnements) + Number(personne.accompagnements_ac) ,
          nom: personne.nom ?? '',
          prenom: personne.prenom ?? '',
          role: roles,
        }
      })
      
      const mappingTime = Date.now() - mappingStart
      
      console.log(`[getAidantsPagines] Performance:
        - Query: ${queryTime}ms
        - Mapping: ${mappingTime}ms
        - Total: ${queryTime + mappingTime}ms
        - Results: ${personnes.length} rows`)
      
      return result
    } catch (error) {
      reportLoaderError(error, 'PrismaListeAidantsMediateursLoader.getAidantsPagines', {
        limite,
        offset,
      })
      return []
    }
  }

  private async getStatistiques(territoire: string): Promise<{
    totalAccompagnements: number
    totalActeursNumerique: number
    totalConseillersNumerique: number
  }> {
    const statsStart = Date.now()
    
    // Nombre total d'accompagnements réalisés
    const accompStart = Date.now()
    const accompagnementsResult = territoire === 'France'
      ? await prisma.$queryRaw<Array<{ total_accompagnements_realises: bigint }>>`
        SELECT SUM(accompagnements) AS total_accompagnements_realises
        FROM main.activites_coop
        WHERE main.activites_coop.date >= CURRENT_DATE - INTERVAL '30 days';
          `
      : await prisma.$queryRaw<Array<{ total_accompagnements_realises: bigint }>>`
            SELECT SUM(main.activites_coop.accompagnements) AS total_accompagnements_realises
            FROM main.activites_coop
            JOIN main.structure ON main.activites_coop.structure_id = main.structure.id
            JOIN main.adresse ON main.structure.adresse_id = main.adresse.id
            WHERE main.adresse.departement = ${territoire}
              and main.activites_coop.date >= CURRENT_DATE - INTERVAL '30 days'
          `
    const accompagnementsRealises = Number(accompagnementsResult[0]?.total_accompagnements_realises || 0)
    const accompTime = Date.now() - accompStart

    // Statistiques des personnes en poste
    const conseillerStart = Date.now()
    const conseillersResult =
      territoire === 'France'
        ? await prisma.$queryRaw<
          Array<{ aidant_connect: bigint; conseillers_numeriques: bigint; mediateur: bigint }>>`
        SELECT
          COUNT(*) FILTER (WHERE est_actuellement_conseiller_numerique = true) AS conseillers_numeriques,
          COUNT(*) FILTER (WHERE est_actuellement_mediateur_en_poste = true AND est_actuellement_conseiller_numerique = false) AS mediateur,
          COUNT(*) FILTER (WHERE est_actuellement_aidant_numerique_en_poste = true) AS aidant_connect
        FROM min.personne_enrichie
          `
        : await prisma.$queryRaw<
          Array<{ aidant_connect: bigint; conseillers_numeriques: bigint; mediateur: bigint }>>`
        SELECT
          COUNT(*) FILTER (WHERE pe.est_actuellement_conseiller_numerique = true) AS conseillers_numeriques,
          COUNT(*) FILTER (WHERE pe.est_actuellement_mediateur_en_poste = true AND pe.est_actuellement_conseiller_numerique = false) AS mediateur,
          COUNT(*) FILTER (WHERE pe.est_actuellement_aidant_numerique_en_poste = true) AS aidant_connect
        FROM min.personne_enrichie pe
        LEFT JOIN main.structure s ON s.id = pe.structure_employeuse_id
        LEFT JOIN main.adresse a ON a.id = s.adresse_id
        WHERE a.departement = ${territoire}
          `
    const totalConseillersNumeriques = Number(conseillersResult[0]?.conseillers_numeriques || 0)
    const totalPersonnes = Number(conseillersResult[0]?.conseillers_numeriques || 0)
      + Number(conseillersResult[0]?.aidant_connect || 0)
      + Number(conseillersResult[0]?.mediateur || 0)
    
    const conseillerTime = Date.now() - conseillerStart
    const totalStatsTime = Date.now() - statsStart
    
    console.log(`[getStatistiques] Performance:
      - Accompagnements query: ${accompTime}ms
      - Conseillers query: ${conseillerTime}ms
      - Total: ${totalStatsTime}ms`)

    return {
      totalAccompagnements: accompagnementsRealises,
      totalActeursNumerique: totalPersonnes,
      totalConseillersNumerique: totalConseillersNumeriques,
    }
  }
}

interface PersonneQueryResult {
  accompagnements: number
  accompagnements_ac: number
  aidants_connect: boolean
  conseiller_numerique: boolean
  coordinateur: boolean
  est_actuellement_mediateur_en_poste: boolean
  formations: Array<string>
  id: number
  nom: null | string
  pix: boolean
  prenom: null | string
  remn: boolean
}
