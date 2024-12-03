import { CommandHandler, ResultAsync } from '../CommandHandler'
import { FindUtilisateurRepository, UpdateUtilisateurUidRepository } from './shared/UtilisateurRepository'
import { UtilisateurFactory } from '@/domain/UtilisateurFactory'

export class MettreAJourUidALaPremiereConnexion implements CommandHandler<Command> {
  readonly #repository: Repository

  constructor(repository: Repository) {
    this.#repository = repository
  }

  async execute(command: Command): ResultAsync<Failure | Success> {
    const utilisateurAvecUidEgalEmail = await this.#repository.find(command.emailAsUid)

    if (!utilisateurAvecUidEgalEmail) {
      return 'comptePremiereConnexionInexistant'
    }

    const utilisateurAvecNouvelUid = UtilisateurFactory.avecNouvelUid(utilisateurAvecUidEgalEmail, command.uid)
    await this.#repository.updateUid(utilisateurAvecNouvelUid)
    return 'ok'
  }
}

type Failure = 'comptePremiereConnexionInexistant'
type Success = 'ok'

type Command = Readonly<{
  emailAsUid: string
  uid: string
}>

type Repository = FindUtilisateurRepository & UpdateUtilisateurUidRepository
