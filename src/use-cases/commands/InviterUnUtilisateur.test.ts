import { EmailGateway, InviterUnUtilisateur } from './InviterUnUtilisateur'
import { AddUtilisateurRepository, FindUtilisateurRepository } from './shared/UtilisateurRepository'
import { TypologieRole } from '../../domain/Role'
import { Utilisateur, UtilisateurUid } from '../../domain/Utilisateur'
import { utilisateurFactory } from '@/domain/testHelper'

describe('inviter un utilisateur', () => {
  afterEach(() => {
    spiedUidToFind = ''
    spiedUtilisateurToAdd = null
    spiedDestinataire = ''
    spiedIsSuperAdmin = null
  })

  describe('étant donné que l’utilisateur courant peut gérer l’utilisateur à inviter, quand il l’invite, celui-ci est enregistré et un e-mail lui est envoyé', () => {
    it.each([
      {
        command: {
          email: 'martin.tartempion@example.com',
          nom: 'Tartempion',
          prenom: 'Martin',
          role: {
            organisation: 'HubEst',
            type: 'Gestionnaire groupement' as const,
          },
          uidUtilisateurCourant: 'utilisateurAdminUid',
        },
        desc: 'le rôle ainsi que l’organisation sont mentionnées',
        utilisateurACreer: {
          email: 'martin.tartempion@example.com',
          isSuperAdmin: false,
          nom: 'Tartempion',
          organisation: 'HubEst',
          prenom: 'Martin',
          role: 'Gestionnaire groupement' as const,
          uid: 'martin.tartempion@example.com',
        },
      },
      {
        command: {
          email: 'martin.tartempion@example.com',
          nom: 'Tartempion',
          prenom: 'Martin',
          role: {
            type: 'Instructeur' as const,
          },
          uidUtilisateurCourant: 'utilisateurAdminUid',
        },
        desc: 'le rôle seul est mentionné',
        utilisateurACreer: {
          email: 'martin.tartempion@example.com',
          isSuperAdmin: false,
          nom: 'Tartempion',
          prenom: 'Martin',
          role: 'Instructeur' as const,
          uid: 'martin.tartempion@example.com',
        },
      },
      {
        command: {
          email: 'martin.tartempion@example.com',
          nom: 'Tartempion',
          prenom: 'Martin',
          uidUtilisateurCourant: 'utilisateurGestionnaireUid',
        },
        desc: 'ni le rôle ni l’organisation ne sont mentionnées : on prend ceux de l’utilisateur courant',
        utilisateurACreer: {
          email: 'martin.tartempion@example.com',
          isSuperAdmin: false,
          nom: 'Tartempion',
          organisation: 'Bretagne',
          prenom: 'Martin',
          role: 'Gestionnaire région' as const,
          uid: 'martin.tartempion@example.com',
        },
      },
    ])('$desc', async ({ command, utilisateurACreer }) => {
      // GIVEN
      const repository = new RepositorySpy()
      const emailGatewayFactory = emailGatewayFactorySpy
      const inviterUnUtilisateur = new InviterUnUtilisateur(repository, emailGatewayFactory)

      // WHEN
      const result = await inviterUnUtilisateur.execute(command)

      // THEN
      expect(result).toBe('OK')
      expect(spiedUtilisateurToAdd?.equals(Utilisateur.create(utilisateurACreer))).toBe(true)
      expect(spiedDestinataire).toBe('martin.tartempion@example.com')
      expect(spiedIsSuperAdmin).toBe(false)
    })

    it('un e-mail est envoyé à l’utilisateur', async () => {
      // GIVEN
      const command = {
        email: 'martin.tartempion@example.com',
        nom: 'Tartempion',
        prenom: 'Martin',
        uidUtilisateurCourant: 'utilisateurGestionnaireUid',
      }
      const repository = new RepositoryDummy()
      const emailGatewayFactory = emailGatewayFactorySpy
      const inviterUnUtilisateur = new InviterUnUtilisateur(repository, emailGatewayFactory)

      // WHEN
      await inviterUnUtilisateur.execute(command)

      // THEN
      expect(spiedDestinataire).toBe('martin.tartempion@example.com')
      expect(spiedIsSuperAdmin).toBe(false)
    })
  })

  it('étant donné que l’utilisateur courant ne peut pas gérer l’utilisateur à inviter, quand il l’invite, alors il y a une erreur', async () => {
    // GIVEN
    const repository = new RepositorySpy()
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
    const repository = new RepositorySpy()
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
    const repository = new RepositoryUtilisateurExisteDejaSpy()
    const emailGatewayFactory = emailGatewayFactorySpy
    const inviterUnUtilisateur = new InviterUnUtilisateur(repository, emailGatewayFactory)
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
    const utilisateurACreer = utilisateurFactory({
      telephone: '',
      uid: 'martin.tartempion@example.net',
    })
    expect(spiedUtilisateurToAdd?.equals(utilisateurACreer)).toBe(true)
    expect(spiedDestinataire).toBe('')
    expect(spiedIsSuperAdmin).toBeNull()
  })
})

const utilisateursByUid: Readonly<Record<string, Utilisateur>> = {
  utilisateurAdminUid: utilisateurFactory({
    uid: 'utilisateurAdminUid',
  }),
  utilisateurGestionnaireUid: utilisateurFactory({
    email: 'martina.tartempion@example.net',
    organisation: 'Bretagne',
    prenom: 'Martine',
    role: 'Gestionnaire région',
    uid: 'utilisateurGestionnaireUid',
  }),
}

let spiedUidToFind = ''
let spiedUtilisateurToAdd: Utilisateur | null = null
let spiedDestinataire = ''
let spiedIsSuperAdmin: boolean | null = null

class RepositorySpy implements AddUtilisateurRepository {
  async find(uid: UtilisateurUid): Promise<Utilisateur | null> {
    const uidValue = uid.state().value
    spiedUidToFind = uidValue
    return Promise.resolve(utilisateursByUid[uidValue])
  }
  async add(utilisateur: Utilisateur): Promise<boolean> {
    spiedUtilisateurToAdd = utilisateur
    return Promise.resolve(true)
  }
}

class RepositoryUtilisateurExisteDejaSpy extends RepositorySpy {
  override async add(utilisateur: Utilisateur): Promise<boolean> {
    spiedUtilisateurToAdd = utilisateur
    return Promise.resolve(false)
  }
}

class RepositoryDummy implements AddUtilisateurRepository, FindUtilisateurRepository {
  async find(uid: UtilisateurUid): Promise<Utilisateur | null> {
    const uidValue = uid.state().value
    return Promise.resolve(utilisateursByUid[uidValue])
  }

  async add(): Promise<boolean> {
    return Promise.resolve(true)
  }
}

function emailGatewayFactorySpy(isSuperAdmin: boolean): EmailGateway {
  spiedIsSuperAdmin = isSuperAdmin
  return new class implements EmailGateway {
    async send(destinataire: string): Promise<void> {
      spiedDestinataire = destinataire
      return Promise.resolve()
    }
  }()
}
