'use server'

import { ResultAsync } from '@/use-cases/CommandHandler'

export async function ajouterUnComiteAction(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _actionParams: ActionParams
): ResultAsync<ReadonlyArray<string>> {
  return Promise.resolve(['OK'])
}

type ActionParams = Readonly<{
  commentaire?: string
  date?: string
  frequence: string
  path: string
  type: string
  uidGouvernance: string
}>
