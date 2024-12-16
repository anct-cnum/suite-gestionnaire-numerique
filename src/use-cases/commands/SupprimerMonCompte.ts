import { CommandHandler, ResultAsync } from '../CommandHandler'
import { DropUtilisateurByUidRepository } from './shared/UtilisateurRepository'

export class SupprimerMonCompte implements CommandHandler<Command, Failure> {
  readonly #utilisateurRepository: DropUtilisateurByUidRepository

  constructor(utilisateurRepository: DropUtilisateurByUidRepository) {
    this.#utilisateurRepository = utilisateurRepository
  }

  async execute(command: Command): ResultAsync<Failure> {
    return this.#utilisateurRepository
      .dropByUid(command.uidUtilisateurCourant)
      .then((result) => (result ? 'OK' : 'utilisateurCourantInexistant'))
  }
}

type Failure = 'utilisateurCourantInexistant'

type Command = Readonly<{
  uidUtilisateurCourant: string
}>
