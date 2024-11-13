import { CommandHandler, ResultAsync } from '../CommandHandler'
import { UpdateUtilisateurRepository } from './shared/UtilisateurRepository'
import { UtilisateurUid } from '@/domain/Utilisateur'

export class ReinviterUnUtilisateur implements CommandHandler<ReinviterUnUtilisateurCommand> {
  readonly #repository: UpdateUtilisateurRepository
  readonly #date: Date

  constructor(repository: UpdateUtilisateurRepository, date: Date = new Date()) {
    this.#repository = repository
    this.#date = date
  }

  async execute(command: ReinviterUnUtilisateurCommand): ResultAsync<ReinviterUnUtilisateurFailure> {
    const utilisateurCourant = await this.#repository.find(UtilisateurUid.from(command.uidUtilisateurCourant))
    if (!utilisateurCourant) {
      return 'utilisateurCourantInexistant'
    }

    const utilisateurAReinviter = await this.#repository.find(UtilisateurUid.from(command.uidUtilisateurAReinviter))
    if (!utilisateurAReinviter) {
      return 'utilisateurAReinviterInexistant'
    }
    if (utilisateurAReinviter.state().isActive) {
      return 'utilisateurAReinviterDejaActif'
    }
    if (!utilisateurCourant.peutGerer(utilisateurAReinviter)) {
      return 'utilisateurNePeutPasGererUtilisateurAReinviter'
    }

    utilisateurAReinviter.changerLaDateDInvitation(this.#date)
    await this.#repository.update(utilisateurAReinviter)
    return 'OK'
  }
}

export type ReinviterUnUtilisateurFailure =
  | 'utilisateurCourantInexistant'
  | 'utilisateurAReinviterInexistant'
  | 'utilisateurAReinviterDejaActif'
  | 'utilisateurNePeutPasGererUtilisateurAReinviter'

export type ReinviterUnUtilisateurCommand = Readonly<{
  uidUtilisateurAReinviter: string
  uidUtilisateurCourant: string
}>
