import { MettreAJourDateDeDerniereConnexion } from './MettreAJourDateDeDerniereConnexion'
import { FindUtilisateurRepository, UpdateUtilisateurRepository } from './shared/UtilisateurRepository'
import { utilisateurFactory } from '@/domain/testHelper'
import { Utilisateur, UtilisateurUidState } from '@/domain/Utilisateur'
import { epochTime, invalidDate } from '@/shared/testHelper'

describe('mettre à jour la date de dernière connexion à chaque connexion', () => {
  beforeEach(() => {
    spiedUidToFind = null
    spiedUtilisateurToUpdate = null
  })

  it('étant donné que le compte de l’utilisateur courant n’existe plus, quand sa date de dernière connexion doit être mise à jour, alors il y a une erreur', async () => {
    // GIVEN
    const uidUtilisateurCourant = 'fooId'
    const repository = new UtilisateurInexistantRepositorySpy()
    const mettreAJourDateDerniereConnexion = new MettreAJourDateDeDerniereConnexion(repository, epochTime)
    // WHEN
    const result = await mettreAJourDateDerniereConnexion.execute({ uidUtilisateurCourant })
    // THEN
    expect(result).toBe('utilisateurCourantInexistant')
    expect(spiedUidToFind).toBe('fooId')
  })

  it('étant donné une nouvelle date de connexion d’un utilisateur, quand une mise à jour est demandée, alors elle est mise à jour', async () => {
    // GIVEN
    const uidUtilisateurCourant = 'fooId'
    const date = epochTime
    const repository = new UtilisateurRepositorySpy()
    const mettreAJourDateDerniereConnexion = new MettreAJourDateDeDerniereConnexion(repository, date)

    // WHEN
    const result = await mettreAJourDateDerniereConnexion.execute({ uidUtilisateurCourant })

    // THEN
    expect(result).toBe('OK')
    expect(spiedUidToFind).toBe('fooId')
    expect(spiedUtilisateurToUpdate?.state).toStrictEqual(utilisateurFactory({
      derniereConnexion: date,
      uid: {
        email: 'martin.tartempion@example.net',
        value: uidUtilisateurCourant,
      },
    }).state)
  })

  it('étant donné une date invalide de connexion d’un utilisateur, quand une mise à jour est demandée, alors elle n’est pas mise à jour', async () => {
    // GIVEN
    const uidUtilisateurCourant = 'fooId'
    const repository = new UtilisateurRepositorySpy()
    const mettreAJourDateDerniereConnexion = new MettreAJourDateDeDerniereConnexion(repository, invalidDate)

    // WHEN
    const asyncResult = mettreAJourDateDerniereConnexion.execute({ uidUtilisateurCourant })

    // THEN
    await expect(asyncResult).rejects.toThrow('dateDeDerniereConnexionInvalide')
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
class UtilisateurInexistantRepositorySpy implements UpdateUtilisateurRepository, FindUtilisateurRepository {
  async find(uid: UtilisateurUidState['value']): Promise<Utilisateur | null> {
    spiedUidToFind = uid
    return Promise.resolve(null)
  }

  async update(utilisateur: Utilisateur): Promise<void> {
    spiedUtilisateurToUpdate = utilisateur
    return Promise.resolve()
  }
}
