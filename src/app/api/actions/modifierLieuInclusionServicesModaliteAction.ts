'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { avecJournalisationMin } from './shared/journalisation'
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

    // Vérification des droits (session, [bêta], lieu, lieu coop refusé, rôle)
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
      email: actionParams.email,
      fraisACharge: actionParams.fraisACharge,
      modalitesAcces: actionParams.modalitesAcces,
      structureId: actionParams.structureId,
      telephone: actionParams.telephone,
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
  email: z.string().optional(),
  fraisACharge: z.array(z.string()),
  modalitesAcces: z.array(z.string()),
  path: z.string().min(1, { message: 'Le chemin doit être renseigné' }),
  structureId: z.string().min(1, { message: "L'identifiant de la structure doit être renseigné" }),
  telephone: z.string().optional(),
})
