'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { avecJournalisationMin } from './shared/journalisation'
import prisma from '../../../../prisma/prismaClient'
import { getSessionUtilisateurId } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaUtilisateurRepository } from '@/gateways/PrismaUtilisateurRepository'
import { ResultAsync } from '@/use-cases/CommandHandler'
import { SupprimerUnUtilisateur } from '@/use-cases/commands/SupprimerUnUtilisateur'

export async function supprimerUnUtilisateurAction(actionParams: ActionParams): ResultAsync<ReadonlyArray<string>> {
  return avecJournalisationMin(async () => {
    const validationResult = validator.safeParse(actionParams)

    if (validationResult.error) {
      return validationResult.error.issues.map(({ message }) => message)
    }

    const message = await new SupprimerUnUtilisateur(new PrismaUtilisateurRepository(prisma.utilisateurRecord)).handle({
      uidUtilisateurASupprimer: actionParams.uidUtilisateurASupprimer,
      uidUtilisateurCourant: await getSessionUtilisateurId(),
    })

    revalidatePath(actionParams.path)

    return [message]
  })
}

type ActionParams = Readonly<{
  path: string
  uidUtilisateurASupprimer: number
}>

const validator = z.object({
  path: z.string().min(1, { message: 'Le chemin doit être renseigné' }),
  uidUtilisateurASupprimer: z
    .number()
    .int()
    .min(1, { message: 'L’identifiant de l’utilisateur à supprimer doit être renseigné' }),
})
