'use server'

import prisma from '../../../../prisma/prismaClient'
import { PostgreUtilisateurRepository } from '@/gateways/PostgreUtilisateurRepository'
import { getSession } from '@/gateways/ProConnectAuthentificationGateway'
import { ResultAsync } from '@/use-cases/CommandHandler'
import { SuppressionCompteFailure, SupprimerMonCompte } from '@/use-cases/commands/SupprimerMonCompte'

export async function supprimerMonCompteAction(): ResultAsync<SuppressionCompteFailure> {
  return new SupprimerMonCompte(new PostgreUtilisateurRepository(prisma))
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    .execute({ utilisateurUid: (await getSession())!.user.sub })
}
