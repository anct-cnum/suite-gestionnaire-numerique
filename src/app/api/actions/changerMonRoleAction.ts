'use server'

import { z, ZodIssue } from 'zod'

import prisma from '../../../../prisma/prismaClient'
import { Roles } from '@/domain/Role'
import { PostgreUtilisateurRepository } from '@/gateways/PostgreUtilisateurRepository'
import { getSubSession } from '@/gateways/ProConnectAuthentificationGateway'
import { ResultAsync } from '@/use-cases/CommandHandler'
import { ChangerMonRole, ChangerMonRoleFailure } from '@/use-cases/commands/ChangerMonRole'

export async function changerMonRoleAction(nouveauRole: string): ResultAsync<ChangerMonRoleFailure | Array<ZodIssue>> {
  const validationResult = validator.safeParse({ nouveauRole })

  if (validationResult.error) {
    return validationResult.error.issues
  }

  return new ChangerMonRole(new PostgreUtilisateurRepository(prisma))
    .execute({
      nouveauRole: validationResult.data.nouveauRole,
      utilisateurUid: await getSubSession(),
    })
}

const validator = z.object({
  nouveauRole: z.enum(Roles, { message: 'Le rôle n’est pas correct' }),
})
