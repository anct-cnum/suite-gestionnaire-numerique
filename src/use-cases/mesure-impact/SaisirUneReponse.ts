import { CommandHandler, ResultAsync } from '../CommandHandler'
import { Campagne } from '@/domain/mesure-impact/Campagne'
import { Contenu } from '@/domain/mesure-impact/Questionnaire'
import { EchecDepot, Reponse } from '@/domain/mesure-impact/Reponse'

// Réponse recueillie sur papier ou par téléphone, saisie par une personne de la structure qui porte la
// campagne. Mêmes règles qu'en ligne, sans preuve anti-abus : la saisie demande d'être connecté.
export class SaisirUneReponse implements CommandHandler<Command, Failure> {
  readonly #campagneLoader: CampagneLoader
  readonly #date: Date
  readonly #reponseRepository: ReponseRepository

  constructor(campagneLoader: CampagneLoader, reponseRepository: ReponseRepository, date: Date) {
    this.#campagneLoader = campagneLoader
    this.#reponseRepository = reponseRepository
    this.#date = date
  }

  async handle({ canal, contenu, identifiantPublic, structureId }: Command): ResultAsync<Failure> {
    const campagne = await this.#campagneLoader.parIdentifiantPublic(identifiantPublic)
    if (campagne === null) {
      return 'campagneIntrouvable'
    }
    if (!campagne.estPiloteePar(structureId)) {
      return 'accesRefuse'
    }
    const reponse = Reponse.deposer({ campagne, canal, contenu, date: this.#date })
    if (!(reponse instanceof Reponse)) {
      return reponse
    }
    await this.#reponseRepository.ajouter(reponse)
    return 'OK'
  }
}

export interface CampagneLoader {
  parIdentifiantPublic(identifiantPublic: string): Promise<Campagne | null>
}

export interface ReponseRepository {
  ajouter(reponse: Reponse): Promise<void>
}

export type CanalDeSaisie = 'papier' | 'telephone'

export type Failure = 'accesRefuse' | 'campagneIntrouvable' | EchecDepot

type Command = Readonly<{
  canal: CanalDeSaisie
  contenu: Contenu
  identifiantPublic: string
  structureId: null | number
}>
