'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { avecJournalisationMin } from './shared/journalisation'
import { verifierDroitsLieu } from './shared/verifierDroitsLieu'
import { PrismaLieuInclusionRepository } from '@/gateways/PrismaLieuInclusionRepository'
import { ResultAsync } from '@/use-cases/CommandHandler'
import { ModifierLieuInclusionDescription } from '@/use-cases/commands/ModifierLieuInclusionDescription'

export async function modifierLieuInclusionInformationsPratiquesAction(
  actionParams: ActionParams
): ResultAsync<ReadonlyArray<string>> {
  return avecJournalisationMin(async () => {
    // Validation des paramètres
    const validationResult = validator.safeParse(actionParams)
    if (validationResult.error) {
      return validationResult.error.issues.map(({ message }) => message)
    }

    try {
      // Vérification des droits (session, [bêta], lieu, lieu coop refusé, rôle)
      const droits = await verifierDroitsLieu(actionParams.structureId, {
        action: 'modifier',
        reserveAuxBetaTesteurs: false,
      })
      if (droits.statut === 'refus') {
        return [droits.message]
      }

      // Appel du Use Case
      const result = await new ModifierLieuInclusionDescription(new PrismaLieuInclusionRepository(), new Date()).handle(
        {
          horaires: actionParams.horaires,
          itinerance: actionParams.itinerance,
          priseRdvUrl: actionParams.priseRdvUrl,
          structureId: actionParams.structureId,
          websiteUrl: actionParams.websiteUrl,
        }
      )

      // Invalider le cache de la page
      revalidatePath(validationResult.data.path)

      return [result]
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue lors de la modification'
      return [errorMessage]
    }
  })
}

type ActionParams = Readonly<{
  horaires?: string
  itinerance?: string
  path: string
  priseRdvUrl?: string
  structureId: string
  websiteUrl?: string
}>

const validator = z.object({
  horaires: z.string().optional(),
  itinerance: z.string().optional(),
  path: z.string().min(1, { message: 'Le chemin doit être renseigné' }),
  priseRdvUrl: z.string().optional(),
  structureId: z.string().min(1, { message: "L'identifiant de la structure doit être renseigné" }),
  websiteUrl: z.string().optional(),
})
