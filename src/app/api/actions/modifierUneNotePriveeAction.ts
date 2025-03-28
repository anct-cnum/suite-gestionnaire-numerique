'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import prisma from '../../../../prisma/prismaClient'
import { getSessionSub } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaGouvernanceRepository } from '@/gateways/PrismaGouvernanceRepository'
import { PrismaUtilisateurRepository } from '@/gateways/PrismaUtilisateurRepository'
import { ResultAsync } from '@/use-cases/CommandHandler'
import { ModifierUneNotePrivee } from '@/use-cases/commands/ModifierUneNotePrivee'

export async function modifierUneNotePriveeAction(actionParams: ActionParams): ResultAsync<ReadonlyArray<string>> {
  const validationResult = validator.safeParse(actionParams)

  if (validationResult.error) {
    return validationResult.error.issues.map(({ message }) => message)
  }

  const result = await new ModifierUneNotePrivee(
    new PrismaGouvernanceRepository(),
    new PrismaUtilisateurRepository(prisma.utilisateurRecord),
    new Date()
  ).handle({
    contenu: actionParams.contenu,
    uidEditeur: await getSessionSub(),
    uidGouvernance: actionParams.uidGouvernance,
  })

  revalidatePath(validationResult.data.path)

  return [result]
}

type ActionParams = Readonly<{
  contenu: string
  path: string
  uidGouvernance: string
}>

const validator = z.object({
  path: z.string().min(1, { message: 'Le chemin doit être renseigné' }),
})
