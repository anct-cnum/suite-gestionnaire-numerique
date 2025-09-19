import { Prisma } from '@prisma/client'

import { reportLoaderError } from './shared/sentryErrorReporter'
import prisma from '../../prisma/prismaClient'
import departements from '../../ressources/departements.json'
import { AidantMediateurReadModel, FiltreFormations, FiltreHabilitations, FiltreRoles, FiltresListeAidants, ListeAidantsMediateursLoader, ListeAidantsMediateursReadModel } from '@/use-cases/queries/RecupererListeAidantsMediateurs'
import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'

export class PrismaListeAidantsMediateursLoader implements ListeAidantsMediateursLoader {
  async get(filtres: FiltresListeAidants)
    : Promise<ErrorReadModel | ListeAidantsMediateursReadModel> {
    try {
      const { pagination, territoire } = filtres

      // Page commence à 1 dans le controller, mais offset doit commencer à 0
      const safePage = Math.max(1, pagination.page) // Garantir que page >= 1
      const offset = (safePage - 1) * pagination.limite // offset = 0 pour page 1

      // Récupération des aidants avec pagination
      const aidantsData = await this.getAidantsPagines(territoire, pagination.limite, offset, filtres)

      // Récupération des statistiques
      const statsData = await this.getStatistiques(territoire, filtres)

      const totalCount = statsData.totalActeursNumerique
      const totalPages = Math.ceil(totalCount / pagination.limite)
      return {
        aidants: aidantsData,
        displayPagination: totalCount > pagination.limite,
        limite: pagination.limite,
        page: pagination.page,
        total: totalCount,
        totalAccompagnements: statsData.totalAccompagnements,
        totalActeursNumerique: statsData.totalActeursNumerique,
        totalConseillersNumerique: statsData.totalConseillersNumerique,
        totalPages,
      }
    } catch (error) {
      reportLoaderError(error, 'PrismaListeAidantsMediateursLoader', {
        filtres,
        operation: 'get',
      })
      return {
        message: 'Impossible de récupérer la liste des aidants et médiateurs numériques',
        type: 'error',
      }
    }
  }

  // eslint-disable-next-line sonarjs/cognitive-complexity
  private buildWhereConditions(roles?: FiltreRoles, habilitations?: FiltreHabilitations, formations?: FiltreFormations):
  Prisma.Sql {
    const conditions: Array<Prisma.Sql> = []

    // Filtre par rôles
    if (roles && roles.length > 0) {
      const roleConditions: Array<Prisma.Sql> = []

      if (roles.includes('Médiateur')) {
        roleConditions.push(Prisma.sql`pe.est_actuellement_mediateur_en_poste = true`)
      }
      if (roles.includes('Coordinateur')) {
        roleConditions.push(Prisma.sql`pe.is_coordinateur = true`)
      }
      if (roles.includes('Aidant')) {
        roleConditions.push(Prisma.sql`(pe.est_actuellement_aidant_numerique_en_poste = true AND pe.est_actuellement_mediateur_en_poste = false)`)
      }

      if (roleConditions.length > 0) {
        conditions.push(Prisma.sql`(${Prisma.join(roleConditions, ' OR ')})`)
      }
    }

    // Filtre par habilitations
    if (habilitations && habilitations.length > 0) {
      const habilitationConditions: Array<Prisma.Sql> = []

      if (habilitations.includes('Conseiller numérique')) {
        habilitationConditions.push(Prisma.sql`pe.est_actuellement_conseiller_numerique = true`)
      }
      if (habilitations.includes('Aidants Connect')) {
        habilitationConditions.push(Prisma.sql`pe.labellisation_aidant_connect = true`)
      }

      if (habilitationConditions.length > 0) {
        conditions.push(Prisma.sql`(${Prisma.join(habilitationConditions, ' OR ')})`)
      }
    }

    // Filtre par formations
    if (formations && formations.length > 0) {
      const formationConditions: Array<Prisma.Sql> = []

      if (formations.includes('PIX')) {
        formationConditions.push(Prisma.sql`f.pix = true`)
      }
      if (formations.includes('REMN')) {
        formationConditions.push(Prisma.sql`f.remn = true`)
      }
      if (formations.includes('CCP1')) {
        formationConditions.push(Prisma.sql`f.label = 'CCP1'`)
      }
      if (formations.includes('CCP2 & CCP3')) {
        formationConditions.push(Prisma.sql`f.label = 'CCP2 & CCP3'`)
      }

      if (formationConditions.length > 0) {
        conditions.push(Prisma.sql`(${Prisma.join(formationConditions, ' OR ')})`)
      }
    }

    // Joindre toutes les conditions avec AND
    if (conditions.length > 0) {
      return Prisma.sql`AND ${Prisma.join(conditions, ' AND ')}`
    }

    return Prisma.empty
  }

