'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { getSubSession } from '@/gateways/NextAuthAuthentificationGateway'
import { ResultAsync } from '@/use-cases/CommandHandler'
import { AjouterUnComite } from '@/use-cases/commands/AjouterUnComite'

export async function ajouterUnComiteAction(
  actionParams: ActionParams
): ResultAsync<ReadonlyArray<string>> {
  const validationResult = validator.safeParse(actionParams)

  if (validationResult.error) {
    return validationResult.error.issues.map(({ message }) => message)
  }

  const result = await new AjouterUnComite().execute({
    commentaire: validationResult.data.commentaire,
    date: validationResult.data.date,
    frequence: validationResult.data.frequence,
    gouvernanceUid: validationResult.data.gouvernanceId,
    type: validationResult.data.type,
    utilisateurUid: await getSubSession(),
  })

  revalidatePath(validationResult.data.path)

  return [result]
}

type ActionParams = Readonly<{
  commentaire?: string
  date?: string
  frequence: string
  gouvernanceId: string
  path: string
  type: string
}>

const validator = z.object({
  commentaire: z.string().min(1, { message: 'Le commentaire doit contenir au moins 1 caractère' }).optional(),
  date: z.string().date('La date est invalide').optional(),
  frequence: z.string().min(1, { message: 'La fréquence du comité doit être renseignée' }),
  gouvernanceId: z.string().min(1, { message: 'L’identifiant de la gouvernance doit être renseigné' }),
  path: z.string().min(1, { message: 'Le chemin doit être renseigné' }),
  type: z.string().min(1, { message: 'Le type de comité doit être renseigné' }),
})
