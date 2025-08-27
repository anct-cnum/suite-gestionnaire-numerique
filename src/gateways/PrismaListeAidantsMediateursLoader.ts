import { reportLoaderError } from './shared/sentryErrorReporter'
import prisma from '../../prisma/prismaClient'
import { AidantMediateurReadModel, ListeAidantsMediateursLoader, ListeAidantsMediateursReadModel } from '@/use-cases/queries/RecupererListeAidantsMediateurs'
import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'

export class PrismaListeAidantsMediateursLoader implements ListeAidantsMediateursLoader {
  async get(territoire: string, page: number, limite: number)
    : Promise<ErrorReadModel | ListeAidantsMediateursReadModel> {
    try {
      const offset = page * limite

      // Récupération des aidants avec pagination
      const [aidantsData, statsData] = await Promise.all([
        this.getAidantsPagines(territoire, limite, offset),
        this.getStatistiques(territoire),
      ])

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
      const personnes =
        territoire === 'France'
          ? await prisma.$queryRaw<Array<PersonneQueryResult>>`
          SELECT
            main.personne.id,
            main.personne.nom,
            main.personne.prenom,
            is_mediateur as mediateur,
            is_coordinateur as coordinateur,
            is_active_ac as  aidants,
            is_active_ac as  aidants_connect,
            (conseiller_numerique_id IS NOT NULL OR cn_pg_id IS NOT NULL) as conseiller_numerique,
            array_agg(DISTINCT main.formation.label) AS formations,
            BOOL_OR(main.formation.pix) AS pix,
            BOOL_OR(main.formation.remn) AS remn,
            COALESCE(SUM(main.activites_coop.accompagnements), 0) AS accompagnements,
            COALESCE(main.personne.nb_accompagnements_ac, 0) AS accompagnements_ac
          FROM main.personne
                 LEFT JOIN main.formation ON main.personne.id = main.formation.personne_id
                 left join main.activites_coop on main.activites_coop.personne_id = main.personne.id
                 left join main.personne_affectations on main.personne.id = main.personne_affectations.personne_id
          WHERE main.personne_affectations.suppression IS NULL or main.personne.is_active_ac = true
          group by main.personne.id, main.personne.nom, main.personne.prenom, main.personne.is_mediateur, main.personne.is_coordinateur, main.personne.is_active_ac, main.personne.conseiller_numerique_id, main.personne.cn_pg_id
          LIMIT ${limite} OFFSET ${offset};
        `
          : await prisma.$queryRaw<Array<PersonneQueryResult>>`
            SELECT
              main.personne.id,
              main.personne.nom,
              main.personne.prenom,
              is_mediateur as mediateur,
              is_coordinateur as coordinateur,
              is_active_ac as  aidants,
              is_active_ac as  aidants_connect,
              (conseiller_numerique_id IS NOT NULL OR cn_pg_id IS NOT NULL) as conseiller_numerique,
              array_agg(DISTINCT main.formation.label) AS formations,
              BOOL_OR(main.formation.pix) AS pix,
              BOOL_OR(main.formation.remn) AS remn,
              COALESCE(SUM(main.activites_coop.accompagnements), 0) AS accompagnements,
              COALESCE(main.personne.nb_accompagnements_ac, 0) AS accompagnements_ac
            FROM main.personne
                   LEFT JOIN main.structure
                             ON main.personne.structure_id = main.structure.id
                   LEFT JOIN main.adresse
                             ON main.structure.adresse_id = main.adresse.id
                   LEFT JOIN main.formation  ON main.personne.id = main.formation.personne_id
                   left join main.activites_coop on main.activites_coop.personne_id = main.personne.id
                   left join main.personne_affectations on main.personne.id = main.personne_affectations.personne_id
            where main.adresse.departement =  ${territoire} and (main.personne_affectations.suppression IS NULL or main.personne.is_active_ac = true)
            group by main.personne.id, main.personne.nom, main.personne.prenom, main.personne.is_mediateur, main.personne.is_coordinateur, main.personne.is_active_ac, main.personne.conseiller_numerique_id, main.personne.cn_pg_id
            LIMIT ${limite} OFFSET ${offset};
          `
      return personnes.map(personne => {
        const isCoordinateur = Boolean(personne.coordinateur)
        const isMediateur = Boolean(personne.mediateur)
        const hasAidantConnect = Boolean(personne.aidants_connect)
        const hasConseillerNumerique = Boolean(personne.conseiller_numerique)

        const roles: Array<string> = []
        if (isCoordinateur) {roles.push('Coordinateur')}
        if (isMediateur) {roles.push('Médiateur')}
        if (hasAidantConnect) {roles.push('Aidant')}

        let labelisation = ''
        if (hasConseillerNumerique) {
          labelisation = 'Conseiller Numérique'
        } else if (hasAidantConnect) {
          labelisation = 'Aidants Connect'
        }

        return {
          // eslint-disable-next-line
          formation: personne.formations.filter(item => item !== null),
          id: String(personne.id),
          labelisation,
          nbAccompagnements: Number(personne.accompagnements) + Number(personne.accompagnements_ac) ,
          nom: personne.nom ?? '',
          prenom: personne.prenom ?? '',
          role: roles,
        }
      })
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
    // Nombre total d'accompagnements réalisés
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

    // Nombre de conseillers numériques
    const conseillersResult =
      territoire === 'France'
        ? await prisma.$queryRaw<
          Array<{ aidant_connect: bigint; conseillers_numeriques: bigint; mediateur: bigint }>>`
        SELECT
          COUNT(Distinct main.personne.id) FILTER (WHERE main.personne_affectations.suppression IS NULL and (conseiller_numerique_id IS NOT NULL OR cn_pg_id IS NOT NULL)) AS conseillers_numeriques,
          COUNT(Distinct main.personne.id) FILTER (WHERE main.personne_affectations.suppression IS NULL and (conseiller_numerique_id IS NULL and cn_pg_id IS NULL)) AS mediateur,
          count(distinct main.personne.id) FILTER (where main.personne_affectations.suppression IS NOT NULL and (main.personne.is_active_ac = true)) as aidant_connect
        FROM main.personne
               left join main.personne_affectations on main.personne.id = main.personne_affectations.personne_id
          `
        : await prisma.$queryRaw<
          Array<{ aidant_connect: bigint; conseillers_numeriques: bigint; mediateur: bigint }>>`
        SELECT
          COUNT(Distinct main.personne.id) FILTER (WHERE main.personne_affectations.suppression IS NULL and (conseiller_numerique_id IS NOT NULL OR cn_pg_id IS NOT NULL)) AS conseillers_numeriques,
          COUNT(Distinct main.personne.id) FILTER (WHERE main.personne_affectations.suppression IS NULL and (conseiller_numerique_id IS NULL and cn_pg_id IS NULL)) AS mediateur,
          count(distinct main.personne.id) FILTER (where main.personne_affectations.suppression IS NOT NULL and (main.personne.is_active_ac = true)) as aidant_connect
        FROM main.personne
               left join main.personne_affectations on main.personne.id = main.personne_affectations.personne_id
               LEFT JOIN main.structure ON main.structure.id = main.personne.structure_id
               LEFT JOIN main.adresse ON main.adresse.id = main.structure.adresse_id
        WHERE main.adresse.departement =  ${territoire};
          `
    const totalConseillersNumeriques = Number(conseillersResult[0]?.conseillers_numeriques || 0)
    const totalPersonnes = Number(conseillersResult[0]?.conseillers_numeriques || 0)
      + Number(conseillersResult[0]?.aidant_connect || 0)
      + Number(conseillersResult[0]?.mediateur || 0)

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
  aidants: boolean
  aidants_connect: boolean
  conseiller_numerique: boolean
  coordinateur: boolean
  formations: Array<string>
  id: number
  mediateur: boolean
  nom: null | string
  pix: boolean
  prenom: null | string
  remn: boolean
}
