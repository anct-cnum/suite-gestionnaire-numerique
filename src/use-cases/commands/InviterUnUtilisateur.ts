import { CommandHandler, ResultAsync } from '../CommandHandler'
import { EmailGatewayFactory } from './shared/EmailGateway'
import { AddUtilisateurRepository, GetUtilisateurRepository } from './shared/UtilisateurRepository'
import { TypologieRole } from '@/domain/Role'
import { UtilisateurFactory } from '@/domain/UtilisateurFactory'

export class InviterUnUtilisateur implements CommandHandler<Command> {
  readonly #date: Date
  readonly #emailGatewayFactory: EmailGatewayFactory
  readonly #utilisateurRepository: UtilisateurRepository

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
    const utilisateurCourantState = utilisateurCourant.state
    const utilisateurACreer = new UtilisateurFactory({
      departement: utilisateurCourantState.departement,
      emailDeContact: command.email,
      groupementUid: utilisateurCourantState.groupementUid?.value,
      inviteLe: this.#date,
      isSuperAdmin: false,
      nom: command.nom,
      prenom: command.prenom,
      region: utilisateurCourantState.region,
      structureUid: utilisateurCourantState.structureUid?.value,
      telephone: '',
      uid: { email: command.email, value: command.email },
    }).create(
      command.role?.type ?? utilisateurCourantState.role.nom,
      command.role?.codeOrganisation
    )

    if (!utilisateurCourant.peutGerer(utilisateurACreer)) {
      return 'utilisateurNePeutPasGererUtilisateurACreer'
    }

    const isUtilisateurCreated = await this.#utilisateurRepository.add(utilisateurACreer)
    if (isUtilisateurCreated) {
      const emailGateway = this.#emailGatewayFactory(utilisateurCourant.state.isSuperAdmin)
      await emailGateway.send(command.email)
      return 'OK'
    }

    return 'emailExistant'
  }
}

type Command = Readonly<{
  email: string
  nom: string
  prenom: string
  role?: Readonly<{
    codeOrganisation?: string
    type: TypologieRole
  }>
  uidUtilisateurCourant: string
}>

type Failure = 'emailExistant' | 'utilisateurNePeutPasGererUtilisateurACreer'

interface UtilisateurRepository extends AddUtilisateurRepository, GetUtilisateurRepository {}
