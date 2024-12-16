import { CommandHandler, ResultAsync } from '../CommandHandler'
import { EmailGatewayFactory } from './shared/EmailGateway'
import { FindUtilisateurRepository, UpdateUtilisateurRepository } from './shared/UtilisateurRepository'

export class ReinviterUnUtilisateur implements CommandHandler<Command> {
  readonly #utilisateurRepository: UtilisateurRepository
  readonly #emailGatewayFactory: EmailGatewayFactory
  readonly #date: Date

  constructor(
    utilisateurRepository: UtilisateurRepository,
    emailGatewayFactory: EmailGatewayFactory,
    date: Date = new Date()
  ) {
    this.#utilisateurRepository = utilisateurRepository
    this.#emailGatewayFactory = emailGatewayFactory
    this.#date = date
  }

  async execute(command: Command): ResultAsync<Failure> {
    const utilisateurCourant = await this.#utilisateurRepository.find(command.uidUtilisateurCourant)
    if (!utilisateurCourant) {
      return 'utilisateurCourantInexistant'
    }

    const utilisateurAReinviter = await this.#utilisateurRepository.find(command.uidUtilisateurAReinviter)
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
    await this.#utilisateurRepository.update(utilisateurAReinviter)
    const emailGateway = this.#emailGatewayFactory(utilisateurCourant.state.isSuperAdmin)
    await emailGateway.send(utilisateurAReinviter.state.emailDeContact)

    return 'OK'
  }
}

type Failure =
  | 'utilisateurCourantInexistant'
  | 'utilisateurAReinviterInexistant'
  | 'utilisateurAReinviterDejaActif'
  | 'utilisateurNePeutPasGererUtilisateurAReinviter'

type Command = Readonly<{
  uidUtilisateurAReinviter: string
  uidUtilisateurCourant: string
}>

interface UtilisateurRepository extends FindUtilisateurRepository, UpdateUtilisateurRepository {}
