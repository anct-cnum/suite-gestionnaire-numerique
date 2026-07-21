import { Prisma } from '@prisma/client'

import { contexteJournalisationMin, EvenementMin } from './contexteJournalisationMin'
import { ClientExecuteur, insererEvenementsMin, resoudreActeurMin } from '../../../prisma/journalisationMinExtension'

// Exécute fn (qui ouvre une transaction Prisma) en différant l'écriture des
// événements interceptés par l'extension : écrits après commit, jetés si rollback.
export async function journaliserTransaction<Retour>(
  client: ClientExecuteur,
  fn: () => Promise<Retour>
): Promise<Retour> {
  const contexte = contexteJournalisationMin.getStore()
  if (contexte === undefined) {
    return fn()
  }
  contexte.bufferTransaction = []
  try {
    const resultat = await fn()
    await insererEvenementsMin(client, contexte.runId, contexte.bufferTransaction)

    return resultat
  } finally {
    contexte.bufferTransaction = null
  }
}

// Helpers pour les écritures en SQL brut (non interceptables par l'extension Prisma) :
// chaque ligne touchée est journalisée dans source.min__evenements, DANS la transaction
// (rollback = événements jetés). Toutes les tables concernées ont une clé primaire `id`.

// SELECT to_jsonb d'une ligne par id — sélection « avant » des updates mono-ligne.
export function selectionLigne(sourceKey: string, id: number | string): Prisma.Sql {
  return Prisma.sql`SELECT to_jsonb(t.*) AS ligne FROM ${Prisma.raw(sourceKey)} t WHERE t.id = ${id}`
}

// Journalise en « create » la ligne fraîchement insérée (relue par id).
export async function journaliserCreateBrut(
  tx: Prisma.TransactionClient,
  sourceKey: string,
  id: number | string
): Promise<void> {
  if (contexteJournalisationMin.getStore() === undefined) {
    return
  }
  const ligne = await relireParId(tx, sourceKey, id)
  if (ligne === null) {
    return
  }
  await enregistrerEvenementMin(tx, { action: 'create', entityId: String(id), sourceKey, value: ligne })
}

// Journalise en « delete » les lignes que `mutation` va supprimer : `selectionAvant`
// (SELECT to_jsonb(x.*) AS ligne … avec le même WHERE que la mutation) capture le snapshot.
export async function journaliserDeleteBrut<Retour>(
  tx: Prisma.TransactionClient,
  sourceKey: string,
  selectionAvant: Prisma.Sql,
  mutation: () => Promise<Retour>
): Promise<Retour> {
  if (contexteJournalisationMin.getStore() === undefined) {
    return mutation()
  }
  const avant = await lignesJson(tx, selectionAvant)
  const resultat = await mutation()
  for (const ligne of avant) {
    await enregistrerEvenementMin(tx, {
      action: 'delete',
      entityId: String(ligne.id as number | string),
      sourceKey,
      value: ligne,
    })
  }

  return resultat
}

// Journalise en « update » les lignes que `mutation` va modifier : `selectionAvant` capture
// l'état avant (même WHERE que la mutation), chaque ligne est relue par id après coup pour
// n'émettre que les colonnes réellement changées ({ old, new }).
export async function journaliserUpdateBrut<Retour>(
  tx: Prisma.TransactionClient,
  sourceKey: string,
  selectionAvant: Prisma.Sql,
  mutation: () => Promise<Retour>
): Promise<Retour> {
  if (contexteJournalisationMin.getStore() === undefined) {
    return mutation()
  }
  const avant = await lignesJson(tx, selectionAvant)
  const resultat = await mutation()
  for (const ligne of avant) {
    const apres = await relireParId(tx, sourceKey, ligne.id as number | string)
    if (apres === null) {
      continue
    }
    const difference = differencierJson(ligne, apres)
    if (difference === null) {
      continue
    }
    await enregistrerEvenementMin(tx, {
      action: 'update',
      entityId: String(ligne.id as number | string),
      sourceKey,
      value: difference,
    })
  }

  return resultat
}

type LigneJson = Record<string, unknown>

// Journalise un événement construit manuellement dans la transaction courante.
async function enregistrerEvenementMin(tx: ClientExecuteur, evenement: EvenementMin): Promise<void> {
  const contexte = contexteJournalisationMin.getStore()
  if (contexte === undefined) {
    return
  }
  const userId = await resoudreActeurMin(tx, contexte)
  if (userId === null) {
    return
  }
  await insererEvenementsMin(tx, contexte.runId, [{ ...evenement, userId }])
}

async function lignesJson(tx: Prisma.TransactionClient, selection: Prisma.Sql): Promise<ReadonlyArray<LigneJson>> {
  const lignes = await tx.$queryRaw<Array<Readonly<{ ligne: LigneJson }>>>(selection)

  return lignes.map(({ ligne }) => ligne)
}

async function relireParId(
  tx: Prisma.TransactionClient,
  sourceKey: string,
  id: number | string
): Promise<LigneJson | null> {
  const lignes = await tx.$queryRaw<Array<Readonly<{ ligne: LigneJson }>>>(selectionLigne(sourceKey, id))

  return lignes.at(0)?.ligne ?? null
}

function differencierJson(avant: LigneJson, apres: LigneJson): null | Readonly<{ new: LigneJson; old: LigneJson }> {
  const anciennes: LigneJson = {}
  const nouvelles: LigneJson = {}
  for (const colonne of Object.keys(apres)) {
    if (JSON.stringify(avant[colonne]) === JSON.stringify(apres[colonne])) {
      continue
    }
    anciennes[colonne] = avant[colonne]
    nouvelles[colonne] = apres[colonne]
  }
  if (Object.keys(nouvelles).length === 0) {
    return null
  }

  return { new: nouvelles, old: anciennes }
}
