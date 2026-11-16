import { QueryHandler } from '../QueryHandler'
import { Campagne } from '@/domain/mesure-impact/Campagne'

// Ce que la page publique du questionnaire doit savoir de la campagne : le territoire à afficher, la
// version du questionnaire, et si elle accepte des réponses aujourd'hui.
export class RecupererLaCampagnePublique implements QueryHandler<Query, CampagnePubliqueReadModel | null> {
  readonly #date: Date
  readonly #loader: CampagnePubliqueLoader

  constructor(loader: CampagnePubliqueLoader, date: Date) {
    this.#loader = loader
    this.#date = date
  }

  async handle({ identifiantPublic }: Query): Promise<CampagnePubliqueReadModel | null> {
    const campagne = await this.#loader.parIdentifiantPublic(identifiantPublic)
    if (campagne === null) {
      return null
    }
    const { libelleTerritoire, questionnaireVersion } = campagne.state
    return {
      identifiantPublic,
      libelleTerritoire,
      ouverte: campagne.accepteDesReponses(this.#date),
      questionnaireVersion,
    }
  }
}

export interface CampagnePubliqueLoader {
  parIdentifiantPublic(identifiantPublic: string): Promise<Campagne | null>
}

type CampagnePubliqueReadModel = Readonly<{
  identifiantPublic: string
  libelleTerritoire: string
  ouverte: boolean
  questionnaireVersion: string
}>

type Query = Readonly<{
  identifiantPublic: string
}>
