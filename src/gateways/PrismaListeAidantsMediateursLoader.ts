import { Prisma } from '@prisma/client'

import { reportLoaderError } from './shared/sentryErrorReporter'
import prisma from '../../prisma/prismaClient'
import departements from '../../ressources/departements.json'
import { AidantMediateurAvecAccompagnementReadModel, AidantMediateurReadModel, FiltreFormations, FiltreHabilitations, FiltreRoles, FiltresListeAidants, ListeAidantsMediateursLoader, ListeAidantsMediateursReadModel } from '@/use-cases/queries/RecupererListeAidantsMediateurs'
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

  async getAccompagnementsForPersonnes(personneIds: Array<string>): Promise<Map<string, number>> {
    try {
      if (personneIds.length === 0) {
        return new Map()
      }

      const personneIdsAsNumbers = personneIds.map(id => parseInt(id, 10))

      const result = await prisma.$queryRaw<Array<{ personne_id: number; total: bigint }>>`
        SELECT
          ac.personne_id,
          COALESCE(SUM(ac.accompagnements), 0) as total
        FROM main.activites_coop ac
        WHERE ac.personne_id = ANY(${personneIdsAsNumbers})
        GROUP BY ac.personne_id
      `

      // Récupérer aussi les accompagnements AC depuis personne_enrichie
      const resultAC = await prisma.$queryRaw<Array<{ id: number; nb_accompagnements_ac: number }>>`
        SELECT
          pe.id,
          COALESCE(pe.nb_accompagnements_ac, 0) as nb_accompagnements_ac
        FROM min.personne_enrichie pe
        WHERE pe.id = ANY(${personneIdsAsNumbers})
      `

      // Créer une Map pour combiner les résultats
      const accompagnementsMap = new Map<string, number>()

      // Ajouter les accompagnements de activites_coop
      for (const row of result) {
        accompagnementsMap.set(String(row.personne_id), Number(row.total))
      }

      // Ajouter les accompagnements AC
      for (const row of resultAC) {
        const currentTotal = accompagnementsMap.get(String(row.id)) ?? 0
        accompagnementsMap.set(String(row.id), currentTotal + Number(row.nb_accompagnements_ac))
      }

      // S'assurer que tous les IDs ont une valeur (0 par défaut)
      for (const id of personneIds) {
        if (!accompagnementsMap.has(id)) {
          accompagnementsMap.set(id, 0)
        }
      }

      return accompagnementsMap
    } catch (error) {
      reportLoaderError(error, 'PrismaListeAidantsMediateursLoader.getAccompagnementsForPersonnes', {
        personneIds,
      })
      // Retourner une Map avec des 0 en cas d'erreur
      return new Map(personneIds.map(id => [id, 0]))
    }
  }

  async getForExport(filtres: FiltresListeAidants): 
  Promise<Array<AidantMediateurAvecAccompagnementReadModel> | ErrorReadModel> {
    try {
      const { territoire } = filtres

      // Pour l'export, on récupère toutes les données avec les accompagnements
      const aidantsData = await this.getAidantsPaginesAvecAccompagnements(territoire, filtres)

      return aidantsData
    } catch (error) {
      reportLoaderError(error, 'PrismaListeAidantsMediateursLoader', {
        filtres,
        operation: 'getForExport',
      })
      return {
        message: 'Impossible de récupérer la liste des aidants et médiateurs numériques pour l\'export',
        type: 'error',
      }
    }
  }

  private async avecAccompagnementQuery(
    territoire: string,
    geographique: FiltresListeAidants['geographique'],
    whereConditions: Prisma.Sql,
    departementFilter: Prisma.Sql,
    limitOffset: Prisma.Sql
  ): Promise<Array<PersonneAvecAccompagnementQueryResult>> {
    if (territoire === 'France' && !geographique) {
      return prisma.$queryRaw<Array<PersonneAvecAccompagnementQueryResult>>`
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
        GROUP BY pe.id, pe.nom, pe.prenom, pe.is_mediateur, pe.est_actuellement_mediateur_en_poste, pe.is_coordinateur, pe.labellisation_aidant_connect, pe.est_actuellement_conseiller_numerique, pe.nb_accompagnements_ac
        ORDER BY pe.nom, pe.prenom
        ${limitOffset};
      `
    } 
    return prisma.$queryRaw<Array<PersonneAvecAccompagnementQueryResult>>`
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
        ${limitOffset};
      `
  }
   
  /* eslint-disable-next-line sonarjs/cognitive-complexity, complexity */
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
      if (habilitations.includes('Sans habilitation/labellisation')) {
        habilitationConditions.push(Prisma.sql`(pe.est_actuellement_conseiller_numerique = false AND pe.labellisation_aidant_connect = false)`)
      }

      if (habilitationConditions.length > 0) {
        conditions.push(Prisma.sql`(${Prisma.join(habilitationConditions, ' OR ')})`)
      }
    }

    // Filtre par formations
    if (formations && formations.length > 0) {
      const formationConditions: Array<Prisma.Sql> = []
      const hasSansFormation = formations.includes('Sans formation')
      const otherFormations = formations.filter(formation => formation !== 'Sans formation')

      // Gérer les formations normales
      if (otherFormations.includes('PIX')) {
        formationConditions.push(Prisma.sql`f.pix = true`)
      }
      if (otherFormations.includes('REMN')) {
        formationConditions.push(Prisma.sql`f.remn = true`)
      }
      if (otherFormations.includes('CCP1')) {
        formationConditions.push(Prisma.sql`f.label = 'CCP1'`)
      }
      if (otherFormations.includes('CCP2 & CCP3')) {
        formationConditions.push(Prisma.sql`f.label = 'CCP2 & CCP3'`)
      }

      // Ajouter la condition "Sans formation" si sélectionnée
      if (hasSansFormation) {
        // Personne sans aucune formation
        formationConditions.push(Prisma.sql`(f.id IS NULL OR (f.pix = false AND f.remn = false AND f.label IS NULL))`)
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

  private async executeAidantsQuery(
    territoire: string,
    filtres: FiltresListeAidants,
    includeAccompagnements: boolean,
    limite?: number,
    offset?: number
  ): Promise<Array<AidantMediateurAvecAccompagnementReadModel | AidantMediateurReadModel>> {
    try {
      const { formations, geographique, habilitations, roles } = filtres

      // Déterminer les conditions de filtre géographique
      let departementsFilter: Array<string> = []

      if (geographique) {
        if (geographique.type === 'region') {
          departementsFilter = departements
            .filter(dept => dept.regionCode === geographique.code)
            .map(dept => dept.code)
        } else {
          departementsFilter = [geographique.code]
        }
      } else if (territoire !== 'France') {
        departementsFilter = [territoire]
      }

      // Construction des conditions WHERE
      const whereConditions = this.buildWhereConditions(roles, habilitations, formations)
      const departementFilter = departementsFilter.length > 0
        ? Prisma.sql`AND a.departement = ANY(${departementsFilter})`
        : Prisma.empty

      const limitOffset = limite !== undefined && offset !== undefined
        ? Prisma.sql`LIMIT ${limite} OFFSET ${offset}`
        : Prisma.empty

      const personnes = includeAccompagnements
        ? await this.avecAccompagnementQuery(territoire, geographique, whereConditions, departementFilter, limitOffset)
        : await this.sansAccompagnementQuery(territoire, geographique, whereConditions, departementFilter, limitOffset)

      return this.mapPersonnesToAidants(personnes, includeAccompagnements)
    } catch (error) {
      const operation = includeAccompagnements ? 'getAidantsPaginesAvecAccompagnements' : 'getAidantsPagines'
      reportLoaderError(error, `PrismaListeAidantsMediateursLoader.${operation}`, {
        filtres,
        limite,
        offset,
        territoire,
      })
      return []
    }
  }

  private async getAidantsPagines(territoire: string, limite: number, offset: number, filtres: FiltresListeAidants)
    : Promise<Array<AidantMediateurReadModel>> {
    return (
      this.executeAidantsQuery(territoire, filtres, false, limite, offset) as Promise<Array<AidantMediateurReadModel>>
    )
  }

  private async getAidantsPaginesAvecAccompagnements(territoire: string, filtres: FiltresListeAidants)
    : Promise<Array<AidantMediateurAvecAccompagnementReadModel>> {
    return this.executeAidantsQuery(territoire, filtres, true) as Promise<
      Array<AidantMediateurAvecAccompagnementReadModel>
    >
  }

  private async getStatistiques(territoire: string, filtres: FiltresListeAidants): Promise<{
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
    const departementFilterPersonnes = departementsFilter.length > 0
      ? Prisma.sql`AND a.departement = ANY(${departementsFilter})`
      : Prisma.empty

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
      totalActeursNumerique: totalPersonnes,
      totalConseillersNumerique: totalConseillersNumeriques,
    }
  }

  private mapPersonnesToAidants(
    personnes: Array<PersonneAvecAccompagnementQueryResult | PersonneQueryResult>,
    includeAccompagnements: boolean
  ): Array<AidantMediateurAvecAccompagnementReadModel | AidantMediateurReadModel> {
    return personnes.map(personne => {
      const isCoordinateur = Boolean(personne.coordinateur)
      const isMediateur = Boolean(personne.est_actuellement_mediateur_en_poste)
      const hasAidantConnect = Boolean(personne.aidants_connect)
      const hasConseillerNumerique = Boolean(personne.conseiller_numerique)

      const roles: Array<string> = []
      if (isCoordinateur) { roles.push('Coordinateur') }
      if (isMediateur) { roles.push('Médiateur') }
      else { roles.push('aidant') }

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

      const baseAidant = {
        formations,
        id: String(personne.id),
        labelisations,
        nom: personne.nom ?? '',
        prenom: personne.prenom ?? '',
        role: roles,
      }

      if (includeAccompagnements) {
        const personneAvecAccompagnements = personne as PersonneAvecAccompagnementQueryResult
        return {
          ...baseAidant,
          nbAccompagnements: 
            Number(personneAvecAccompagnements.accompagnements) 
            + Number(personneAvecAccompagnements.accompagnements_ac),
        } as AidantMediateurAvecAccompagnementReadModel
      }

      return baseAidant as AidantMediateurReadModel
    })
  }

  private async sansAccompagnementQuery(
    territoire: string,
    geographique: FiltresListeAidants['geographique'],
    whereConditions: Prisma.Sql,
    departementFilter: Prisma.Sql,
    limitOffset: Prisma.Sql
  ): Promise<Array<PersonneQueryResult>> {
    if (territoire === 'France' && !geographique) {
      return prisma.$queryRaw<Array<PersonneQueryResult>>`
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
          BOOL_OR(f.remn) AS remn
        FROM min.personne_enrichie pe
               LEFT JOIN main.formation f ON pe.id = f.personne_id
        WHERE (pe.est_actuellement_mediateur_en_poste = true OR pe.est_actuellement_aidant_numerique_en_poste = true)
          ${whereConditions}
        GROUP BY pe.id, pe.nom, pe.prenom, pe.is_mediateur, pe.est_actuellement_mediateur_en_poste, pe.is_coordinateur, pe.labellisation_aidant_connect, pe.est_actuellement_conseiller_numerique
        ORDER BY pe.nom, pe.prenom
        ${limitOffset};
      `
    } 
    return prisma.$queryRaw<Array<PersonneQueryResult>>`
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
          BOOL_OR(f.remn) AS remn
        FROM min.personne_enrichie pe
               LEFT JOIN main.formation f ON pe.id = f.personne_id
               LEFT JOIN main.structure s ON s.id = pe.structure_employeuse_id
               LEFT JOIN main.adresse a ON a.id = s.adresse_id
        WHERE (pe.est_actuellement_mediateur_en_poste = true OR pe.est_actuellement_aidant_numerique_en_poste = true)
          ${departementFilter}
          ${whereConditions}
        GROUP BY pe.id, pe.nom, pe.prenom, pe.est_actuellement_mediateur_en_poste, pe.is_coordinateur, pe.labellisation_aidant_connect, pe.est_actuellement_conseiller_numerique
        ORDER BY pe.nom, pe.prenom
        ${limitOffset};
      `
  }
}

interface PersonneQueryResult {
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
interface PersonneAvecAccompagnementQueryResult extends PersonneQueryResult {
  accompagnements: number
  accompagnements_ac: number
}
