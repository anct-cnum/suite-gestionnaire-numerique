'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { emailConfirmationLabellisationGatewayFactory } from './shared/emailConfirmationLabellisationGatewayFactory'
import { avecJournalisationMin } from './shared/journalisation'
import { getSessionUtilisateurId } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaMembreLoader } from '@/gateways/PrismaMembreLoader'
import { PrismaStructureLabellisationRepository } from '@/gateways/PrismaStructureLabellisationRepository'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { PrismaEligibiliteLabelConumLoader } from '@/gateways/tableauDeBord/PrismaEligibiliteLabelConumLoader'
import { AttesterLabellisationStructure, Failure } from '@/use-cases/commands/AttesterLabellisationStructure'
import { resoudreContexte } from '@/use-cases/queries/ResoudreContexte'

const MESSAGES_ECHEC: Readonly<Record<Failure, string>> = {
  dejaLabellisee: 'Votre structure est déjà labellisée conseiller numérique',
}

export async function attesterLabellisationAction(actionParams: ActionParams): Promise<ReadonlyArray<string>> {
  return avecJournalisationMin(async () => {
    const validationResult = validator.safeParse(actionParams)
    if (validationResult.error) {
      return validationResult.error.issues.map(({ message }) => message)
    }
    const { path, structureId } = validationResult.data

    // Gardes : parcours réservé au gestionnaire bêta-testeur de sa propre structure éligible.
    const utilisateurId = await getSessionUtilisateurId()
    const utilisateur = await new PrismaUtilisateurLoader().findById(utilisateurId)
    const contexte = await resoudreContexte(utilisateur, new PrismaMembreLoader())
    if (!contexte.aCesRoles('gestionnaire_structure') || !contexte.isBetaTesteur) {
      return ['Action réservée aux gestionnaires autorisés']
    }
    if (contexte.idStructure() !== structureId) {
      return ['Vous ne pouvez labelliser que votre structure']
    }
    const estEligible = await new PrismaEligibiliteLabelConumLoader().estEligible(structureId)
    if (!estEligible) {
      return ['Votre structure n’est pas éligible au label conseiller numérique']
    }

    const result = await new AttesterLabellisationStructure(
      new PrismaStructureLabellisationRepository(),
      emailConfirmationLabellisationGatewayFactory(),
      new Date()
    ).handle({
      structureId,
      utilisateurId,
    })
    if (result !== 'OK') {
      return [MESSAGES_ECHEC[result]]
    }

    revalidatePath(path)

    return ['OK']
  })
}

type ActionParams = Readonly<{
  path: string
  structureId: number
}>

const validator = z.object({
  path: z.string().min(1, { message: 'Le chemin doit être renseigné' }),
  structureId: z.number().int().positive({ message: "L'identifiant de la structure doit être un entier positif" }),
})
