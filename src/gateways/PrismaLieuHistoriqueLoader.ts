import prisma from '../../prisma/prismaClient'
import {
  DetailEvenement,
  EvenementHistorique,
  LieuHistoriqueReadModel,
  RecupererLieuHistoriqueLoader,
  SourcePivot,
} from '@/use-cases/queries/RecupererLieuHistorique'
import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'

export class PrismaLieuHistoriqueLoader implements RecupererLieuHistoriqueLoader {
  async recuperer(id: string): Promise<ErrorReadModel | LieuHistoriqueReadModel> {
    const lieuId = parseInt(id, 10)

    const lieuResult = await this.#recupererLieu(lieuId)

    if (lieuResult.length === 0) {
      return { message: 'Lieu non trouvé', type: 'error' } as ErrorReadModel
    }

    const lieu = lieuResult[0]
    const sourcesPivots = this.#construireSourcesPivots(lieu)

    const evenements = await this.#recupererEvenementsSources(lieu)

    return {
      evenements,
      nomLieu: lieu.nom,
      sourcesPivots,
    }
  }

  #construireSourcesPivots(lieu: LieuRow): ReadonlyArray<SourcePivot> {
    const candidates: ReadonlyArray<Readonly<{ pivot: null | string; source: string }>> = [
      { pivot: lieu.structure_coop_id, source: 'coop' },
      { pivot: lieu.structure_cartographie_nationale_id, source: 'carto' },
    ]

