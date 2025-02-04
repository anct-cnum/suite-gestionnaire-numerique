import { CommandHandler, ResultAsync } from '../CommandHandler'
import { FindUtilisateurRepository, UpdateUtilisateurUidRepository } from './shared/UtilisateurRepository'
import { UtilisateurFactory } from '@/domain/UtilisateurFactory'

export class MettreAJourUidALaPremiereConnexion implements CommandHandler<Command> {
  readonly #utilisateurRepository: UtilisateurRepository

  constructor(utilisateurRepository: UtilisateurRepository) {
    this.#utilisateurRepository = utilisateurRepository
  }

  async execute(command: Command): ResultAsync<never> {
    const utilisateurCourant = await this.#utilisateurRepository.find(command.emailAsUid)

    const utilisateurAvecNouvelUid = UtilisateurFactory.avecNouvelUid(utilisateurCourant, command.uid)
    await this.#utilisateurRepository.updateUid(utilisateurAvecNouvelUid)

    return 'OK'
  }
}

type Command = Readonly<{
  emailAsUid: string
  uid: string
}>

type UtilisateurRepository = FindUtilisateurRepository & UpdateUtilisateurUidRepository
