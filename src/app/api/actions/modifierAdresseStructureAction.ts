'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import prisma from '../../../../prisma/prismaClient'
import { Administrateur } from '@/domain/Administrateur'
import { ApiBanGeocodingGateway } from '@/gateways/apiBan/ApiBanGeocodingGateway'
import { getSessionSub } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaStructureRepository } from '@/gateways/PrismaStructureRepository'
import { PrismaUtilisateurRepository } from '@/gateways/PrismaUtilisateurRepository'
import { Failure, ModifierAdresseStructure } from '@/use-cases/commands/ModifierAdresseStructure'

const MESSAGES_ECHEC: Readonly<Record<Failure, string>> = {
  adresseIntrouvable: 'Adresse introuvable — vérifiez la saisie',
  structureCanoniqueNonModifiable: 'Cette structure utilise le nom officiel (SIRENE) et ne peut pas être modifiée',
  structureIntrouvable: 'Structure introuvable',
}

export async function modifierAdresseStructureAction(actionParams: ActionParams): Promise<ReadonlyArray<string>> {
  const validationResult = validator.safeParse(actionParams)
  if (validationResult.error) {
    return validationResult.error.issues.map(({ message }) => message)
  }

  // Garde : édition réservée aux bêta-testeurs (administrateur dispositif + flag is_beta_testeur).
  const utilisateur = await new PrismaUtilisateurRepository(prisma.utilisateurRecord).get(await getSessionSub())
  if (!(utilisateur instanceof Administrateur) || !utilisateur.isBetaTesteur) {
    return ['Action réservée aux administrateurs autorisés']
  }

  const result = await new ModifierAdresseStructure(
    new ApiBanGeocodingGateway(),
    new PrismaStructureRepository()
  ).handle({
    adresse: validationResult.data.adresse,
    structureId: validationResult.data.structureId,
  })

  if (result !== 'OK') {
    return [MESSAGES_ECHEC[result]]
  }

  revalidatePath(validationResult.data.path)

  return ['OK']
}

type ActionParams = Readonly<{
  adresse: string
  path: string
  structureId: number
}>

const validator = z.object({
  adresse: z.string().min(1, { message: 'L’adresse doit être renseignée' }),
  path: z.string().min(1, { message: 'Le chemin doit être renseigné' }),
  structureId: z.number().int().positive({ message: "L'identifiant de la structure doit être un entier positif" }),
})
