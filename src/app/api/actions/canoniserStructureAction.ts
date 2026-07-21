'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { avecJournalisationMin } from './shared/journalisation'
import { ApiBanGeocodingGateway } from '@/gateways/apiBan/ApiBanGeocodingGateway'
import { ApiSireneLoader } from '@/gateways/apiEntreprise/ApiSireneLoader'
import { getSessionSub } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaMembreLoader } from '@/gateways/PrismaMembreLoader'
import { PrismaStructureCanonisationRepository } from '@/gateways/PrismaStructureCanonisationRepository'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { CanoniserFailure, CanoniserStructure } from '@/use-cases/commands/CanoniserStructure'
import { resoudreContexte } from '@/use-cases/queries/ResoudreContexte'

const MESSAGES_ECHEC: Readonly<Record<CanoniserFailure, string>> = {
  canoniqueExistante: 'Une structure canonique existe déjà pour ce SIRET : fusionnez-la plutôt',
  canonisationEchouee: 'La canonisation a échoué, aucune modification effectuée',
  entrepriseIntrouvable: 'Aucun établissement actif trouvé à l’INSEE pour ce SIRET',
  siretManquant: 'La structure n’a pas de SIRET : impossible d’interroger l’INSEE',
  structureDejaCanonique: 'Cette structure est déjà canonique',
  structureIntrouvable: 'Structure introuvable ou déjà supprimée',
}

export async function canoniserStructureAction(actionParams: ActionParams): Promise<ReadonlyArray<string>> {
  return avecJournalisationMin(async () => {
    const validationResult = validator.safeParse(actionParams)
    if (validationResult.error) {
      return validationResult.error.issues.map(({ message }) => message)
    }

    // Garde : opération réservée aux bêta-testeurs.
    const sub = await getSessionSub()
    const utilisateur = await new PrismaUtilisateurLoader().findByUid(sub)
    const contexte = await resoudreContexte(utilisateur, new PrismaMembreLoader())
    if (!contexte.aCesRoles('administrateur_dispositif') || !contexte.isBetaTesteur) {
      return ['Action réservée aux administrateurs autorisés']
    }

    const result = await new CanoniserStructure(
      new ApiSireneLoader(),
      new ApiBanGeocodingGateway(),
      new PrismaStructureCanonisationRepository()
    ).handle({ structureId: validationResult.data.structureId, uidUtilisateur: sub })

    if (result !== 'OK') {
      return [MESSAGES_ECHEC[result]]
    }

    revalidatePath(validationResult.data.path)

    return ['OK']
  })
}

type ActionParams = Readonly<{
  path: string
  structureId: number
}>

const validator = z.object({
  path: z.string().min(1, { message: 'Le chemin doit être renseigné' }),
  structureId: z.number().int().positive({ message: "L'identifiant de la structure doit être un entier positif" }),
})
