'use server'

import { z } from 'zod'

import { verifierDroitsCreationLieu } from './shared/verifierDroitsCreationLieu'
import { ApiBanGeocodingGateway } from '@/gateways/apiBan/ApiBanGeocodingGateway'
import { PrismaLieuxInclusionSimilairesLoader } from '@/gateways/PrismaLieuxInclusionSimilairesLoader'
import {
  LieuInclusionSimilaireViewModel,
  lieuxInclusionSimilairesPresenter,
} from '@/presenters/lieuxInclusionSimilairesPresenter'
import { RechercherLieuxInclusionSimilaires } from '@/use-cases/queries/RechercherLieuxInclusionSimilaires'

// Lecture seule : pendant la création d'un lieu (#1495), propose les lieux déjà
// déclarés à l'adresse saisie pour un contrôle humain. Aucune écriture, aucun blocage.
export async function rechercherLieuxInclusionSimilairesAction(
  actionParams: ActionParams
): Promise<ReadonlyArray<LieuInclusionSimilaireViewModel>> {
  const validationResult = validator.safeParse(actionParams)
  if (validationResult.error) {
    return []
  }
  const { adresse } = validationResult.data
  if (adresse === '') {
    return []
  }

  const droits = await verifierDroitsCreationLieu()
  if (droits.statut === 'refus') {
    return []
  }

  const lieux = await new RechercherLieuxInclusionSimilaires(
    new ApiBanGeocodingGateway(),
    new PrismaLieuxInclusionSimilairesLoader()
  ).handle({ adresse })

  return lieuxInclusionSimilairesPresenter(lieux)
}

type ActionParams = Readonly<{
  adresse: string
}>

const validator = z.object({
  adresse: z.string(),
})
