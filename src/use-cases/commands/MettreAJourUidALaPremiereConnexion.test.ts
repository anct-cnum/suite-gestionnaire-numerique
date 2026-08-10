import { beforeEach, describe, expect, it } from 'vitest'

import { MettreAJourUidALaPremiereConnexion } from './MettreAJourUidALaPremiereConnexion'
import { FindUtilisateurByEmailRepository, UpdateUtilisateurSsoIdRepository } from './shared/UtilisateurRepository'
import { utilisateurFactory } from '@/domain/testHelper'
import { Utilisateur } from '@/domain/Utilisateur'

describe("mettre à jour l'identifiant unique à la première connexion", () => {
  beforeEach(() => {
    spiedEmailToFind = null
    spiedSsoIdToUpdate = null
  })

  it("quand l'utilisateur se connecte pour la première fois, alors l'identifiant unique est mis à jour", async () => {
    // GIVEN
    const email = 'martin.tartempion@example.net'
    const uid = 'fooId'
    const mettreAJourUidALaPremiereConnexion = new MettreAJourUidALaPremiereConnexion(new UtilisateurRepositorySpy())

    // WHEN
    const result = await mettreAJourUidALaPremiereConnexion.handle({ email, uid })

    // THEN
    expect(result).toBe('OK')
    expect(spiedEmailToFind).toBe('martin.tartempion@example.net')
    expect(spiedSsoIdToUpdate).toStrictEqual({ email, ssoId: uid })
  })

  it("quand l'utilisateur n'existe pas, alors une erreur est levée", async () => {
    // GIVEN
    const email = 'inconnu@example.net'
    const uid = 'fooId'
    const mettreAJourUidALaPremiereConnexion = new MettreAJourUidALaPremiereConnexion(
      new UtilisateurRepositorySpyNotFound()
    )

    // WHEN
    const promise = mettreAJourUidALaPremiereConnexion.handle({ email, uid })

    // THEN
    await expect(promise).rejects.toThrow('Utilisateur non trouvé')
    expect(spiedSsoIdToUpdate).toBeNull()
  })
})

let spiedEmailToFind: null | string
let spiedSsoIdToUpdate: null | Readonly<{ email: string; ssoId: string }>

class UtilisateurRepositorySpy implements FindUtilisateurByEmailRepository, UpdateUtilisateurSsoIdRepository {
  async findByEmail(email: string): Promise<undefined | Utilisateur> {
    spiedEmailToFind = email
    return Promise.resolve(
      utilisateurFactory({
        derniereConnexion: undefined,
        uid: { email: 'martin.tartempion@example.net', value: 1 },
      })
    )
  }

  async updateSsoId(email: string, ssoId: string): Promise<void> {
    spiedSsoIdToUpdate = { email, ssoId }
    return Promise.resolve()
  }
}

class UtilisateurRepositorySpyNotFound implements FindUtilisateurByEmailRepository, UpdateUtilisateurSsoIdRepository {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async findByEmail(_: string): Promise<undefined | Utilisateur> {
    return Promise.resolve(undefined)
  }

  async updateSsoId(email: string, ssoId: string): Promise<void> {
    spiedSsoIdToUpdate = { email, ssoId }
    return Promise.resolve()
  }
}
