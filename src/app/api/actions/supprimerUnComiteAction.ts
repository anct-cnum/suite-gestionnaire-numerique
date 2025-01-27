'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import prisma from '../../../../prisma/prismaClient'
import { getSessionSub } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaComiteRepository } from '@/gateways/PrismaComiteRepository'
import { PrismaGouvernanceRepository } from '@/gateways/PrismaGouvernanceRepository'
import { PrismaUtilisateurRepository } from '@/gateways/PrismaUtilisateurRepository'
import { ResultAsync } from '@/use-cases/CommandHandler'
import { SupprimerUnComite } from '@/use-cases/commands/SupprimerUnComite'

export async function supprimerUnComiteAction(
  actionParams: ActionParams
): ResultAsync<ReadonlyArray<string>> {
  const validationResult = validator.safeParse(actionParams)

  if (validationResult.error) {
    return validationResult.error.issues.map(({ message }) => message)
  }

  const result = await new SupprimerUnComite(
    new PrismaGouvernanceRepository(prisma.gouvernanceRecord),
    new PrismaUtilisateurRepository(prisma.utilisateurRecord),
    new PrismaComiteRepository(prisma.comiteRecord)
  ).execute({
    uid: actionParams.uid,
    uidEditeur: await getSessionSub(),
    uidGouvernance: actionParams.uidGouvernance,
  })

  revalidatePath(validationResult.data.path)

  return [result]
}

type ActionParams = Readonly<{
  path: string
  uid: string
  uidGouvernance: string
}>

const validator = z.object({
  path: z.string().min(1, { message: 'Le chemin doit être renseigné' }),
})
