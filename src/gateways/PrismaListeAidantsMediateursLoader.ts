import { Prisma } from '@prisma/client'

import { reportLoaderError } from './shared/sentryErrorReporter'
import prisma from '../../prisma/prismaClient'
import departements from '../../ressources/departements.json'
import {
  AidantMediateurAvecAccompagnementReadModel,
  AidantMediateurReadModel,
  FiltreFormations,
  FiltreHabilitations,
  FiltreRoles,
  FiltresListeAidants,
  ListeAidantsMediateursLoader,
  ListeAidantsMediateursReadModel,
} from '@/use-cases/queries/RecupererListeAidantsMediateurs'
import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'

export class PrismaListeAidantsMediateursLoader implements ListeAidantsMediateursLoader {
  async get(filtres: FiltresListeAidants): Promise<ErrorReadModel | ListeAidantsMediateursReadModel> {
    try {
      const { pagination } = filtres
      const safePage = Math.max(1, pagination.page)
      const offset = (safePage - 1) * pagination.limite
      const limitOffset = Prisma.sql`LIMIT ${pagination.limite} OFFSET ${offset}`

      const [aidants, stats] = await Promise.all([
        this.queryPersonnes(filtres, limitOffset),
        this.getStatistiques(filtres),
      ])

      return {
        aidants: aidants.map((personne) => this.mapToAidant(personne)),
        displayPagination: stats.totalActeursNumerique > pagination.limite,
        limite: pagination.limite,
        page: pagination.page,
        total: stats.totalActeursNumerique,
        totalActeursNumerique: stats.totalActeursNumerique,
        totalConseillersNumerique: stats.totalConseillersNumerique,
        totalPages: Math.ceil(stats.totalActeursNumerique / pagination.limite),
      }
    } catch (error) {
      reportLoaderError(error, 'PrismaListeAidantsMediateursLoader', { filtres, operation: 'get' })
      return {
        message: 'Impossible de récupérer la liste des aidants et médiateurs numériques',
        type: 'error',
      }
    }
  }

  async getForExport(
    filtres: FiltresListeAidants
  ): Promise<Array<AidantMediateurAvecAccompagnementReadModel> | ErrorReadModel> {
    try {
      const personnes = await this.queryPersonnesAvecAccompagnements(filtres)
      return personnes.map((personne) => this.mapToAidantAvecAccompagnement(personne))
    } catch (error) {
      reportLoaderError(error, 'PrismaListeAidantsMediateursLoader', { filtres, operation: 'getForExport' })
      return {
        message: "Impossible de récupérer la liste des aidants et médiateurs numériques pour l'export",
        type: 'error',
      }
    }
  }

  private buildFiltreActif(anciens?: boolean): Prisma.Sql {
    if (anciens) {
      return Prisma.empty
    }
    return Prisma.sql`AND EXISTS (
      SELECT 1 FROM main.personne_affectations_emploi pae
      WHERE pae.personne_id = pe.id AND pae.est_active = true
    )`
  }

