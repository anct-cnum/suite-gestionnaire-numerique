'use server'

import prisma from '../../../../prisma/prismaClient'
import { PostgreUtilisateurRepository } from '@/gateways/PostgreUtilisateurRepository'
import { getSubSession } from '@/gateways/ProConnectAuthentificationGateway'
import { ResultAsync } from '@/use-cases/CommandHandler'
import { SuppressionCompteFailure, SupprimerMonCompte } from '@/use-cases/commands/SupprimerMonCompte'

export async function supprimerMonCompteAction(): ResultAsync<SuppressionCompteFailure> {
  return new SupprimerMonCompte(new PostgreUtilisateurRepository(prisma))
    .execute({ utilisateurUid: await getSubSession() })
}
