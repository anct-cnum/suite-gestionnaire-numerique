'use server'

import { revalidatePath } from 'next/cache'
import { z, ZodIssue } from 'zod'

import { emailInvitationGatewayFactory } from './shared/emailInvitationGatewayFactory'
import prisma from '../../../../prisma/prismaClient'
import { getSubSession } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaUtilisateurRepository } from '@/gateways/PrismaUtilisateurRepository'
import { ResultAsync } from '@/use-cases/CommandHandler'
import { ReinviterUnUtilisateur, ReinviterUnUtilisateurFailure } from '@/use-cases/commands/ReinviterUnUtilisateur'

export async function reinviterUnUtilisateurAction(
  actionParams: ActionParams
): ResultAsync<ReinviterUnUtilisateurFailure | Array<ZodIssue>> {
  const validationResult = validator
    .safeParse({
      uidUtilisateurAReinviter: actionParams.uidUtilisateurAReinviter,
    })

  if (validationResult.error) {
    return validationResult.error.issues
  }

  const command = {
    uidUtilisateurAReinviter: validationResult.data.uidUtilisateurAReinviter,
    uidUtilisateurCourant: await getSubSession(),
  }

  revalidatePath(actionParams.path)

  return new ReinviterUnUtilisateur(
    new PrismaUtilisateurRepository(prisma),
    emailInvitationGatewayFactory
  ).execute(command)
}

type ActionParams = Readonly<{
  uidUtilisateurAReinviter: string
  path: __next_route_internal_types__.StaticRoutes
}>

const validator = z.object({
  uidUtilisateurAReinviter: z.string().min(1, 'L’identifiant de l’utilisateur à réinviter doit être renseigné'),
})
