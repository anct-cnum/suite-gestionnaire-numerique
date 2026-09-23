'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { avecJournalisationMin } from './shared/journalisation'
import { MESSAGE_CONTACT_HORS_STRUCTURE, verifierDroitsStructure } from './shared/verifierDroitsStructure'
import { PrismaStructureRepository } from '@/gateways/PrismaStructureRepository'

export async function supprimerContactStructureAction(actionParams: ActionParams): Promise<ReadonlyArray<string>> {
  return avecJournalisationMin(async () => {
    const validationResult = validator.safeParse(actionParams)

    if (validationResult.error) {
      return validationResult.error.issues.map(({ message }) => message)
    }

    const verification = await verifierDroitsStructure(actionParams.structureId)
    if (verification.statut === 'refus') {
      return [verification.message]
    }

    const estSupprime = await new PrismaStructureRepository().supprimerContact(
      actionParams.structureId,
      actionParams.contactId
    )
    if (!estSupprime) {
      return [MESSAGE_CONTACT_HORS_STRUCTURE]
    }

    revalidatePath(actionParams.path)

    return ['OK']
  })
}

type ActionParams = Readonly<{
  contactId: number
  path: string
  structureId: number
}>

const validator = z.object({
  contactId: z.number().int().positive({ message: "L'identifiant du contact doit être un entier positif" }),
  path: z.string().min(1, { message: 'Le chemin doit être renseigné' }),
  structureId: z.number().int().positive({ message: "L'identifiant de la structure doit être un entier positif" }),
})
