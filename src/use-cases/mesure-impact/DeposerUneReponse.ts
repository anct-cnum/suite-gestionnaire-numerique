import { CommandHandler, ResultAsync } from '../CommandHandler'
import { Campagne } from '@/domain/mesure-impact/Campagne'
import { Canal, Contenu } from '@/domain/mesure-impact/Questionnaire'
import { EchecDepot, Reponse } from '@/domain/mesure-impact/Reponse'

// En ligne, le questionnaire est public : l'envoi doit porter une preuve de travail valide pour cette
// campagne (défi signé, résolu par le navigateur), utilisable une seule fois. Aucune adresse IP n'est lue.
export class DeposerUneReponse implements CommandHandler<Command, Failure> {
  readonly #campagneLoader: CampagneLoader
  readonly #date: Date
  readonly #defisConsommes: DefisConsommesRepository
  readonly #reponseRepository: ReponseRepository
  readonly #verificateurDePreuve: VerificateurDePreuve

  constructor(
    campagneLoader: CampagneLoader,
    reponseRepository: ReponseRepository,
    verificateurDePreuve: VerificateurDePreuve,
    defisConsommes: DefisConsommesRepository,
    date: Date
  ) {
    this.#campagneLoader = campagneLoader
    this.#reponseRepository = reponseRepository
    this.#verificateurDePreuve = verificateurDePreuve
    this.#defisConsommes = defisConsommes
    this.#date = date
  }

  async handle({ canal, contenu, identifiantPublic, preuve }: Command): ResultAsync<Failure> {
    const campagne = await this.#campagneLoader.parIdentifiantPublic(identifiantPublic)
    if (campagne === null) {
      return 'campagneIntrouvable'
    }
    const reponse = Reponse.deposer({ campagne, canal, contenu, date: this.#date })
    if (!(reponse instanceof Reponse)) {
      return reponse
    }
    if (canal === 'en-ligne' && !(await this.#consommerLaPreuve(preuve ?? '', identifiantPublic))) {
      return 'preuveInvalide'
    }
    await this.#reponseRepository.ajouter(reponse)
    return 'OK'
  }

  async #consommerLaPreuve(preuve: string, identifiantPublic: string): Promise<boolean> {
    const verifiee = await this.#verificateurDePreuve.verifier(preuve, identifiantPublic)
    return verifiee !== null && this.#defisConsommes.consommer(verifiee.empreinte, verifiee.expiration, this.#date)
  }
}

export interface CampagneLoader {
  parIdentifiantPublic(identifiantPublic: string): Promise<Campagne | null>
}

export interface ReponseRepository {
  ajouter(reponse: Reponse): Promise<void>
}

// Preuve valide (signature, solution, échéance, campagne) : l'empreinte identifie le défi résolu
export interface VerificateurDePreuve {
  verifier(preuve: string, identifiantPublic: string): Promise<null | PreuveVerifiee>
}

// Garde chaque défi résolu jusqu'à son échéance : faux s'il a déjà servi
export interface DefisConsommesRepository {
  consommer(empreinte: string, expiration: Date, maintenant: Date): Promise<boolean>
}

export type PreuveVerifiee = Readonly<{
  empreinte: string
  expiration: Date
}>

export type Failure = 'campagneIntrouvable' | 'preuveInvalide' | EchecDepot

type Command = Readonly<{
  canal: Canal
  contenu: Contenu
  identifiantPublic: string
  preuve?: string
}>
