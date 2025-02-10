import { DropUtilisateurRepository, GetUtilisateurRepository } from './shared/UtilisateurRepository'
import { SupprimerUnUtilisateur } from './SupprimerUnUtilisateur'
import { utilisateurFactory } from '@/domain/testHelper'
import { Utilisateur, UtilisateurUid, UtilisateurUidState } from '@/domain/Utilisateur'

describe('supprimer un utilisateur', () => {
  beforeEach(() => {
    spiedUidsToFind.splice(0, spiedUidsToFind.length)
    spiedUtilisateurToDrop = null
  })

  it('l’utilisateur courant n’est pas autorisé à supprimer l’utilisateur qu’il souhaite supprimer : échec de suppression', async () => {
    // GIVEN
    const supprimerUnUtilisateur = new SupprimerUnUtilisateur(new UtilisateurRepositorySpy())

    // WHEN
    const result = await supprimerUnUtilisateur.handle({
      uidUtilisateurASupprimer: 'utilisateurASupprimerExistantUid',
      uidUtilisateurCourant: 'utilisateurCourantExistantUid',
    })

    // THEN
    expect(spiedUtilisateurToDrop).toBeNull()
    expect(result).toBe('suppressionNonAutorisee')
  })

  it('l’utilisateur courant est autorisé à supprimer celui qu’il souhaite supprimer, mais ce dernier a été supprimé'
    + ' entre-temps : échec de la suppression', async () => {
    // GIVEN
    const commandHandler = new SupprimerUnUtilisateur(new UtilisateursSuppressionConcurrenteRepositorySpy())

    // WHEN
    const result = await commandHandler.handle({
      uidUtilisateurASupprimer: 'utilisateurASupprimerExistantUid',
      uidUtilisateurCourant: 'utilisateurCourantExistantAutreUid',
    })

    // THEN
    expect(spiedUtilisateurToDrop).not.toBeNull()
    expect(spiedUtilisateurToDrop?.state).toStrictEqual(utilisateursByUid.utilisateurASupprimerExistantUid.state)
    expect(result).toBe('compteASupprimerDejaSupprime')
  })

  it('l’utilisateur courant est autorisé à supprimer celui qu’il souhaite supprimer, qui n’a pas été supprimé'
    + ' entre-temps : succès de la suppression', async () => {
    // GIVEN
    const commandHandler = new SupprimerUnUtilisateur(new UtilisateurRepositorySpy())

    // WHEN
    const result = await commandHandler.handle({
      uidUtilisateurASupprimer: 'utilisateurASupprimerExistantUid',
      uidUtilisateurCourant: 'utilisateurCourantExistantAutreUid',
    })

    // THEN
    expect(spiedUidsToFind).toStrictEqual([
      'utilisateurCourantExistantAutreUid',
      'utilisateurASupprimerExistantUid',
    ])
    expect(spiedUtilisateurToDrop?.state).toStrictEqual(utilisateursByUid.utilisateurASupprimerExistantUid.state)
    expect(result).toBe('OK')
  })
})

const utilisateursByUid: Readonly<Record<string, Utilisateur>> = {
  utilisateurASupprimerExistantUid: utilisateurFactory({
    role: 'Instructeur',
    uid: { email: 'martin.tartempion@example.com', value: 'utilisateurASupprimerExistantUid' },
  }),
  utilisateurCourantExistantAutreUid: utilisateurFactory({
    role: 'Administrateur dispositif',
    uid: { email: 'martin.tartempion@example.com', value: 'utilisateurCourantExistantAutreUid' },
  }),
  utilisateurCourantExistantUid: utilisateurFactory({
    role: 'Gestionnaire département',
    uid: { email: 'martin.tartempion@example.com', value: 'utilisateurCourantExistantUid' },
  }),
}

const spiedUidsToFind: Array<string> = []
let spiedUtilisateurToDrop: Utilisateur | null

class UtilisateurRepositorySpy implements GetUtilisateurRepository, DropUtilisateurRepository {
  async get(uid: UtilisateurUidState['value']): Promise<Utilisateur> {
    spiedUidsToFind.push(uid)
    return Promise.resolve(utilisateursByUid[uid])
  }

  async drop(utilisateur: Utilisateur | UtilisateurUid): Promise<boolean> {
    spiedUtilisateurToDrop = utilisateur as Utilisateur
    return Promise.resolve(Boolean(utilisateur))
  }
}

class UtilisateursSuppressionConcurrenteRepositorySpy extends UtilisateurRepositorySpy {
  override async drop(utilisateur: Utilisateur | UtilisateurUid): Promise<boolean> {
    return super.drop(utilisateur).then(() => false)
  }
}
