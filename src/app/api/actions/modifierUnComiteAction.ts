'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import prisma from '../../../../prisma/prismaClient'
import { getSessionSub } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaComiteRepository } from '@/gateways/PrismaComiteRepository'
import { PrismaGouvernanceRepository } from '@/gateways/PrismaGouvernanceRepository'
import { PrismaUtilisateurRepository } from '@/gateways/PrismaUtilisateurRepository'
import { ResultAsync } from '@/use-cases/CommandHandler'
import { ModifierUnComite } from '@/use-cases/commands/ModifierUnComite'

export async function modifierUnComiteAction(
  actionParams: ActionParams
): ResultAsync<ReadonlyArray<string>> {
  const validationResult = validator.safeParse(actionParams)

  if (validationResult.error) {
    return validationResult.error.issues.map(({ message }) => message)
  }

  const result = await new ModifierUnComite(
    new PrismaGouvernanceRepository(prisma.gouvernanceRecord, prisma.noteDeContexteRecord),
    new PrismaUtilisateurRepository(prisma.utilisateurRecord),
    new PrismaComiteRepository(prisma.comiteRecord),
    new Date()
  ).handle({
    commentaire: actionParams.commentaire,
    date: actionParams.date,
    frequence: actionParams.frequence,
    type: actionParams.type,
    uid: actionParams.uid,
    uidEditeur: await getSessionSub(),
    uidGouvernance: actionParams.uidGouvernance,
  })

  revalidatePath(validationResult.data.path)

  return [result]
}

type ActionParams = Readonly<{
  commentaire?: string
  date?: string
  frequence: string
  path: string
  type: string
  uid: string
  uidGouvernance: string
}>

const validator = z.object({
  path: z.string().min(1, { message: 'Le chemin doit être renseigné' }),
})
