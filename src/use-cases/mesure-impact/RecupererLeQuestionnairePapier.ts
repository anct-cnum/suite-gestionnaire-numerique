import { QueryHandler } from '../QueryHandler'
import { Campagne } from '@/domain/mesure-impact/Campagne'
import { QuestionnairePapier, versionPapier } from '@/domain/mesure-impact/QuestionnairePapier'
import { questionnaireDeVersion } from '@/domain/mesure-impact/questionnaires'

// Questionnaire à imprimer, pour la structure qui porte la campagne : la version papier de son questionnaire
export class RecupererLeQuestionnairePapier implements QueryHandler<
  Query,
  'accesRefuse' | null | QuestionnairePapierReadModel
> {
  readonly #campagneLoader: CampagneLoader

  constructor(campagneLoader: CampagneLoader) {
    this.#campagneLoader = campagneLoader
  }

  async handle({
    identifiantPublic,
    structureId,
  }: Query): Promise<'accesRefuse' | null | QuestionnairePapierReadModel> {
    const campagne = await this.#campagneLoader.parIdentifiantPublic(identifiantPublic)
    if (campagne === null) {
      return null
    }
    if (!campagne.estPiloteePar(structureId ?? null)) {
      return 'accesRefuse'
    }
    const { libelleTerritoire, questionnaireVersion } = campagne.state
    const questionnaire = questionnaireDeVersion(questionnaireVersion)
    if (questionnaire === undefined) {
      return null
    }
    return { identifiantPublic, libelleTerritoire, questionnaire: versionPapier(questionnaire) }
  }
}

export interface CampagneLoader {
  parIdentifiantPublic(identifiantPublic: string): Promise<Campagne | null>
}

export type QuestionnairePapierReadModel = Readonly<{
  identifiantPublic: string
  libelleTerritoire: string
  questionnaire: QuestionnairePapier
}>

type Query = Readonly<{
  identifiantPublic: string
  // Absente pour une personne sans structure
  structureId?: number
}>
