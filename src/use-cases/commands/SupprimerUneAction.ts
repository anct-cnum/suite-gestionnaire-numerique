import { CommandHandler, ResultAsync } from '../CommandHandler'
import { DropActionRepository } from './shared/ActionRepository'
import { GetUtilisateurRepository } from './shared/UtilisateurRepository'

export class SupprimerUneAction implements CommandHandler<Command> {
  readonly #utilisateurRepository: UtilisateurRepository
  readonly #actionRepository: ActionRepository
  // Ajouter les autres repository

  constructor(
    utilisateurRepository: UtilisateurRepository,
    actionRepository: ActionRepository,
  ) {
    this.#utilisateurRepository = utilisateurRepository
    this.#actionRepository = actionRepository
  }

  async handle(command: Command): ResultAsync<Failure> {
    const gestionnaire = await this.#utilisateurRepository.get(command.uidGestionnaire)

    // Utiliser les autres repository, ajouter les règles métier et l'écriture en base de données

    return 'OK'
  }
}

type Failure = ''
type Command = Readonly<{
  uidAction: string
  uidGestionnaire: string
}>

type UtilisateurRepository = GetUtilisateurRepository
type ActionRepository = DropActionRepository
// Ajouter les autres types de repository
