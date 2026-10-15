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
import { verifierDroitsCreationLieu } from './shared/verifierDroitsCreationLieu'
import { ApiBanGeocodingGateway } from '@/gateways/apiBan/ApiBanGeocodingGateway'
import { createApiEntrepriseLoader } from '@/gateways/factories/apiEntrepriseLoaderFactory'
import { PrismaLieuInclusionRepository } from '@/gateways/PrismaLieuInclusionRepository'
import { CreerUnLieuInclusion, Failure } from '@/use-cases/commands/CreerUnLieuInclusion'
import { RechercherUneEntreprise } from '@/use-cases/queries/RechercherUneEntreprise'

const MESSAGES_ECHEC: Readonly<Record<Failure, string>> = {
  adresseIntrouvable: 'Adresse introuvable — vérifiez la saisie',
}

// Création d'un lieu d'inclusion depuis MIN (#1495). Retour discriminé : l'identifiant
// créé sert à rediriger vers la fiche.
export async function creerUnLieuInclusionAction(actionParams: ActionParams): Promise<ResultatCreationLieu> {
  return avecJournalisationMin(async () => {
    const validationResult = validator.safeParse(actionParams)
    if (validationResult.error) {
      return erreur(validationResult.error.issues.map(({ message }) => message))
    }

    try {
      const droits = await verifierDroitsCreationLieu()
      if (droits.statut === 'refus') {
        return erreur([droits.message])
      }

      const creation = await construireCreation(validationResult.data)
      if (typeof creation === 'string') {
        return erreur([creation])
      }

      const result = await new CreerUnLieuInclusion(
        new ApiBanGeocodingGateway(),
        new PrismaLieuInclusionRepository(),
        new Date()
      ).handle({ creation, visiblePourCartographie: validationResult.data.visiblePourCartographie })

      if (typeof result === 'string') {
        return erreur([MESSAGES_ECHEC[result]])
      }

      revalidatePath('/liste-lieux-inclusion')

      return {
        lieuId: String(result.lieuId),
        statut: 'cree',
        visibilitePourCartographieForcee: result.visibilitePourCartographieForcee,
      }
    } catch (error) {
      return erreur([error instanceof Error ? error.message : 'Une erreur est survenue lors de la création'])
    }
  })
}

export type ResultatCreationLieu =
  | Readonly<{ lieuId: string; statut: 'cree'; visibilitePourCartographieForcee: boolean }>
  | Readonly<{ messages: ReadonlyArray<string>; statut: 'erreur' }>

// Maquettes V6 : tous les champs sont saisis par l'utilisateur, le SIRET n'étant qu'un
// accélérateur de remplissage. Il reste revérifié ici côté serveur — on ne stocke pas un
// identifiant que l'API Entreprise ne reconnaît pas — et son adresse est conservée pour
// servir de repli au géocodage si l'utilisateur l'a soumise sans la retoucher.
async function construireCreation(params: ParamsValides): Promise<Creation | string> {
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

function erreur(messages: ReadonlyArray<string>): ResultatCreationLieu {
  return { messages, statut: 'erreur' }
}

type Creation = Parameters<CreerUnLieuInclusion['handle']>[0]['creation']

type ActionParams = Readonly<{
  adresse: string
  complementAdresse?: string
  itinerant?: boolean
  nom: string
  siret?: string
  typologies: ReadonlyArray<string>
  visiblePourCartographie: boolean
}>

const validator = z.object({
  adresse: z.string().min(1, { message: 'L’adresse du lieu doit être renseignée' }),
  complementAdresse: complementAdresseDuStandard,
  itinerant: z.boolean().optional(),
  nom: nomDuStandard,
  siret: siretDuStandard,
  typologies: typologiesDuStandard.pipe(
    z.array(z.string()).min(1, { message: 'Au moins une typologie doit être renseignée' })
  ),
  visiblePourCartographie: z.boolean(),
})

type ParamsValides = z.infer<typeof validator>
