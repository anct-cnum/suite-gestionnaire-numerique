'use server'

import { revalidatePath } from 'next/cache'
import { z, ZodIssue } from 'zod'

import prisma from '../../../../prisma/prismaClient'
import { getSubSession } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaUtilisateurRepository } from '@/gateways/PrismaUtilisateurRepository'
import { telephonePattern } from '@/shared/patterns'
import { ResultAsync } from '@/use-cases/CommandHandler'
import { ModificationUtilisateurFailure, ModifierMesInformationsPersonnelles } from '@/use-cases/commands/ModifierMesInformationsPersonnelles'

export async function modifierMesInformationsPersonnellesAction(
  actionParams: ActionParams
): ResultAsync<ModificationUtilisateurFailure | Array<ZodIssue>> {
  const validationResult = validator.safeParse(actionParams)

  if (validationResult.error) {
    return validationResult.error.issues
  }

  revalidatePath(actionParams.path)

  return new ModifierMesInformationsPersonnelles(new PrismaUtilisateurRepository(prisma))
    .execute({
      modification: {
        email: validationResult.data.email,
        nom: validationResult.data.nom,
        prenom: validationResult.data.prenom,
        telephone: validationResult.data.telephone,
      },
      uid: await getSubSession(),
    })
}

type ActionParams = Readonly<{
  email: string
  nom: string
  prenom: string
  telephone: string
  path: __next_route_internal_types__.StaticRoutes
}>

const validator = z.object({
  email: z.string().email({ message: 'L’email doit être valide' }),
  nom: z.string().min(1, { message: 'Le nom doit contenir au moins 1 caractère' }),
  path: z.string().min(1, { message: 'Le chemin n’est pas correct' }),
  prenom: z.string().min(1, { message: 'Le prénom doit contenir au moins 1 caractère' }),
  // Stryker disable next-line Regex
  telephone: z.string().regex(telephonePattern, { message: 'Le téléphone doit être au format 0102030405 ou +33102030405' }).or(z.literal('')),
})
