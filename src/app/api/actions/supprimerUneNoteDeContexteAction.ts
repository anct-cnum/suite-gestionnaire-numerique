'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import prisma from '../../../../prisma/prismaClient'
import { getSessionSub } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaGouvernanceRepository } from '@/gateways/PrismaGouvernanceRepository'
import { PrismaUtilisateurRepository } from '@/gateways/PrismaUtilisateurRepository'
import { ResultAsync } from '@/use-cases/CommandHandler'
import { SupprimerUneNoteDeContexte } from '@/use-cases/commands/SupprimerUneNoteDeContexte'

export async function supprimerUneNoteDeContexteAction(
  actionParam: ActionParams
): ResultAsync<ReadonlyArray<string>> {
  const validationResult = validator.safeParse(actionParam)

  if (validationResult.error) {
    return validationResult.error.issues.map(({ message }) => message)
  }

  const supprimerUneNoteDeContexte = new SupprimerUneNoteDeContexte(
    new PrismaGouvernanceRepository(),
    new PrismaUtilisateurRepository(prisma.utilisateurRecord)
  )
  const result = await supprimerUneNoteDeContexte.handle({
    uidEditeur: await getSessionSub(),
    uidGouvernance: actionParam.uidGouvernance,
  })
  revalidatePath(validationResult.data.path)
  return [result]
}

type ActionParams = Readonly<{
  uidGouvernance: string
  path: string
}>

const validator = z.object({
  path: z.string().min(1, { message: 'Le chemin doit être renseigné' }),
})