  // Étape 1 — Périmètre d'accès : "qui ai-je le droit de voir ?"
  // Le filtre géographique explicite (UI) prend le pas sur le scope departemental/structure.
  private buildScopeCte(filtres: FiltresListeAidants): Prisma.Sql {
    const { anciens, geographique, scopeFiltre } = filtres
    const filtreActif = this.buildFiltreActif(anciens)

    if (geographique) {
      const codesDepartements =
        geographique.type === 'region'
          ? departements.filter((dept) => dept.regionCode === geographique.code).map((dept) => dept.code)
          : [geographique.code]
      return Prisma.sql`personnes_dans_scope AS (
        SELECT pe.id
        FROM min.personne_enrichie pe
        LEFT JOIN main.structure_administrative s ON s.id = pe.structure_employeuse_id
        LEFT JOIN main.adresse a ON a.id = s.adresse_id
        WHERE (pe.est_actuellement_mediateur_en_poste = true OR pe.est_actuellement_aidant_numerique_en_poste = true)
          AND a.departement = ANY(${codesDepartements})
          ${filtreActif}
      )`
    }

    if (scopeFiltre.type === 'departemental') {
      const codesDepartements = [...scopeFiltre.codes]
      return Prisma.sql`personnes_dans_scope AS (
        SELECT pe.id
        FROM min.personne_enrichie pe
        LEFT JOIN main.structure_administrative s ON s.id = pe.structure_employeuse_id
        LEFT JOIN main.adresse a ON a.id = s.adresse_id
        WHERE (pe.est_actuellement_mediateur_en_poste = true OR pe.est_actuellement_aidant_numerique_en_poste = true)
          AND a.departement = ANY(${codesDepartements})
          ${filtreActif}
      )`
    }

    if (scopeFiltre.type === 'structure') {
      const filtreEmploiStructure = anciens ? Prisma.empty : Prisma.sql`AND pae.est_active = true`
      return Prisma.sql`personnes_dans_scope AS (
        SELECT pe.id
        FROM min.personne_enrichie pe
        WHERE (pe.est_actuellement_mediateur_en_poste = true OR pe.est_actuellement_aidant_numerique_en_poste = true)
          AND (
            pe.structure_employeuse_id = ${scopeFiltre.id}
            OR EXISTS (
              SELECT 1 FROM main.personne_affectations_emploi pae
              WHERE pae.personne_id = pe.id
                AND pae.structure_administrative_id = ${scopeFiltre.id}
                ${filtreEmploiStructure}
            )
          )
      )`
    }

    // Scope national : aucune restriction d'accès
    return Prisma.sql`personnes_dans_scope AS (
      SELECT pe.id
      FROM min.personne_enrichie pe
      WHERE (pe.est_actuellement_mediateur_en_poste = true OR pe.est_actuellement_aidant_numerique_en_poste = true)
        ${filtreActif}
    )`
  }

  // Étape 2 — Filtres UI : "parmi les personnes accessibles, lesquelles correspondent à la recherche ?"
  /* eslint-disable-next-line sonarjs/cognitive-complexity */
  private buildWhereConditions(
    roles?: FiltreRoles,
    habilitations?: FiltreHabilitations,
    formations?: FiltreFormations
  ): Prisma.Sql {
    const conditions: Array<Prisma.Sql> = []

    if (roles && roles.length > 0) {
      const roleConditions: Array<Prisma.Sql> = []
      if (roles.includes('Médiateur')) {
        roleConditions.push(Prisma.sql`pe.est_actuellement_mediateur_en_poste = true`)
      }
      if (roles.includes('Coordinateur')) {
        roleConditions.push(Prisma.sql`pe.is_coordinateur = true`)
      }
      if (roles.includes('Aidant')) {
        roleConditions.push(
          Prisma.sql`(pe.est_actuellement_aidant_numerique_en_poste = true AND pe.est_actuellement_mediateur_en_poste = false)`
        )
      }
      if (roleConditions.length > 0) {
        conditions.push(Prisma.sql`(${Prisma.join(roleConditions, ' OR ')})`)
      }
    }

    if (habilitations && habilitations.length > 0) {
      const habilitationConditions: Array<Prisma.Sql> = []
      if (habilitations.includes('Conseiller numérique')) {
        habilitationConditions.push(Prisma.sql`pe.est_actuellement_conseiller_numerique = true`)
      }
      if (habilitations.includes('Aidants Connect')) {
        habilitationConditions.push(Prisma.sql`pe.labellisation_aidant_connect = true`)
      }
      if (habilitations.includes('Sans habilitation/labellisation')) {
        habilitationConditions.push(
          Prisma.sql`(pe.est_actuellement_conseiller_numerique = false AND pe.labellisation_aidant_connect = false)`
        )
      }
      if (habilitationConditions.length > 0) {
        conditions.push(Prisma.sql`(${Prisma.join(habilitationConditions, ' OR ')})`)
      }
    }

    if (formations && formations.length > 0) {
      const formationConditions: Array<Prisma.Sql> = []
      const hasSansFormation = formations.includes('Sans formation')
      const otherFormations = formations.filter((formation) => formation !== 'Sans formation')

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
      if (hasSansFormation) {
        formationConditions.push(Prisma.sql`(f.id IS NULL OR (f.pix = false AND f.remn = false AND f.label IS NULL))`)
      }
      if (formationConditions.length > 0) {
        conditions.push(Prisma.sql`(${Prisma.join(formationConditions, ' OR ')})`)
      }
    }

    return conditions.length > 0 ? Prisma.sql`AND ${Prisma.join(conditions, ' AND ')}` : Prisma.empty
  }

