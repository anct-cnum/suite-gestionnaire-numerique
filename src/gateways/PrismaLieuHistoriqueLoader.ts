import { detecterSuppression, rowsToEvenements, SourceRow } from './shared/historiqueSource'
import prisma from '../../prisma/prismaClient'
import { LieuHistoriqueReadModel, RecupererLieuHistoriqueLoader } from '@/use-cases/queries/RecupererLieuHistorique'
import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'
import { EvenementHistorique, SourcePivot } from '@/use-cases/queries/shared/HistoriqueEvenement'

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

    const evenements = rowsToEvenements(rows, 'Ingest Cartographie nationale', 'carto')

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
        `.then((rows) => rowsToEvenements(rows, 'Ingest Coop', 'coop'))
      )

      queries.push(detecterSuppression('coop__structures', 'structure_coop_id', pivot, 'Coop', 'coop'))
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
}

type LieuRow = Readonly<{
  nom: string
  structure_cartographie_nationale_id: null | string
  structure_coop_id: null | string
}>