  private async getAidantsPagines(territoire: string, limite: number, offset: number, filtres: FiltresListeAidants)
    : Promise<Array<AidantMediateurReadModel>> {
    try {
      const { formations, geographique, habilitations, roles } = filtres
      // Déterminer les conditions de filtre géographique
      let departementsFilter: Array<string> = []

      if (geographique) {
        if (geographique.type === 'region') {
          // Récupérer tous les départements de la région
          departementsFilter = departements
            .filter(dept => dept.regionCode === geographique.code)
            .map(dept => dept.code)
        } else {
          // C'est un code département
          departementsFilter = [geographique.code]
        }
      } else if (territoire !== 'France') {
        departementsFilter = [territoire]
      }

      // Construction des conditions WHERE pour les nouveaux filtres
      const whereConditions = this.buildWhereConditions(roles, habilitations, formations)
      const departementFilter = departementsFilter.length > 0 
        ? Prisma.sql`AND a.departement = ANY(${departementsFilter})` 
        : Prisma.empty

      const personnes =
        territoire === 'France' && !geographique
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
            ${whereConditions}
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
              ${departementFilter}
              ${whereConditions}
            GROUP BY pe.id, pe.nom, pe.prenom, pe.est_actuellement_mediateur_en_poste, pe.is_coordinateur, pe.labellisation_aidant_connect, pe.est_actuellement_conseiller_numerique, pe.nb_accompagnements_ac
            ORDER BY pe.nom, pe.prenom
            LIMIT ${limite} OFFSET ${offset};
          `
      
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
      
      return result
    } catch (error) {
      reportLoaderError(error, 'PrismaListeAidantsMediateursLoader.getAidantsPagines', {
        limite,
        offset,
      })
      return []
    }
  }

  private async getStatistiques(territoire: string, filtres: FiltresListeAidants): Promise<{
    totalAccompagnements: number
    totalActeursNumerique: number
    totalConseillersNumerique: number
  }> {
    const { formations, geographique, habilitations, roles } = filtres
    // Déterminer les conditions de filtre géographique
    let departementsFilter: Array<string> = []

    if (geographique) {
      if (geographique.type === 'region') {
        // Récupérer tous les départements de la région
        departementsFilter = departements
          .filter(dept => dept.regionCode === geographique.code)
          .map(dept => dept.code)
      } else {
        // C'est un code département
        departementsFilter = [geographique.code]
      }
    } else if (territoire !== 'France') {
      departementsFilter = [territoire]
    }

    // Construction des conditions WHERE pour les nouveaux filtres
    const whereConditions = this.buildWhereConditions(roles, habilitations, formations)
    const departementFilterStats = departementsFilter.length > 0 
      ? Prisma.sql`AND main.adresse.departement = ANY(${departementsFilter})` 
      : Prisma.empty
    const departementFilterPersonnes = departementsFilter.length > 0 
      ? Prisma.sql`AND a.departement = ANY(${departementsFilter})` 
      : Prisma.empty

    // Nombre total d'accompagnements réalisés
    const accompagnementsResult = territoire === 'France' && !geographique
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
            WHERE main.activites_coop.date >= CURRENT_DATE - INTERVAL '30 days'
              ${departementFilterStats}
          `
    const accompagnementsRealises = Number(accompagnementsResult[0]?.total_accompagnements_realises || 0)

    // Statistiques des personnes en poste
    const conseillersResult =
      territoire === 'France' && !geographique
        ? await prisma.$queryRaw<
          Array<{ aidant_connect: bigint; conseillers_numeriques: bigint; mediateur: bigint }>>`
        SELECT
          COUNT(*) FILTER (WHERE est_actuellement_conseiller_numerique = true) AS conseillers_numeriques,
          COUNT(*) FILTER (WHERE est_actuellement_mediateur_en_poste = true AND est_actuellement_conseiller_numerique = false) AS mediateur,
          COUNT(*) FILTER (WHERE est_actuellement_aidant_numerique_en_poste = true) AS aidant_connect
        FROM min.personne_enrichie pe
        LEFT JOIN main.formation f ON pe.id = f.personne_id
        WHERE (pe.est_actuellement_mediateur_en_poste = true OR pe.est_actuellement_aidant_numerique_en_poste = true)
          ${whereConditions}
          `
        : await prisma.$queryRaw<
          Array<{ aidant_connect: bigint; conseillers_numeriques: bigint; mediateur: bigint }>>`
        SELECT
          COUNT(*) FILTER (WHERE pe.est_actuellement_conseiller_numerique = true) AS conseillers_numeriques,
          COUNT(*) FILTER (WHERE pe.est_actuellement_mediateur_en_poste = true AND pe.est_actuellement_conseiller_numerique = false) AS mediateur,
          COUNT(*) FILTER (WHERE pe.est_actuellement_aidant_numerique_en_poste = true) AS aidant_connect
        FROM min.personne_enrichie pe
        LEFT JOIN main.formation f ON pe.id = f.personne_id
        LEFT JOIN main.structure s ON s.id = pe.structure_employeuse_id
        LEFT JOIN main.adresse a ON a.id = s.adresse_id
        WHERE (pe.est_actuellement_mediateur_en_poste = true OR pe.est_actuellement_aidant_numerique_en_poste = true)
        ${departementFilterPersonnes}
        ${whereConditions}
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
