import { QueryHandler } from '../QueryHandler'
import { Campagne } from '@/domain/mesure-impact/Campagne'
import { Partie } from '@/domain/mesure-impact/Questionnaire'
import { questionnaireDeVersion } from '@/domain/mesure-impact/questionnaires'
import {
  calculerLesResultats,
  filtrerLesReponses,
  Filtres,
  optionsDeFiltre,
  OptionsDeFiltre,
  ReponseEnregistree,
  Resultats,
} from '@/domain/mesure-impact/Resultats'

// Résultats de la campagne pour la structure qui la porte. Les filtres proposés viennent de toutes les
// réponses, pour qu'un filtre appliqué ne fasse pas disparaître les autres choix.
export class RecupererLesResultats implements QueryHandler<Query, 'accesRefuse' | null | ResultatsReadModel> {
  readonly #campagneLoader: CampagneLoader
  readonly #reponsesLoader: ReponsesDeLaCampagneLoader

  constructor(campagneLoader: CampagneLoader, reponsesLoader: ReponsesDeLaCampagneLoader) {
    this.#campagneLoader = campagneLoader
    this.#reponsesLoader = reponsesLoader
  }

  async handle({ filtres, identifiantPublic, structureId }: Query): Promise<'accesRefuse' | null | ResultatsReadModel> {
    const campagne = await this.#campagneLoader.parIdentifiantPublic(identifiantPublic)
    if (campagne === null) {
      return null
    }
    if (!campagne.estPiloteePar(structureId ?? null)) {
      return 'accesRefuse'
    }
    const { libelleTerritoire, nom, ouverture, questionnaireVersion, uid } = campagne.state
    const questionnaire = questionnaireDeVersion(questionnaireVersion)
    if (questionnaire === undefined) {
      return null
    }
    const reponses = await this.#reponsesLoader.reponses(uid.value)
    return {
      campagne: { identifiantPublic, libelleTerritoire, nom, ouverture: new Date(ouverture) },
      filtres,
      optionsDeFiltre: optionsDeFiltre(questionnaire, reponses),
      parties: questionnaire.parties,
      resultats: calculerLesResultats(questionnaire, filtrerLesReponses(questionnaire, reponses, filtres)),
    }
  }
}

export interface CampagneLoader {
  parIdentifiantPublic(identifiantPublic: string): Promise<Campagne | null>
}

export interface ReponsesDeLaCampagneLoader {
  reponses(campagneUid: number): Promise<ReadonlyArray<ReponseEnregistree>>
}

export type ResultatsReadModel = Readonly<{
  campagne: Readonly<{ identifiantPublic: string; libelleTerritoire: string; nom: string; ouverture: Date }>
  filtres: Filtres
  optionsDeFiltre: OptionsDeFiltre
  parties: ReadonlyArray<Partie>
  resultats: Resultats
}>

type Query = Readonly<{
  filtres: Filtres
  identifiantPublic: string
  // Absente pour une personne sans structure
  structureId?: number
}>
