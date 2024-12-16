'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { emailInvitationGatewayFactory } from './shared/emailInvitationGatewayFactory'
import prisma from '../../../../prisma/prismaClient'
import { getSubSession } from '@/gateways/NextAuthAuthentificationGateway'
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
    new PrismaUtilisateurRepository(prisma),
    emailInvitationGatewayFactory
  ).execute({
    uidUtilisateurAReinviter: validationResult.data.uidUtilisateurAReinviter,
    uidUtilisateurCourant: await getSubSession(),
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
  uidUtilisateurAReinviter: z.string().min(1, 'L’identifiant de l’utilisateur à réinviter doit être renseigné'),
})
