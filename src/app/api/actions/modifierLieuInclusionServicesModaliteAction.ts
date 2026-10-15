'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { avecJournalisationMin } from './shared/journalisation'
import { courrielDuStandard, telephoneDuStandard } from './shared/reglesDuStandardLieu'
import { verifierDroitsLieu } from './shared/verifierDroitsLieu'
import { PrismaLieuInclusionRepository } from '@/gateways/PrismaLieuInclusionRepository'
import { ResultAsync } from '@/use-cases/CommandHandler'
import { ModifierLieuInclusionServicesModalite } from '@/use-cases/commands/ModifierLieuInclusionServicesModalite'

export async function modifierLieuInclusionServicesModaliteAction(
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
    const result = await new ModifierLieuInclusionServicesModalite(
      new PrismaLieuInclusionRepository(),
      new Date()
    ).handle({
      email: validationResult.data.email,
      fraisACharge: validationResult.data.fraisACharge,
      modalitesAcces: validationResult.data.modalitesAcces,
      structureId: validationResult.data.structureId,
      telephone: validationResult.data.telephone,
    })

    // Invalider le cache de la page
    revalidatePath(validationResult.data.path)

    return [result]
  })
}

type ActionParams = Readonly<{
  email?: string
  fraisACharge: ReadonlyArray<string>
  modalitesAcces: ReadonlyArray<string>
  path: string
  structureId: string
  telephone?: string
}>

const validator = z.object({
  email: courrielDuStandard,
  fraisACharge: z.array(z.string()),
  modalitesAcces: z.array(z.string()),
  path: z.string().min(1, { message: 'Le chemin doit être renseigné' }),
  structureId: z.string().min(1, { message: "L'identifiant de la structure doit être renseigné" }),
  telephone: telephoneDuStandard,
})
