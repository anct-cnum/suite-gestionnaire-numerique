import { InviterUnUtilisateur } from './InviterUnUtilisateur'
import { AddUtilisateurRepository } from './shared/UtilisateurRepository'
import { TypologieRole } from '@/domain/Role'
import { utilisateurFactory } from '@/domain/testHelper'
import { Utilisateur } from '@/domain/Utilisateur'

describe('inviter un utilisateur', () => {
  afterEach(() => {
    spiedUidToFind = ''
    spiedUtilisateurToReinvite = null
  })

  describe('étant donné que l’utilisateur courant peut gérer l’utilisateur à inviter, quand il l’invite, le champ "inviteLe se met à jour"', () => {
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
        utilisateurAMettreAJour: {
          email: 'martin.tartempion@example.com',
          inviteLe: new Date('2024-02-12'),
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
        utilisateurAMettreAJour: {
          email: 'martin.tartempion@example.com',
          inviteLe: new Date('2024-02-12'),
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
        utilisateurAMettreAJour: {
          email: 'martin.tartempion@example.com',
          inviteLe: new Date('2024-02-12'),
          isSuperAdmin: false,
          nom: 'Tartempion',
          organisation: 'Bretagne',
          prenom: 'Martin',
          role: 'Gestionnaire région' as const,
          uid: 'martin.tartempion@example.com',
        },
      },
    ])('$desc', async ({ command, utilisateurAMettreAJour }) => {
      // GIVEN
      const repository = new RepositorySpy()
      const inviterUnUtilisateur = new InviterUnUtilisateur(repository)

      // WHEN
      const result = await inviterUnUtilisateur.execute(command)

      // THEN
      expect(result).toBe('OK')
      expect(spiedUtilisateurToReinvite?.equals(Utilisateur.create(utilisateurAMettreAJour))).toBe(true)
    })
  })

  it('étant donné que l’utilisateur courant ne peut pas gérer l’utilisateur à inviter, quand il le reinvite, alors il y a une erreur', async () => {
    // GIVEN
    const repository = new RepositorySpy()
    const inviterUnUtilisateur = new InviterUnUtilisateur(repository)
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
    expect(spiedUtilisateurToReinvite).toBeNull()
  })

  it('étant donné que le compte de l’utilisateur courant n’existe plus, quand il reinvite un autre utilisateur, alors il y a une erreur', async () => {
    // GIVEN
    const repository = new RepositorySpy()
    const inviterUnUtilisateur = new InviterUnUtilisateur(repository)
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
    expect(spiedUtilisateurToReinvite).toBeNull()
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
let spiedUtilisateurToReinvite: Utilisateur | null = null

class RepositorySpy implements AddUtilisateurRepository {
  async find(uid: string): Promise<Utilisateur | null> {
    spiedUidToFind = uid
    return Promise.resolve(utilisateursByUid[uid])
  }
  async add(utilisateur: Utilisateur): Promise<boolean> {
    spiedUtilisateurToReinvite = utilisateur
    return Promise.resolve(true)
  }
}
