'use server'

import prisma from '../../../../prisma/prismaClient'
import { getSessionSub } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaUtilisateurRepository } from '@/gateways/PrismaUtilisateurRepository'
import { ResultAsync } from '@/use-cases/CommandHandler'
import { SupprimerMonCompte } from '@/use-cases/commands/SupprimerMonCompte'

export async function supprimerMonCompteAction(): ResultAsync<ReadonlyArray<string>> {
  const message = await new SupprimerMonCompte(new PrismaUtilisateurRepository(prisma.utilisateurRecord))
    .execute({ uidUtilisateurCourant: await getSessionSub() })

  return [message]
}
