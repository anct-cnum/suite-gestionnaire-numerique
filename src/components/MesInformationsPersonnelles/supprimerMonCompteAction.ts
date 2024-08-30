'use server'

import prisma from '../../../prisma/prismaClient'
import { PostgresSoftDeleteUtilisateurGateway } from '@/gateways/PostgreSoftDeleteUtilisateurGateway'
import {
  EmailUtilisateur,
  SupprimerMonCompteCommandHandler,
} from '@/use-cases/commands/SupprimerMonCompteCommand'

export async function supprimerMonCompteAction(emailUtilisateur: EmailUtilisateur): Promise<void> {
  await new SupprimerMonCompteCommandHandler(new PostgresSoftDeleteUtilisateurGateway(prisma))
    .execute(emailUtilisateur)
}
