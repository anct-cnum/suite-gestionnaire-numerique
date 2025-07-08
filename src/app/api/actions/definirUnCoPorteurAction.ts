'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { PrismaMembreRepository } from '@/gateways/PrismaMembreRepository'
import { ResultAsync } from '@/use-cases/CommandHandler'
import { DefinirUnCoPorteur } from '@/use-cases/commands/DefinirUnCoPorteur'

export async function definirUnCoPorteurAction(
  actionParams: ActionParams
): ResultAsync<ReadonlyArray<string>> {
  const validationResult = validator.safeParse(actionParams)

  if (validationResult.error) {
    return validationResult.error.issues.map(({ message }) => message)
  }
  const message = await new DefinirUnCoPorteur(new PrismaMembreRepository())
    .handle({
      uidGouvernance: actionParams.uidGouvernance,
      uidMembre: actionParams.uidMembre,
    })

  revalidatePath(actionParams.path)

  return [message]
}

type ActionParams = Readonly<{
  path: string
  uidGouvernance: string
  uidMembre: string
}>

const validator = z.object({
  //nouveauRole: z.enum(Roles, { message: 'Le rôle n’est pas correct' }),
  path: z.string().min(1, { message: 'Le chemin doit être renseigné' }),
})
