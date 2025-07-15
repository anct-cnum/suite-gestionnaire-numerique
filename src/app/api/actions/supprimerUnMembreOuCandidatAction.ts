'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import prisma from '../../../../prisma/prismaClient'
import { getSessionSub } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaGouvernanceRepository } from '@/gateways/PrismaGouvernanceRepository'
import { PrismaMembreRepository } from '@/gateways/PrismaMembreRepository'
import { PrismaUtilisateurRepository } from '@/gateways/PrismaUtilisateurRepository'
import { ResultAsync } from '@/use-cases/CommandHandler'
import { SupprimerUnMembreOuCandidat } from '@/use-cases/commands/SupprimerUnMembreOuCandidat'

export async function supprimerUnMembreOuCandidatAction(
  actionParams: ActionParams
): ResultAsync<ReadonlyArray<string>> {
  const validationResult = validator.safeParse(actionParams)

  if (validationResult.error) {
    return validationResult.error.issues.map(({ message }) => message)
  }
  const sessionSub = await getSessionSub()

  const message = await new SupprimerUnMembreOuCandidat(
    new PrismaMembreRepository(),
    new PrismaUtilisateurRepository(prisma.utilisateurRecord),
    new PrismaGouvernanceRepository()
  )
    .handle({
      date: new Date(),
      uidGouvernance: actionParams.uidGouvernance,
      uidMembre: actionParams.uidMembre,
      uidUtilisateurConnecte: sessionSub,
    })

  revalidatePath(actionParams.path)

  return [message]
}

type ActionParams = Readonly<{
  path: string
  uidGouvernance: string
  uidMembre: string
}>

const validator = z.object({
  path: z.string().min(1, { message: 'Le chemin doit être renseigné' }),
})
