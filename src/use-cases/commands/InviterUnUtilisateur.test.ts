import { InviterUnUtilisateur } from './InviterUnUtilisateur'
import { AddUtilisateurRepository } from './shared/UtilisateurRepository'
import { TypologieRole } from '../../domain/Role'
import { Utilisateur } from '../../domain/Utilisateur'

describe('inviter un utilisateur', () => {
  afterEach(() => {
    spiedUidToFind = ''
    spiedUtilisateurToAdd = null
  })
  it('quand j’invite un utilisateur, il est enregistré', async () => {
    // GIVEN
    const repository = new RepositorySpy()
    const inviterUnUtilisateur = new InviterUnUtilisateur(repository)
    const command = {
      email: 'martin.tartempion@example.com',
      nom: 'Tartempion',
      prenom: 'Martin',
      role: 'Instructeur' as TypologieRole,
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

  it('quand j’invite un utilisateur et que je n’ai pas le droit de l’inviter, alors il y a une erreur', async () => {
    // GIVEN
    const repository = new RepositorySpy()
    const inviterUnUtilisateur = new InviterUnUtilisateur(repository)
    const command = {
      email: 'martin.tartempion@example.com',
      nom: 'Tartempion',
      prenom: 'Martin',
      role: 'Instructeur' as TypologieRole,
      uidUtilisateurCourant: 'utilisateurGestionnaireUid',
    }

    // WHEN
    const result = await inviterUnUtilisateur.execute(command)

    // THEN
    expect(result).toBe('KO')
    expect(spiedUidToFind).toBe('utilisateurGestionnaireUid')
    expect(spiedUtilisateurToAdd).toBeNull()
  })

  it('quand j’invite un utilisateur et que mon compte n’existe pas, alors il y a une erreur', async () => {
    // GIVEN
    const repository = new RepositorySpy()
    const inviterUnUtilisateur = new InviterUnUtilisateur(repository)
    const command = {
      email: 'martin.tartempion@example.com',
      nom: 'Tartempion',
      prenom: 'Martin',
      role: 'Instructeur' as const,
      uidUtilisateurCourant: 'utilisateurInexistantUid',
    }

    // WHEN
    const result = await inviterUnUtilisateur.execute(command)

    // THEN
    expect(result).toBe('KO')
    expect(spiedUidToFind).toBe('utilisateurInexistantUid')
    expect(spiedUtilisateurToAdd).toBeNull()
  })

  it('quand j’invite un utilisateur et qu’il existe déjà, alors il y a une erreur', async () => {
    // GIVEN
    const repository = new RepositoryUtilisateurExisteDejaSpy()
    const inviterUnUtilisateur = new InviterUnUtilisateur(repository)
    const command = {
      email: 'martin.tartempion@example.net',
      nom: 'Tartempion',
      prenom: 'Martin',
      role: 'Instructeur' as const,
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
    organisation: 'Banque des territoires',
    prenom: 'Martin',
    role: 'Instructeur',
    uid: 'utilisateurAdminUid',
  }),
  utilisateurGestionnaireUid: Utilisateur.create({
    email: 'martina.tartempion@example.net',
    isSuperAdmin: false,
    nom: 'Tartempion',
    organisation: 'Dispositif lambda',
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
