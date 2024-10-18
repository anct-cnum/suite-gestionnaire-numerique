import { z, ZodIssue } from 'zod'

import prisma from '../../../../prisma/prismaClient'
import { PostgreUtilisateurRepository } from '../../../gateways/PostgreUtilisateurRepository'
import { getSession } from '../../../gateways/ProConnectAuthentificationGateway'
import { ResultAsync } from '../../../use-cases/CommandHandler'
import {
  InviterUnUtilisateur,
  InviterUnUtilisateurFailure,
} from '../../../use-cases/commands/InviterUnUtilisateur'
import { Roles } from '@/domain/Role'

type ActionProps = Readonly<{
  prenom: string
  nom: string
  email: string
  organisation: string
  role: string
}>

export async function inviterUnUtilisateurAction(
  actionProps: ActionProps
): ResultAsync<InviterUnUtilisateurFailure | Array<ZodIssue>> {
  const roleValidationResult = roleValidation().safeParse({ role: actionProps.role })

  if (roleValidationResult.error) {
    return roleValidationResult.error.issues
  }

  return new InviterUnUtilisateur(new PostgreUtilisateurRepository(prisma)).execute({
    ...actionProps,
    role: roleValidationResult.data.role,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    uidUtilisateurCourant: (await getSession())!.user.sub,
  })
}

function roleValidation() {
  return z.object({
    role: z.enum(Roles, { message: 'Le rôle n’est pas correct' }),
  })
}
