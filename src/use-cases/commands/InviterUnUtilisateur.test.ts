import { InviterUnUtilisateur, InviterUnUtilisateurCommand } from './InviterUnUtilisateur'
import { EmailGateway } from './shared/EmailGateway'
import { AddUtilisateurRepository, FindUtilisateurRepository } from './shared/UtilisateurRepository'
import { TypologieRole } from '../../domain/Role'
import { Utilisateur, UtilisateurUid } from '../../domain/Utilisateur'
import { utilisateurFactory } from '@/domain/testHelper'

describe('inviter un utilisateur', () => {
  beforeEach(() => {
    spiedUidToFind = ''
    spiedUtilisateurToAdd = null
    spiedDestinataire = ''
    spiedIsSuperAdmin = null
  })

  describe('étant donné que l’utilisateur courant peut gérer l’utilisateur à inviter', () => {
    it.each([
      {
        desc:
          'qu’il est super admin, qu’il a un rôle admin et invite un admin, quand il l’invite, alors celui-ci est' +
          ' enregistré avec un compte super admin et un rôle admin choisi par l’utilisateur courant',
        utilisateurAInviter: {
          role: 'Instructeur' as const,
        },
        utilisateurCourant: {
          isSuperAdmin: true,
          role: 'Support animation' as const,
          uid: 'utilisateurAdminUid',
        },
      },
      {
        desc:
          'qu’il est super admin, qu’il a un rôle admin et invite un gestionnaire, quand il l’invite, alors celui-ci' +
          ' est enregistré avec un compte super admin, un rôle gestionnaire et une organisation choisis par l’' +
          ' utilisateur courant',
        utilisateurAInviter: {
          codeOrganisation: '15',
          role: 'Gestionnaire groupement' as const,
        },
        utilisateurCourant: {
          isSuperAdmin: true,
          role: 'Support animation' as const,
          uid: 'utilisateurAdminUid',
        },
      },
      {
        desc:
          'qu’il est super admin, qu’il a un rôle gestionnaire et invite un gestionnaire, quand il l’invite, alors' +
          ' celui-ci est enregistré avec un compte super admin, un rôle et une organisation identiques à ceux de' +
          ' l’utilisateur courant',
        utilisateurAInviter: {
          codeOrganisation: '53',
          role: 'Gestionnaire région' as const,
        },
        utilisateurCourant: {
          codeOrganisation: '53',
          isSuperAdmin: true,
          role: 'Gestionnaire région' as const,
          uid: 'utilisateurGestionnaireUid',
        },
      },
      {
        desc:
          'qu’il n’est pas super admin, qu’il a un rôle admin et invite un admin, quand il l’invite, alors celui-ci' +
          ' est enregistré avec un compte ordinaire et un rôle admin choisi par l’utilisateur courant',
        utilisateurAInviter: {
          role: 'Instructeur' as const,
        },
        utilisateurCourant: {
          isSuperAdmin: false,
          role: 'Support animation' as const,
          uid: 'utilisateurAdminUid',
        },
      },
      {
        desc:
          'qu’il n’est pas super admin, qu’il a un rôle admin et invite un gestionnaire, quand il l’invite, alors' +
          ' celui-ci est enregistré avec un compte ordinaire, un rôle gestionnaire et une organisation choisis par l’' +
          'utilisateur courant',
        utilisateurAInviter: {
          codeOrganisation: '15',
          role: 'Gestionnaire groupement' as const,
        },
        utilisateurCourant: {
          isSuperAdmin: false,
          role: 'Support animation' as const,
          uid: 'utilisateurAdminUid',
        },
      },
      {
        desc:
          'qu’il n’est pas super admin, qu’il a un rôle gestionnaire et invite un gestionnaire, quand il l’invite,' +
          ' alors celui-ci est enregistré avec un compte ordinaire, un rôle et une organisation identiques à ceux de' +
          ' l’utilisateur courant',
        utilisateurAInviter: {
          codeOrganisation: '53',
          role: 'Gestionnaire région' as const,
        },
        utilisateurCourant: {
          codeOrganisation: '53',
          isSuperAdmin: false,
          role: 'Gestionnaire région' as const,
          uid: 'utilisateurGestionnaireUid',
        },
      },
    ])(
      '$desc puis un e-mail lui est envoyé',
      async ({ utilisateurCourant, utilisateurAInviter }) => {
        // GIVEN
        const date = new Date('2024-01-01')
        const command = inviterUnUtilisateurCommandFactory({
          role: {
            codeOrganisation: utilisateurAInviter.codeOrganisation,
            type: utilisateurAInviter.role,
          },
          uidUtilisateurCourant: utilisateurCourant.uid,
        })
        const repository = new RepositorySpy(
          utilisateurFactory({
            codeOrganisation: utilisateurCourant.codeOrganisation,
            inviteLe: date,
            isSuperAdmin: utilisateurCourant.isSuperAdmin,
            role: utilisateurCourant.role,
          })
        )
        const inviterUnUtilisateur = new InviterUnUtilisateur(
          repository,
          emailGatewayFactorySpy,
          date
        )

        // WHEN
        const result = await inviterUnUtilisateur.execute(command)

        // THEN
        const expectedUtilisateurInvite = utilisateurFactory({
          codeOrganisation: utilisateurAInviter.codeOrganisation,
          email: 'martine.dugenoux@example.com',
          inviteLe: date,
          isSuperAdmin: utilisateurCourant.isSuperAdmin,
          nom: 'Dugenoux',
          prenom: 'Martine',
          role: utilisateurAInviter.role,
          telephone: '',
          uid: 'martine.dugenoux@example.com',
        })
        expect(result).toBe('OK')
        expect(spiedUidToFind).toBe(command.uidUtilisateurCourant)
        expect(spiedUtilisateurToAdd?.state()).toStrictEqual(expectedUtilisateurInvite.state())
        expect(spiedDestinataire).toBe('martine.dugenoux@example.com')
        expect(spiedIsSuperAdmin).toBe(utilisateurCourant.isSuperAdmin)
      }
    )
  })

  it('étant donné que l’utilisateur courant ne peut pas gérer l’utilisateur à inviter, quand il l’invite, alors il y a une erreur', async () => {
    // GIVEN
    const repository = new RepositorySpy(utilisateurFactory({ role: 'Gestionnaire structure' }))
    const emailGatewayFactory = emailGatewayFactorySpy
    const inviterUnUtilisateur = new InviterUnUtilisateur(repository, emailGatewayFactory)
    const roleUtilisateurAInviter: TypologieRole = 'Instructeur'
    const command = {
      email: 'martin.tartempion@example.net',
      nom: 'Tartempion',
      prenom: 'Martin',
      role: { type: roleUtilisateurAInviter },
      uidUtilisateurCourant: 'utilisateurGestionnaireUid',
    }

    // WHEN
    const result = await inviterUnUtilisateur.execute(command)

    // THEN
    expect(result).toBe('KO')
    expect(spiedUidToFind).toBe('utilisateurGestionnaireUid')
    expect(spiedUtilisateurToAdd).toBeNull()
    expect(spiedDestinataire).toBe('')
    expect(spiedIsSuperAdmin).toBeNull()
  })

  it('étant donné que le compte de l’utilisateur courant n’existe plus, quand il invite un autre utilisateur, alors il y a une erreur', async () => {
    // GIVEN
    const repository = new RepositorySpy(null)
    const emailGatewayFactory = emailGatewayFactorySpy
    const inviterUnUtilisateur = new InviterUnUtilisateur(repository, emailGatewayFactory)
    const roleUtilisateurAInviter: TypologieRole = 'Instructeur'
    const command = {
      email: 'martin.tartempion@example.net',
      nom: 'Tartempion',
      prenom: 'Martin',
      role: { type: roleUtilisateurAInviter },
      uidUtilisateurCourant: 'utilisateurInexistantUid',
    }

    // WHEN
    const result = await inviterUnUtilisateur.execute(command)

    // THEN
    expect(result).toBe('KO')
    expect(spiedUidToFind).toBe('utilisateurInexistantUid')
    expect(spiedUtilisateurToAdd).toBeNull()
    expect(spiedDestinataire).toBe('')
    expect(spiedIsSuperAdmin).toBeNull()
  })

  it('étant donné que l’utilisateur à inviter existe déjà, quand l’utilisateur courant l’invite, alors il y a une erreur', async () => {
    // GIVEN
    const date = new Date('2024-01-01')
    const utilisateurACreer = utilisateurFactory({
      inviteLe: date,
      telephone: '',
      uid: 'martin.tartempion@example.net',
    })
    const repository = new RepositoryUtilisateurAInviterExisteDejaSpy(utilisateurACreer)
    const emailGatewayFactory = emailGatewayFactorySpy
    const inviterUnUtilisateur = new InviterUnUtilisateur(repository, emailGatewayFactory, date)
    const roleUtilisateurAInviter: TypologieRole = 'Instructeur'
    const command = {
      email: 'martin.tartempion@example.net',
      nom: 'Tartempion',
      prenom: 'Martin',
      role: { type: roleUtilisateurAInviter },
      uidUtilisateurCourant: 'utilisateurAdminUid',
    }

    // WHEN
    const result = await inviterUnUtilisateur.execute(command)

    // THEN
    expect(result).toBe('emailExistant')
    expect(spiedUidToFind).toBe('utilisateurAdminUid')
    expect(spiedUtilisateurToAdd?.state()).toStrictEqual(utilisateurACreer.state())
    expect(spiedDestinataire).toBe('')
    expect(spiedIsSuperAdmin).toBeNull()
  })
})

