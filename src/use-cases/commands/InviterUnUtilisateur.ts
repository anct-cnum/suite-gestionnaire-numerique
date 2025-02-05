import { CommandHandler, ResultAsync } from '../CommandHandler'
import { EmailGatewayFactory } from './shared/EmailGateway'
import { AddUtilisateurRepository, GetUtilisateurRepository } from './shared/UtilisateurRepository'
import { TypologieRole } from '@/domain/Role'
import { UtilisateurFactory } from '@/domain/UtilisateurFactory'

export class InviterUnUtilisateur implements CommandHandler<Command> {
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
    const utilisateurCourantState = utilisateurCourant.state
    const utilisateurACreer = new UtilisateurFactory({
      departement: utilisateurCourantState.departement,
      emailDeContact: command.email,
      groupementUid: utilisateurCourantState.groupementUid?.value,
      inviteLe: this.#date,
      isSuperAdmin: utilisateurCourantState.isSuperAdmin,
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
  prenom: string
  nom: string
  email: string
  role?: Readonly<{
    type: TypologieRole
    codeOrganisation?: string
  }>
  uidUtilisateurCourant: string
}>

type Failure = 'utilisateurNePeutPasGererUtilisateurACreer' | 'emailExistant'

interface UtilisateurRepository extends GetUtilisateurRepository, AddUtilisateurRepository {}
