import { CommandHandler, ResultAsync } from '../CommandHandler'
import { FindUtilisateurRepository, UpdateUtilisateurUidRepository } from './shared/UtilisateurRepository'
import { UtilisateurUid } from '@/domain/Utilisateur'

export class MettreAJourUidALaPremiereConnexion implements CommandHandler<Command> {
  readonly #repository: Repository

  constructor(repository: Repository) {
    this.#repository = repository
  }

  async execute(command: Command): ResultAsync<Failure | Success> {
    const utilisateurAvecUidEgalEmail = await this.#repository.find(UtilisateurUid.from(command.email))

    if (!utilisateurAvecUidEgalEmail) {
      return 'comptePremiereConnexionInexistant'
    }

    const utilisateurAvecNouvelUid = utilisateurAvecUidEgalEmail.avecNouvelUid(command.uid)
    await this.#repository.updateUid(utilisateurAvecNouvelUid)
    return 'ok'
  }
}

type Failure = 'comptePremiereConnexionInexistant'
type Success = 'ok'

type Command = Readonly<{
  email: string
  uid: string
}>

type Repository = FindUtilisateurRepository & UpdateUtilisateurUidRepository
