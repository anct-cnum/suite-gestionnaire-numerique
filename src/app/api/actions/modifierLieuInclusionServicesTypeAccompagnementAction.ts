'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { avecJournalisationMin } from './shared/journalisation'
import { verifierDroitsLieu } from './shared/verifierDroitsLieu'
import { PrismaLieuInclusionRepository } from '@/gateways/PrismaLieuInclusionRepository'
import { ResultAsync } from '@/use-cases/CommandHandler'
import { ModifierLieuInclusionServicesTypeAccompagnement } from '@/use-cases/commands/ModifierLieuInclusionServicesTypeAccompagnement'

export async function modifierLieuInclusionServicesTypeAccompagnementAction(
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
    const result = await new ModifierLieuInclusionServicesTypeAccompagnement(
      new PrismaLieuInclusionRepository(),
      new Date()
    ).handle({
      modalites: actionParams.modalites,
      structureId: actionParams.structureId,
      thematiques: actionParams.thematiques,
      typesAccompagnement: actionParams.typesAccompagnement,
    })

    // Invalider le cache de la page
    revalidatePath(validationResult.data.path)

    return [result]
  })
}

type ActionParams = Readonly<{
  modalites: ReadonlyArray<string>
  path: string
  structureId: string
  thematiques: ReadonlyArray<string>
  typesAccompagnement: ReadonlyArray<string>
}>

const validator = z.object({
  modalites: z.array(z.string()),
  path: z.string().min(1, { message: 'Le chemin doit être renseigné' }),
  structureId: z.string().min(1, { message: "L'identifiant de la structure doit être renseigné" }),
  thematiques: z.array(z.string()),
  typesAccompagnement: z.array(z.string()),
})
