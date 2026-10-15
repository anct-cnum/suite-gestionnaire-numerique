'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { avecJournalisationMin } from './shared/journalisation'
import {
  complementAdresseDuStandard,
  nomDuStandard,
  siretDuStandard,
  typologiesDuStandard,
} from './shared/reglesDuStandardLieu'
import { verifierDroitsLieu } from './shared/verifierDroitsLieu'
import { ApiBanGeocodingGateway } from '@/gateways/apiBan/ApiBanGeocodingGateway'
import { createApiEntrepriseLoader } from '@/gateways/factories/apiEntrepriseLoaderFactory'
import { PrismaLieuInclusionRepository } from '@/gateways/PrismaLieuInclusionRepository'
import { ResultAsync } from '@/use-cases/CommandHandler'
import {
  Failure,
  ModifierLieuInclusionInformationsGenerales,
} from '@/use-cases/commands/ModifierLieuInclusionInformationsGenerales'
import { RechercherUneEntreprise } from '@/use-cases/queries/RechercherUneEntreprise'

const MESSAGES_ECHEC: Readonly<Record<Failure, string>> = {
  adresseIntrouvable: 'Adresse introuvable — vérifiez la saisie',
}

export async function modifierLieuInclusionInformationsGeneralesAction(
  actionParams: ActionParams
): ResultAsync<ReadonlyArray<string>> {
  return avecJournalisationMin(async () => {
    const validationResult = validator.safeParse(actionParams)
    if (validationResult.error) {
      return validationResult.error.issues.map(({ message }) => message)
    }

    try {
      // Vérification des droits (session, [bêta], lieu, lieu coop refusé, rôle)
      const droits = await verifierDroitsLieu(validationResult.data.structureId, {
        action: 'modifier',
        reserveAuxBetaTesteurs: true,
      })
      if (droits.statut === 'refus') {
        return [droits.message]
      }

      const modification = await construireModification(validationResult.data)
      if (typeof modification === 'string') {
        return [modification]
      }

      const result = await new ModifierLieuInclusionInformationsGenerales(
        new ApiBanGeocodingGateway(),
        new PrismaLieuInclusionRepository(),
        new Date()
      ).handle({
        modification,
        structureId: validationResult.data.structureId,
      })

      if (result !== 'OK') {
        return [MESSAGES_ECHEC[result]]
      }

      revalidatePath(validationResult.data.path)

      return ['OK']
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue lors de la modification'
      return [errorMessage]
    }
  })
}

// Maquettes V6 : tous les champs sont saisis par l'utilisateur, le SIRET n'étant qu'un
// accélérateur de remplissage. Il reste revérifié ici côté serveur — on ne stocke pas un
// identifiant que l'API Entreprise ne reconnaît pas — et son adresse est conservée pour
// servir de repli au géocodage si l'utilisateur l'a soumise sans la retoucher.
async function construireModification(params: ParamsValides): Promise<Modification | string> {
  const commun = {
    adresse: params.adresse,
    complementAdresse: params.complementAdresse ?? '',
    itinerant: params.itinerant ?? false,
    nom: params.nom,
    typologies: params.typologies,
  }

  if (params.siret === undefined || params.siret === '') {
    return { ...commun, repliSirene: null, siret: null }
  }

  const entreprise = await new RechercherUneEntreprise(createApiEntrepriseLoader(params.siret)).handle({
    siret: params.siret,
  })

  if ('estTrouvee' in entreprise) {
    return 'Aucune entreprise trouvée avec cet identifiant'
  }

  return {
    ...commun,
    repliSirene: {
      adresse: entreprise.adresse,
      codeInsee: entreprise.codeInsee,
      codePostal: entreprise.codePostal,
      commune: entreprise.commune,
      nomVoie: entreprise.nomVoie,
      numeroVoie: entreprise.numeroVoie,
    },
    siret: params.siret,
  }
}

type Modification = Parameters<ModifierLieuInclusionInformationsGenerales['handle']>[0]['modification']

type ActionParams = Readonly<{
  adresse: string
  complementAdresse?: string
  itinerant?: boolean
  nom: string
  path: string
  siret?: string
  structureId: string
  typologies: ReadonlyArray<string>
}>

const validator = z.object({
  adresse: z.string().min(1, { message: 'L’adresse du lieu doit être renseignée' }),
  complementAdresse: complementAdresseDuStandard,
  itinerant: z.boolean().optional(),
  nom: nomDuStandard,
  path: z.string().min(1, { message: 'Le chemin doit être renseigné' }),
  siret: siretDuStandard,
  structureId: z.string().min(1, { message: "L'identifiant de la structure doit être renseigné" }),
  typologies: typologiesDuStandard.pipe(
    z.array(z.string()).min(1, { message: 'Au moins une typologie doit être renseignée' })
  ),
})

type ParamsValides = z.infer<typeof validator>
