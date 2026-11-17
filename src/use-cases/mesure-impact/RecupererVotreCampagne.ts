import { QueryHandler } from '../QueryHandler'
import { Campagne } from '@/domain/mesure-impact/Campagne'
import { questionnaireDeVersion } from '@/domain/mesure-impact/questionnaires'

// Page de la campagne pour la structure qui la porte : ses détails et le suivi des réponses reçues
export class RecupererVotreCampagne implements QueryHandler<Query, 'accesRefuse' | null | VotreCampagneReadModel> {
  readonly #campagneLoader: CampagneLoader
  readonly #date: Date
  readonly #suiviLoader: SuiviDesReponsesLoader

  constructor(campagneLoader: CampagneLoader, suiviLoader: SuiviDesReponsesLoader, date: Date) {
    this.#campagneLoader = campagneLoader
    this.#suiviLoader = suiviLoader
    this.#date = date
  }

  async handle({ identifiantPublic, structureId }: Query): Promise<'accesRefuse' | null | VotreCampagneReadModel> {
    const campagne = await this.#campagneLoader.parIdentifiantPublic(identifiantPublic)
    if (campagne === null) {
      return null
    }
    if (!campagne.estPiloteePar(structureId ?? null)) {
      return 'accesRefuse'
    }
    const { libelleTerritoire, nom, ouverture, questionnaireVersion, uid } = campagne.state
    const suivi = await this.#suiviLoader.suivi(uid.value)
    return {
      derniereReponse: suivi.derniere,
      identifiantPublic,
      libelleTerritoire,
      nom,
      nombreDeQuestions: questionnaireDeVersion(questionnaireVersion)?.questions.length ?? 0,
      nombreDeReponses: suivi.nombre,
      ouverte: campagne.accepteDesReponses(this.#date),
      ouverture: new Date(ouverture),
      questionnaireVersion,
    }
  }
}

export interface CampagneLoader {
  parIdentifiantPublic(identifiantPublic: string): Promise<Campagne | null>
}

export interface SuiviDesReponsesLoader {
  suivi(campagneUid: number): Promise<Readonly<{ derniere: Date | null; nombre: number }>>
}

export type VotreCampagneReadModel = Readonly<{
  derniereReponse: Date | null
  identifiantPublic: string
  libelleTerritoire: string
  nom: string
  nombreDeQuestions: number
  nombreDeReponses: number
  ouverte: boolean
  ouverture: Date
  questionnaireVersion: string
}>

type Query = Readonly<{
  identifiantPublic: string
  // Absente pour une personne sans structure
  structureId?: number
}>
