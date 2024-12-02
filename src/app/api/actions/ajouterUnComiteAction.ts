'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { getSubSession } from '@/gateways/NextAuthAuthentificationGateway'
import { ResultAsync } from '@/use-cases/CommandHandler'

export async function ajouterUnComiteAction(
  actionParams: ActionParams
): ResultAsync<ReadonlyArray<string>> {
  const validationResult = validator.safeParse(actionParams)

  if (validationResult.error) {
    return validationResult.error.issues.map(({ message }) => message)
  }

  const command: AjouterUnComiteCommand = {
    commentaire: validationResult.data.commentaire,
    date: validationResult.data.date,
    frequence: validationResult.data.frequence,
    type: validationResult.data.type,
    uidUtilisateurCourant: await getSubSession(),
  }
  const result = fakeUseCase(command)

  if (result === 'OK') {
    revalidatePath(`/gouvernance/${actionParams.gouvernanceId}`)
  }

  return [result]
}

type ActionParams = Readonly<{
  gouvernanceId: string,
  type: string,
  frequence: string,
  date?: string,
  commentaire?: string
}>

const validator = z.object({
  commentaire: z.string().min(1, { message: 'Le commentaire n’est pas correct' }).optional(),
  date: z.string().min(1, { message: 'La date n’est pas correcte' }).optional(),
  frequence: z
    .string()
    .min(1, { message: 'La fréquence du comité doit être renseignée' }),
  type: z
    .string()
    .min(1, { message: 'Le type de comité doit être renseigné' }),
})

type AjouterUnComiteCommand = Readonly<{
  type: string,
  frequence: string,
  date?: string,
  commentaire?: string
  uidUtilisateurCourant: string
}>

const fakeUseCase = (command: AjouterUnComiteCommand): string => {
  if (command.frequence && command.type) {
    return 'OK'
  }
  return 'KO'
}
