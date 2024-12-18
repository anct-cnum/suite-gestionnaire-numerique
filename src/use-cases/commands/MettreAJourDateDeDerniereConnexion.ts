import { CommandHandler, ResultAsync } from '../CommandHandler'
import { FindUtilisateurRepository, UpdateUtilisateurRepository } from './shared/UtilisateurRepository'

export class MettreAJourDateDeDerniereConnexion implements CommandHandler<Command> {
  readonly #repository: Repository
  readonly #date: Date

  constructor(repository: Repository, date: Date = new Date()) {
    this.#repository = repository
    this.#date = date
  }

  async execute(command: Command): ResultAsync<Failure> {
    const utilisateurCourant = await this.#repository.find(command.uidUtilisateurCourant)
    if (!utilisateurCourant) {
      return 'utilisateurCourantInexistant'
    }
    if (isNaN(this.#date.getTime())) {
      return 'dateInvalide'
    }
    utilisateurCourant.mettreAJourLaDateDeDerniereConnexion(this.#date)
    await this.#repository.update(utilisateurCourant)
    return 'OK'
  }
}

type Failure = 'utilisateurCourantInexistant' | 'dateInvalide'

type Command = Readonly<{
  uidUtilisateurCourant: string
}>

interface Repository extends FindUtilisateurRepository, UpdateUtilisateurRepository {}