let spiedUidToFind: string
let spiedUtilisateurToAdd: Utilisateur | null
let spiedDestinataire: string
let spiedIsSuperAdmin: boolean | null

class RepositorySpy implements AddUtilisateurRepository, FindUtilisateurRepository {
  readonly #utilisateurCourant: Utilisateur | null

  constructor(utilisateurCourant: Utilisateur | null) {
    this.#utilisateurCourant = utilisateurCourant
  }

  async find(uid: UtilisateurUid): Promise<Utilisateur | null> {
    spiedUidToFind = uid.state().value
    return Promise.resolve(this.#utilisateurCourant)
  }

  async add(utilisateur: Utilisateur): Promise<boolean> {
    spiedUtilisateurToAdd = utilisateur
    return Promise.resolve(true)
  }
}

class RepositoryUtilisateurAInviterExisteDejaSpy extends RepositorySpy {
  override async add(utilisateur: Utilisateur): Promise<boolean> {
    spiedUtilisateurToAdd = utilisateur
    return Promise.resolve(false)
  }
}

function emailGatewayFactorySpy(isSuperAdmin: boolean): EmailGateway {
  spiedIsSuperAdmin = isSuperAdmin
  return new (class implements EmailGateway {
    async send(destinataire: string): Promise<void> {
      spiedDestinataire = destinataire
      return Promise.resolve()
    }
  })()
}

function inviterUnUtilisateurCommandFactory(
  override: Readonly<Partial<InviterUnUtilisateurCommand>>
): InviterUnUtilisateurCommand {
  return {
    email: 'martine.dugenoux@example.com',
    nom: 'Dugenoux',
    prenom: 'Martine',
    uidUtilisateurCourant: 'utilisateurAdminUid',
    ...override,
  }
}