  private async getStatistiques(filtres: FiltresListeAidants): Promise<{
    totalActeursNumerique: number
    totalConseillersNumerique: number
  }> {
    const { formations, habilitations, roles } = filtres
    const scopeCte = this.buildScopeCte(filtres)
    const whereConditions = this.buildWhereConditions(roles, habilitations, formations)

    const result = await prisma.$queryRaw<
      Array<{ aidant_connect: bigint; conseillers_numeriques: bigint; mediateur: bigint }>
    >`
      WITH ${scopeCte}
      SELECT
        COUNT(*) FILTER (WHERE pe.est_actuellement_conseiller_numerique = true) AS conseillers_numeriques,
        COUNT(*) FILTER (WHERE pe.est_actuellement_mediateur_en_poste = true AND pe.est_actuellement_conseiller_numerique = false) AS mediateur,
        COUNT(*) FILTER (WHERE pe.est_actuellement_aidant_numerique_en_poste = true) AS aidant_connect
      FROM min.personne_enrichie pe
      JOIN personnes_dans_scope pds ON pds.id = pe.id
      LEFT JOIN main.formation f ON pe.id = f.personne_id
      WHERE true
        ${whereConditions}
    `

    const totalConseillersNumerique = Number(result[0]?.conseillers_numeriques ?? 0)
    const totalActeursNumerique =
      Number(result[0]?.conseillers_numeriques ?? 0) +
      Number(result[0]?.aidant_connect ?? 0) +
      Number(result[0]?.mediateur ?? 0)

    return { totalActeursNumerique, totalConseillersNumerique }
  }

  private mapToAidant(personne: PersonneQueryResult): AidantMediateurReadModel {
    const formations = [...personne.formations.filter((item) => Boolean(item) && item.trim() !== '')]
    if (personne.pix) {
      formations.push('PIX')
    }
    if (personne.remn) {
      formations.push('REMN')
    }

    const labelisations: Array<'aidants connect' | 'conseiller numérique'> = []
    if (personne.conseiller_numerique) {
      labelisations.push('conseiller numérique')
    }
    if (personne.aidants_connect) {
      labelisations.push('aidants connect')
    }

    const role: Array<string> = []
    if (personne.coordinateur) {
      role.push('Coordinateur')
    }
    if (personne.est_actuellement_mediateur_en_poste) {
      role.push('Médiateur')
    } else {
      role.push('aidant')
    }

    return {
      estActif: personne.est_actif,
      formations,
      id: String(personne.id),
      labelisations,
      nom: personne.nom ?? '',
      prenom: personne.prenom ?? '',
      role,
    }
  }

  private mapToAidantAvecAccompagnement(
    personne: PersonneAvecAccompagnementQueryResult
  ): AidantMediateurAvecAccompagnementReadModel {
    return {
      ...this.mapToAidant(personne),
      adresseStructure: personne.structure_adresse ?? '',
      nomStructure: personne.structure_nom ?? '',
      siretStructure: personne.structure_siret ?? '',
    }
  }

