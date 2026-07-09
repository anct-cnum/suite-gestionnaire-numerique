import { detecterSuppression, rowsToEvenements, SourceRow } from './shared/historiqueSource'
import prisma from '../../prisma/prismaClient'
import {
  RecupererStructureHistoriqueLoader,
  StructureHistoriqueReadModel,
} from '@/use-cases/queries/RecupererStructureHistorique'
import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'
import { EvenementHistorique, SourcePivot } from '@/use-cases/queries/shared/HistoriqueEvenement'

export class PrismaStructureHistoriqueLoader implements RecupererStructureHistoriqueLoader {
  async recuperer(id: string): Promise<ErrorReadModel | StructureHistoriqueReadModel> {
    const structureId = parseInt(id, 10)

    const structureResult = await this.#recupererStructure(structureId)

    if (structureResult.length === 0) {
      return { message: 'Structure non trouvée', type: 'error' } as ErrorReadModel
    }

    const structure = structureResult[0]

    return {
      denomination: structure.denomination_antenne ?? structure.denomination_sirene ?? `Structure #${structureId}`,
      evenements: await this.#recupererEvenementsSources(structure),
      sourcesPivots: this.#construireSourcesPivots(structure),
    }
  }

  #construireSourcesPivots(structure: StructureRow): ReadonlyArray<SourcePivot> {
    const candidates: ReadonlyArray<SourcePivot> = [
      { pivot: structure.structure_coop_id, source: 'coop' },
      { pivot: structure.structure_ac_id, source: 'aidants-connect' },
      { pivot: structure.structure_tp_id === null ? null : String(structure.structure_tp_id), source: 'id-poste' },
    ]

    return candidates.filter((entry) => entry.pivot !== null)
  }

  #libellePoste(row: SourceRowAvecPoste): string {
    const prenom = row.donnee['prénom']
    const nom = row.donnee.nom
    const conseiller = [prenom, nom].filter((valeur) => typeof valeur === 'string' && valeur !== '').join(' ')

    return conseiller === '' ? `poste ${row.id_poste}` : `poste ${row.id_poste} — ${conseiller}`
  }

  // Une ligne source par poste ET par conseiller ayant occupé le poste : le diff
  // entre runs se fait par couple (poste, conseiller). Le tri secondaire sur run_id
  // garantit un ordre chronologique stable quand plusieurs runs partagent le même
  // ingested_at (backfill).
  async #recupererEvenementsIdPoste(structureTpId: number): Promise<ReadonlyArray<EvenementHistorique>> {
    const pivot = String(structureTpId)

    const rows: ReadonlyArray<SourceRowAvecPoste> = await prisma.$queryRaw`
      SELECT ingested_at, donnee, donnee->>'id_poste' AS id_poste, coalesce(donnee->>'id_cn', '') AS id_cn
      FROM source.idposte__conum
      WHERE donnee->>'id_structure' = ${pivot}
      ORDER BY ingested_at DESC, run_id DESC
    `

    const rowsParPosteEtConseiller = new Map<string, Array<SourceRowAvecPoste>>()
    for (const row of rows) {
      const cle = `${row.id_poste}|${row.id_cn}`
      const rowsDuGroupe = rowsParPosteEtConseiller.get(cle) ?? []
      rowsDuGroupe.push(row)
      rowsParPosteEtConseiller.set(cle, rowsDuGroupe)
    }

    const evenements = [...rowsParPosteEtConseiller.values()].flatMap((rowsDuGroupe) =>
      rowsToEvenements(rowsDuGroupe, `Ingest id-poste — ${this.#libellePoste(rowsDuGroupe[0])}`, 'id-poste')
    )

    const suppressions = await detecterSuppression('idposte__conum', 'id_structure', pivot, 'id-poste', 'id-poste')

    return [...evenements, ...suppressions]
  }

  async #recupererEvenementsSources(structure: StructureRow): Promise<ReadonlyArray<EvenementHistorique>> {
    const queries: Array<Promise<ReadonlyArray<EvenementHistorique>>> = []

    if (structure.structure_coop_id !== null) {
      const pivot = structure.structure_coop_id

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

    if (structure.structure_ac_id !== null) {
      const pivot = structure.structure_ac_id

      queries.push(
        prisma.$queryRaw<ReadonlyArray<SourceRow>>`
          SELECT ingested_at, donnee
          FROM source.ac__structures
          WHERE donnee->>'structure_ac_id' = ${pivot}
          ORDER BY ingested_at DESC
        `.then((rows) => rowsToEvenements(rows, 'Ingest Aidants Connect', 'aidants-connect'))
      )

      queries.push(
        detecterSuppression('ac__structures', 'structure_ac_id', pivot, 'Aidants Connect', 'aidants-connect')
      )
    }

    if (structure.structure_tp_id !== null) {
      queries.push(this.#recupererEvenementsIdPoste(structure.structure_tp_id))
    }

    const resultats = await Promise.all(queries)
    const evenements = resultats.flat()

    evenements.sort((ev1, ev2) => ev2.date.getTime() - ev1.date.getTime())

    return evenements
  }

  async #recupererStructure(structureId: number): Promise<ReadonlyArray<StructureRow>> {
    return prisma.$queryRaw`
      SELECT
        sa.denomination_sirene,
        sa.denomination_antenne,
        sa.structure_coop_id,
        sa.structure_ac_id,
        sa.structure_tp_id
      FROM main.structure_administrative sa
      WHERE sa.id = ${structureId}
    `
  }
}

type StructureRow = Readonly<{
  denomination_antenne: null | string
  denomination_sirene: null | string
  structure_ac_id: null | string
  structure_coop_id: null | string
  structure_tp_id: null | number
}>

type SourceRowAvecPoste = Readonly<{
  donnee: Record<string, unknown>
  id_cn: string
  id_poste: string
  ingested_at: Date
}>
