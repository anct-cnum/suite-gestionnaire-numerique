import { beforeEach, describe, expect, it } from 'vitest'

import { ChangerMonRole } from './ChangerMonRole'
import { GetUtilisateurRepository, UpdateUtilisateurRepository } from './shared/UtilisateurRepository'
import { utilisateurFactory } from '@/domain/testHelper'
import { Utilisateur, UtilisateurUidState } from '@/domain/Utilisateur'

describe('changer mon rôle', () => {
  beforeEach(() => {
    spiedUtilisateur = nullUtilisateur
  })

  it('ayant le rôle super admin quand un utilisateur change de rôle alors le rôle est modifié', async () => {
    // GIVEN
    const nouveauRole = 'Gestionnaire structure'
    const changerMonRole = new ChangerMonRole(utilisateurRepository)

    // WHEN
    const result = await changerMonRole.handle({
      nouveauRole,
      uidUtilisateurCourant: 1,
    })

    // THEN
    expect(result).toBe('OK')
    expect(spiedUtilisateur.state).toStrictEqual(
      utilisateurFactory({
        isSuperAdmin: true,
        role: 'Gestionnaire structure',
        uid: { email: 'martin.tartempion@example.fr', value: 1 },
      }).state
    )
  })

  it('n’ayant pas le rôle super admin quand un utilisateur change de rôle alors le rôle est n’est pas modifié', async () => {
    // GIVEN
    const nouveauRole = 'Gestionnaire structure'
    const changerMonRole = new ChangerMonRole(utilisateurRepository)

    // WHEN
    const result = await changerMonRole.handle({
      nouveauRole,
      uidUtilisateurCourant: 2,
    })

    // THEN
    expect(result).toBe('utilisateurNonAutoriseAChangerSonRole')
    expect(spiedUtilisateur).toStrictEqual(nullUtilisateur)
  })
})

const nullUtilisateur = {} as Utilisateur

let spiedUtilisateur: Utilisateur

const utilisateurByUid: Readonly<Record<number, Utilisateur>> = {
  1: utilisateurFactory({
    isSuperAdmin: true,
    uid: { email: 'martin.tartempion@example.fr', value: 1 },
  }),
  2: utilisateurFactory({
    isSuperAdmin: false,
    uid: { email: 'martin.tartempion@example.fr', value: 2 },
  }),
}

const utilisateurRepository = new (class implements GetUtilisateurRepository, UpdateUtilisateurRepository {
  async get(uid: UtilisateurUidState['value']): Promise<Utilisateur> {
    return Promise.resolve(utilisateurByUid[uid])
  }

  async update(utilisateur: Utilisateur): Promise<void> {
    spiedUtilisateur = utilisateur
    return Promise.resolve()
  }
})()
