'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import prisma from '../../../../prisma/prismaClient'
import { getSessionSub } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaUtilisateurRepository } from '@/gateways/PrismaUtilisateurRepository'
import { ResultAsync } from '@/use-cases/CommandHandler'
import { SupprimerUnUtilisateur } from '@/use-cases/commands/SupprimerUnUtilisateur'

export async function supprimerUnUtilisateurAction(
  actionParams: ActionParams
): ResultAsync<ReadonlyArray<string>> {
  const validationResult = validator.safeParse(actionParams)

  if (validationResult.error) {
    return validationResult.error.issues.map(({ message }) => message)
  }

  const message = await new SupprimerUnUtilisateur(new PrismaUtilisateurRepository(prisma.utilisateurRecord))
    .handle({
      uidUtilisateurASupprimer: actionParams.uidUtilisateurASupprimer,
      uidUtilisateurCourant: await getSessionSub(),
    })

  revalidatePath(actionParams.path)

  return [message]
}

type ActionParams = Readonly<{
  path: string
  uidUtilisateurASupprimer: string
}>

const validator = z.object({
  path: z.string().min(1, { message: 'Le chemin doit être renseigné' }),
})
