'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { avecJournalisationMin } from './shared/journalisation'
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

      return { lieuId: String(result.lieuId), statut: 'cree' }
    } catch (error) {
      return erreur([error instanceof Error ? error.message : 'Une erreur est survenue lors de la création'])
    }
  })
}

export type ResultatCreationLieu =
  Readonly<{ lieuId: string; statut: 'cree' }> | Readonly<{ messages: ReadonlyArray<string>; statut: 'erreur' }>

// Règle de gestion #1498 : avec SIRET, les données proviennent de l'API Entreprise —
// re-résolues ici côté serveur, jamais reprises du client — à l'exception des typologies,
// saisies par l'utilisateur depuis le référentiel de la médiation numérique.
async function construireCreation(params: ParamsValides): Promise<Creation | string> {
  if (params.siret !== undefined && params.siret !== '') {
    if (params.typologies === undefined || params.typologies.length === 0) {
      return 'Au moins une typologie doit être renseignée'
    }

    const entreprise = await new RechercherUneEntreprise(createApiEntrepriseLoader(params.siret)).handle({
      siret: params.siret,
    })

    if ('estTrouvee' in entreprise) {
      return 'Aucune entreprise trouvée avec cet identifiant'
    }

    return {
      avecSiret: {
        entreprise: {
          adresse: entreprise.adresse,
          codeInsee: entreprise.codeInsee,
          codePostal: entreprise.codePostal,
          commune: entreprise.commune,
          denomination: entreprise.denomination,
          nomVoie: entreprise.nomVoie,
          numeroVoie: entreprise.numeroVoie,
        },
        siret: params.siret,
        typologies: params.typologies,
      },
    }
  }

  if (
    params.adresse === undefined ||
    params.nom === undefined ||
    params.typologies === undefined ||
    params.typologies.length === 0
  ) {
    return 'Sans SIRET, le nom, l’adresse et au moins une typologie doivent être renseignés'
  }

  return {
    sansSiret: {
      adresse: params.adresse,
      complementAdresse: params.complementAdresse ?? '',
      itinerant: params.itinerant ?? false,
      nom: params.nom,
      typologies: params.typologies,
    },
  }
}

function erreur(messages: ReadonlyArray<string>): ResultatCreationLieu {
  return { messages, statut: 'erreur' }
}

type Creation = Parameters<CreerUnLieuInclusion['handle']>[0]['creation']

type ActionParams = Readonly<{
  adresse?: string
  complementAdresse?: string
  itinerant?: boolean
  nom?: string
  siret?: string
  typologies?: ReadonlyArray<string>
  visiblePourCartographie: boolean
}>

const validator = z.object({
  adresse: z.string().optional(),
  complementAdresse: z.string().optional(),
  itinerant: z.boolean().optional(),
  nom: z.string().optional(),
  siret: z
    .string()
    .regex(/^\d{6,7}$|^\d{14}$/, { message: 'Format invalide : saisissez 6-7 chiffres (RIDET) ou 14 chiffres (SIRET)' })
    .optional(),
  typologies: z.array(z.string()).optional(),
  visiblePourCartographie: z.boolean(),
})

type ParamsValides = z.infer<typeof validator>
