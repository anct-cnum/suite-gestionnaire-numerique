'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { avecJournalisationMin } from './shared/journalisation'
import { ApiBanGeocodingGateway } from '@/gateways/apiBan/ApiBanGeocodingGateway'
import { getSessionSub } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaMembreLoader } from '@/gateways/PrismaMembreLoader'
import { PrismaStructureRepository } from '@/gateways/PrismaStructureRepository'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { Failure, ModifierAdresseStructure } from '@/use-cases/commands/ModifierAdresseStructure'
import { resoudreContexte } from '@/use-cases/queries/ResoudreContexte'

const MESSAGES_ECHEC: Readonly<Record<Failure, string>> = {
  adresseIntrouvable: 'Adresse introuvable — vérifiez la saisie',
  structureCanoniqueNonModifiable: 'Cette structure utilise le nom officiel (SIRENE) et ne peut pas être modifiée',
  structureIntrouvable: 'Structure introuvable',
}

export async function modifierAdresseStructureAction(actionParams: ActionParams): Promise<ReadonlyArray<string>> {
  return avecJournalisationMin(async () => {
    const validationResult = validator.safeParse(actionParams)
    if (validationResult.error) {
      return validationResult.error.issues.map(({ message }) => message)
    }

    // Garde : édition réservée aux bêta-testeurs.
    const sub = await getSessionSub()
    const utilisateur = await new PrismaUtilisateurLoader().findByUid(sub)
    const contexte = await resoudreContexte(utilisateur, new PrismaMembreLoader())
    if (!contexte.aCesRoles('administrateur_dispositif') || !contexte.isBetaTesteur) {
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
  })
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
