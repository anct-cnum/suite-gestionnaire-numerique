import { CommandHandler, ResultAsync } from '../CommandHandler'
import { EmailGatewayFactory } from './shared/EmailGateway'
import { FindUtilisateurRepository, UpdateUtilisateurRepository } from './shared/UtilisateurRepository'

export class ReinviterUnUtilisateur implements CommandHandler<ReinviterUnUtilisateurCommand> {
  readonly #repository: Repository
  readonly #emailGatewayFactory: EmailGatewayFactory
  readonly #date: Date

  constructor(repository: Repository, emailGatewayFactory: EmailGatewayFactory, date: Date = new Date()) {
    this.#repository = repository
    this.#emailGatewayFactory = emailGatewayFactory
    this.#date = date
  }

  async execute(command: ReinviterUnUtilisateurCommand): ResultAsync<ReinviterUnUtilisateurFailure> {
    const utilisateurCourant = await this.#repository.find(command.uidUtilisateurCourant)
    if (!utilisateurCourant) {
      return 'utilisateurCourantInexistant'
    }

    const utilisateurAReinviter = await this.#repository.find(command.uidUtilisateurAReinviter)
    if (!utilisateurAReinviter) {
      return 'utilisateurAReinviterInexistant'
    }
    if (utilisateurAReinviter.state.isActive) {
      return 'utilisateurAReinviterDejaActif'
    }
    if (!utilisateurCourant.peutGerer(utilisateurAReinviter)) {
      return 'utilisateurNePeutPasGererUtilisateurAReinviter'
    }

    utilisateurAReinviter.changerLaDateDInvitation(this.#date)
    await this.#repository.update(utilisateurAReinviter)
    const emailGateway = this.#emailGatewayFactory(utilisateurCourant.state.isSuperAdmin)
    await emailGateway.send(utilisateurAReinviter.state.emailDeContact)
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

interface Repository extends FindUtilisateurRepository, UpdateUtilisateurRepository {}
