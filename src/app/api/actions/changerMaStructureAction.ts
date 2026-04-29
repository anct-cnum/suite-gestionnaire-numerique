'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import prisma from '../../../../prisma/prismaClient'
import { getSessionSub } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaUtilisateurRepository } from '@/gateways/PrismaUtilisateurRepository'
import { ResultAsync } from '@/use-cases/CommandHandler'
import { ChangerMaStructure } from '@/use-cases/commands/ChangerMaStructure'

export async function changerMaStructureAction(actionParams: ActionParams): ResultAsync<ReadonlyArray<string>> {
  const validationResult = validator.safeParse(actionParams)

  if (validationResult.error) {
    return validationResult.error.issues.map(({ message }) => message)
  }

  const uid = await getSessionSub()

  const message = await new ChangerMaStructure(new PrismaUtilisateurRepository(prisma.utilisateurRecord)).handle({
    idStructure: validationResult.data.idStructure,
    uidUtilisateurCourant: uid,
  })

  revalidatePath(actionParams.path)

  return [message]
}

type ActionParams = Readonly<{
  idStructure: null | number
  path: string
}>

const validator = z.object({
  idStructure: z
    .number()
    .int()
    .positive({ message: "L'identifiant de la structure doit être un entier positif" })
    .nullable(),
  path: z.string().min(1, { message: 'Le chemin doit être renseigné' }),
})
