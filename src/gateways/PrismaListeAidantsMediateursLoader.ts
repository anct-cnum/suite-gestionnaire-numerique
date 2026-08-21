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

      const [aidants, stats, total] = await Promise.all([
        this.queryPersonnes(filtres, limitOffset),
        this.getStatistiques(filtres),
        this.queryTotal(filtres),
      ])

      return {
        aidants: aidants.map((personne) => this.mapToAidant(personne)),
        displayPagination: total > pagination.limite,
        limite: pagination.limite,
        page: pagination.page,
        total,
        totalActeursNumerique: stats.totalActeursNumerique,
        totalConseillersNumerique: stats.totalConseillersNumerique,
        totalPages: Math.ceil(total / pagination.limite),
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
      if (geographique.type === 'epci') {
        return Prisma.sql`personnes_dans_scope AS (
          SELECT pe.id
          FROM min.personne_enrichie pe
          LEFT JOIN main.structure_administrative s ON s.id = pe.structure_employeuse_id
          LEFT JOIN main.adresse a ON a.id = s.adresse_id
          WHERE (pe.est_actuellement_mediateur_en_poste = true OR pe.est_actuellement_aidant_numerique_en_poste = true)
            AND a.code_insee IN (
              SELECT c.code_insee
              FROM admin.commune c
              JOIN admin.commune_epci ce ON ce.commune_id = c.id
              JOIN admin.epci e ON e.id = ce.epci_id
              WHERE e.code = ${geographique.code}
            )
            ${filtreActif}
        )`
      }
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
    formations?: FiltreFormations,
    recherche?: string
  ): Prisma.Sql {
    const conditions: Array<Prisma.Sql> = []

    // Recherche libre sur le nom, le prénom, ou le nom complet dans les deux sens ("Jean Dupont" / "Dupont Jean")
    if (recherche !== undefined && recherche !== '') {
      const motif = motifRecherche(recherche)
      conditions.push(Prisma.sql`(
        pe.nom ILIKE ${motif}
        OR pe.prenom ILIKE ${motif}
        OR CONCAT(pe.prenom, ' ', pe.nom) ILIKE ${motif}
        OR CONCAT(pe.nom, ' ', pe.prenom) ILIKE ${motif}
      )`)
    }

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

      if (otherFormations.includes('REMN')) {
        formationConditions.push(Prisma.sql`f.remn = true OR f.label IN ('CCP2', 'CCP2 & CCP3')`)
      }
      if (otherFormations.includes('CCP1')) {
        formationConditions.push(Prisma.sql`
          f.label = 'CCP1'
          AND NOT EXISTS (
            SELECT 1 FROM main.formation f2
            WHERE f2.personne_id = f.personne_id
              AND (f2.remn = true OR f2.label IN ('CCP2', 'CCP2 & CCP3'))
          )
        `)
      }
      if (otherFormations.includes('PIX')) {
        formationConditions.push(Prisma.sql`f.pix = true`)
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

  // Statistiques des blocs résumé : la recherche libre est volontairement ignorée (#1292),
  // seuls le scope et les filtres du drawer s'appliquent.
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
    const labels = personne.formations.filter((item) => Boolean(item) && item.trim() !== '')
    const estREMN = personne.remn || labels.some((label) => labelsREMN.includes(label))

    const formations: Array<string> = []
    if (estREMN) {
      formations.push('REMN')
    } else if (labels.includes('CCP1')) {
      formations.push('CCP1')
    }
    if (personne.pix) {
      formations.push('PIX')
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
    const { formations, habilitations, recherche, roles } = filtres
    const scopeCte = this.buildScopeCte(filtres)
    const whereConditions = this.buildWhereConditions(roles, habilitations, formations, recherche)

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
    const { formations, habilitations, recherche, roles } = filtres
    const scopeCte = this.buildScopeCte(filtres)
    const whereConditions = this.buildWhereConditions(roles, habilitations, formations, recherche)

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

  // Total des résultats de la liste (recherche comprise) : sert à la pagination,
  // contrairement aux statistiques des blocs résumé qui ignorent la recherche.
  private async queryTotal(filtres: FiltresListeAidants): Promise<number> {
    const { formations, habilitations, recherche, roles } = filtres
    const scopeCte = this.buildScopeCte(filtres)
    const whereConditions = this.buildWhereConditions(roles, habilitations, formations, recherche)

    const result = await prisma.$queryRaw<Array<{ total: bigint }>>`
      WITH ${scopeCte}
      SELECT COUNT(DISTINCT pe.id) AS total
      FROM min.personne_enrichie pe
      JOIN personnes_dans_scope pds ON pds.id = pe.id
      LEFT JOIN main.formation f ON pe.id = f.personne_id
      WHERE true
        ${whereConditions}
    `

    return Number(result[0]?.total ?? 0)
  }
}

const labelsREMN = ['CCP2', 'CCP2 & CCP3']

// Recherche partielle insensible à la casse : échappe les jokers LIKE (\ % _) de la saisie utilisateur.
function motifRecherche(valeur: string): string {
  return `%${valeur.replaceAll('\\', '\\\\').replaceAll('%', '\\%').replaceAll('_', '\\_')}%`
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
