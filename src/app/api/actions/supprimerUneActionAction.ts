'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { avecJournalisationMin } from './shared/journalisation'
import prisma from '../../../../prisma/prismaClient'
import { getSessionUtilisateurId } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaActionRepository } from '@/gateways/PrismaActionRepository'
import { PrismaDemandeDeSubventionRepository } from '@/gateways/PrismaDemandeDeSubventionRepository'
import { PrismaFeuilleDeRouteRepository } from '@/gateways/PrismaFeuilleDeRouteRepository'
import { PrismaGouvernanceRepository } from '@/gateways/PrismaGouvernanceRepository'
import { PrismaUtilisateurRepository } from '@/gateways/PrismaUtilisateurRepository'
import { ResultAsync } from '@/use-cases/CommandHandler'
import { SupprimerUneAction } from '@/use-cases/commands/SupprimerUneAction'

export async function supprimerUneActionAction(action: ActionParams): ResultAsync<ReadonlyArray<string>> {
  return avecJournalisationMin(async () => {
    const validationResult = validator.safeParse(action)
    if (validationResult.error) {
      return validationResult.error.issues.map(({ message }) => message)
    }
    const message = await new SupprimerUneAction(
      new PrismaActionRepository(),
      new PrismaDemandeDeSubventionRepository(),
      new PrismaFeuilleDeRouteRepository(),
      new PrismaGouvernanceRepository(),
      new PrismaUtilisateurRepository(prisma.utilisateurRecord)
    ).handle({
      uidActionASupprimer: action.uidActionASupprimer,
      uidEditeur: await getSessionUtilisateurId(),
    })
    revalidatePath(action.path)
    return [message]
  })
}
type ActionParams = Readonly<{
  path: string
  uidActionASupprimer: string
}>

const validator = z.object({
  path: z.string().min(1, { message: 'Le chemin doit être renseigné' }),
  uidActionASupprimer: z.string().min(1, { message: 'L’id de l’action doit doit être renseigné' }),
})
