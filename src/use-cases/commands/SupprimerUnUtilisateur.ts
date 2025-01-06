import { CommandHandler, ResultAsync } from '../CommandHandler'
import { DropUtilisateurRepository, FindUtilisateurRepository } from './shared/UtilisateurRepository'

export class SupprimerUnUtilisateur implements CommandHandler<Command> {
  readonly #utilisateurRepository: UtilisateurRepository

  constructor(utilisateurRepository: UtilisateurRepository) {
    this.#utilisateurRepository = utilisateurRepository
  }

  async execute(command: Command): ResultAsync<Failure> {
    const utilisateurCourant = await this.#utilisateurRepository.find(command.uidUtilisateurCourant)
    if (!utilisateurCourant) {
      return 'utilisateurCourantInexistant'
    }

    const utilisateurASupprimer = await this.#utilisateurRepository.find(command.uidUtilisateurASupprimer)
    if (!utilisateurASupprimer) {
      return 'compteASupprimerInexistant'
    }
    if (!utilisateurCourant.peutGerer(utilisateurASupprimer)) {
      return 'suppressionNonAutorisee'
    }

    return await this.#utilisateurRepository.drop(utilisateurASupprimer)
      ? 'OK'
      : 'compteASupprimerDejaSupprime'
  }
}

type Failure =
  | 'utilisateurCourantInexistant'
  | 'compteASupprimerInexistant'
  | 'suppressionNonAutorisee'
  | 'compteASupprimerDejaSupprime'

type Command = Readonly<{
  uidUtilisateurCourant: string
  uidUtilisateurASupprimer: string
}>

interface UtilisateurRepository extends FindUtilisateurRepository, DropUtilisateurRepository {}
