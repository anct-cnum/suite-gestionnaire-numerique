import prisma from '../../../prisma/prismaClient'
import { DetailEvenement, EvenementHistorique } from '@/use-cases/queries/shared/HistoriqueEvenement'

// Détecte la disparition d'un pivot d'une table source : si un run d'ingest
// postérieur au dernier run contenant le pivot existe, le pivot a été supprimé.
export async function detecterSuppression(
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

// Transforme les runs d'ingest (du plus récent au plus ancien) en événements :
// état initial pour le plus ancien, delta JSON pour les suivants.
export function rowsToEvenements(
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
        details: jsonToDetails(row.donnee),
        source,
        type: 'ingest initial',
      })
    } else {
      const delta = diffJson(row.donnee, precedent.donnee)

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

export type SourceRow = Readonly<{
  donnee: Record<string, unknown>
  ingested_at: Date
}>

function diffJson(actuel: Record<string, unknown>, precedent: Record<string, unknown>): ReadonlyArray<DetailEvenement> {
  const details: Array<DetailEvenement> = []
  const toutesLesCles = new Set([...Object.keys(actuel), ...Object.keys(precedent)])

  for (const cle of toutesLesCles) {
    const valeurActuelle = stringifier(actuel[cle])
    const valeurPrecedente = stringifier(precedent[cle])

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

function jsonToDetails(donnee: Record<string, unknown>): ReadonlyArray<DetailEvenement> {
  return Object.entries(donnee)
    .filter(([, valeur]) => valeur !== null && valeur !== '')
    .sort(([cle1], [cle2]) => cle1.localeCompare(cle2))
    .map(([cle, valeur]) => ({
      label: cle,
      statut: 'contexte' as const,
      valeur: stringifier(valeur),
    }))
}

function stringifier(valeur: unknown): string {
  if (valeur === null || valeur === undefined) {
    return ''
  }
  if (typeof valeur === 'object') {
    return JSON.stringify(valeur)
  }

  return String(valeur as boolean | number | string)
}
