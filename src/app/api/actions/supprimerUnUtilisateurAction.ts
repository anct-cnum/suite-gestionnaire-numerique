'use server'

import { revalidatePath } from 'next/cache'
import { z, ZodIssue } from 'zod'

import prisma from '../../../../prisma/prismaClient'
import { getSubSession } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaUtilisateurRepository } from '@/gateways/PrismaUtilisateurRepository'
import { ResultAsync } from '@/use-cases/CommandHandler'
import { SupprimerUnUtilisateur, SupprimerUnUtilisateurFailure } from '@/use-cases/commands/SupprimerUnUtilisateur'

export async function supprimerUnUtilisateurAction(
  actionParams: ActionParams
): ResultAsync<SupprimerUnUtilisateurFailure | Array<ZodIssue>> {
  const validationResult = validator.safeParse(actionParams)

  if (validationResult.error) {
    return validationResult.error.issues
  }

  revalidatePath(actionParams.path)

  return new SupprimerUnUtilisateur(new PrismaUtilisateurRepository(prisma))
    .execute({
      utilisateurASupprimerUid: actionParams.utilisateurASupprimerUid,
      utilisateurCourantUid: await getSubSession(),
    })
}

type ActionParams = Readonly<{
  utilisateurASupprimerUid: string
  path: __next_route_internal_types__.StaticRoutes
}>

const validator = z.object({
  path: z.string().min(1, { message: 'Le chemin n’est pas correct' }),
})
