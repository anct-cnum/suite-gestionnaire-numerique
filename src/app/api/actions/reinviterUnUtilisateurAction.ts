'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { emailInvitationGatewayFactory } from './shared/emailInvitationGatewayFactory'
import prisma from '../../../../prisma/prismaClient'
import { getSessionSub } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaUtilisateurRepository } from '@/gateways/PrismaUtilisateurRepository'
import { ResultAsync } from '@/use-cases/CommandHandler'
import { ReinviterUnUtilisateur } from '@/use-cases/commands/ReinviterUnUtilisateur'

export async function reinviterUnUtilisateurAction(
  actionParams: ActionParams
): ResultAsync<ReadonlyArray<string>> {
  const validationResult = validator.safeParse(actionParams)

  if (validationResult.error) {
    return validationResult.error.issues.map(({ message }) => message)
  }

  const message = await new ReinviterUnUtilisateur(
    new PrismaUtilisateurRepository(prisma.utilisateurRecord),
    emailInvitationGatewayFactory,
    new Date()
  ).execute({
    uidUtilisateurAReinviter: actionParams.uidUtilisateurAReinviter,
    uidUtilisateurCourant: await getSessionSub(),
  })

  revalidatePath(validationResult.data.path)

  return [message]
}

type ActionParams = Readonly<{
  path: string
  uidUtilisateurAReinviter: string
}>

const validator = z.object({
  path: z.string().min(1, { message: 'Le chemin doit être renseigné' }),
})
