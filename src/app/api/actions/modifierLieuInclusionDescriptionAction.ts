'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { avecJournalisationMin } from './shared/journalisation'
import {
  horairesDuStandard,
  presentationDetailDuStandard,
  presentationResumeDuStandard,
  sitesWebDuStandard,
  typologiesDuStandard,
  urlDuStandard,
} from './shared/reglesDuStandardLieu'
import { verifierDroitsLieu } from './shared/verifierDroitsLieu'
import { PrismaLieuInclusionRepository } from '@/gateways/PrismaLieuInclusionRepository'
import { ResultAsync } from '@/use-cases/CommandHandler'
import { ModifierLieuInclusionDescription } from '@/use-cases/commands/ModifierLieuInclusionDescription'

export async function modifierLieuInclusionDescriptionAction(
  actionParams: ActionParams
): ResultAsync<ReadonlyArray<string>> {
  return avecJournalisationMin(async () => {
    // Validation des paramètres
    const validationResult = validator.safeParse(actionParams)
    if (validationResult.error) {
      return validationResult.error.issues.map(({ message }) => message)
    }

    // Vérification des droits (session, [bêta], lieu, rôle)
    const droits = await verifierDroitsLieu(actionParams.structureId, {
      action: 'modifier',
      reserveAuxBetaTesteurs: false,
    })
    if (droits.statut === 'refus') {
      return [droits.message]
    }

    // Appel du Use Case
    const result = await new ModifierLieuInclusionDescription(new PrismaLieuInclusionRepository(), new Date()).handle({
      horaires: validationResult.data.horaires,
      itinerance: validationResult.data.itinerance,
      presentationDetail: validationResult.data.presentationDetail,
      presentationResume: validationResult.data.presentationResume,
      priseRdvUrl: validationResult.data.priseRdvUrl,
      structureId: validationResult.data.structureId,
      typologie: validationResult.data.typologie,
      websiteUrl: validationResult.data.websiteUrl,
    })

    // Invalider le cache de la page
    revalidatePath(validationResult.data.path)

    return [result]
  })
}

type ActionParams = Readonly<{
  horaires?: string
  itinerance?: string
  path: string
  presentationDetail?: string
  presentationResume?: string
  priseRdvUrl?: string
  structureId: string
  typologie?: string
  websiteUrl?: string
}>

const validator = z.object({
  horaires: horairesDuStandard,
  itinerance: z.string().optional(),
  path: z.string().min(1, { message: 'Le chemin doit être renseigné' }),
  presentationDetail: presentationDetailDuStandard,
  presentationResume: presentationResumeDuStandard,
  priseRdvUrl: urlDuStandard,
  structureId: z.string().min(1, { message: "L'identifiant de la structure doit être renseigné" }),
  typologie: z
    .string()
    .optional()
    .superRefine((typologie, contexte) => {
      const verification = typologiesDuStandard.safeParse(
        typologie === undefined || typologie === '' ? [] : [typologie]
      )
      verification.error?.issues.forEach((issue) => {
        contexte.addIssue({ code: z.ZodIssueCode.custom, message: issue.message })
      })
    }),
  websiteUrl: sitesWebDuStandard,
})
