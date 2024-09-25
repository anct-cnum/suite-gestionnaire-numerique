'use server'

import prisma from '../../../prisma/prismaClient'
import { PostgresSoftDeleteUtilisateurGateway } from '@/gateways/PostgreSoftDeleteUtilisateurGateway'
import { getSession } from '@/gateways/ProConnectAuthentificationGateway'
import { ResultAsync } from '@/use-cases/CommandHandler'
import {
  ErreurSuppressionCompte,
  SupprimerMonCompte,
} from '@/use-cases/commands/SupprimerMonCompte'

export async function supprimerMonCompteAction(): ResultAsync<ErreurSuppressionCompte> {
  return new SupprimerMonCompte(new PostgresSoftDeleteUtilisateurGateway(prisma))
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    .execute((await getSession())!.user.sub)
}
