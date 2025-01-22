'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import prisma from '../../../../prisma/prismaClient'
import { getSessionSub } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaGouvernanceRepository } from '@/gateways/PrismaGouvernanceRepository'
import { PrismaUtilisateurRepository } from '@/gateways/PrismaUtilisateurRepository'
import { ResultAsync } from '@/use-cases/CommandHandler'
import { AjouterNoteDeContexteAGouvernance } from '@/use-cases/commands/AjouterNoteDeContexteAGouvernance'

export async function ajouterUneNoteDeContexteAction(
  actionParam: ActionParams
): ResultAsync<ReadonlyArray<string>> {
  const validationResult = validator.safeParse(actionParam)

  if (validationResult.error) {
    return validationResult.error.issues.map(({ message }) => message)
  }

  const ajouterNoteDeContexteAGouvernance = new AjouterNoteDeContexteAGouvernance(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
    new PrismaGouvernanceRepository(prisma.gouvernanceRecord),
    new PrismaUtilisateurRepository(prisma.utilisateurRecord),
    new Date()
  )
  const result = await ajouterNoteDeContexteAGouvernance.execute({
    contenu: actionParam.contenu,
    uidGouvernance: actionParam.uidGouvernance,
    uidUtilisateurCourant: await getSessionSub(),
  })
  revalidatePath(validationResult.data.path)
  return [result]
}

type ActionParams = Readonly<{
  contenu: string
  uidGouvernance: string
  path: string
}>

const validator = z.object({
  path: z.string().min(1, { message: 'Le chemin doit être renseigné' }),
})
