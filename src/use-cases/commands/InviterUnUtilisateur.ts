import { AddUtilisateurRepository, FindUtilisateurRepository } from './shared/UtilisateurRepository'
import { TypologieRole } from '../../domain/Role'
import { Utilisateur, UtilisateurUid } from '../../domain/Utilisateur'
import { CommandHandler, ResultAsync } from '../CommandHandler'
import { EmailGatewayFactory } from './shared/EmailGateway'

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
    const utilisateurACreer = this.#creerUtilisateurAInviter(command, utilisateurCourant)
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

  #creerUtilisateurAInviter(
    command: InviterUnUtilisateurCommand,
    utilisateurCourant: Utilisateur
  ): Utilisateur {
    const isSuperAdmin = utilisateurCourant.state().isSuperAdmin
    return command.role
      ? Utilisateur.create(
          this.#toUtilisateurParams(command as Required<InviterUnUtilisateurCommand>, isSuperAdmin)
        )
      : utilisateurCourant.duMemeRole(this.#toUtilisateurDuMemeRoleParams(command, isSuperAdmin))
  }
  #toUtilisateurParams(
    command: Required<InviterUnUtilisateurCommand>,
    isSuperAdmin: boolean
  ): UtilisateurCreateParam {
    return {
      ...this.#toUtilisateurDuMemeRoleParams(command, isSuperAdmin),
      codeOrganisation: command.role.codeOrganisation,
      role: command.role.type,
    }
  }

  #toUtilisateurDuMemeRoleParams(
    command: InviterUnUtilisateurCommand,
    isSuperAdmin: boolean
  ): UtilisateurDuMemeRoleParam {
    return {
      derniereConnexion: null,
      email: command.email,
      inviteLe: this.#date,
      isSuperAdmin,
      nom: command.nom,
      prenom: command.prenom,
      uid: command.email,
    }
  }
}

export type InviterUnUtilisateurCommand = Readonly<{
  prenom: string
  nom: string
  email: string
  uidUtilisateurCourant: string
  role?: Readonly<{
    type: TypologieRole
    codeOrganisation?: string
  }>
}>

export type InviterUnUtilisateurFailure = 'KO' | 'emailExistant'

interface Repository extends FindUtilisateurRepository, AddUtilisateurRepository {}

type UtilisateurCreateParam = Parameters<typeof Utilisateur.create>[0]

type UtilisateurDuMemeRoleParam = Parameters<typeof Utilisateur.prototype.duMemeRole>[0]
