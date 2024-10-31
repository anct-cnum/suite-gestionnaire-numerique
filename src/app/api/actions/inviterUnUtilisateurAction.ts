'use server'

import { z, ZodIssue } from 'zod'

import prisma from '../../../../prisma/prismaClient'
import { InviterUnUtilisateurCommand,
  InviterUnUtilisateur, InviterUnUtilisateurFailure } from '../../../use-cases/commands/InviterUnUtilisateur'
import { Roles } from '@/domain/Role'
import { PostgreUtilisateurRepository } from '@/gateways/PostgreUtilisateurRepository'
import { getSession } from '@/gateways/ProConnectAuthentificationGateway'
import { ResultAsync } from '@/use-cases/CommandHandler'

export async function inviterUnUtilisateurAction(
  actionParams: ActionParams
): ResultAsync<InviterUnUtilisateurFailure | Array<ZodIssue>> {
  const roleValidationResult = roleValidation.safeParse({ role: actionParams.role })

  if (roleValidationResult.error) {
    return roleValidationResult.error.issues
  }

  let command: InviterUnUtilisateurCommand = {
    email: actionParams.email,
    nom: actionParams.nom,
    prenom: actionParams.prenom,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    uidUtilisateurCourant: (await getSession())!.user.sub,
  }

  if (roleValidationResult.data.role) {
    command = {
      ...command,
      role: {
        organisation: actionParams.organisation,
        type: roleValidationResult.data.role,
      },
    }
  }

  return new InviterUnUtilisateur(new PostgreUtilisateurRepository(prisma)).execute(command)
}

const roleValidation = z.object({
  role: z.enum(Roles, { message: 'Le rôle n’est pas correct' }).optional(),
})

type ActionParams = Readonly<{
  prenom: string
  nom: string
  email: string
  organisation?: string
  role?: string
}>
