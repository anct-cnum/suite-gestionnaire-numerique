'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import prisma from '../../../../prisma/prismaClient'
import { getSessionSub } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaComiteRepository } from '@/gateways/PrismaComiteRepository'
import { PrismaGouvernanceRepository } from '@/gateways/PrismaGouvernanceRepository'
import { PrismaUtilisateurRepository } from '@/gateways/PrismaUtilisateurRepository'
import { ResultAsync } from '@/use-cases/CommandHandler'
import { AjouterUnComite } from '@/use-cases/commands/AjouterUnComite'

export async function ajouterUnComiteAction(
  actionParams: ActionParams
): ResultAsync<ReadonlyArray<string>> {
  const validationResult = validator.safeParse(actionParams)

  if (validationResult.error) {
    return validationResult.error.issues.map(({ message }) => message)
  }

  const result = await new AjouterUnComite(
    new PrismaGouvernanceRepository(prisma.gouvernanceRecord),
    new PrismaUtilisateurRepository(prisma.utilisateurRecord),
    new PrismaComiteRepository(prisma.comiteRecord),
    new Date()
  ).execute({
    commentaire: actionParams.commentaire,
    date: actionParams.date,
    frequence: actionParams.frequence,
    type: actionParams.type,
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
  uidGouvernance: string
}>

const validator = z.object({
  path: z.string().min(1, { message: 'Le chemin doit être renseigné' }),
})
