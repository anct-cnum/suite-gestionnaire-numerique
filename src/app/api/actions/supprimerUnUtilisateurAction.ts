'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import prisma from '../../../../prisma/prismaClient'
import { getSubSession } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaUtilisateurRepository } from '@/gateways/PrismaUtilisateurRepository'
import { ResultAsync } from '@/use-cases/CommandHandler'
import { SupprimerUnUtilisateur } from '@/use-cases/commands/SupprimerUnUtilisateur'

export async function supprimerUnUtilisateurAction(
  actionParams: ActionParams
): ResultAsync<ReadonlyArray<string>> {
  const validationResult = validator.safeParse(actionParams)

  if (validationResult.error) {
    return validationResult.error.issues.map(({ message }) => message)
  }

  revalidatePath(actionParams.path)

  const message = await new SupprimerUnUtilisateur(new PrismaUtilisateurRepository(prisma))
    .execute({
      utilisateurASupprimerUid: actionParams.utilisateurASupprimerUid,
      utilisateurCourantUid: await getSubSession(),
    })

  return [message]
}

type ActionParams = Readonly<{
  utilisateurASupprimerUid: string
  path: __next_route_internal_types__.StaticRoutes
}>

const validator = z.object({
  path: z.string().min(1, { message: 'Le chemin n’est pas correct' }),
})
