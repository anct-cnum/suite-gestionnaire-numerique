import { CommandHandler, ResultAsync } from '../CommandHandler'
import { GetUtilisateurRepository, UpdateUtilisateurUidRepository } from './shared/UtilisateurRepository'
import { UtilisateurFactory } from '@/domain/UtilisateurFactory'

export class MettreAJourUidALaPremiereConnexion implements CommandHandler<Command> {
  readonly #utilisateurRepository: UtilisateurRepository

  constructor(utilisateurRepository: UtilisateurRepository) {
    this.#utilisateurRepository = utilisateurRepository
  }

  async handle(command: Command): ResultAsync<never> {
    const utilisateurCourant = await this.#utilisateurRepository.get(command.emailAsUid)

    const utilisateurAvecNouvelUid = UtilisateurFactory.avecNouvelUid(utilisateurCourant, command.uid)
    await this.#utilisateurRepository.updateUid(utilisateurAvecNouvelUid)

    return 'OK'
  }
}

type Command = Readonly<{
  emailAsUid: string
  uid: string
}>

type UtilisateurRepository = GetUtilisateurRepository & UpdateUtilisateurUidRepository
