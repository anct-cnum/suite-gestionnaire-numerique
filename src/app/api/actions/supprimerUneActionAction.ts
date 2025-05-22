'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { PrismaActionRepository } from '@/gateways/PrismaActionRepository'
import { PrismaDemandeDeSubventionRepository } from '@/gateways/PrismaDemandeDeSubventionRepository'
import { ResultAsync } from '@/use-cases/CommandHandler'
import { SupprimerUneAction } from '@/use-cases/commands/SupprimerUneAction'

export async function supprimerUneActionAction(action : ActionParams): ResultAsync<ReadonlyArray<string>> {
  const validationResult = validator.safeParse(action)
  if (validationResult.error) {
    return validationResult.error.issues.map(({ message }) => message)
  }
  //const sub = await getSessionSub()
  const message = await new SupprimerUneAction(new PrismaActionRepository()
    , new PrismaDemandeDeSubventionRepository())
    .handle({
      uidActionASupprimer: action.uidActionASupprimer,
    })
  revalidatePath(action.path)
  return [message]
}
type ActionParams = Readonly<{
  path: string
  uidActionASupprimer: string
}>

const validator = z.object({
  path: z.string().min(1, { message: 'Le chemin doit être renseigné' }),
  uidActionASupprimer: z.string().min(1, { message: 'L’id de l’action doit doit être renseigné' }),
})
