import { CommandHandler, ResultAsync } from '../CommandHandler'
import { FindUtilisateurByEmailRepository, UpdateUtilisateurSsoIdRepository } from './shared/UtilisateurRepository'

export class MettreAJourUidALaPremiereConnexion implements CommandHandler<Command> {
  readonly #utilisateurRepository: UtilisateurRepository

  constructor(utilisateurRepository: UtilisateurRepository) {
    this.#utilisateurRepository = utilisateurRepository
  }

  async handle(command: Command): ResultAsync<never> {
    const utilisateurCourant = await this.#utilisateurRepository.findByEmail(command.email)

    if (!utilisateurCourant) {
      throw new Error('Utilisateur non trouvé')
    }

    // Le uid reçu est le sub ProConnect : il ne sert qu'à l'authentification, pas au domaine
    await this.#utilisateurRepository.updateSsoId(command.email, command.uid)

    return 'OK'
  }
}

type Command = Readonly<{
  email: string
  uid: string
}>

type UtilisateurRepository = FindUtilisateurByEmailRepository & UpdateUtilisateurSsoIdRepository
