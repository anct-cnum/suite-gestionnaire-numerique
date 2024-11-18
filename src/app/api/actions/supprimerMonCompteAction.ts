'use server'

import prisma from '../../../../prisma/prismaClient'
import { getSubSession } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaUtilisateurRepository } from '@/gateways/PrismaUtilisateurRepository'
import { ResultAsync } from '@/use-cases/CommandHandler'
import { SuppressionCompteFailure, SupprimerMonCompte } from '@/use-cases/commands/SupprimerMonCompte'

export async function supprimerMonCompteAction(): ResultAsync<SuppressionCompteFailure> {
  return new SupprimerMonCompte(new PrismaUtilisateurRepository(prisma))
    .execute({ utilisateurUid: await getSubSession() })
}
