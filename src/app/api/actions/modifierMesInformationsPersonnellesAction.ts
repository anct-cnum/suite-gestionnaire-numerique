'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import prisma from '../../../../prisma/prismaClient'
import { getSessionSub } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaUtilisateurRepository } from '@/gateways/PrismaUtilisateurRepository'
import { telephonePattern } from '@/shared/patterns'
import { ResultAsync } from '@/use-cases/CommandHandler'
import { ModifierMesInformationsPersonnelles } from '@/use-cases/commands/ModifierMesInformationsPersonnelles'

export async function modifierMesInformationsPersonnellesAction(
  actionParams: ActionParams
): ResultAsync<ReadonlyArray<string>> {
  const validationResult = validator.safeParse(actionParams)

  if (validationResult.error) {
    return validationResult.error.issues.map(({ message }) => message)
  }

  const message = await new ModifierMesInformationsPersonnelles(
    new PrismaUtilisateurRepository(prisma.utilisateurRecord)
  ).execute({
    modification: {
      emailDeContact: actionParams.emailDeContact,
      nom: actionParams.nom,
      prenom: actionParams.prenom,
      telephone: actionParams.telephone,
    },
    uidUtilisateurCourant: await getSessionSub(),
  })

  revalidatePath(actionParams.path)

  return [message]
}

type ActionParams = Readonly<{
  emailDeContact: string
  nom: string
  prenom: string
  telephone: string
  path: string
}>

const validator = z.object({
  path: z.string().min(1, { message: 'Le chemin doit être renseigné' }),
  telephone: z.string().regex(telephonePattern, { message: 'Le téléphone doit être au format 0102030405 ou +33102030405' }).or(z.literal('')),
})
