import { CommandHandler, ResultAsync } from '../CommandHandler'
import { FindUtilisateurRepository, UpdateUtilisateurRepository } from './shared/UtilisateurRepository'

export class MettreAJourDateDeDerniereConnexion implements CommandHandler<Command> {
  readonly #repository: Repository
  readonly #date: Date

  constructor(repository: Repository, date: Date = new Date()) {
    this.#repository = repository
    this.#date = date
  }

  async execute(command: Command): ResultAsync<Failure | Success> {
    const utilisateur = await this.#repository.find(command.uid)
    if (!utilisateur) {
      return 'compteInexistant'
    }
    utilisateur.mettreAJourLaDateDeDerniereConnexion(this.#date)
    await this.#repository.update(utilisateur)
    return 'ok'
  }
}

type Failure = 'compteInexistant'
type Success = 'ok'

type Command = Readonly<{
  uid: string
}>

interface Repository extends FindUtilisateurRepository, UpdateUtilisateurRepository {}
