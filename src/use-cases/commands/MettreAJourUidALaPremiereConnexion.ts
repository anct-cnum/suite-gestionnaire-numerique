import { CommandHandler, ResultAsync } from '../CommandHandler'
import { FindUtilisateurByEmailRepository, UpdateUtilisateurUidRepository } from './shared/UtilisateurRepository'
import { UtilisateurFactory } from '@/domain/UtilisateurFactory'

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

    const utilisateurAvecNouvelUid = UtilisateurFactory.avecNouvelUid(utilisateurCourant, command.uid)
    await this.#utilisateurRepository.updateUid(utilisateurAvecNouvelUid)

    return 'OK'
  }
}

type Command = Readonly<{
  email: string
  uid: string
}>

type UtilisateurRepository = FindUtilisateurByEmailRepository & UpdateUtilisateurUidRepository
