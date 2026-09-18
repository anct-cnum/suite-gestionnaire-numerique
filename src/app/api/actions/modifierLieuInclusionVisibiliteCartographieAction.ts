'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { avecJournalisationMin } from './shared/journalisation'
import { verifierDroitsLieu } from './shared/verifierDroitsLieu'
import { PrismaLieuInclusionRepository } from '@/gateways/PrismaLieuInclusionRepository'
import { ResultAsync } from '@/use-cases/CommandHandler'
import { ModifierLieuInclusionVisibiliteCartographie } from '@/use-cases/commands/ModifierLieuInclusionVisibiliteCartographie'

export async function modifierLieuInclusionVisibiliteCartographieAction(
  actionParams: ActionParams
): ResultAsync<ReadonlyArray<string>> {
  return avecJournalisationMin(async () => {
    // Validation des paramètres
    const validationResult = validator.safeParse(actionParams)
    if (validationResult.error) {
      return validationResult.error.issues.map(({ message }) => message)
    }

    // Vérification des droits (session, [bêta], lieu, lieu coop refusé, rôle)
    const droits = await verifierDroitsLieu(actionParams.lieuId, { action: 'modifier', reserveAuxBetaTesteurs: true })
    if (droits.statut === 'refus') {
      return [droits.message]
    }

    // Appel du Use Case
    const result = await new ModifierLieuInclusionVisibiliteCartographie(
      new PrismaLieuInclusionRepository(),
      new Date()
    ).handle({
      lieuId: actionParams.lieuId,
      visiblePourCartographie: actionParams.visiblePourCartographie,
    })

    // Invalider le cache de la page
    revalidatePath(validationResult.data.path)

    return [result]
  })
}

type ActionParams = Readonly<{
  lieuId: string
  path: string
  visiblePourCartographie: boolean
}>

const validator = z.object({
  lieuId: z.string().min(1, { message: "L'identifiant du lieu doit être renseigné" }),
  path: z.string().min(1, { message: 'Le chemin doit être renseigné' }),
  visiblePourCartographie: z.boolean(),
})
