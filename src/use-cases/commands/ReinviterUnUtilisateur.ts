import { CommandHandler, ResultAsync } from '../CommandHandler'
import { EmailGatewayFactory } from './shared/EmailGateway'
import { GetUtilisateurRepository, UpdateUtilisateurRepository } from './shared/UtilisateurRepository'
import { UtilisateurFailure } from '@/domain/Utilisateur'

export class ReinviterUnUtilisateur implements CommandHandler<Command> {
  readonly #utilisateurRepository: UtilisateurRepository
  readonly #emailGatewayFactory: EmailGatewayFactory
  readonly #date: Date

  constructor(
    utilisateurRepository: UtilisateurRepository,
    emailGatewayFactory: EmailGatewayFactory,
    date: Date
  ) {
    this.#utilisateurRepository = utilisateurRepository
    this.#emailGatewayFactory = emailGatewayFactory
    this.#date = date
  }

  async handle(command: Command): ResultAsync<Failure> {
    const utilisateurCourant = await this.#utilisateurRepository.get(command.uidUtilisateurCourant)

    const utilisateurAReinviter = await this.#utilisateurRepository.get(command.uidUtilisateurAReinviter)
    if (utilisateurAReinviter.state.isActive) {
      return 'utilisateurAReinviterDejaActif'
    }
    if (!utilisateurCourant.peutGerer(utilisateurAReinviter)) {
      return 'utilisateurNePeutPasGererUtilisateurAReinviter'
    }

    utilisateurAReinviter.changerDateDInvitation(this.#date)
    await this.#utilisateurRepository.update(utilisateurAReinviter)
    const emailGateway = this.#emailGatewayFactory(utilisateurCourant.state.isSuperAdmin)
    await emailGateway.send(utilisateurAReinviter.state.emailDeContact)

    return 'OK'
  }
}

type Failure = 'utilisateurAReinviterDejaActif' | 'utilisateurNePeutPasGererUtilisateurAReinviter' | UtilisateurFailure

type Command = Readonly<{
  uidUtilisateurAReinviter: string
  uidUtilisateurCourant: string
}>

interface UtilisateurRepository extends GetUtilisateurRepository, UpdateUtilisateurRepository {}
