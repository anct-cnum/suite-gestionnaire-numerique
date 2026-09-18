'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { avecJournalisationMin } from './shared/journalisation'
import { verifierDroitsLieu } from './shared/verifierDroitsLieu'
import { PrismaLieuInclusionRepository } from '@/gateways/PrismaLieuInclusionRepository'
import { ResultAsync } from '@/use-cases/CommandHandler'
import { SupprimerUnLieuInclusion } from '@/use-cases/commands/SupprimerUnLieuInclusion'

export async function supprimerUnLieuInclusionAction(actionParams: ActionParams): ResultAsync<ReadonlyArray<string>> {
  return avecJournalisationMin(async () => {
    const validationResult = validator.safeParse(actionParams)
    if (validationResult.error) {
      return validationResult.error.issues.map(({ message }) => message)
    }

    // Vérification des droits (session, [bêta], lieu, lieu coop refusé, rôle)
    const droits = await verifierDroitsLieu(validationResult.data.lieuId, {
      action: 'supprimer',
      reserveAuxBetaTesteurs: true,
    })
    if (droits.statut === 'refus') {
      return [droits.message]
    }

    const result = await new SupprimerUnLieuInclusion(new PrismaLieuInclusionRepository(), new Date()).handle({
      lieuId: validationResult.data.lieuId,
    })

    revalidatePath(validationResult.data.path)

    return [result]
  })
}

type ActionParams = Readonly<{
  lieuId: string
  path: string
}>

const validator = z.object({
  lieuId: z.string().min(1, { message: "L'identifiant du lieu doit être renseigné" }),
  path: z.string().min(1, { message: 'Le chemin doit être renseigné' }),
})
