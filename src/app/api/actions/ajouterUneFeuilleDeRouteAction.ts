'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { ResultAsync } from '@/use-cases/CommandHandler'

export async function ajouterUneFeuilleDeRouteAction(
  actionParams: ActionParams
): ResultAsync<ReadonlyArray<string>> {
  const validationResult = validator.safeParse(actionParams)

  if (validationResult.error) {
    return validationResult.error.issues.map(({ message }) => message)
  }

  revalidatePath(validationResult.data.path)

  return Promise.resolve(['OK'])
}

type ActionParams = Readonly<{
  contratPreexistant: string
  nom: string
  path: string
  perimetre: string
  uidGouvernance: string
  uidMembre: string
}>

const validator = z.object({
  path: z.string().min(1, { message: 'Le chemin doit être renseigné' }),
})
