'use server'

import { z, ZodIssue } from 'zod'

import prisma from '../../../../prisma/prismaClient'
import { PostgreUtilisateurRepository } from '@/gateways/PostgreUtilisateurRepository'
import { getSession } from '@/gateways/ProConnectAuthentificationGateway'
import { ResultAsync } from '@/use-cases/CommandHandler'
import { ModificationUtilisateurFailure, ModifierMesInformationsPersonnelles } from '@/use-cases/commands/ModifierMesInformationsPersonnelles'

export async function modifierMesInformationsPersonnellesAction(
  email: string,
  nom: string,
  prenom: string,
  telephone: string
): ResultAsync<ModificationUtilisateurFailure | Array<ZodIssue>> {
  const modifierMesInformationsPersonnellesParsed = modifierMesInformationsPersonnellesValidation()
    .safeParse({
      email,
      nom,
      prenom,
      telephone,
    })

  if (modifierMesInformationsPersonnellesParsed.error) {
    return modifierMesInformationsPersonnellesParsed.error.issues
  }

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const session = (await getSession())!

  return new ModifierMesInformationsPersonnelles(new PostgreUtilisateurRepository(prisma))
    .execute({
      modification: {
        email,
        nom,
        prenom,
        telephone,
      },
      uid: session.user.sub,
    })
}

function modifierMesInformationsPersonnellesValidation() {
  return z
    .object({
      email: z.string().email({ message: 'L’email doit être valide' }),
      nom: z.string().min(1, { message: 'Le nom doit contenir au moins 1 caractère' }),
      prenom: z.string().min(1, { message: 'Le prénom doit contenir au moins 1 caractère' }),
      // Stryker disable next-line Regex
      telephone: z.string().regex(/^(\+[\d]{11,12}|[\d]{10})$/, { message: 'Le téléphone doit être au format 0102030405 ou +33102030405' }).optional().or(z.literal('')),
    })
}
