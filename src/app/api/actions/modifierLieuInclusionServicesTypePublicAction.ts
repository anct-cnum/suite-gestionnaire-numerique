'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { avecJournalisationMin } from './shared/journalisation'
import { verifierDroitsLieu } from './shared/verifierDroitsLieu'
import { PrismaLieuInclusionRepository } from '@/gateways/PrismaLieuInclusionRepository'
import { ResultAsync } from '@/use-cases/CommandHandler'
import { ModifierLieuInclusionServicesTypePublic } from '@/use-cases/commands/ModifierLieuInclusionServicesTypePublic'

export async function modifierLieuInclusionServicesTypePublicAction(
  actionParams: ActionParams
): ResultAsync<ReadonlyArray<string>> {
  return avecJournalisationMin(async () => {
    // Validation des paramètres
    const validationResult = validator.safeParse(actionParams)
    if (validationResult.error) {
      return validationResult.error.issues.map(({ message }) => message)
    }

    // Vérification des droits (session, [bêta], lieu, lieu coop refusé, rôle)
    const droits = await verifierDroitsLieu(actionParams.structureId, {
      action: 'modifier',
      reserveAuxBetaTesteurs: false,
    })
    if (droits.statut === 'refus') {
      return [droits.message]
    }

    // Appel du Use Case
    const result = await new ModifierLieuInclusionServicesTypePublic(
      new PrismaLieuInclusionRepository(),
      new Date()
    ).handle({
      priseEnChargeSpecifique: actionParams.priseEnChargeSpecifique,
      publicsSpecifiquementAdresses: actionParams.publicsSpecifiquementAdresses,
      structureId: actionParams.structureId,
    })

    // Invalider le cache de la page
    revalidatePath(validationResult.data.path)

    return [result]
  })
}

type ActionParams = Readonly<{
  path: string
  priseEnChargeSpecifique: ReadonlyArray<string>
  publicsSpecifiquementAdresses: ReadonlyArray<string>
  structureId: string
}>

const validator = z.object({
  path: z.string().min(1, { message: 'Le chemin doit être renseigné' }),
  priseEnChargeSpecifique: z.array(z.string()),
  publicsSpecifiquementAdresses: z.array(z.string()),
  structureId: z.string().min(1, { message: "L'identifiant de la structure doit être renseigné" }),
})
