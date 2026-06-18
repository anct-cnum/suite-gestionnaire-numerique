'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import prisma from '../../../../prisma/prismaClient'
import { Administrateur } from '@/domain/Administrateur'
import { getSessionSub } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaStructureRepository } from '@/gateways/PrismaStructureRepository'
import { PrismaUtilisateurRepository } from '@/gateways/PrismaUtilisateurRepository'
import { ModifierNomStructure } from '@/use-cases/commands/ModifierNomStructure'

export async function modifierNomStructureAction(actionParams: ActionParams): Promise<ReadonlyArray<string>> {
  const validationResult = validator.safeParse(actionParams)
  if (validationResult.error) {
    return validationResult.error.issues.map(({ message }) => message)
  }

  // Garde : édition réservée aux bêta-testeurs (administrateur dispositif + flag is_beta_testeur).
  const utilisateur = await new PrismaUtilisateurRepository(prisma.utilisateurRecord).get(await getSessionSub())
  if (!(utilisateur instanceof Administrateur) || !utilisateur.isBetaTesteur) {
    return ['Action réservée aux administrateurs autorisés']
  }

  await new ModifierNomStructure(new PrismaStructureRepository()).handle({
    nomAffichage: validationResult.data.nomAffichage,
    structureId: validationResult.data.structureId,
  })

  revalidatePath(validationResult.data.path)

  return ['OK']
}

type ActionParams = Readonly<{
  nomAffichage: string
  path: string
  structureId: number
}>

const validator = z.object({
  nomAffichage: z.string().max(255, { message: 'Le nom ne doit pas dépasser 255 caractères' }),
  path: z.string().min(1, { message: 'Le chemin doit être renseigné' }),
  structureId: z.number().int().positive({ message: "L'identifiant de la structure doit être un entier positif" }),
})
