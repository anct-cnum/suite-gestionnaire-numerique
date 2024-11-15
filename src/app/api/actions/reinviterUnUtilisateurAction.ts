'use server'

import { revalidatePath } from 'next/cache'
import { z, ZodIssue } from 'zod'

import prisma from '../../../../prisma/prismaClient'
import { PostgreUtilisateurRepository } from '@/gateways/PostgreUtilisateurRepository'
import { ResultAsync } from '@/use-cases/CommandHandler'
import { ReinviterUnUtilisateur, ReinviterUnUtilisateurFailure } from '@/use-cases/commands/ReinviterUnUtilisateur'

export async function reinviterUnUtilisateurAction(
  actionParams: ActionParams
): ResultAsync<ReinviterUnUtilisateurFailure | Array<ZodIssue>> {
  const validationResult = validator
    .safeParse({
      uidUtilisateurAReinviter: actionParams.uidUtilisateurAReinviter,
      uidUtilisateurCourant: actionParams.uidUtilisateurCourant,
    })

  if (validationResult.error) {
    return validationResult.error.issues
  }

  const command = {
    uidUtilisateurAReinviter: validationResult.data.uidUtilisateurAReinviter,
    uidUtilisateurCourant: validationResult.data.uidUtilisateurCourant,
  }

  revalidatePath('/mes-utilisateurs')

  return new ReinviterUnUtilisateur(new PostgreUtilisateurRepository(prisma)).execute(command)
}

type ActionParams = Readonly<{
  uidUtilisateurAReinviter: string
  uidUtilisateurCourant: string
}>

const validator = z.object({
  uidUtilisateurAReinviter: z.string().min(1, 'L’identifiant de l’utilisateur à réinviter doit être renseigné'),
  uidUtilisateurCourant: z.string().min(1, 'L’identifiant de l’utilisateur courant doit être renseigné'),
})
