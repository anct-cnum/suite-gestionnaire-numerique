'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { contenuValidator } from './contenuValidator'
import { avecJournalisationMin } from '../shared/journalisation'
import { structureDeLaMesureDImpact } from '@/app/shared/structurePorteUneCampagne'
import { Contenu } from '@/domain/mesure-impact/Questionnaire'
import { PrismaCampagneLoader } from '@/gateways/mesure-impact/PrismaCampagneLoader'
import { PrismaReponseRepository } from '@/gateways/mesure-impact/PrismaReponseRepository'
import { getSessionUtilisateurId } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { CanalDeSaisie, Failure, SaisirUneReponse } from '@/use-cases/mesure-impact/SaisirUneReponse'

// Saisie d'un questionnaire papier ou téléphonique par une personne de la structure qui porte la campagne.
// Contrairement au dépôt en ligne, elle est journalisée : elle est faite par une personne connectée (ADR-007).
export async function saisirUneReponseAction(actionParams: ActionParams): Promise<ReadonlyArray<string>> {
  return avecJournalisationMin(async () => {
    const validationResult = validator.safeParse(actionParams)
    if (validationResult.error) {
      return [ENREGISTREMENT_IMPOSSIBLE]
    }

    const { canal, contenu, identifiantPublic } = validationResult.data
    const utilisateur = await new PrismaUtilisateurLoader().findById(await getSessionUtilisateurId())
    const result = await new SaisirUneReponse(
      new PrismaCampagneLoader(),
      new PrismaReponseRepository(),
      new Date()
    ).handle({ canal, contenu, identifiantPublic, structureId: structureDeLaMesureDImpact(utilisateur) ?? null })

    if (result !== 'OK') {
      return [MESSAGES_ECHEC[result]]
    }
    revalidatePath(`/mesure-impact/${identifiantPublic}`)
    return ['OK']
  })
}

const ENREGISTREMENT_IMPOSSIBLE = 'Les réponses n’ont pas pu être enregistrées. Veuillez réessayer.'

const MESSAGES_ECHEC: Readonly<Record<Failure, string>> = {
  accesRefuse: 'Vous ne pouvez pas saisir de réponse pour cette campagne.',
  campagneFermee: 'Cette campagne n’accepte plus de réponses.',
  campagneIntrouvable: 'Cette campagne n’existe pas.',
  contenuInvalide: 'Les réponses saisies ne sont pas cohérentes avec le questionnaire.',
  questionnaireInconnu: ENREGISTREMENT_IMPOSSIBLE,
}

type ActionParams = Readonly<{
  canal: CanalDeSaisie
  contenu: Contenu
  identifiantPublic: string
}>

const validator = z.object({
  canal: z.enum(['papier', 'telephone']),
  contenu: contenuValidator,
  identifiantPublic: z.string().min(1).max(100),
})