    return candidates.filter((entry) => entry.pivot !== null)
  }

  async #detecterSuppression(
    table: string,
    cleJson: string,
    pivot: string,
    libelleSource: string,
    source: string
  ): Promise<ReadonlyArray<EvenementHistorique>> {
    const dernierRunRows: ReadonlyArray<Readonly<{ run_id: string }>> = await prisma.$queryRawUnsafe(
      `SELECT run_id FROM source.${table} WHERE donnee->>'${cleJson}' = $1 ORDER BY ingested_at DESC LIMIT 1`,
      pivot
    )

    if (dernierRunRows.length === 0) {
      return []
    }

    const dernierRun = dernierRunRows[0].run_id

    const runSuivantRows: ReadonlyArray<Readonly<{ ingested_at: Date; run_id: string }>> = await prisma.$queryRawUnsafe(
      `SELECT DISTINCT ON (run_id) run_id, ingested_at FROM source.${table} WHERE run_id > $1 ORDER BY run_id, ingested_at LIMIT 1`,
      dernierRun
    )

    if (runSuivantRows.length === 0) {
      return []
    }

    return [
      {
        date: runSuivantRows[0].ingested_at,
        description: 'Supprimé de ' + libelleSource,
        details: [{ label: 'run_id', statut: 'suppression', valeur: runSuivantRows[0].run_id }],
        source,
        type: 'suppression',
      },
    ]
  }

  async #detecterSuppressionCarto(sousIds: ReadonlyArray<string>): Promise<ReadonlyArray<EvenementHistorique>> {
    const likePatterns = sousIds.map((sousId) => `%${sousId}%`)

    // Dernier run où au moins un sous-id apparaît
    const dernierRunRows: ReadonlyArray<Readonly<{ run_id: string }>> = await prisma.$queryRawUnsafe(
      `SELECT run_id FROM source.carto__structures
       WHERE ${sousIds.map((_, idx) => `donnee->>'id' LIKE $${idx + 1}`).join(' OR ')}
       ORDER BY ingested_at DESC LIMIT 1`,
      ...likePatterns
    )

    if (dernierRunRows.length === 0) {
      return []
    }

    const dernierRun = dernierRunRows[0].run_id

    // Premier run après celui-là
    const runSuivantRows: ReadonlyArray<Readonly<{ ingested_at: Date; run_id: string }>> = await prisma.$queryRawUnsafe(
      'SELECT DISTINCT ON (run_id) run_id, ingested_at FROM source.carto__structures WHERE run_id > $1 ORDER BY run_id, ingested_at LIMIT 1',
      dernierRun
    )

    if (runSuivantRows.length === 0) {
      return []
    }

    return [
      {
        date: runSuivantRows[0].ingested_at,
        description: 'Structure supprimée de Cartographie nationale',
        details: [{ label: 'run_id', statut: 'suppression', valeur: runSuivantRows[0].run_id }],
        source: 'carto',
        type: 'suppression',
      },
    ]
  }

  #diffJson(actuel: Record<string, unknown>, precedent: Record<string, unknown>): ReadonlyArray<DetailEvenement> {
    const details: Array<DetailEvenement> = []
    const toutesLesCles = new Set([...Object.keys(actuel), ...Object.keys(precedent)])

    for (const cle of toutesLesCles) {
      const valeurActuelle = this.#stringifier(actuel[cle])
      const valeurPrecedente = this.#stringifier(precedent[cle])

      if (valeurActuelle === valeurPrecedente) {
        continue
      }

      if (valeurPrecedente === '' && valeurActuelle !== '') {
        details.push({ label: cle, statut: 'ajout', valeur: valeurActuelle })
      } else if (valeurActuelle === '' && valeurPrecedente !== '') {
        details.push({ label: cle, statut: 'suppression', valeur: valeurPrecedente })
      } else {
        details.push({ label: cle, statut: 'suppression', valeur: valeurPrecedente })
        details.push({ label: cle, statut: 'ajout', valeur: valeurActuelle })
      }
    }

    return details.sort((detail1, detail2) => detail1.label.localeCompare(detail2.label))
  }

  #jsonToDetails(donnee: Record<string, unknown>): ReadonlyArray<DetailEvenement> {
    return Object.entries(donnee)
      .filter(([, valeur]) => valeur !== null && valeur !== '')
      .sort(([cle1], [cle2]) => cle1.localeCompare(cle2))
      .map(([cle, valeur]) => ({
        label: cle,
        statut: 'contexte' as const,
        valeur: this.#stringifier(valeur),
      }))
  }

  async #recupererEvenementsCarto(idCarto: string): Promise<ReadonlyArray<EvenementHistorique>> {
    const sousIds = idCarto.split('__')
    const likePatterns = sousIds.map((sousId) => `%${sousId}%`)

    const rows: ReadonlyArray<SourceRow> = await prisma.$queryRawUnsafe(
      `SELECT ingested_at, donnee
       FROM source.carto__structures
       WHERE ${sousIds.map((_, idx) => `donnee->>'id' LIKE $${idx + 1}`).join(' OR ')}
       ORDER BY ingested_at DESC`,
      ...likePatterns
    )

    const evenements = this.#rowsToEvenements(rows, 'Ingest Cartographie nationale', 'carto')

    // Détection de suppression globale (tous les sous-ids disparus)
    const suppressions = await this.#detecterSuppressionCarto(sousIds)

    return [...evenements, ...suppressions]
  }

  async #recupererEvenementsSources(lieu: LieuRow): Promise<ReadonlyArray<EvenementHistorique>> {
    const queries: Array<Promise<ReadonlyArray<EvenementHistorique>>> = []

    if (lieu.structure_coop_id !== null) {
      const pivot = lieu.structure_coop_id

      queries.push(
        prisma.$queryRaw<ReadonlyArray<SourceRow>>`
          SELECT ingested_at, donnee
          FROM source.coop__structures
          WHERE donnee->>'structure_coop_id' = ${pivot}
          ORDER BY ingested_at DESC
        `.then((rows) => this.#rowsToEvenements(rows, 'Ingest Coop', 'coop'))
      )

      queries.push(this.#detecterSuppression('coop__structures', 'structure_coop_id', pivot, 'Coop', 'coop'))
    }

    if (lieu.structure_cartographie_nationale_id !== null) {
      queries.push(this.#recupererEvenementsCarto(lieu.structure_cartographie_nationale_id))
    }

    const resultats = await Promise.all(queries)
    const evenements = resultats.flat()

    evenements.sort((ev1, ev2) => ev2.date.getTime() - ev1.date.getTime())

    return evenements
  }

  async #recupererLieu(lieuId: number): Promise<ReadonlyArray<LieuRow>> {
    return prisma.$queryRaw`
      SELECT
        l.nom,
        l.structure_coop_id,
        l.structure_cartographie_nationale_id
      FROM main.lieu_inclusion l
      WHERE l.id = ${lieuId}
    `
  }

  #rowsToEvenements(
    rows: ReadonlyArray<SourceRow>,
    description: string,
    source: string
  ): ReadonlyArray<EvenementHistorique> {
    const evenements: Array<EvenementHistorique> = []

    for (let idx = 0; idx < rows.length; idx++) {
      const row = rows[idx]
      const precedent = idx < rows.length - 1 ? rows[idx + 1] : null

      if (precedent === null) {
        evenements.push({
          date: row.ingested_at,
          description: description + ' (état initial)',
          details: this.#jsonToDetails(row.donnee),
          source,
          type: 'ingest initial',
        })
      } else {
        const delta = this.#diffJson(row.donnee, precedent.donnee)

        if (delta.length > 0) {
          evenements.push({
            date: row.ingested_at,
            description: description + ' (delta)',
            details: delta,
            source,
            type: 'ingest delta',
          })
        }
      }
    }

    return evenements
  }

  #stringifier(valeur: unknown): string {
    if (valeur === null || valeur === undefined) {
      return ''
    }
    if (typeof valeur === 'object') {
      return JSON.stringify(valeur)
    }

    return String(valeur as boolean | number | string)
  }
}

type LieuRow = Readonly<{
  nom: string
  structure_cartographie_nationale_id: null | string
  structure_coop_id: null | string
}>

type SourceRow = Readonly<{
  donnee: Record<string, unknown>
  ingested_at: Date
}>
