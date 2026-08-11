'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { emailInvitationGatewayFactory } from './shared/emailInvitationGatewayFactory'
import { avecJournalisationMin } from './shared/journalisation'
import prisma from '../../../../prisma/prismaClient'
import { getSessionUtilisateurId } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaUtilisateurRepository } from '@/gateways/PrismaUtilisateurRepository'
import { ResultAsync } from '@/use-cases/CommandHandler'
import { ReinviterUnUtilisateur } from '@/use-cases/commands/ReinviterUnUtilisateur'

export async function reinviterUnUtilisateurAction(actionParams: ActionParams): ResultAsync<ReadonlyArray<string>> {
  return avecJournalisationMin(async () => {
    const validationResult = validator.safeParse(actionParams)

    if (validationResult.error) {
      return validationResult.error.issues.map(({ message }) => message)
    }

    const message = await new ReinviterUnUtilisateur(
      new PrismaUtilisateurRepository(prisma.utilisateurRecord),
      emailInvitationGatewayFactory,
      new Date()
    ).handle({
      uidUtilisateurAReinviter: actionParams.uidUtilisateurAReinviter,
      uidUtilisateurCourant: await getSessionUtilisateurId(),
    })

    revalidatePath(validationResult.data.path)

    return [message]
  })
}

type ActionParams = Readonly<{
  path: string
  uidUtilisateurAReinviter: number
}>

const validator = z.object({
  path: z.string().min(1, { message: 'Le chemin doit être renseigné' }),
  uidUtilisateurAReinviter: z
    .number()
    .int()
    .min(1, { message: 'L’identifiant de l’utilisateur à réinviter doit être renseigné' }),
})
