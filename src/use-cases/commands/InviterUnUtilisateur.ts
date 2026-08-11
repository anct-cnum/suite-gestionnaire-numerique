import { CommandHandler, ResultAsync } from '../CommandHandler'
import { EmailGatewayFactory } from './shared/EmailGateway'
import { AddUtilisateurRepository, GetUtilisateurRepository } from './shared/UtilisateurRepository'
import { TypologieRole } from '@/domain/Role'
import { UtilisateurState } from '@/domain/Utilisateur'
import { UtilisateurFactory } from '@/domain/UtilisateurFactory'

export interface StructurePrefectureDuDepartementLoader {
  structurePrefectureDuDepartement(codeDepartement: string): Promise<null | number>
}

export class InviterUnUtilisateur implements CommandHandler<Command> {
  readonly #date: Date
  readonly #emailGatewayFactory: EmailGatewayFactory
  readonly #structurePrefectureDuDepartementLoader: StructurePrefectureDuDepartementLoader
  readonly #utilisateurRepository: UtilisateurRepository

  constructor(
    utilisateurRepository: UtilisateurRepository,
    emailGatewayFactory: EmailGatewayFactory,
    date: Date,
    structurePrefectureDuDepartementLoader: StructurePrefectureDuDepartementLoader
  ) {
    this.#utilisateurRepository = utilisateurRepository
    this.#emailGatewayFactory = emailGatewayFactory
    this.#date = date
    this.#structurePrefectureDuDepartementLoader = structurePrefectureDuDepartementLoader
  }

  async handle(command: Command): ResultAsync<Failure> {
    const utilisateurCourant = await this.#utilisateurRepository.get(command.uidUtilisateurCourant)
    const utilisateurCourantState = utilisateurCourant.state
    const roleACreer = command.role?.type ?? utilisateurCourantState.role.nom
    const structureUid = await this.#structureUidPourInvitation(roleACreer, command, utilisateurCourantState)
    const utilisateurACreer = new UtilisateurFactory({
      departement: utilisateurCourantState.departement,
      emailDeContact: command.email,
      groupementUid: utilisateurCourantState.groupementUid?.value,
      inviteLe: this.#date,
      isBetaTesteur: false,
      isSuperAdmin: false,
      nom: command.nom,
      prenom: command.prenom,
      region: utilisateurCourantState.region,
      structureUid,
      telephone: '',
      // L'id interne est généré par la base à l'insertion : 0 = sentinelle « pas encore persisté »
      uid: { email: command.email, value: 0 },
    }).create(roleACreer, command.role?.codeOrganisation)

    if (!utilisateurCourant.peutGerer(utilisateurACreer)) {
      return 'utilisateurNePeutPasGererUtilisateurACreer'
    }

    const isUtilisateurCreeOuReactive = await this.#utilisateurRepository.add(utilisateurACreer)
    if (isUtilisateurCreeOuReactive) {
      const emailGateway = this.#emailGatewayFactory()
      await emailGateway.send({
        email: command.email,
        nom: command.nom,
        prenom: command.prenom,
      })
      return 'OK'
    }

    return 'emailExistant'
  }

  // Un gestionnaire département invité est rattaché à une structure : celle de son invitant
  // s'il est lui-même gestionnaire du département, sinon la préfecture du département
  // (structure du membre 'prefecture-<dept>' de la gouvernance).
  async #structureUidPourInvitation(
    roleACreer: TypologieRole,
    command: Command,
    utilisateurCourantState: UtilisateurState
  ): Promise<number | undefined> {
    if (roleACreer !== 'Gestionnaire département') {
      return utilisateurCourantState.structureUid?.value
    }

    const structureInvitant =
      utilisateurCourantState.role.nom === 'Gestionnaire département'
        ? utilisateurCourantState.structureUid?.value
        : undefined
    if (structureInvitant !== undefined) {
      return structureInvitant
    }

    const codeDepartement = command.role?.codeOrganisation ?? utilisateurCourantState.departement?.code
    if (codeDepartement === undefined || codeDepartement === '') {
      return undefined
    }

    return (
      (await this.#structurePrefectureDuDepartementLoader.structurePrefectureDuDepartement(codeDepartement)) ??
      undefined
    )
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
  uidUtilisateurCourant: number
}>

type Failure = 'emailExistant' | 'utilisateurNePeutPasGererUtilisateurACreer'

interface UtilisateurRepository extends AddUtilisateurRepository, GetUtilisateurRepository {}
