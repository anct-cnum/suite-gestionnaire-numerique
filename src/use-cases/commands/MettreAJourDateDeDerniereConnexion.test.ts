import { MettreAJourDateDeDerniereConnexion } from './MettreAJourDateDeDerniereConnexion'
import { FindUtilisateurRepository, UpdateUtilisateurRepository } from './shared/UtilisateurRepository'
import { utilisateurFactory } from '@/domain/testHelper'
import { Utilisateur, UtilisateurUidState } from '@/domain/Utilisateur'

describe('mettre à jour la date de dernière connexion à chaque connexion', () => {
  beforeEach(() => {
    spiedUidToFind = null
    spiedUtilisateurToUpdate = null
  })

  it('chaque fois que l’utilisateur se connecte, alors sa date de dernière connexion est mise à jour', async () => {
    // GIVEN
    const uid = 'fooId'
    const date = new Date('2023-02-03')
    const repository = new UtilisateurRepositorySpy()
    const mettreAJourDateDerniereConnexion = new MettreAJourDateDeDerniereConnexion(repository, date)

    // WHEN
    const result = await mettreAJourDateDerniereConnexion.execute({ uid })

    // THEN
    expect(result).toBe('ok')
    expect(spiedUidToFind).toBe('fooId')
    expect(spiedUtilisateurToUpdate?.state).toStrictEqual(utilisateurFactory({
      derniereConnexion: date,
      uid: {
        email: 'martin.tartempion@example.net',
        value: uid,
      },
    }).state)
  })
})

let spiedUidToFind: string | null
let spiedUtilisateurToUpdate: Utilisateur | null

class UtilisateurRepositorySpy implements UpdateUtilisateurRepository, FindUtilisateurRepository {
  async find(uid: UtilisateurUidState['value']): Promise<Utilisateur | null> {
    spiedUidToFind = uid
    return Promise.resolve(utilisateurFactory({
      uid: { email: 'martin.tartempion@example.net', value: 'fooId' },
    }))
  }

  async update(utilisateur: Utilisateur): Promise<void> {
    spiedUtilisateurToUpdate = utilisateur
    return Promise.resolve()
  }
}
