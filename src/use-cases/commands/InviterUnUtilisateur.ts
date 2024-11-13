import { AddUtilisateurRepository, FindUtilisateurRepository } from './shared/UtilisateurRepository'
import { TypologieRole } from '../../domain/Role'
import { Utilisateur, UtilisateurUid } from '../../domain/Utilisateur'
import { CommandHandler, ResultAsync } from '../CommandHandler'

export class InviterUnUtilisateur implements CommandHandler<InviterUnUtilisateurCommand> {
  readonly #repository: Repository
  readonly #emailGatewayFactory: EmailGatewayFactory

  constructor(repository: Repository, emailGatewayFactory: EmailGatewayFactory) {
    this.#repository = repository
    this.#emailGatewayFactory = emailGatewayFactory
  }

  async execute(command: InviterUnUtilisateurCommand): ResultAsync<InviterUnUtilisateurFailure> {
    const utilisateurCourant = await this.#repository.find(
      UtilisateurUid.from(command.uidUtilisateurCourant)
    )
    if (!utilisateurCourant) {
      return 'KO'
    }
    const utilisateurACreer = command.role
      ? Utilisateur.create(toUtilisateurParams(command as Required<InviterUnUtilisateurCommand>))
      : utilisateurCourant.duMemeRole(toUtilisateurDuMemeRoleParams(command))
    if (!utilisateurCourant.peutGerer(utilisateurACreer)) {
      return 'KO'
    }
    const isUtilisateurCreated = await this.#repository.add(utilisateurACreer)
    if (isUtilisateurCreated) {
      const emailGateway = this.#emailGatewayFactory(utilisateurCourant.state().isSuperAdmin)
      await emailGateway.send(command.email)
      return 'OK'
    }
    return 'emailExistant'
  }
}

export type InviterUnUtilisateurCommand = Readonly<{
  prenom: string
  nom: string
  email: string
  uidUtilisateurCourant: string
  role?: Readonly<{
    type: TypologieRole
    organisation?: string
  }>
}>

export interface EmailGateway {
  send: (destinataire: string) => Promise<void>
}

export type InviterUnUtilisateurFailure = 'KO' | 'emailExistant'

interface Repository extends FindUtilisateurRepository, AddUtilisateurRepository {}

type EmailGatewayFactory = (isSuperAdmin: boolean) => EmailGateway

type UtilisateurCreateParam = Parameters<typeof Utilisateur.create>[0]

type UtilisateurDuMemeRoleParam = Parameters<typeof Utilisateur.prototype.duMemeRole>[0]

function toUtilisateurParams(
  command: Required<InviterUnUtilisateurCommand>
): UtilisateurCreateParam {
  return {
    ...toUtilisateurDuMemeRoleParams(command),
    organisation: command.role.organisation,
    role: command.role.type,
  }
}

function toUtilisateurDuMemeRoleParams(
  command: InviterUnUtilisateurCommand
): UtilisateurDuMemeRoleParam {
  return {
    email: command.email,
    isSuperAdmin: false,
    nom: command.nom,
    prenom: command.prenom,
    uid: command.email,
  }
}
