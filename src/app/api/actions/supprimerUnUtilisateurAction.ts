'use server'

import prisma from '../../../../prisma/prismaClient'
import { PostgreUtilisateurRepository } from '@/gateways/PostgreUtilisateurRepository'
import { getSubSession } from '@/gateways/ProConnectAuthentificationGateway'
import { ResultAsync } from '@/use-cases/CommandHandler'
import { SupprimerUnUtilisateur, SupprimerUnUtilisateurFailure } from '@/use-cases/commands/SupprimerUnUtilisateur'

export async function supprimerUnUtilisateurAction(
  utilisateurASupprimerUid: string
): ResultAsync<SupprimerUnUtilisateurFailure> {
  return new SupprimerUnUtilisateur(new PostgreUtilisateurRepository(prisma))
    .execute({
      utilisateurASupprimerUid,
      utilisateurCourantUid: await getSubSession(),
    })
}
