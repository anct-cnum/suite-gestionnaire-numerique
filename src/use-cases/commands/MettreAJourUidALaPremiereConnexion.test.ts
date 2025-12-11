import { MettreAJourUidALaPremiereConnexion } from './MettreAJourUidALaPremiereConnexion'
import { FindUtilisateurByEmailRepository, UpdateUtilisateurUidRepository } from './shared/UtilisateurRepository'
import { utilisateurFactory } from '@/domain/testHelper'
import { Utilisateur } from '@/domain/Utilisateur'

describe('mettre à jour l\'identifiant unique à la première connexion', () => {
  beforeEach(() => {
    spiedEmailToFind = null
    spiedUtilisateurToUpdate = null
  })

  it('quand l\'utilisateur se connecte pour la première fois, alors l\'identifiant unique est mis à jour', async () => {
    // GIVEN
    const email = 'martin.tartempion@example.net'
    const uid = 'fooId'
    const mettreAJourUidALaPremiereConnexion = new MettreAJourUidALaPremiereConnexion(new UtilisateurRepositorySpy())

    // WHEN
    const result = await mettreAJourUidALaPremiereConnexion.handle({ email, uid })

    // THEN
    expect(result).toBe('OK')
    expect(spiedEmailToFind).toBe('martin.tartempion@example.net')
    expect(spiedUtilisateurToUpdate?.state).toStrictEqual(utilisateurFactory({
      derniereConnexion: undefined,
      uid: {
        email,
        value: uid,
      },
    }).state)
  })

  it('quand l\'utilisateur n\'existe pas, alors une erreur est levée', async () => {
    // GIVEN
    const email = 'inconnu@example.net'
    const uid = 'fooId'
    const mettreAJourUidALaPremiereConnexion = 
        new MettreAJourUidALaPremiereConnexion(new UtilisateurRepositorySpyNotFound())

    // WHEN
    const promise = mettreAJourUidALaPremiereConnexion.handle({ email, uid })

    // THEN
    await expect(promise).rejects.toThrow('Utilisateur non trouvé')
  })
})

let spiedEmailToFind: null | string
let spiedUtilisateurToUpdate: null | Utilisateur

class UtilisateurRepositorySpy implements FindUtilisateurByEmailRepository, UpdateUtilisateurUidRepository {
  async findByEmail(email: string): Promise<undefined | Utilisateur> {
    spiedEmailToFind = email
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

class UtilisateurRepositorySpyNotFound implements FindUtilisateurByEmailRepository, UpdateUtilisateurUidRepository {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async findByEmail(_: string): Promise<undefined | Utilisateur> {
    return Promise.resolve(undefined)
  }
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async updateUid(_: Utilisateur): Promise<void> {
    return Promise.resolve()
  }
}
