import { CommandHandler, ResultAsync } from '../CommandHandler'
import { FindUtilisateurRepository, UpdateUtilisateurRepository } from './shared/UtilisateurRepository'
import { UtilisateurFailure } from '@/domain/Utilisateur'

export class MettreAJourDateDeDerniereConnexion implements CommandHandler<Command> {
  readonly #utilisateurRepository: UtilisateurRepository
  readonly #date: Date

  constructor(utilisateurRepository: UtilisateurRepository, date: Date) {
    this.#utilisateurRepository = utilisateurRepository
    this.#date = date
  }

  async execute(command: Command): ResultAsync<Failure> {
    const utilisateurCourant = await this.#utilisateurRepository.find(command.uidUtilisateurCourant)
    if (!utilisateurCourant) {
      return 'utilisateurCourantInexistant'
    }

    utilisateurCourant.changerDateDeDerniereConnexion(this.#date)
    await this.#utilisateurRepository.update(utilisateurCourant)
    return 'OK'
  }
}

type Failure = 'utilisateurCourantInexistant' | 'dateInvalide' | UtilisateurFailure

type Command = Readonly<{
  uidUtilisateurCourant: string
}>

interface UtilisateurRepository extends FindUtilisateurRepository, UpdateUtilisateurRepository {}
