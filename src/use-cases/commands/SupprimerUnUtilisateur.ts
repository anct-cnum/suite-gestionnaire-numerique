import { CommandHandler, ResultAsync } from '../CommandHandler'
import { DropUtilisateurRepository, GetUtilisateurRepository } from './shared/UtilisateurRepository'

export class SupprimerUnUtilisateur implements CommandHandler<Command> {
  readonly #utilisateurRepository: UtilisateurRepository

  constructor(utilisateurRepository: UtilisateurRepository) {
    this.#utilisateurRepository = utilisateurRepository
  }

  async handle(command: Command): ResultAsync<Failure> {
    const utilisateurCourant = await this.#utilisateurRepository.get(command.uidUtilisateurCourant)
    const utilisateurASupprimer = await this.#utilisateurRepository.get(command.uidUtilisateurASupprimer)
    if (!utilisateurCourant.peutGerer(utilisateurASupprimer)) {
      return 'suppressionNonAutorisee'
    }

    return await this.#utilisateurRepository.drop(utilisateurASupprimer)
      ? 'OK'
      : 'compteASupprimerDejaSupprime'
  }
}

type Failure = 'suppressionNonAutorisee' | 'compteASupprimerDejaSupprime'

type Command = Readonly<{
  uidUtilisateurCourant: string
  uidUtilisateurASupprimer: string
}>

interface UtilisateurRepository extends GetUtilisateurRepository, DropUtilisateurRepository {}
