import { MettreAJourUidALaPremiereConnexion } from './MettreAJourUidALaPremiereConnexion'
import { FindUtilisateurRepository, UpdateUtilisateurUidRepository } from './shared/UtilisateurRepository'
import { utilisateurFactory } from '@/domain/testHelper'
import { Utilisateur, UtilisateurUidState } from '@/domain/Utilisateur'

describe('mettre à jour l’identifiant unique à la première connexion', () => {
  beforeEach(() => {
    spiedUidToFind = null
    spiedUtilisateurToUpdate = null
  })

  it('quand l’utilisateur se connecte pour la première fois, alors l’identifiant unique est mis à jour', async () => {
    // GIVEN
    const emailAsUid = 'martin.tartempion@example.net'
    const uid = 'fooId'
    const mettreAJourUidALaPremiereConnexion = new MettreAJourUidALaPremiereConnexion(new UtilisateurRepositorySpy())

    // WHEN
    const result = await mettreAJourUidALaPremiereConnexion.execute({ emailAsUid, uid })

    // THEN
    expect(result).toBe('OK')
    expect(spiedUidToFind).toBe('martin.tartempion@example.net')
    expect(spiedUtilisateurToUpdate?.state).toStrictEqual(utilisateurFactory({
      uid: {
        email: emailAsUid,
        value: uid,
      },
    }).state)
  })

  it('quand l’utilisateur se connecte pour la première fois mais qu’il n’existe pas, alors un message d’erreur est renvoyé', async () => {
    // GIVEN
    const emailAsUid = 'fake-email@example.com'
    const uid = 'fooId'
    const mettreAJourUidALaPremiereConnexion = new MettreAJourUidALaPremiereConnexion(
      new UtilisateurIntrouvableRepositorySpy()
    )

    // WHEN
    const result = await mettreAJourUidALaPremiereConnexion.execute({ emailAsUid, uid })

    // THEN
    expect(result).toBe('utilisateurCourantInexistant')
    expect(spiedUidToFind).toBe(emailAsUid)
    expect(spiedUtilisateurToUpdate).toBeNull()
  })
})

let spiedUidToFind: string | null
let spiedUtilisateurToUpdate: Utilisateur | null

class UtilisateurRepositorySpy implements UpdateUtilisateurUidRepository, FindUtilisateurRepository {
  async find(uid: UtilisateurUidState['value']): Promise<Utilisateur | null> {
    spiedUidToFind = uid
    return Promise.resolve(utilisateurFactory({
      uid: { email: 'martin.tartempion@example.net', value: 'martin.tartempion@example.net' },
    }))
  }

  async updateUid(utilisateur: Utilisateur): Promise<void> {
    spiedUtilisateurToUpdate = utilisateur
    return Promise.resolve()
  }
}

class UtilisateurIntrouvableRepositorySpy extends UtilisateurRepositorySpy {
  override async find(uid: UtilisateurUidState['value']): Promise<null> {
    spiedUidToFind = uid
    return Promise.resolve(null)
  }
}
