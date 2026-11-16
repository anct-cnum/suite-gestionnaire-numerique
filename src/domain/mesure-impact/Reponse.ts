import { Campagne } from './Campagne'
import { Canal, Contenu } from './Questionnaire'
import { questionnaireDeVersion } from './questionnaires'
import { Result } from '@/shared/lang'

// Réponse d'une personne à une campagne : déposée une fois, jamais modifiée. Elle garde la version du
// questionnaire pour être relue avec les libellés et les règles qui étaient en vigueur.
export class Reponse {
  get state(): ReponseState {
    return {
      campagneUid: this.#campagneUid,
      canal: this.#canal,
      contenu: this.#contenu,
      depot: this.#depot.toJSON(),
      questionnaireVersion: this.#questionnaireVersion,
    }
  }

  readonly #campagneUid: number
  readonly #canal: Canal
  readonly #contenu: Contenu
  readonly #depot: Date
  readonly #questionnaireVersion: string

  private constructor(campagneUid: number, questionnaireVersion: string, canal: Canal, contenu: Contenu, depot: Date) {
    this.#campagneUid = campagneUid
    this.#questionnaireVersion = questionnaireVersion
    this.#canal = canal
    this.#contenu = contenu
    this.#depot = depot
    Object.freeze(this)
  }

  static deposer({ campagne, canal, contenu, date }: DepotParams): Result<EchecDepot, Reponse> {
    if (!campagne.accepteDesReponses(date)) {
      return 'campagneFermee'
    }
    const { questionnaireVersion, uid } = campagne.state
    const questionnaire = questionnaireDeVersion(questionnaireVersion)
    if (questionnaire === undefined) {
      return 'questionnaireInconnu'
    }
    if (questionnaire.verifier(contenu, canal).length > 0) {
      return 'contenuInvalide'
    }
    return new Reponse(uid.value, questionnaireVersion, canal, contenu, heureDeDepot(date))
  }
}

// Une heure de dépôt précise désignerait la séance de médiation, donc la personne pour qui y était :
// on ne garde que l'heure, ce qui suffit à suivre l'arrivée des réponses.
export function heureDeDepot(date: Date): Date {
  return new Date(Math.floor(date.getTime() / UNE_HEURE) * UNE_HEURE)
}

const UNE_HEURE = 3_600_000

export type EchecDepot = 'campagneFermee' | 'contenuInvalide' | 'questionnaireInconnu'

type ReponseState = Readonly<{
  campagneUid: number
  canal: Canal
  contenu: Contenu
  depot: string
  questionnaireVersion: string
}>

type DepotParams = Readonly<{
  campagne: Campagne
  canal: Canal
  contenu: Contenu
  date: Date
}>
