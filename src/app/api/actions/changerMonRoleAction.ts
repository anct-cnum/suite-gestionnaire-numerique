'use server'

import { z, ZodIssue } from 'zod'

import prisma from '../../../../prisma/prismaClient'
import { Roles } from '@/domain/Role'
import { PostgreUtilisateurRepository } from '@/gateways/PostgreUtilisateurRepository'
import { getSession } from '@/gateways/ProConnectAuthentificationGateway'
import { ResultAsync } from '@/use-cases/CommandHandler'
import { ChangerMonRole, ChangerMonRoleFailure } from '@/use-cases/commands/ChangerMonRole'

export async function changerMonRoleAction(nouveauRole: string): ResultAsync<ChangerMonRoleFailure | Array<ZodIssue>> {
  const changerMonRoleParsed = changerMonRoleValidation()
    .safeParse({
      nouveauRole,
    })

  if (changerMonRoleParsed.error) {
    return changerMonRoleParsed.error.issues
  }

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const utilisateurUid = (await getSession())!.user.sub
  return new ChangerMonRole(new PostgreUtilisateurRepository(prisma))
    .execute({ nouveauRole: changerMonRoleParsed.data.nouveauRole, utilisateurUid })
}

function changerMonRoleValidation() {
  return z
    .object({
      nouveauRole: z.enum(Roles, { message: 'Le rôle n’est pas correct' }),
    })
}