  private async queryPersonnes(
    filtres: FiltresListeAidants,
    limitOffset: Prisma.Sql
  ): Promise<Array<PersonneQueryResult>> {
    const { formations, habilitations, roles } = filtres
    const scopeCte = this.buildScopeCte(filtres)
    const whereConditions = this.buildWhereConditions(roles, habilitations, formations)

    return prisma.$queryRaw<Array<PersonneQueryResult>>`
      WITH ${scopeCte}
      SELECT
        pe.id,
        pe.nom,
        pe.prenom,
        pe.is_coordinateur AS coordinateur,
        pe.labellisation_aidant_connect AS aidants_connect,
        pe.est_actuellement_conseiller_numerique AS conseiller_numerique,
        pe.est_actuellement_mediateur_en_poste,
        array_agg(DISTINCT f.label) AS formations,
        BOOL_OR(f.pix) AS pix,
        BOOL_OR(f.remn) AS remn,
        EXISTS (
          SELECT 1 FROM main.personne_affectations_emploi pae
          WHERE pae.personne_id = pe.id AND pae.est_active = true
        ) AS est_actif
      FROM min.personne_enrichie pe
      JOIN personnes_dans_scope pds ON pds.id = pe.id
      LEFT JOIN main.formation f ON pe.id = f.personne_id
      WHERE true
        ${whereConditions}
      GROUP BY pe.id, pe.nom, pe.prenom, pe.est_actuellement_mediateur_en_poste, pe.is_coordinateur,
               pe.labellisation_aidant_connect, pe.est_actuellement_conseiller_numerique
      ORDER BY pe.nom, pe.prenom
      ${limitOffset}
    `
  }

  private async queryPersonnesAvecAccompagnements(
    filtres: FiltresListeAidants,
    limitOffset = Prisma.empty
  ): Promise<Array<PersonneAvecAccompagnementQueryResult>> {
    const { formations, habilitations, roles } = filtres
    const scopeCte = this.buildScopeCte(filtres)
    const whereConditions = this.buildWhereConditions(roles, habilitations, formations)

    return prisma.$queryRaw<Array<PersonneAvecAccompagnementQueryResult>>`
      WITH ${scopeCte}
      SELECT
        pe.id,
        pe.nom,
        pe.prenom,
        pe.is_coordinateur AS coordinateur,
        pe.labellisation_aidant_connect AS aidants_connect,
        pe.est_actuellement_conseiller_numerique AS conseiller_numerique,
        pe.est_actuellement_mediateur_en_poste,
        array_agg(DISTINCT f.label) AS formations,
        BOOL_OR(f.pix) AS pix,
        BOOL_OR(f.remn) AS remn,
        EXISTS (
          SELECT 1 FROM main.personne_affectations_emploi pae
          WHERE pae.personne_id = pe.id AND pae.est_active = true
        ) AS est_actif,
        MAX(COALESCE(s.denomination_antenne, s.denomination_sirene)) AS structure_nom,
        MAX(s.siret) AS structure_siret,
        MAX(TRIM(CONCAT_WS(' ', a.numero_voie::text, a.repetition, a.nom_voie, a.code_postal, a.nom_commune))) AS structure_adresse
      FROM min.personne_enrichie pe
      JOIN personnes_dans_scope pds ON pds.id = pe.id
      LEFT JOIN main.formation f ON pe.id = f.personne_id
      LEFT JOIN main.structure_administrative s ON s.id = pe.structure_employeuse_id
      LEFT JOIN main.adresse a ON a.id = s.adresse_id
      WHERE true
        ${whereConditions}
      GROUP BY pe.id, pe.nom, pe.prenom, pe.est_actuellement_mediateur_en_poste, pe.is_coordinateur,
               pe.labellisation_aidant_connect, pe.est_actuellement_conseiller_numerique
      ORDER BY pe.nom, pe.prenom
      ${limitOffset}
    `
  }
}

interface PersonneQueryResult {
  aidants_connect: boolean
  conseiller_numerique: boolean
  coordinateur: boolean
  est_actif: boolean
  est_actuellement_mediateur_en_poste: boolean
  formations: Array<string>
  id: number
  nom: null | string
  pix: boolean
  prenom: null | string
  remn: boolean
}

interface PersonneAvecAccompagnementQueryResult extends PersonneQueryResult {
  structure_adresse: null | string
  structure_nom: null | string
  structure_siret: null | string
}
