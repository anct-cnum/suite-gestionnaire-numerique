import { MettreAJourUidALaPremiereConnexion } from './MettreAJourUidALaPremiereConnexion'
import { UpdateUtilisateurUidRepository } from './shared/UtilisateurRepository'
import { utilisateurFactory } from '@/domain/testHelper'
import { Utilisateur, UtilisateurUid } from '@/domain/Utilisateur'

describe('mettre à jour l’identifiant unique à la première connexion', () => {
  afterEach(() => {
    spiedUidToFind = null
    spiedUtilisateurToUpdate = null
  })

  it('quand l’utilisateur se connecte pour la première fois, alors l’identifiant unique est mis à jour', async () => {
    // GIVEN
    const email = 'martin.tartempion@example.net'
    const uid = 'fooId'
    const mettreAJourUidALaPremiereConnexion = new MettreAJourUidALaPremiereConnexion(new UtilisateurRepositorySpy())

    // WHEN
    const result = await mettreAJourUidALaPremiereConnexion.execute({ email, uid })

    // THEN
    expect(result).toBe('ok')
    expect(spiedUidToFind).toBe('martin.tartempion@example.net')
    expect(spiedUtilisateurToUpdate?.state()).toStrictEqual(utilisateurFactory({ email, uid }).state())
  })

  it('quand l’utilisateur se connecte pour la première fois mais qu’il n’existe pas, alors un message d’erreur est renvoyé', async () => {
    // GIVEN
    const email = 'fake-email@example.com'
    const uid = 'fooId'
    const mettreAJourUidALaPremiereConnexion = new MettreAJourUidALaPremiereConnexion(
      new UtilisateurIntrouvableRepositorySpy()
    )

    // WHEN
    const result = await mettreAJourUidALaPremiereConnexion.execute({ email, uid })

    // THEN
    expect(result).toBe('comptePremiereConnexionInexistant')
    expect(spiedUidToFind).toBe(email)
    expect(spiedUtilisateurToUpdate).toBeNull()
  })
})

let spiedUidToFind: string | null = null
let spiedUtilisateurToUpdate: Utilisateur | null = null

class UtilisateurRepositorySpy implements UpdateUtilisateurUidRepository {
  async find(uid: UtilisateurUid): Promise<Utilisateur | null> {
    spiedUidToFind = uid.state().value
    return Promise.resolve(utilisateurFactory({
      email: 'martin.tartempion@example.net',
      uid: 'martin.tartempion@example.net',
    }))
  }

  async updateUid(utilisateur: Utilisateur): Promise<void> {
    spiedUtilisateurToUpdate = utilisateur
    return Promise.resolve()
  }
}

class UtilisateurIntrouvableRepositorySpy extends UtilisateurRepositorySpy {
  override async find(uid: UtilisateurUid): Promise<null> {
    spiedUidToFind = uid.state().value
    return Promise.resolve(null)
  }
}
