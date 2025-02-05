import { MettreAJourUidALaPremiereConnexion } from './MettreAJourUidALaPremiereConnexion'
import { GetUtilisateurRepository, UpdateUtilisateurUidRepository } from './shared/UtilisateurRepository'
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
    const result = await mettreAJourUidALaPremiereConnexion.handle({ emailAsUid, uid })

    // THEN
    expect(result).toBe('OK')
    expect(spiedUidToFind).toBe('martin.tartempion@example.net')
    expect(spiedUtilisateurToUpdate?.state).toStrictEqual(utilisateurFactory({
      derniereConnexion: undefined,
      uid: {
        email: emailAsUid,
        value: uid,
      },
    }).state)
  })
})

let spiedUidToFind: string | null
let spiedUtilisateurToUpdate: Utilisateur | null

class UtilisateurRepositorySpy implements UpdateUtilisateurUidRepository, GetUtilisateurRepository {
  async get(uid: UtilisateurUidState['value']): Promise<Utilisateur> {
    spiedUidToFind = uid
    return Promise.resolve(utilisateurFactory({
      derniereConnexion: undefined,
      uid: { email: 'martin.tartempion@example.net', value: 'martin.tartempion@example.net' },
    }))
  }

  async updateUid(utilisateur: Utilisateur): Promise<void> {
    spiedUtilisateurToUpdate = utilisateur
    return Promise.resolve()
  }
}
