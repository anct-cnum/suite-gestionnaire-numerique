'use server'

import prisma from '../../../prisma/prismaClient'
import { PostgresSoftDeleteUtilisateurGateway } from '@/gateways/PostgreSoftDeleteUtilisateurGateway'
import { ResultAsync } from '@/use-cases/commands/CommandHandler'
import {
  EmailUtilisateur,
  ErreurSuppressionCompte,
  SupprimerMonCompte,
} from '@/use-cases/commands/SupprimerMonCompte'

export async function supprimerMonCompteAction(
  emailUtilisateur: EmailUtilisateur
): ResultAsync<ErreurSuppressionCompte> {
  return new SupprimerMonCompte(new PostgresSoftDeleteUtilisateurGateway(prisma))
    .execute(emailUtilisateur)
}
