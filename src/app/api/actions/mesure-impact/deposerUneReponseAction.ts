'use server'

import { z } from 'zod'

import { contenuValidator } from './contenuValidator'
import { Contenu } from '@/domain/mesure-impact/Questionnaire'
import { AltchaPreuveDeTravail } from '@/gateways/mesure-impact/AltchaPreuveDeTravail'
import { PrismaCampagneLoader } from '@/gateways/mesure-impact/PrismaCampagneLoader'
import { PrismaDefiConsommeRepository } from '@/gateways/mesure-impact/PrismaDefiConsommeRepository'
import { PrismaReponseRepository } from '@/gateways/mesure-impact/PrismaReponseRepository'
import { DeposerUneReponse, Failure } from '@/use-cases/mesure-impact/DeposerUneReponse'

// Questionnaire public, sans compte. Le dépôt n'est volontairement pas journalisé (exception à la règle des
// mutations, ADR-007) : depuis un navigateur connecté à MIN, le journal lierait la réponse au compte et à l'heure
// exacte, alors qu'elle doit rester anonyme (#2267 RG7, #2268 RG6).
// Le contenu est vérifié deux fois : sa forme ici, sa cohérence avec le questionnaire dans le domaine.
// L'envoi porte une preuve de travail anti-abus ; aucune adresse IP n'est lue.
export async function deposerUneReponseAction(actionParams: ActionParams): Promise<ReadonlyArray<string>> {
  const validationResult = validator.safeParse(actionParams)
  if (validationResult.error) {
    return [ENVOI_IMPOSSIBLE]
  }

  const { contenu, identifiantPublic, preuve } = validationResult.data
  const result = await new DeposerUneReponse(
    new PrismaCampagneLoader(),
    new PrismaReponseRepository(),
    new AltchaPreuveDeTravail(process.env.ALTCHA_HMAC_KEY),
    new PrismaDefiConsommeRepository(),
    new Date()
  ).handle({ canal: 'en-ligne', contenu, identifiantPublic, preuve })

  return result === 'OK' ? ['OK'] : [MESSAGES_ECHEC[result]]
}

const ENVOI_IMPOSSIBLE = 'Vos réponses n’ont pas pu être envoyées. Veuillez réessayer.'

const MESSAGES_ECHEC: Readonly<Record<Failure, string>> = {
  campagneFermee: 'Ce questionnaire n’accepte plus de réponses.',
  campagneIntrouvable: 'Ce questionnaire n’existe pas.',
  contenuInvalide: ENVOI_IMPOSSIBLE,
  preuveInvalide: ENVOI_IMPOSSIBLE,
  questionnaireInconnu: ENVOI_IMPOSSIBLE,
}

type ActionParams = Readonly<{
  contenu: Contenu
  identifiantPublic: string
  preuve: string
}>

const validator = z.object({
  contenu: contenuValidator,
  identifiantPublic: z.string().min(1).max(100),
  preuve: z.string().max(4000),
})
