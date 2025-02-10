'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import prisma from '../../../../prisma/prismaClient'
import { getSessionSub } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaGouvernanceRepository } from '@/gateways/PrismaGouvernanceRepository'
import { PrismaMembreRepository } from '@/gateways/PrismaMembreRepository'
import { PrismaUtilisateurRepository } from '@/gateways/PrismaUtilisateurRepository'
import { ResultAsync } from '@/use-cases/CommandHandler'
import { AccepterUnMembre } from '@/use-cases/commands/AccepterUnMembre'

export async function accepterUnMembreAction(
  actionParams: ActionParams
): ResultAsync<ReadonlyArray<string>> {
  const validationResult = validator.safeParse(actionParams)

  if (validationResult.error) {
    return validationResult.error.issues.map(({ message }) => message)
  }

  const result = await new AccepterUnMembre(
    new PrismaUtilisateurRepository(prisma.utilisateurRecord),
    new PrismaGouvernanceRepository(),
    new PrismaMembreRepository()
  ).handle({
    uidGestionnaire: await getSessionSub(),
    uidGouvernance: actionParams.uidGouvernance,
    uidMembrePotentiel: actionParams.uidMembrePotentiel,
  })

  revalidatePath(validationResult.data.path)

  return [result]
}

type ActionParams = Readonly<{
  path: string
  uidGouvernance: string
  uidMembrePotentiel: string
}>

const validator = z.object({
  path: z.string().min(1, { message: 'Le chemin doit être renseigné' }),
})
