'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import prisma from '../../../../prisma/prismaClient'
import { getSessionSub } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaGouvernanceRepository } from '@/gateways/PrismaGouvernanceRepository'
import { PrismaUtilisateurRepository } from '@/gateways/PrismaUtilisateurRepository'
import { ResultAsync } from '@/use-cases/CommandHandler'
import { SupprimerUneNotePrivee } from '@/use-cases/commands/SupprimerUneNotePrivee'

export async function supprimerUneNotePriveeAction(actionParams: ActionParams): ResultAsync<ReadonlyArray<string>> {
  const validationResult = validator.safeParse(actionParams)

  if (validationResult.error) {
    return validationResult.error.issues.map(({ message }) => message)
  }

  const result = await new SupprimerUneNotePrivee(
    new PrismaGouvernanceRepository(prisma.gouvernanceRecord),
    new PrismaUtilisateurRepository(prisma.utilisateurRecord)
  ).handle({
    uidEditeur: await getSessionSub(),
    uidGouvernance: actionParams.uidGouvernance,
  })

  revalidatePath(validationResult.data.path)

  return [result]
}

type ActionParams = Readonly<{
  path: string
  uidGouvernance: string
}>

const validator = z.object({
  path: z.string().min(1, { message: 'Le chemin doit être renseigné' }),
})
