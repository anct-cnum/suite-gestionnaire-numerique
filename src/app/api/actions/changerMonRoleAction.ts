'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import prisma from '../../../../prisma/prismaClient'
import { Roles } from '@/domain/Role'
import { getSessionSub } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaUtilisateurRepository } from '@/gateways/PrismaUtilisateurRepository'
import { ResultAsync } from '@/use-cases/CommandHandler'
import { ChangerMonRole } from '@/use-cases/commands/ChangerMonRole'

export async function changerMonRoleAction(
  actionParams: ActionParams
): ResultAsync<ReadonlyArray<string>> {
  const validationResult = validator.safeParse(actionParams)

  if (validationResult.error) {
    return validationResult.error.issues.map(({ message }) => message)
  }

  const message = await new ChangerMonRole(new PrismaUtilisateurRepository(prisma.utilisateurRecord))
    .handle({
      nouveauRole: validationResult.data.nouveauRole,
      uidUtilisateurCourant: await getSessionSub(),
    })

  revalidatePath(actionParams.path)

  return [message]
}

type ActionParams = Readonly<{
  nouveauRole: string
  path: string
}>

const validator = z.object({
  nouveauRole: z.enum(Roles, { message: 'Le rôle n’est pas correct' }),
  path: z.string().min(1, { message: 'Le chemin doit être renseigné' }),
})
