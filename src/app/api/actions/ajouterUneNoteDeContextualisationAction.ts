'use server'

import { z } from 'zod'

import { ResultAsync } from '@/use-cases/CommandHandler'

export async function ajouterUneNoteDeContextualisationAction(
  actionParam: ActionParams
): ResultAsync<ReadonlyArray<string>> {
  const validationResult = validator.safeParse(actionParam)

  if (validationResult.error) {
    return validationResult.error.issues.map(({ message }) => message)
  }
  return Promise.resolve(['OK'])
}

type ActionParams = Readonly<{
  contenu: string
  path: string
}>

const validator = z.object({
  contenu: z.string().min(1, { message: 'Le contenu doit être renseigné' }),
  path: z.string().min(1, { message: 'Le chemin doit être renseigné' }),
})
