'use server'

import { revalidatePath } from 'next/cache'
import { z, ZodIssue } from 'zod'

import prisma from '../../../../prisma/prismaClient'
import { Roles } from '@/domain/Role'
import { getSubSession } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaUtilisateurRepository } from '@/gateways/PrismaUtilisateurRepository'
import { ResultAsync } from '@/use-cases/CommandHandler'
import { ChangerMonRole, ChangerMonRoleFailure } from '@/use-cases/commands/ChangerMonRole'

export async function changerMonRoleAction(
  actionParams: ActionParams
): ResultAsync<ChangerMonRoleFailure | Array<ZodIssue>> {
  const validationResult = validator.safeParse(actionParams)

  if (validationResult.error) {
    return validationResult.error.issues
  }

  revalidatePath(actionParams.path)

  return new ChangerMonRole(new PrismaUtilisateurRepository(prisma))
    .execute({
      nouveauRole: validationResult.data.nouveauRole,
      utilisateurUid: await getSubSession(),
    })
}

type ActionParams = Readonly<{
  nouveauRole: string
  path: __next_route_internal_types__.StaticRoutes
}>

const validator = z.object({
  nouveauRole: z.enum(Roles, { message: 'Le rôle n’est pas correct' }),
  path: z.string().min(1, { message: 'Le chemin n’est pas correct' }),
})
