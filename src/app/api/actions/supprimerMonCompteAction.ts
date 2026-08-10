'use server'

import { avecJournalisationMin } from './shared/journalisation'
import prisma from '../../../../prisma/prismaClient'
import { getSessionUtilisateurId } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaUtilisateurRepository } from '@/gateways/PrismaUtilisateurRepository'
import { ResultAsync } from '@/use-cases/CommandHandler'
import { SupprimerUnUtilisateur } from '@/use-cases/commands/SupprimerUnUtilisateur'

export async function supprimerMonCompteAction(): ResultAsync<ReadonlyArray<string>> {
  return avecJournalisationMin(async () => {
    const sessionSub = await getSessionUtilisateurId()

    const message = await new SupprimerUnUtilisateur(new PrismaUtilisateurRepository(prisma.utilisateurRecord)).handle({
      uidUtilisateurASupprimer: sessionSub,
      uidUtilisateurCourant: sessionSub,
    })

    return [message]
  })
}
