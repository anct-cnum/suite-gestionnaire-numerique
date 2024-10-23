import { InviterUnUtilisateur } from './InviterUnUtilisateur'
import { AddUtilisateurRepository } from './shared/UtilisateurRepository'
import { TypologieRole } from '@/domain/Role'
import { Utilisateur } from '@/domain/Utilisateur'

describe('inviter un utilisateur', () => {
  afterEach(() => {
    spiedUidToFind = ''
    spiedUtilisateurToAdd = null
  })
  it('étant donné que l’utilisateur courant peut gérer l’utilisateur à inviter, quand il l’invite, celui-ci est enregistré', async () => {
    // GIVEN
    const repository = new RepositorySpy()
    const inviterUnUtilisateur = new InviterUnUtilisateur(repository)
    const roleUtilisateurAInviter: TypologieRole = 'Instructeur'
    const command = {
      email: 'martin.tartempion@example.com',
      nom: 'Tartempion',
      prenom: 'Martin',
      role: roleUtilisateurAInviter,
      uidUtilisateurCourant: 'utilisateurAdminUid',
    }

    // WHEN
    const result = await inviterUnUtilisateur.execute(command)

    // THEN
    expect(result).toBe('OK')
    expect(spiedUidToFind).toBe('utilisateurAdminUid')
    const utilisateurACreer = Utilisateur.create({
      email: 'martin.tartempion@example.com',
      isSuperAdmin: false,
      nom: 'Tartempion',
      prenom: 'Martin',
      role: 'Instructeur' as TypologieRole,
      uid: 'martin.tartempion@example.com',
    })
    expect(spiedUtilisateurToAdd?.equals(utilisateurACreer)).toBe(true)
  })

  it('étant donné que l’utilisateur courant ne peut pas gérer l’utilisateur à inviter, quand il l’invite, alors il y a une erreur', async () => {
    // GIVEN
    const repository = new RepositorySpy()
    const inviterUnUtilisateur = new InviterUnUtilisateur(repository)
    const roleUtilisateurAInviter: TypologieRole = 'Instructeur'
    const command = {
      email: 'martin.tartempion@example.com',
      nom: 'Tartempion',
      prenom: 'Martin',
      role: roleUtilisateurAInviter,
      uidUtilisateurCourant: 'utilisateurGestionnaireUid',
    }

    // WHEN
    const result = await inviterUnUtilisateur.execute(command)

    // THEN
    expect(result).toBe('KO')
    expect(spiedUidToFind).toBe('utilisateurGestionnaireUid')
    expect(spiedUtilisateurToAdd).toBeNull()
  })

  it('étant donné que le compte de l’utilisateur courant n’existe plus, quand il invite un autre utilisateur, alors il y a une erreur', async () => {
    // GIVEN
    const repository = new RepositorySpy()
    const inviterUnUtilisateur = new InviterUnUtilisateur(repository)
    const roleUtilisateurAInviter: TypologieRole = 'Instructeur'
    const command = {
      email: 'martin.tartempion@example.com',
      nom: 'Tartempion',
      prenom: 'Martin',
      role: roleUtilisateurAInviter,
      uidUtilisateurCourant: 'utilisateurInexistantUid',
    }

    // WHEN
    const result = await inviterUnUtilisateur.execute(command)

    // THEN
    expect(result).toBe('KO')
    expect(spiedUidToFind).toBe('utilisateurInexistantUid')
    expect(spiedUtilisateurToAdd).toBeNull()
  })

  it('étant donné que l’utilisateur à inviter existe déjà, quand l’utilisateur courant l’invite, alors il y a une erreur', async () => {
    // GIVEN
    const repository = new RepositoryUtilisateurExisteDejaSpy()
    const inviterUnUtilisateur = new InviterUnUtilisateur(repository)
    const roleUtilisateurAInviter: TypologieRole = 'Instructeur'
    const command = {
      email: 'martin.tartempion@example.net',
      nom: 'Tartempion',
      prenom: 'Martin',
      role: roleUtilisateurAInviter,
      uidUtilisateurCourant: 'utilisateurAdminUid',
    }

    // WHEN
    const result = await inviterUnUtilisateur.execute(command)

    // THEN
    expect(result).toBe('emailExistant')
    expect(spiedUidToFind).toBe('utilisateurAdminUid')
    const utilisateurACreer = Utilisateur.create({
      email: 'martin.tartempion@example.net',
      isSuperAdmin: false,
      nom: 'Tartempion',
      prenom: 'Martin',
      role: 'Instructeur' as TypologieRole,
      uid: 'martin.tartempion@example.net',
    })
    expect(spiedUtilisateurToAdd?.equals(utilisateurACreer)).toBe(true)
  })
})

const utilisateursByUid: Readonly<Record<string, Utilisateur>> = {
  utilisateurAdminUid: Utilisateur.create({
    email: 'martin.tartempion@example.net',
    isSuperAdmin: false,
    nom: 'Tartempion',
    prenom: 'Martin',
    role: 'Instructeur',
    uid: 'utilisateurAdminUid',
  }),
  utilisateurGestionnaireUid: Utilisateur.create({
    email: 'martina.tartempion@example.net',
    isSuperAdmin: false,
    nom: 'Tartempion',
    prenom: 'Martine',
    role: 'Gestionnaire région',
    uid: 'utilisateurGestionnaireUid',
  }),
}

let spiedUidToFind = ''
let spiedUtilisateurToAdd: Utilisateur | null = null

class RepositorySpy implements AddUtilisateurRepository {
  async find(uid: string): Promise<Utilisateur | null> {
    spiedUidToFind = uid
    return Promise.resolve(utilisateursByUid[uid])
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
