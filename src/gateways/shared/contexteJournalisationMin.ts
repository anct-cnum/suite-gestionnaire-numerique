import { AsyncLocalStorage } from 'node:async_hooks'

// Contexte de journalisation des événements MIN (source.min__evenements), porté
// par AsyncLocalStorage le temps d'une server action :
//   - runId : identifiant de corrélation (toutes les mutations d'une même action partagent le même runId)
//   - resoudreSub : résolution paresseuse (à la première mutation) de l'identifiant ProConnect de l'utilisateur,
//     ensuite converti et mémoïsé en actorId (id min.utilisateur)
//   - bufferTransaction : quand non null, les événements sont accumulés puis écrits après commit (jetés si rollback)
export type ContexteJournalisationMin = {
  actorId: null | number | undefined
  bufferTransaction: Array<EvenementMinComplet> | null
  resoudreSub(): Promise<string | undefined>
  runId: string
}

export type EvenementMin = Readonly<{
  action: 'create' | 'delete' | 'update'
  entityId: string
  sourceKey: string
  value: unknown
}>

export type EvenementMinComplet = EvenementMin & Readonly<{ userId: number }>

export const contexteJournalisationMin = new AsyncLocalStorage<ContexteJournalisationMin>()
