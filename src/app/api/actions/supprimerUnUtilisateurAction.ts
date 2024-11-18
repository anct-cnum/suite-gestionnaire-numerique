'use server'

import prisma from '../../../../prisma/prismaClient'
import { getSubSession } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaUtilisateurRepository } from '@/gateways/PrismaUtilisateurRepository'
import { ResultAsync } from '@/use-cases/CommandHandler'
import { SupprimerUnUtilisateur, SupprimerUnUtilisateurFailure } from '@/use-cases/commands/SupprimerUnUtilisateur'

export async function supprimerUnUtilisateurAction(
  utilisateurASupprimerUid: string
): ResultAsync<SupprimerUnUtilisateurFailure> {
  return new SupprimerUnUtilisateur(new PrismaUtilisateurRepository(prisma))
    .execute({
      utilisateurASupprimerUid,
      utilisateurCourantUid: await getSubSession(),
    })
}
