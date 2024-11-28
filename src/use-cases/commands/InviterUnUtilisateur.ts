import { AddUtilisateurRepository, FindUtilisateurRepository } from './shared/UtilisateurRepository'
import { TypologieRole } from '../../domain/Role'
import { UtilisateurUid } from '../../domain/Utilisateur'
import { CommandHandler, ResultAsync } from '../CommandHandler'
import { EmailGatewayFactory } from './shared/EmailGateway'
import { UtilisateurFactory } from '@/domain/UtilisateurFactory'

export class InviterUnUtilisateur implements CommandHandler<InviterUnUtilisateurCommand> {
  readonly #repository: Repository
  readonly #emailGatewayFactory: EmailGatewayFactory
  readonly #date: Date

  constructor(
    repository: Repository,
    emailGatewayFactory: EmailGatewayFactory,
    date: Date = new Date()
  ) {
    this.#repository = repository
    this.#emailGatewayFactory = emailGatewayFactory
    this.#date = date
  }

  async execute(command: InviterUnUtilisateurCommand): ResultAsync<InviterUnUtilisateurFailure> {
    const utilisateurCourant = await this.#repository.find(
      UtilisateurUid.from(command.uidUtilisateurCourant)
    )
    if (!utilisateurCourant) {
      return 'KO'
    }
    const utilisateurCourantState = utilisateurCourant.state()
    const utilisateurACreer = new UtilisateurFactory({
      departement: utilisateurCourantState.departement,
      emailDeContact: command.emailDeContact,
      groupementUid: utilisateurCourantState.groupementUid?.value,
      inviteLe: this.#date,
      isSuperAdmin: utilisateurCourantState.isSuperAdmin,
      nom: command.nom,
      prenom: command.prenom,
      region: utilisateurCourantState.region,
      structureUid: utilisateurCourantState.structureUid?.value,
      telephone: '',
      uid: command.emailDeContact,
    }).create(
      command.role?.type ?? utilisateurCourantState.role.nom,
      command.role?.codeOrganisation
    )
    if (!utilisateurCourant.peutGerer(utilisateurACreer)) {
      return 'KO'
    }
    const isUtilisateurCreated = await this.#repository.add(utilisateurACreer)
    if (isUtilisateurCreated) {
      const emailGateway = this.#emailGatewayFactory(utilisateurCourant.state().isSuperAdmin)
      await emailGateway.send(command.emailDeContact)
      return 'OK'
    }
    return 'emailExistant'
  }
}

export type InviterUnUtilisateurCommand = Readonly<{
  prenom: string
  nom: string
  emailDeContact: string
  uidUtilisateurCourant: string
  role?: Readonly<{
    type: TypologieRole
    codeOrganisation?: string
  }>
}>

export type InviterUnUtilisateurFailure = 'KO' | 'emailExistant'

interface Repository extends FindUtilisateurRepository, AddUtilisateurRepository {}
