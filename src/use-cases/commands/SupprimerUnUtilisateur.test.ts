import { DropUtilisateurRepository, FindUtilisateurRepository } from './shared/UtilisateurRepository'
import { SupprimerUnUtilisateur } from './SupprimerUnUtilisateur'
import { Utilisateur } from '@/domain/Utilisateur'

describe('supprimer un utilisateur', () => {
  afterEach(() => {
    spiedUidsToFind.splice(0, spiedUidsToFind.length)
    spiedUtilisateurToDrop = null
  })

  it('l’utilisateur courant n’existe pas : échec de suppression', async () => {
    // GIVEN
    const command = {
      utilisateurASupprimerUid: 'utilisateurASupprimerExistantUid',
      utilisateurCourantUid: 'utilisateurCourantInexistantUid',
    }
    const supprimerUnUtilisateur = new SupprimerUnUtilisateur(new UtilisateurRepositorySpy())

    // WHEN
    const result = await supprimerUnUtilisateur.execute(command)

    // THEN
    expect(spiedUidsToFind).toStrictEqual(['utilisateurCourantInexistantUid'])
    expect(spiedUtilisateurToDrop).toBeNull()
    expect(result).toBe('compteConnecteInexistant')
  })

  it('l’utilisateur à supprimer n’existe pas : échec de suppression', async () => {
    // GIVEN
    const command = {
      utilisateurASupprimerUid: 'utilisateurASupprimerInexistantUid',
      utilisateurCourantUid: 'utilisateurCourantExistantUid',
    }
    const supprimerUnUtilisateur = new SupprimerUnUtilisateur(new UtilisateurRepositorySpy())

    // WHEN
    const result = await supprimerUnUtilisateur.execute(command)

    // THEN
    expect(spiedUidsToFind).toStrictEqual(['utilisateurCourantExistantUid', 'utilisateurASupprimerInexistantUid'])
    expect(spiedUtilisateurToDrop).toBeNull()
    expect(result).toBe('compteASupprimerInexistant')
  })

  it('l’utilisateur courant n’est pas autorisé à supprimer l’utilisateur qu’il souhaite supprimer :'
    + ' échec de suppression', async () => {
    // GIVEN
    const command = {
      utilisateurASupprimerUid: 'utilisateurASupprimerExistantUid',
      utilisateurCourantUid: 'utilisateurCourantExistantUid',
    }
    const supprimerUnUtilisateur = new SupprimerUnUtilisateur(new UtilisateurRepositorySpy())

    // WHEN
    const result = await supprimerUnUtilisateur.execute(command)

    // THEN
    expect(spiedUidsToFind).toStrictEqual([
      'utilisateurCourantExistantUid',
      'utilisateurASupprimerExistantUid',
    ])
    expect(spiedUtilisateurToDrop).toBeNull()
    expect(result).toBe('suppressionNonAutorisee')
  })

  it('les deux utilisateurs existent et l’utilisateur courant est autorisé à supprimer celui qu’il souhaite' +
    ' supprimer, mais ce dernier a été supprimé entre-temps : échec de la suppression', async () => {
    // GIVEN
    const command = {
      utilisateurASupprimerUid: 'utilisateurASupprimerExistantUid',
      utilisateurCourantUid: 'utilisateurCourantExistantAutreUid',
    }
    const commandHandler = new SupprimerUnUtilisateur(new UtilisateursSuppressionConcurrenteRepositorySpy())

    // WHEN
    const result = await commandHandler.execute(command)

    // THEN
    expect(spiedUidsToFind).toStrictEqual([
      'utilisateurCourantExistantAutreUid',
      'utilisateurASupprimerExistantUid',
    ])
    expect(spiedUtilisateurToDrop).not.toBeNull()
    expect(spiedUtilisateurToDrop?.equals(utilisateursByUid.utilisateurASupprimerExistantUid)).toBe(true)
    expect(result).toBe('compteASupprimerDejaSupprime')
  })

  it('les deux utilisateurs existent et l’utilisateur courant est autorisé à supprimer celui qu’il souhaite' +
    ' supprimer, qui n’a pas été supprimé entre-temps : succès de la suppression', async () => {
    // GIVEN
    const command = {
      utilisateurASupprimerUid: 'utilisateurASupprimerExistantUid',
      utilisateurCourantUid: 'utilisateurCourantExistantAutreUid',
    }
    const commandHandler = new SupprimerUnUtilisateur(new UtilisateurRepositorySpy())

    // WHEN
    const result = await commandHandler.execute(command)

    // THEN
    expect(spiedUidsToFind).toStrictEqual([
      'utilisateurCourantExistantAutreUid',
      'utilisateurASupprimerExistantUid',
    ])
    expect(spiedUtilisateurToDrop?.equals(utilisateursByUid.utilisateurASupprimerExistantUid)).toBe(true)
    expect(result).toBe('OK')
  })
})

const utilisateursByUid: Readonly<Record<string, Utilisateur>> = {
  utilisateurASupprimerExistantUid: Utilisateur.create({
    email: 'martin.tartempion@example.net',
    isSuperAdmin: false,
    nom: 'Tartempion',
    organisation: 'Banque des territoires',
    prenom: 'Martin',
    role: 'Instructeur',
    uid: 'utilisateurASupprimerExistantUid',
  }),
  utilisateurCourantExistantAutreUid: Utilisateur.create({
    email: 'martina.tartempion@example.net',
    isSuperAdmin: false,
    nom: 'Tartempion',
    organisation: 'Dispositif lambda',
    prenom: 'Martine',
    role: 'Administrateur dispositif',
    uid: 'utilisateurCourantExistantAutreUid',
  }),
  utilisateurCourantExistantUid: Utilisateur.create({
    email: 'martine.tartempion@example.net',
    isSuperAdmin: false,
    nom: 'Tartempion',
    organisation: 'Rhône',
    prenom: 'Martina',
    role: 'Gestionnaire département',
    uid: 'utilisateurCourantExistantUid',
  }),
}

const spiedUidsToFind: Array<string> = []
let spiedUtilisateurToDrop: Utilisateur | null = null

class UtilisateurRepositorySpy implements FindUtilisateurRepository, DropUtilisateurRepository {
  async find(uid: string): Promise<Utilisateur | null> {
    spiedUidsToFind.push(uid)
    return Promise.resolve(utilisateursByUid[uid])
  }

  async drop(utilisateur: Utilisateur): Promise<boolean> {
    spiedUtilisateurToDrop = utilisateur
    return Promise.resolve(Boolean(utilisateur))
  }
}

class UtilisateursSuppressionConcurrenteRepositorySpy extends UtilisateurRepositorySpy {
  override async drop(utilisateur: Utilisateur): Promise<boolean> {
    return super.drop(utilisateur).then(() => false)
  }
}
