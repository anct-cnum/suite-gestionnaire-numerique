'use server'

import prisma from '../../../../prisma/prismaClient'
import { getSessionSub } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaUtilisateurRepository } from '@/gateways/PrismaUtilisateurRepository'
import { ResultAsync } from '@/use-cases/CommandHandler'
import { SupprimerUnUtilisateur } from '@/use-cases/commands/SupprimerUnUtilisateur'

export async function supprimerMonCompteAction(): ResultAsync<ReadonlyArray<string>> {
  const sessionSub = await getSessionSub()

  const message = await new SupprimerUnUtilisateur(new PrismaUtilisateurRepository(prisma.utilisateurRecord))
    .execute({
      uidUtilisateurASupprimer: sessionSub,
      uidUtilisateurCourant: sessionSub,
    })

  return [message]
}
