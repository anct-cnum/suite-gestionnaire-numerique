'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { ResultAsync } from '@/use-cases/CommandHandler'

export async function effacerUneNoteDeContextualisationAction(
  actionParam: ActionParams
): ResultAsync<ReadonlyArray<string>> {
  const validationResult = validator.safeParse(actionParam)

  if (validationResult.error) {
    return validationResult.error.issues.map(({ message }) => message)
  }
  revalidatePath(validationResult.data.path)
  return Promise.resolve(['OK'])
}

type ActionParams = Readonly<{
  path: string
}>

const validator = z.object({
  path: z.string().min(1, { message: 'Le chemin doit être renseigné' }),
})
