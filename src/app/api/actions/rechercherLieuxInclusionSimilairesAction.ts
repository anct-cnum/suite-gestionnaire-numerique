'use server'

import { z } from 'zod'

import { verifierDroitsCreationLieu } from './shared/verifierDroitsCreationLieu'
import { verifierDroitsLieu } from './shared/verifierDroitsLieu'
import { ApiBanGeocodingGateway } from '@/gateways/apiBan/ApiBanGeocodingGateway'
import { PrismaLieuxInclusionSimilairesLoader } from '@/gateways/PrismaLieuxInclusionSimilairesLoader'
import {
  LieuInclusionSimilaireViewModel,
  lieuxInclusionSimilairesPresenter,
} from '@/presenters/lieuxInclusionSimilairesPresenter'
import { RechercherLieuxInclusionSimilaires } from '@/use-cases/queries/RechercherLieuxInclusionSimilaires'

// Lecture seule : pendant la création (#1495) ou la modification d'un lieu, propose les
// lieux déjà déclarés à l'adresse saisie pour un contrôle humain. Aucune écriture, aucun blocage.
export async function rechercherLieuxInclusionSimilairesAction(
  actionParams: ActionParams
): Promise<ReadonlyArray<LieuInclusionSimilaireViewModel>> {
  const validationResult = validator.safeParse(actionParams)
  if (validationResult.error) {
    return []
  }
  const { adresse, idLieuEnModification } = validationResult.data
  if (adresse === '') {
    return []
  }

  const droits =
    idLieuEnModification === undefined
      ? await verifierDroitsCreationLieu()
      : await verifierDroitsLieu(idLieuEnModification, { action: 'modifier', reserveAuxBetaTesteurs: true })
  if (droits.statut === 'refus') {
    return []
  }

  const lieux = await new RechercherLieuxInclusionSimilaires(
    new ApiBanGeocodingGateway(),
    new PrismaLieuxInclusionSimilairesLoader()
  ).handle({ adresse, idLieuEnModification })

  return lieuxInclusionSimilairesPresenter(lieux, idLieuEnModification !== undefined)
}

type ActionParams = Readonly<{
  adresse: string
  idLieuEnModification?: string
}>

const validator = z.object({
  adresse: z.string(),
  idLieuEnModification: z.string().optional(),
})
